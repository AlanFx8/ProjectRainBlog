import mongoose from 'mongoose';

const imageSchema = new mongoose.Schema({
    name: {
        type: String,
        required: true
    },
    content: {
        data: Buffer,
        mimetype: String
    }
});

const Image = mongoose.model("images", imageSchema);
export default Image;