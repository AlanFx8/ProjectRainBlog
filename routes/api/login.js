import express from 'express';
import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';
const router = express.Router();

router.post('/:username-:password', async (req, res) => {
    //Set the checkers
    const db_username = 'admin';
    const db_passwword =  '$2b$10$HNtNNGT15Wod/VNvtbolOOQlIAMOgg2QHQrr2MjC5KR1bR/XVf0NO'; //Hash of '1234'

    //Get params
    const username = req.params.username;
    const password = req.params.password;

    //Check password is correct
    const match = await bcrypt.compare(password, db_passwword);

    if (match && username === db_username){
        //Create a JWT
        const token = jwt.sign({
            username,
        }, process.env.JWT_SECRET, {
            expiresIn: '48h'
        });

        //Send resullt
        res.json({
            status: 'success',
            token
        });
    }
    else {
        res.json({
            status: 'fail'
        });
    }
});

//Exports
module.exports = router;