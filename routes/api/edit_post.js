import express from 'express';
import jimp from 'jimp';
import sizeOf from 'image-size';
import Blogpost from '../../models/BlogpostModel';
import Text from '../../models/TextModel';
import Image from '../../models/ImageModel';
import ImageMin from '../../models/ImageMinModel';
import { authenticateToken } from './util';

const router = express.Router();

//Test ID
router.get('/test_id/:id', async (req, res) => {
    try {
        const id = req.params.id;
        const result = await Blogpost.findById({ _id: id });
        if (result){
            res.json({
                status: 'success'
            });
        }
        else {
            res.json({
                status: 'fail'
            });
        }

    }
    catch (error){
        res.json({
            status: 'fail'
        });
    }
});

//Get Post (with IDs)
router.get('/by_id/:id', async (req, res) => {
    try {
        const id = req.params.id;
        const result = await Blogpost.findById({ _id: id });
    
        if (result === null){
            res.json({
                status: 'fail',
                success: false
            })
        }
        else {
            const blogpost = await _buildPost(result);
            res.json(blogpost);
        }
    }
    catch {
        res.json({
            status: 'fail',
            success: false
        })
    }
});

//Update Post
router.post('/', authenticateToken, async (req, res) => {
    try {
        //Get Items
        const { body, files } = req; //Body for text, files for images
        const structure = JSON.parse(req.body.structure); //The 'blueprint' for the blogpost
        const blogpost_id = req.body.blogpost_id;

        //Validate
        const validation = await _checkValidation(body, files, structure);
        if (validation.status !== 'success'){
            res.send({
                status: 'failure',
                errors: validation.errors
            });
        }

        //Loop through original items to delete missing items
        const original_blogpost = await Blogpost.findById({ _id: blogpost_id });
        const fixedBlogpost = await _buildPost(original_blogpost);
        for (let x = 0; x < fixedBlogpost.content.length; x++){
            const blogItem = fixedBlogpost.content[x];
            if (blogItem.type === 0){ //Check Textbox still exists
                let deleteText = true;
                for (var y = 0; y < structure.length; y++){
                    if (structure[y].type === 'text'){
                        if (structure[y].original_id === blogItem.original_id){
                            deleteText = false;
                            continue;
                        }
                    }
                }

                if (deleteText){
                    try {
                        const text = await Text.findById({ _id: blogItem.original_id });
                        text.deleteOne();
                    }
                    catch {
                        continue;
                    }
                }
            }
            else { //Check Image still exists
                let deleteImage = true;
                for (let y = 0; y < structure.length; y++){
                    if (structure[y].type === 'saved_image'){
                        if (structure[y].original_id === blogItem.original_id){
                            deleteImage = false;
                            continue;
                        }
                    }
                }

                if (deleteImage){
                    try {
                        const min_image = await ImageMin.findById({ _id: blogItem.original_id });
                        const image = await Image.findById({_id: min_image.original_image_id});
                        min_image.deleteOne();
                        image.deleteOne();
                    }
                    catch {
                        continue;
                    }
                }
            }
        }

        //Build new items
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
            else if (structure[x].type === 'image') { //IMAGE
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
            else { //Saved image
                blogpost.push({
                    type: IMAGE,
                    id: structure[x].original_id
                })
            }
        }

        await original_blogpost.updateOne({ structure: JSON.stringify(blogpost) });

        res.send({
            status: 'success',
            id: blogpost_id
        });
    }
    catch(error) {
        res.send({
            status: 'failure',
            errors: error.message
        });
    }
});

//NON-ROUTE METHODS
//Build Post (with ids)
const _buildPost = async post => {
    const newPost = {}; //Build return post

    //Build content
    const content = [];
    const structure = JSON.parse(post.structure);

    for (let x = 0; x < structure.length; x++){
        const _index = structure[x];
        if (_index.type === 0){
            try {
                let _text = await Text.findById({ _id: _index.id });
                content.push({
                    type: 0,
                    text: _text.content,
                    original_id: _index.id
                })
            }
            catch {
                content.push({
                    type: 0,
                    text: '[Error: Text not found]',
                    original_id: _index.id
                })
            }
        }
        else {
            try {
                let _image = await ImageMin.findById({ _id: _index.id });
                const buff = Buffer.from(_image.content.data, 'utf-8');
                const base64data = buff.toString('base64');         
                content.push({
                    type: 1,
                    name: _image.name,
                    data: base64data,
                    original_id: _index.id
                })
            }
            catch {
                content.push({
                    type: 1,
                    error: true,
                    original_id: _index.id
                })
            }
        }
    }
    newPost.content = content;
    return newPost;
}

//Check Validation
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
        else if (structure[x].type === 'image') { //As opposed to saved image
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

//EXPORT
module.exports = router;