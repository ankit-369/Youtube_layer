const express = require('express');
var fs = require('fs');
var cors = require('cors')
// var readline = require('readline');
var { google } = require('googleapis');
var OAuth2 = google.auth.OAuth2;
const app = express();
app.use(cors({
    origin: 'http://localhost:5173',
    // Other CORS options...
  }));
  
const SCOPES = ['https://www.googleapis.com/auth/youtube.readonly'];
const TOKEN_PATH = '../' + 'client_oauth_token.json';
// Define a route for /google/callback
// Define a route for /google/callback
app.get('/google/callback', (req, res) => {
    const code = req.query.code; // Retrieve the authorization code from query parameters

    // Check if code is present
    if (!code) {
        // res.status(400).send('Authorization code not found.');
        return res.redirect('/');
    }

    // Load client secrets from a local file.
    fs.readFile('client_secret.json', function processClientSecrets(err, content) {
        if (err) {
            console.log('Error loading client secret file: ' + err);
            return;
        }

        // Authorize a client with the loaded credentials and obtain the access token.
        authorize(JSON.parse(content), code, (auth) => {
            getChannel(auth, req, res); // Call getChannel and pass req, res
           
        });
    });
});


function authorize(credentials, code, callback) {
    const { client_secret, client_id, redirect_uris } = credentials.installed;
    const oauth2Client = new OAuth2(client_id, client_secret, redirect_uris[0]);

    // Exchange the authorization code for an access token
    oauth2Client.getToken(code, function(err, token) {
        if (err) {
            console.log('Error while trying to retrieve access token');
            return;
        }
        oauth2Client.credentials = token;
        storeToken(token);
        callback(oauth2Client);
    });
}

function storeToken(token) {
    try {
        fs.writeFile(TOKEN_PATH, JSON.stringify(token), (err) => {
            if (err) throw err;
            console.log('Token stored to ' + TOKEN_PATH);
        });
    } catch (e) {
        console.log("There is an error in storing the token: " + e);
    }
}

function getChannel(auth, req, res) {
    const service = google.youtube('v3');
    service.channels.list({
        auth: auth,
        part: 'snippet,contentDetails,statistics',
        mine: true,
    }, function(err, response) {
        if (err) {
            console.log('The API returned an error: ' + err);
            return;
        }
        const channels = response.data.items;
        if (!channels || channels.length == 0) {
            console.log('No channel found or empty response.');
            return;
        }
        console.log(channels);
        console.log('This channel\'s ID is %s. Its title is \'%s\', and it has %s views.',
            channels[0].id,
            channels[0].snippet.title,
            channels[0].statistics.viewCount);
        console.log("Thumbnail: " + channels[0].snippet.thumbnails.default.url);
        
        res.json({ channels: channels });

        
    });
}





// Define the route handler for the root path ("/")
app.get('/', (req, res) => {
    // Load client secrets from a local file.
    fs.readFile('client_secret.json', function processClientSecrets(err, content) {
        if (err) {
            console.log('Error loading client secret file: ' + err);
            return;
        }
        // Authorize a client with the loaded credentials, then call the YouTube API.
        // authorize(JSON.parse(content), getChannel);
        authorize(JSON.parse(content), (auth) => {
            getChannel(auth, req, res); // Call getChannel and pass req, res
        });
    });

    // Function to create an OAuth2 client and authorize it
    function authorize(credentials, callback) {
        try{

            const { client_secret, client_id, redirect_uris } = credentials.installed;
            const oauth2Client = new OAuth2(client_id, client_secret, redirect_uris[0]);
            
            // Check if we have previously stored a token.
            fs.readFile(TOKEN_PATH, function (err, token) {
            if (err) {
                getNewToken(oauth2Client, callback);
            } else {
                oauth2Client.credentials = JSON.parse(token);
                callback(oauth2Client);
            }
        });
    }catch(e){
        console.log("nothing in authorized");
    }
    }

    // Function to get a new token
    function getNewToken(oauth2Client, callback) {
        const authUrl = oauth2Client.generateAuthUrl({
            access_type: 'offline',
            scope: SCOPES
        });
        // Redirect the user to the authorization URL
        console.log("redirecting to this url"+ authUrl);
        res.redirect(authUrl);
    }

    // Function to retrieve channel information
  
});





// Start the server
const PORT = 3000;
app.listen(PORT, () => {
    console.log(`Server is running on http://localhost:${PORT}/google/callback`);
});
