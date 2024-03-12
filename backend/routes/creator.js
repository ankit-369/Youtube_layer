const express = require('express');
const router = express.Router()
const fs = require('fs');
const { google } = require('googleapis');
// const OAuth2 = google.auth.OAuth2;
const { authorize , authMiddleware} = require("./functions");

var cors = require('cors')

const app = express();
app.use(cors({
    origin: 'http://localhost:5173',
    // Other CORS options...
}));
app.use(express.json());




router.get('/info',(req, res) => {
    const authHeader = req.headers['authorization'];

    fs.readFile('client_secret.json', (err, content) => {
        if (err) {
            console.log('Error loading client secret file: ' + err);
            return;
        }
        authorize(JSON.parse(content), res,authHeader, (oauth2Client) => {
            getChannel(oauth2Client, req, res);
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



router.get('/video',(req, res) => {
    const authHeader = req.headers['authorization'];

    fs.readFile('client_secret.json', (err, content) => {
        if (err) {
            console.log('Error loading client secret file: ' + err);
            return;
        }
        authorize(JSON.parse(content), res,authHeader, (oauth2Client) =>{
            listUploadedVideos(oauth2Client, req, res);
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
      
        const videoData = videos.map(video => ({
            title: video.snippet.title,
            thumbnail: video.snippet.thumbnails.default.url,
            publishedAt: video.snippet.publishedAt,
            videoUrl: `https://www.youtube.com/watch?v=${video.snippet.resourceId.videoId}`
        }));

        res.json({ videos: videoData });
        
    });
}



// const PORT = 3000;
// app.listen(PORT, () => {
//     console.log(`Server is running on http://localhost:${PORT}`);
// });
module.exports = router;
