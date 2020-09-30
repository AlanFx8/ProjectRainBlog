import mongoose from 'mongoose';

const blogpostSchema = new mongoose.Schema({
    structure: {
        type: String,
        required: true
    },
    date: {
        type: Date,
        default: Date.now
    },
    last_edited: {
        type: Date,
        required: false,
        default: null
    }
});

const Blogpost = mongoose.model("blogposts", blogpostSchema);
export default Blogpost;