const express = require('express');
const router = express.Router()
const fs = require('fs');
const { users, videos } = require('../db')
const { google } = require('googleapis');
const z = require("zod");
const path = require('path');
const { authorize, authMiddleware } = require("./functions");

var cors = require('cors')

const app = express();
app.use(cors({
    origin: 'http://localhost:5173',
    // Other CORS options...
}));
app.use(express.json());



router.get('/info', (req, res) => {
    const AnotherToken = req.headers['anothertoken'];
    const authHeader = req.headers['authorization'];

    console.log('\n\nanothertokrn :-', AnotherToken);
    console.log('\n\nauthtoken :-', authHeader);
    if (AnotherToken == "null") {
        console.log("redirected to signup")

        return res.json({ msg: "token is not set" });
    }
    if (authHeader === "Bearer null") {
        return res.json({ msg: "youtube token is not set" });

    }
    // console.log("\n\n hahahahah :-",AnotherToken)
    // console.log("\n\n\n");
    fs.readFile('client_secret.json', (err, content) => {
        if (err) {
            console.log('Error loading client secret file: ' + err);
            return;
        }
        authorize(JSON.parse(content), res, authHeader, (oauth2Client) => {
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



router.get('/video', (req, res) => {
    const AnotherToken = req.headers['anothertoken'];
    const authHeader = req.headers['authorization'];

    console.log('\n\nanothertokrn :-', AnotherToken);
    console.log('\n\nauthtoken :-', authHeader);

    if (AnotherToken == "null") {
        console.log("redirected to signup")
        return res.json({ msg: "token is not set" });
    }
    if (authHeader === "Bearer null") {
        return res.json({ msg: "youtube token is not set" });

    }
    fs.readFile('client_secret.json', (err, content) => {
        if (err) {
            console.log('Error loading client secret file: ' + err);
            return;
        }
        authorize(JSON.parse(content), res, authHeader, (oauth2Client) => {
            listUploadedVideos(oauth2Client, req, res);
        });
    });
});
function listUploadedVideos(auth, req, res) {
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


router.post('/edited_video', async (req, res) => {

    const creatorstring = req.body.string;
    console.log(creatorstring);
    const allvideos = await videos.find({
        creator_string: creatorstring
    }).select('  -__v')

    console.log(allvideos)


    res.json({
        videodata: allvideos
    })

});

router.get('/thumbnails/:thumbnails', (req, res) => {
    try {
        const imageName = req.params.thumbnails;
        const imagePath = path.join(__dirname, '..', '/thumbnails', imageName); // Adjust the path as per your setup

        // Send the image file as a response
        console.log(imagePath)
        res.sendFile(imagePath);
    } catch (error) {
        console.error('Error:', error);
        res.status(500).json({ error: 'Internal Server Error' });
    }
});

router.get('/video/:videoname', (req, res) => {
    try {
        const videoname = req.params.videoname.toString(); // Corrected parameter name
        const videoPath = path.join(__dirname, '..', '/videos', videoname); // Adjust the path as per your setup

        // Send the video file as a response
        console.log(videoPath);
        res.sendFile(videoPath);
    } catch (error) {
        console.error('Error:', error);
        res.status(500).json({ error: 'Internal Server Error' });
    }
});

const checkvideodetails = z.object({
    description: z.string(),
    id: z.string()
})
router.post('/upload_video', async (req, res) => {

    try {


        const { success, error } = checkvideodetails.safeParse(req.body.body);

        if (success) {

            const video_id = req.body.body.id;
            const updated_description = req.body.body.description;
            console.log(updated_description);

            let videodata;
            videodata = await videos.find({
                _id: video_id
            }).select('  -__v')

            const dbdescription = videodata[0].video_description;

            const compareValue1 = updated_description.localeCompare(dbdescription);

            if (compareValue1 !== 0) {
                console.log("changed");
                const filter = { _id: video_id };
                const update = { video_description: updated_description };

                // `doc` is the document _before_ `update` was applied
                let doc = await videos.findOneAndUpdate(filter, update);

                videodata = await videos.find({
                    _id: video_id
                }).select('  -__v')

                console.log("updated successfull");

            }
            const videoTitle = videodata[0].video_title;
            const videoDescription = videodata[0].video_description;

            const thumbnailfilename = videodata[0].thumbnail_name;
            const thumbnailFilePath = path.join(__dirname, '..', 'thumbnails', thumbnailfilename);

            const videoFileName = videodata[0].video_name; // Assuming this contains the video file name
            const videoFilePath = path.join(__dirname, '..', 'videos', videoFileName);
            // res.json({ msg: videodata })
            const AnotherToken = req.headers['anothertoken'];
            const authHeader = req.headers['authorization'];

            // console.log('\n\nanothertokrn :-', AnotherToken);
            // console.log('\n\nauthtoken :-', authHeader);

            if (AnotherToken == "null") {
                console.log("redirected to signup")
                return res.json({ msg: "token is not set" });
            }
            if (authHeader === "Bearer null") {
                return res.json({ msg: "youtube token is not set" });

            }
            fs.readFile('client_secret.json', (err, content) => {
                if (err) {
                    console.log('Error loading client secret file: ' + err);
                    return;
                }
                authorize(JSON.parse(content), res, authHeader, (oauth2Client) => {
                    uploadVideo(oauth2Client, req, res, videoTitle, videoDescription, videoFilePath, thumbnailFilePath);
                });
            });


        } else {
            res.json({ msg: error });
        }
    } catch (e) {
        console.log("this is error in upload  ", e);
    }
})



// Function to upload a video to YouTube
async function uploadVideo(auth, req, res, videoTitle, videoDescription, videoFilePath, thumbnailFilePath) {
    const youtube = google.youtube({ version: 'v3', auth });

    console.log("video" , videoFilePath);
    console.log("thumbnail " , thumbnailFilePath);

    try {
        // Read video and thumbnail files
        const videoFile = fs.createReadStream(videoFilePath);
        // const thumbnailFile = fs.createReadStream(thumbnailFilePath);
        // const thumbnailData = fs.readFileSync(thumbnailFilePath);
        // const thumbnailBase64 = Buffer.from(thumbnailData).toString('base64');
        // const thumbnailUrl = `data:image/png;base64,${thumbnailBase64}`;
        const thumbnailUrl = encodeThumbnailToBase64(thumbnailFilePath);

        // Upload parameters
        const uploadParams = {
            part: 'snippet,status',
            requestBody: {
                snippet: {
                    title: videoTitle,
                    description: videoDescription,
                    thumbnails: {
                        default: {
                            url: thumbnailUrl // Set the thumbnail URL
                        }
                    }
                },
                status: {
                    privacyStatus: 'private' ,// Change privacy status as needed
                    selfDeclaredMadeForKids: true

                }
            },
            media: {
                body: videoFile
            }
        };
        const stats = fs.statSync(videoFilePath);
        const fileSizeInBytes = stats.size;
        
        console.log('File size:', fileSizeInBytes, 'bytes');
        // // Upload video with progress tracking
        // const response = await youtube.videos.insert(uploadParams, {
        //     onUploadProgress: evt => {
        //         if (evt.bytesRead) {
        //             const progress = (evt.bytesRead / totalBytes) * 100;
        //             console.log(`Upload Progress: ${progress.toFixed(2)}%`);
        //             // console.log(`Bytes Uploaded: ${evt.bytesRead}`);
        //         } else {
        //             console.log('No bytes uploaded yet.');
        //         }
        //     }
        // });
        let totalBytesUploaded = 0;

// Upload video with progress tracking
const response = await youtube.videos.insert(uploadParams, {
    onUploadProgress: evt => {
        if (evt.bytesRead) {
            totalBytesUploaded += evt.bytesRead;
            const percentage = (totalBytesUploaded / fileSizeInBytes) * 100;
            const progressPercentage = Math.min(percentage, 100); // Cap progress at 100%

            console.log(`Upload Progress: ${progressPercentage.toFixed(2)}%`);
        } else {
            console.log('No bytes uploaded yet.');
        }
    }
});
        
        console.log('Video uploaded:', response.data);
        res.json({ msg: "video uploaded" });
        // return response.data.id; // Return the ID of the uploaded video
    } catch (error) {
        console.error('Error uploading video:', error);
        throw error; // Propagate the error
    }
}


function getFileFormat(filePath) {
    const ext = path.extname(filePath).toLowerCase();
    switch (ext) {
        case '.jpeg':
        case '.jpg':
            return 'jpeg';
        case '.png':
            return 'png';
        default:
            throw new Error(`Unsupported file format: ${ext}`);
    }
}

function encodeThumbnailToBase64(thumbnailFilePath) {
    const thumbnailData = fs.readFileSync(thumbnailFilePath);
    const thumbnailBase64 = Buffer.from(thumbnailData).toString('base64');
    const fileFormat = getFileFormat(thumbnailFilePath);
    return `data:image/${fileFormat};base64,${thumbnailBase64}`;
}
module.exports = router;
