const express = require('express');
const fs = require('fs');
const { google } = require('googleapis');
const OAuth2 = google.auth.OAuth2;
var cors = require('cors')

const app = express();
app.use(cors({
    origin: 'http://localhost:5173',
    // Other CORS options...
  }));
app.use(express.json());

const SCOPES = ['https://www.googleapis.com/auth/youtube.readonly'];
const TOKEN_PATH = '../client_oauth_token.json';





app.get('/', (req, res) => {
    fs.readFile('client_secret.json', (err, content) => {
        if (err) {
            console.log('Error loading client secret file: ' + err);
            return;
        }
        authorize(JSON.parse(content), res);
    });
});

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

app.get('/google/callback', (req, res) => {
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




app.get('/info', (req, res) => {
    fs.readFile('client_secret.json', (err, content) => {
        if (err) {
            console.log('Error loading client secret file: ' + err);
            return;
        }
        authorize(JSON.parse(content), res, (auth) => {
            getChannel(auth, req, res);
        });
    });
});

function getChannel(auth, req, res) {
    const service = google.youtube('v3');
    service.channels.list({
        auth: auth,
        part: 'snippet,contentDetails,statistics',
        mine: true,
    }, (err, response) => {
        if (err) {
            console.log('The API returned an error: ' + err);
            res.status(500).send('Error retrieving channel data');
            return;
        }
        const channels = response.data.items;
        if (!channels || channels.length == 0) {
            console.log('No channel found or empty response.');
            res.status(404).send('No channel found');
            return;
        }
        console.log(channels);
        console.log('This channel\'s ID is %s. Its title is \'%s\', and it has %s views.',
            channels[0].id,
            channels[0].snippet.title,
            channels[0].statistics.viewCount);
        console.log("Thumbnail: " + channels[0].snippet.thumbnails.default.url);

        
        // Get the uploads playlist ID from the content details
        const uploadsPlaylistId = channels[0].contentDetails.relatedPlaylists.uploads;
        console.log('Uploads Playlist ID:', uploadsPlaylistId);


        res.json({ channels: channels });
    });
}



app.get('/video', (req, res) => {
    fs.readFile('client_secret.json', (err, content) => {
        if (err) {
            console.log('Error loading client secret file: ' + err);
            return;
        }
        authorize(JSON.parse(content), res, (auth) => {
            listUploadedVideos(auth, req, res);
        });
    });
});
function listUploadedVideos(auth, req,res) {
    const service = google.youtube('v3');
    service.playlistItems.list({
        auth: auth,
        part: 'snippet',
        playlistId: 'UUHPJBySDBJe0E4J5FagpBSg', // Replace with your uploads playlist ID
        maxResults: 10, // Maximum number of videos to retrieve
    }, (err, response) => {
        if (err) {
            console.log('The API returned an error: ' + err);
            res.status(500).send('Error retrieving video data');
            return;
        }
        const videos = response.data.items;
        if (!videos || videos.length === 0) {
            console.log('No videos found.');
            res.status(404).send('No videos found');
            return;
        }
        // videos.forEach(video => {
        //     const videoId = video.snippet.resourceId.videoId;
        //     const videoUrl = `https://www.youtube.com/watch?v=${videoId}`;
        //     console.log('Video URL:', videoUrl);
        // });
        const videoData = videos.map(video => ({
            title: video.snippet.title,
            thumbnail: video.snippet.thumbnails.default.url,
            publishedAt: video.snippet.publishedAt,
            videoUrl: `https://www.youtube.com/watch?v=${video.snippet.resourceId.videoId}`
        }));

        res.json({ videos: videoData });
        // console.log(videoLink);
        // res.json({ videos: videos });
    });
}



const PORT = 3000;
app.listen(PORT, () => {
    console.log(`Server is running on http://localhost:${PORT}`);
});
