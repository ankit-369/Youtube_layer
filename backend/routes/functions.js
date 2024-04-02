// const express = require('express');
// const router = express.Router()
const fs = require('fs');
const {creator,editor} = require('../db')
const { google } = require('googleapis');
const OAuth2 = google.auth.OAuth2;
// var cors = require('cors')
const jwt = require('jsonwebtoken');
const { JWT_SECRET } = require("../config");


// const SCOPES = ['https://www.googleapis.com/auth/youtube.readonly'];
const SCOPES = ['https://www.googleapis.com/auth/youtube.readonly', 'https://www.googleapis.com/auth/youtube.upload'];

const TOKEN_PATH = '../client_oauth_token.json';

function authMiddleware(req, res, next) {
    const userheader = req.headers.authorization;

    if (!userheader || !userheader.startsWith('Bearer ')) 
    {return res.status(401).json({
        msg:"you ere wrong"
    });
    }

    const token = userheader.split(' ')[1];
    jwt.verify(token, JWT_SECRET, (err, authData) => {
        if (err)
            res.status(403).json({error:err});
        else {
            if (authData && authData.userId) {
                req.userId = authData.userId;
                next();
            } else {
                return res.status(403).json({ error: 'Forbidden' });
            }
        }
    })

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
            
            // Check if we have previously stored a token.
        //     fs.readFile(TOKEN_PATH, (err, token) => {
        //         if (err) {
        //             getNewToken(oauth2Client, res);
        //         } else {
                    
        //             console.log('\n\n main json :- ',JSON.parse(token));
        //         oauth2Client.credentials = JSON.parse(token);
        //         console.log('Token already exists.');
        //         callback(oauth2Client);
        //     }
        // });
    } catch (e) {
        console.log('Error in authorization: ' + e);
    }
}

function storeToken(token,res) {
    try {
        const tokenData = JSON.stringify({ token });
        const savedtoken = jwt.sign({ tokenData }, JWT_SECRET);
     
//         fs.writeFile(TOKEN_PATH, JSON.stringify(token), (err) => {
//             if (err) throw err;
//             console.log('Token stored to ' + TOKEN_PATH);
//         });
//         console.log('this is token data :- ',tokenData);
// console.log('\n\n\n\n\nthis is saved  token :- ', savedtoken);
        res.redirect(`http://localhost:5173/?token=${savedtoken}`);
        // Return the redirect URL with the token as a query parameter
        // return `http://localhost:5173/?token=${savedtoken}`;
    } catch (e) {
        console.log('Error storing the token: ' + e);
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

module.exports = { authorize ,authorizesec,getNewToken,storeToken ,authMiddleware};
