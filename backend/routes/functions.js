const express = require('express');
// const router = express.Router()
const fs = require('fs');
const { google } = require('googleapis');
const OAuth2 = google.auth.OAuth2;
// var cors = require('cors')


const SCOPES = ['https://www.googleapis.com/auth/youtube.readonly'];
const TOKEN_PATH = '../client_oauth_token.json';



function authorizesec(credentials, code, callback) {
    const { client_secret, client_id, redirect_uris } = credentials.installed;
    const oauth2Client = new OAuth2(client_id, client_secret, redirect_uris[0]);

    // Exchange the authorization code for an access token
    oauth2Client.getToken(code, (err, token) => {
        if (err) {
            console.log('Error while trying to retrieve access token: ' + err);
            return;
        }
        oauth2Client.credentials = token;
        storeToken(token);
        callback(oauth2Client);
    });
}


function authorize(credentials, res, callback) {
    try {
        const { client_secret, client_id, redirect_uris } = credentials.installed;
        const oauth2Client = new OAuth2(client_id, client_secret, redirect_uris[0]);

        // Check if we have previously stored a token.
        fs.readFile(TOKEN_PATH, (err, token) => {
            if (err) {
                getNewToken(oauth2Client, res);
            } else {
               
                oauth2Client.credentials = JSON.parse(token);
// console.log("\n\n\n\n\n\noath to clint :- ",oauth2Client);
                console.log('Token already exists.');
                callback(oauth2Client);
            }
        });
    } catch (e) {
        console.log('Error in authorization: ' + e);
    }
}

function storeToken(token) {
    try {
        fs.writeFile(TOKEN_PATH, JSON.stringify(token), (err) => {
            if (err) throw err;
            console.log('Token stored to ' + TOKEN_PATH);
        });
    } catch (e) {
        console.log('Error storing the token: ' + e);
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

module.exports = { authorize ,authorizesec,getNewToken,storeToken };
