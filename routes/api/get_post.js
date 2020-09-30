import express from 'express';
import Blogpost from '../../models/BlogpostModel';
import Text from '../../models/TextModel';
import ImageMin from '../../models/ImageMinModel';
import Image from '../../models/ImageModel';
const router = express.Router();

router.get('/:get_amount-:skip_amount', async (req, res) => {
    try {
        const get_amount = parseInt(req.params.get_amount);
        const skip_amount = parseInt(req.params.skip_amount);
        const result = await Blogpost.find().skip(skip_amount).limit(get_amount);
        const blogposts = [];
    
        for (let x = 0; x < result.length; x++){
            blogposts.push(await _buildPost(result[x]));
        }

        res.json({
            status: 'succes',
            blogposts
        });
    }
    catch (error){
        res.json({
            status: 'fail',
            error: error.message
        })
    }
});

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

router.get('/full_images/:id_sets', async (req, res) => {
    try {
        const set_ids = JSON.parse(req.params.id_sets);
    
        const full_images = [];
        for (let x = 0; x < set_ids.length; x++){
            try {
                const result = await Image.findById({ _id: set_ids[x] });
                const buff = Buffer.from(result.content.data, 'utf-8');
                const base64data = buff.toString('base64');
                full_images.push({
                    name: result.name,
                    data: base64data
                });
            }
            catch (error){
                full_images.push(null);
            }
        }
    
        res.json(full_images);
    }
    catch(error){
        res.json({
            status: 'fail',
            error: error.message
        });
    }
});

//BUILD POST
const _buildPost = async post => {
    const newPost = {}; //Build return post
    newPost._id = post._id;
    newPost.date = post.date;
    newPost.last_edited = post.last_edited;

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
                    text: _text.content
                })
            }
            catch {
                content.push({
                    type: 0,
                    text: '[Error: Text not found]'
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
                    original_id: _image.original_image_id
                })
            }
            catch {
                content.push({
                    type: 1,
                    error: true
                })
            }
        }
    }

    newPost.content = content;
    return newPost;
}

//Exports
module.exports = router;