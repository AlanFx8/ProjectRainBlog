import mongoose from 'mongoose';

const imageMinSchema = new mongoose.Schema({
    name: {
        type: String,
        required: true
    },
    content: {
        data: Buffer,
        mimetype: String
    },
    original_image_id: {
        type: String,
        required: true
    }
});

const ImageMin = mongoose.model("images_min", imageMinSchema);
export default ImageMin;