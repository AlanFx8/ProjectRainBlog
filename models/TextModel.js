import mongoose from 'mongoose';

const textSchema = new mongoose.Schema({
    content: {
        type: String,
        required: true
    }
});

const Text = mongoose.model('text', textSchema);
export default Text;