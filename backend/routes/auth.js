const express = require('express');
const router = express.Router()
const fs = require('fs');
const { google } = require('googleapis');
// const OAuth2 = google.auth.OAuth2;
var cors = require('cors')

const app = express();
app.use(cors({
    origin: 'http://localhost:5173',
    // Other CORS options...
  }));
app.use(express.json());
const { authorize , authorizesec  } = require("./functions");





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
        authorizesec(JSON.parse(content), code, (oauth2Client) => {
            // Do nothing else in this callback, token is already stored
            res.redirect("http://localhost:5173");

            // res.send('Token obtained and stored.');
        });
    });
});




module.exports = router;

