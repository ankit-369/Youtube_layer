
const fs = require('fs');
const {creator,editor} = require('../db')
const { google } = require('googleapis');
const OAuth2 = google.auth.OAuth2;
const { users } = require('../db')

const jwt = require('jsonwebtoken');
const { JWT_SECRET } = require("../config");


// const SCOPES = ['https://www.googleapis.com/auth/youtube.readonly'];
const SCOPES = ['https://www.googleapis.com/auth/youtube.readonly', 'https://www.googleapis.com/auth/youtube.upload'];

// const TOKEN_PATH = '../client_oauth_token.json';

// function authMiddleware(req, res, next) {
//     // const AnotherToken = req.headers['anothertoken'];

//     const userheader = req.headers['anothertoken'];

//     if (!userheader || !userheader.startsWith('Bearer ')) 
//     {return res.status(401).json({
//         msg:"token formate is wrong"
//     });
//     }

//     const token = userheader.split(' ')[1];
//     jwt.verify(token, JWT_SECRET, async (err, authData) => {
//         if (err)
//             res.status(403).json({error:err});
//         else {
//             if (authData && authData.email) {
//                 const email = authData.email;
//                 const finduser = await users.findOne({
//                     email 
//                 })
//                 if(finduser){

//                     req.userId = authData.userId;
//                     next();
//                 }else{
//                     res.json({msg : "error in middleware"});
//                 }
//             } else {
//                 return res.status(403).json({ error: 'Forbidden' });
//             }
//         }
//     })

// }
function authMiddleware(req, res, next) {
    const userheader = req.headers['anothertoken']; // Make sure this matches the key in your headers object
    console.log("this is meddleware " ,userheader);
    if (!userheader || !userheader.startsWith('Bearer ')) {
        return res.status(400).json({
            msg: "Token format is wrong"
        });
    }

    const usertoken = userheader.split(' ')[1];
    jwt.verify(usertoken, JWT_SECRET, async (err, authData) => {
        if (err) {
            // wrong user token
            res.json({ msg : "wrong user token"});
        } else {
            if (authData && authData.email) {
                const email = authData.email;
                const finduser = await users.findOne({ email });
                if (finduser) {
                    // req.userId = authData.userId;
                    console.log("auth successsfull yeeeeee")
                    next();
                } else {
                    res.status(403).json({ msg: "Error in middleware" });
                }
            } else {
                res.status(403).json({ error: 'Forbidden' });
            }
        }
    });
}

function authorizesec(credentials, code,res) {
    const { client_secret, client_id, redirect_uris } = credentials.installed;
    const oauth2Client = new OAuth2(client_id, client_secret, redirect_uris[0]);

    // Exchange the authorization code for an access token
    oauth2Client.getToken(code, (err, token) => {
        if (err) {
            console.log('Error while trying to retrieve access token: ' + err);
            return;
        }
        oauth2Client.credentials = token;
        storeToken(token,res);
        // callback(oauth2Client);
    });
}

function decodetoken(tokenstring){
    if( typeof tokenstring === 'string'){
        const newtokenstring = tokenstring.split(' ');

        const newtoken = newtokenstring[1];

        try {
            const decoded = jwt.verify(newtoken, JWT_SECRET);
            // console.log("this is decoded ", decoded);
            return decoded.email;
        } catch (err) {
            console.error("Invalid token:", err);
            return { error: "invalid token" };
        }

    }else{
        return "not a string token";
    }

}

function authorize(credentials, res,authHeader = null, callback) {
    try {
        const { client_secret, client_id, redirect_uris } = credentials.installed;
        const oauth2Client = new OAuth2(client_id, client_secret, redirect_uris[0]);

        if (typeof authHeader === 'string') {
            const tokenParts = authHeader.split(' ');
            if (tokenParts.length === 2 && tokenParts[0] === 'Bearer') {
                const users_authHeader = tokenParts[1];
                jwt.verify(users_authHeader, JWT_SECRET, (err, decoded) => {
                    if (err) {
                        return res.status(401).json({ msg: 'Invalid token' });
                    }
                    const mytoken = JSON.parse(decoded.tokenData);
                    try{

                        console.log('\n\n\n\ my token:', mytoken.token);
                        oauth2Client.credentials = mytoken.token;
                        console.log('Token already exists.');
                        callback(oauth2Client);
                    }catch(e){
                        console.log('Error in authorization: ' + e);

                    }
                });
            }}else{
                getNewToken(oauth2Client, res);

            }
            
          
    } catch (e) {
        console.log('Error in authorization: ' + e);
    }
}

function storeToken(token,res) {
    try {
        const tokenData = JSON.stringify({ token });
        const savedtoken = jwt.sign({ tokenData }, JWT_SECRET);
     
        res.redirect(`http://localhost:5173/?token=${savedtoken}`);
        
    } catch (e) {
        console.log('Error in storetoken function ' + e);
        return null; // Handle error appropriately in your code
    }
}

function getNewToken(oauth2Client, res) {
    const authUrl = oauth2Client.generateAuthUrl({
        access_type: 'offline',
        scope: SCOPES
    });
    // Redirect the user to the authorization URL
    console.log('Redirecting to this URL: ' + authUrl);
    res.redirect(authUrl);
}

module.exports = { authorize ,authorizesec,getNewToken,storeToken ,authMiddleware,decodetoken};
