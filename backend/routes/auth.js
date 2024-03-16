const express = require('express');
const router = express.Router()
const fs = require('fs');
const { google } = require('googleapis');
// const OAuth2 = google.auth.OAuth2;
const multer = require('multer');
const path = require('path');
const { JWT_SECRET } = require('../config')
const { users } = require('../db')
var cors = require('cors')
const z = require("zod");
var jwt = require('jsonwebtoken');
const { v4: uuidv4 } = require('uuid');



const app = express();
app.use(cors({
    origin: 'http://localhost:5173',
    // Other CORS options...
}));
app.use(express.json());
const { authorize, authorizesec } = require("./functions");


const users_zod = z.object({
    name: z.string(),
    email: z.string().email(),
    password: z.string(),
    role: z.string(),
    image: z.any()
})

const storage = multer.diskStorage({
    destination: function (req, file, cb) {

        cb(null, path.join(__dirname, '../upload')); // Specify the directory where uploaded files will be stored

    },
    filename: function (req, file, cb) {
        try {
            const { success } = users_zod.safeParse(req.body);
            const email = req.body.email;

            const nospace = file.originalname.replace(/\s+/g, '')
            const image = email + '-' + nospace;

            cb(null, image) // Specify the filename for the uploaded file
        } catch (e) {
            console.log(e);
        }
    }
});
const upload = multer({ storage: storage });


router.post('/signup', upload.single('image'), async (req, res) => {


    try {
        const { success } = users_zod.safeParse(req.body);
        const email = req.body.email;
        const role = req.body.role;
        const username = req.body.name;
        let uniqueString = '';

        if (role == 'creator') {
            uniqueString = uuidv4();
        }

        const file = req.file;
        const nospace = file.originalname.replace(/\s+/g, '')
        console.log('this is file :- ', file);

        console.log(email + '-' + nospace);
        const image = email + '-' + nospace;
        if (!success) {
            return res.status(411).json({
                message: "not success ",

            })
        }

        const userexixts = await users.findOne({
            email: req.body.email
        })

        if (userexixts) {
            return res.status(411).json({
                message: "Email already taken"
            })
        }

        const incertuser = await users.create({
            name: req.body.name,
            email: req.body.email,
            password: req.body.password,
            role: req.body.role,
            image: image,
            string: uniqueString
        })
        // userId = incertuser._id;
        console.log("jwt_secret key :- ".JWT_SECRET)
        const token = jwt.sign({
            username, email, role, image, uniqueString
        }, JWT_SECRET);

        res.json({
            message: "User created successfully",
            token: token,
            string: uniqueString
        })
    } catch (e) {
        console.error(e);
        res.json({
            msg: "internal error"
        })
    }
})


router.get('/', (req, res) => {
    fs.readFile('client_secret.json', (err, content) => {
        if (err) {
            console.log('Error loading client secret file: ' + err);
            return;
        }
        authorize(JSON.parse(content), res);
    });
});

router.get('/google/callback', (req, res) => {
    const code = req.query.code;
    if (!code) {
        return res.status(400).send('Authorization code not found.');
    }

    fs.readFile('client_secret.json', (err, content) => {
        if (err) {
            console.log('Error loading client secret file: ' + err);
            return;
        }

        // Authorize a client with the loaded credentials and obtain the access token.
        authorizesec(JSON.parse(content), code, res);

    });
});




module.exports = router;

