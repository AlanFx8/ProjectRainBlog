import express from 'express';
import fileuploader from 'express-fileupload';
import mongoose from 'mongoose';
import dotenv from 'dotenv';
import path from 'path';

//Load route files
import newPostRoute from './routes/api/new_post';
import getPostRoute from './routes/api/get_post';
import editRoute from './routes/api/edit_post';
import deleteRoute from './routes/api/delete_post';
import loginRoute from './routes/api/login';

//Load the config and variables
dotenv.config({ path: './config/config.env' });
const PORT = process.env.PORT;
const MONGODB_URL = process.env.MONGODB_URL;

//Connect to database
mongoose.connect(MONGODB_URL, {
	useNewUrlParser: true,
	useUnifiedTopology: true,
	useCreateIndex: true
})
.then(() => console.log('MongoDB connected.'))
.catch(error => console.log(error.reason));

//Create the server
const app = express();
app.use(express.json());
app.use(express.urlencoded({extended: false}));
app.use(fileuploader({
    useTempFiles : true,
    tempFileDir : '/tmp/'
}));

//Set Routes
app.use('/api/new_post', newPostRoute);
app.use('/api/get_post', getPostRoute);
app.use('/api/edit_post', editRoute);
app.use('/api/delete_post', deleteRoute);
app.use('/api/login', loginRoute);

//Set a default path to the client once built
if (process.env.NODE_ENV === "production"){
    app.use(express.static('client/build'));
    app.get('*', (req, res) => {
        res.sendFile(path.resolve(__dirname, 'client', 'build', 'index.html'));
    });
}

//Listen
app.listen(PORT, () => { console.log(`Server listening on port ${PORT}`) });