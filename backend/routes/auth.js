const express = require('express');
const router = express.Router()
const fs = require('fs');
const { google } = require('googleapis');
// const OAuth2 = google.auth.OAuth2;
const {JWT_SECRET} = require('../config')
const {users} = require('../db')
var cors = require('cors')
const z = require("zod");
var jwt = require('jsonwebtoken');


const app = express();
app.use(cors({
    origin: 'http://localhost:5173',
    // Other CORS options...
  }));
app.use(express.json());
const { authorize , authorizesec  } = require("./functions");


const users_zod = z.object({
    name: z.string(),
    email: z.string().email(),
    password: z.string(),
    role:z.string()
})

// Declare global variable
// let userId='65ed062778ce1cacc8a573b1'; 

router.post('/signup', async (req, res) => {
    try{
        const {success} = users_zod.safeParse(req.body);
    const email = req.body.email;
    const role =  req.body.role;

        if (!success) {
            return res.status(411).json({
                message: "not success ",
    
            })
        }
    
        const userexixts = await users.findOne({
            email: req.body.email
        })
    
        if (userexixts) {
           return  res.status(411).json({
                message: "Email already taken"
            })
        }
    
        const incertuser = await users.create({
            name: req.body.name,
            email: req.body.email,
            password: req.body.password,
            role: req.body.role
        })
        // userId = incertuser._id;
        console.log("jwt_secret key :- ".JWT_SECRET)
        const token = jwt.sign({
           email
        }, JWT_SECRET);
    
        res.json({
            message: "User created successfully",
            token: token
        })
    }catch(e){
        console.error(e);
        res.json({
            msg:"internal error"
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
        authorizesec(JSON.parse(content), code,res);
       
    });
});




module.exports = router;

