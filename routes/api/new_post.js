import express from 'express';
import jimp from 'jimp';
import sizeOf from 'image-size';
import Blogpost from '../../models/BlogpostModel';
import Text from '../../models/TextModel';
import Image from '../../models/ImageModel';
import ImageMin from '../../models/ImageMinModel';
import { authenticateToken } from './util';

const router = express.Router();

//Tests
router.post('/succes_test', async (req, res) => {
    res.send({
        status: 'success',
        id: 'NULL'
    });
});

router.post('/fail_test', async (req, res) => {
    const errors = [];
    errors.push("Error 1");
    errors.push("Error 2");
    errors.push("Error 3");
    errors.push("Error 4");

    res.json({
        status: 'failure',
        errors: errors
    });
});

router.post('/validate_test', async (req, res) => {
    const { body, files } = req; //Body for text, files for images
    const structure = JSON.parse(req.body.structure); //The 'blueprint' for the blogpost

    const validation = await _checkValidation(body, files, structure);

    if (validation.status !== 'success'){
        res.send({
            status: 'failure',
            errors: validation.errors
        });
    }

    res.send({
        status: 'success',
        id: 'No ID'
    });
});

//Add new entry
router.post('/', authenticateToken, async (req, res) => {
    try {
        const { body, files } = req; //Body for text, files for images
        const structure = JSON.parse(req.body.structure); //The 'blueprint' for the blogpost

        const validation = await _checkValidation(body, files, structure);

        if (validation.status !== 'success'){
            res.send({
                status: 'failure',
                errors: validation.errors
            });
        }

        const TEXT = 0;
        const IMAGE = 1;
        var blogpost = [];

        for (let x = 0; x < structure.length; x++){
            if (structure[x].type === 'text'){
                const value = body[structure[x].name];
                const newText = new Text({
                    content: value.trim()
                });
                await newText.save();

                blogpost.push({
                    type: TEXT,
                    id: newText._id.toString()
                })
            }
            else { //IMAGE
                //First, save the full image and get its ID
                //Note: we need the original image to be a jimp too
                //Because data from originalImg returns empty when run through a buffer?
                const originalImg = files[structure[x].name];
                const jimpImage = await jimp.read(originalImg.tempFilePath);   
                const { mimetype, name } = originalImg;
                const fixedName = name.trim().toLocaleLowerCase().replace(/\s+/gi, '-');
                const data = await jimpImage.getBufferAsync(jimp.AUTO);
                let newImage = new Image();
                newImage.name = fixedName;
                newImage.content.data = data;
                newImage.content.mimetype = mimetype;
                await newImage.save();

                //Save the thumbnail version, referencing the ID of its full-sized one    
                const newSize = await _getAspectRatio(sizeOf(originalImg.tempFilePath));
                const thumbnail = jimpImage.resize(newSize.x, newSize.y);
                const thumbnailData = await thumbnail.getBufferAsync(jimp.AUTO);
                let newImageMin = new ImageMin();
                newImageMin.name = fixedName
                newImageMin.content.data = thumbnailData;
                newImageMin.content.mimetype = mimetype;
                newImageMin.original_image_id = newImage._id;
                await newImageMin.save();

                blogpost.push({
                    type: IMAGE,
                    id: newImageMin._id.toString()
                })
            }
        }

        const newBlogpost = new Blogpost({
            structure: JSON.stringify(blogpost)
        });

        const newPost = await newBlogpost.save();

        res.send({
            status: 'success',
            id: newPost._id
        });
    }
    catch(error) {
        res.send({
            status: 'failure',
            errors: error.message
        });
    }
});

//Get preview image
router.post('/preview_image', async (req, res) => {
    try {
        const { files } = req; //Image is stored in files
        const originalImg = files['preview']; //Get the only image

        const errors = await _validateImage(originalImg, 'Preview');
        if (errors.length > 0){
            res.send({
                status: 'failure',
                errors: 'File is invalid'
            });
        }

        const jimpImage = await jimp.read(originalImg.tempFilePath);
        const thumbnail = await jimpImage.resize(256, 224);
        const thumbnailData = await thumbnail.getBufferAsync(jimp.AUTO);
        const buff = await Buffer.from(thumbnailData, 'utf-8');
        const base64data = await buff.toString('base64');

        res.send({
            status: 'success',
            image: base64data
        });
    }
    catch(error) {
        console.log('ERROR', error.message);
        res.send({
            status: 'failure',
            errors: error.message
        });
    }
});

//CheckValidation
const _checkValidation = async (body, files, structure) => {
    const errors = [];

    //Loop for each item
    for (let x = 0; x < structure.length; x++){
        if (structure[x].type === 'text'){
            const value = body[structure[x].name];

            if (value.trim().length === 0){
                errors.push(`Textbox ${structure[x].name} is empty`);
            }
            else if (value.length > 5000){
                errors.push(`Textbox ${structure[x].name} exceeds 5000 chars`);
            }
        }
        else { //IMAGE
            if (files === null) {
                //We need to check files is empty or we get an error
                errors.push(`There are 1 or more empty images`);  
            }
            else {
                const originalImg = files[structure[x].name];

                const imgErrors = await _validateImage(files[structure[x].name], structure[x].name);
                if (imgErrors.length > 0){
                    errors.push(imgErrors);
                }
            }
        }
    }

    //If any errors
    if (errors.length > 0){
        return {
            status: 'fail',
            errors
        } 
    }

    //All good
    return {
        status: 'success'
    }
}

//Validate Image
const _validateImage = async (img, name) => {
    const errors = [];

    //Check for empty file
    //If so - we return the errors here
    if (img === undefined){
        errors.push(`Image ${name} is empty`);
        return errors;
    }

    //Check tmp_path is empty - hack attempt?
    if (img.tempFilePath === null || img.tempFilePath === ''){
        errors.push(`Sorry, there was an upload error for image ${name}`);
    }

    //Check file is an image
    if (img.mimetype.toLowerCase() !== 'image/jpeg'
    && img.mimetype.toLowerCase() !== 'image/jpg'
    && img.mimetype.toLowerCase() !== 'image/png'){
        errors.push(`Image ${name} is not an image file.`);
    }

    //Check for file name
    const regex =/^[^\\/:\*\?"<>\|]+$/;
    if (!regex.test(img.name)){
        errors.push(`Image ${name} has an illegal file name.`);
    }

    //Check file is higher than 16mb
    if (img.size > 16000000){
        errors.push(`Image ${name} must be below 16MB.`);
    }

    return errors;
}

//GetAspectRatio
const _getAspectRatio = async img => {
    const max_res = 250;

    let ratio = max_res / img.width;
    let newWidth = max_res;
    let newHeight = img.height * ratio;

    if (newHeight > max_res){
        ratio = max_res / img.height;
        newHeight = max_res;
        newWidth = img.width * ratio;
    }

    return {x: parseInt(newWidth), y: parseInt(newHeight) }
}

//Export
module.exports = router;