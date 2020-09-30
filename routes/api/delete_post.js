import express from 'express';
import Blogpost from '../../models/BlogpostModel';
import Text from '../../models/TextModel';
import ImageMin from '../../models/ImageMinModel';
import Image from '../../models/ImageModel';
import { authenticateToken } from './util';
const router = express.Router();

router.delete('/:id', authenticateToken, async (req, res) => {
    try {
        const id = req.params.id;
        const blogpost = await Blogpost.findById({ _id: id });
    
        if (blogpost === null){
            res.json({
                status: 'fail',
                error: 'Post not found'
            })
        }

        const result = await _deletePost(blogpost);
        res.json(result);
    }
    catch (error){
        res.json({
            status: 'fail',
            error: error.message
        })
    }
});

//Delete Function
const _deletePost = async blogpost => {
    try {
        const structure = JSON.parse(blogpost.structure);

        for (let x = 0; x < structure.length; x++){
            const _index = structure[x];
            if (_index.type === 0){ //Text
                try {
                    const text = await Text.findById({ _id: _index.id });
                    text.deleteOne();
                }
                catch {
                    continue;
                }
            }
            else { //Image
                try {
                    const min_image = await ImageMin.findById({ _id: _index.id });
                    const image = await Image.findById({_id: min_image.original_image_id});
                    min_image.deleteOne();
                    image.deleteOne();
                }
                catch {
                    continue;
                }
            }
        }
    
        blogpost.deleteOne();

        return {
            status: 'success',
        }
    }
    catch(error){
        return {
            status: 'fail',
            error: error.message
        }
    }
}

//Export Route
module.exports = router;