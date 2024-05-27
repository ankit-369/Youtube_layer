const express = require('express');
const router = express.Router()
const fs = require('fs');
const { users, videos } = require('../db')
const { google } = require('googleapis');
const z = require("zod");
const path = require('path');
const { authorize, authMiddleware } = require("./functions");


var cors = require('cors')
const bodyParser = require('body-parser');

const app = express();




const morgan = require('morgan');
app.use(morgan('dev'));


app.use(cors({
    origin: 'http://localhost:5173',
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization','Anothertoken']
}));
app.use(express.json());
// Handle preflight requests
app.options('/api/v1/creator/upload_video', cors());

app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));

global.channelid="" ;

router.get('/',(req,res)=>{
    res.json({
        msg:"hello you are there"
    })
})

router.get('/info', authMiddleware, (req, res) => {
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
            
            global.channelid = uploadsPlaylistId;
            console.log("\n\nthis is channel id again :-",global.channelid);

        res.json({ channels: channels });
    });
}



router.get('/video', authMiddleware, (req, res) => {
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
    console.log(" \n\n\n\n\nchannal id in list of videos :-",global.channelid);
    console.log("\n\n\n\n")
    service.playlistItems.list({
        auth: auth,
        part: 'snippet',
        playlistId: global.channelid, // Replace with your uploads playlist ID

        // playlistId: 'UUHPJBySDBJe0E4J5FagpBSg', // Replace with your uploads playlist ID
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
        console.log("this is videos ", videos);
        const videoData = videos.map(video => ({
            title: video.snippet.title,
            thumbnail: video.snippet.thumbnails.default.url,
            publishedAt: video.snippet.publishedAt,
            desription: video.snippet.description,
            videoUrl: `https://www.youtube.com/watch?v=${video.snippet.resourceId.videoId}`
        }));

        res.json({ videos: videoData });

    });
}


router.post('/edited_video', authMiddleware, async (req, res) => {

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
});



router.post('/upload_video', authMiddleware, async (req, res) => {

    try {


        const { success, error } = checkvideodetails.safeParse(req.body.body);

        if (error) {
            console.log("inside error in creators")
            res.json({ msg: error })
        }
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

            console.log("\n\ndescripting changes \n\n");
            fs.readFile('client_secret.json', (err, content) => {
                if (err) {
                    console.log('Error loading client secret file: ' + err);
                    return;
                }
                authorize(JSON.parse(content), res, authHeader, (oauth2Client) => {
                    uploadVideo(oauth2Client, req, res, videoTitle, videoDescription, videoFilePath, thumbnailFilePath);
                });
            });


        }
    } catch (e) {
        console.log("this is error in upload  ", e);
    }
})





// Function to upload a video to YouTube

async function uploadVideo(auth, req, res, videoTitle, videoDescription, videoFilePath, thumbnailFilePath) {
    const youtube = google.youtube({ version: 'v3', auth });
    try {
        const videoFile = fs.createReadStream(videoFilePath);
        const thumbnailUrl = encodeThumbnailToBase64(thumbnailFilePath);
        const uploadParams = {
            part: 'snippet,status',
            requestBody: {
                snippet: {
                    title: videoTitle,
                    description: videoDescription
                },
                status: {
                    privacyStatus: 'private',
                    selfDeclaredMadeForKids: true
                }
            },
            media: { body: videoFile }
        };
        const stats = fs.statSync(videoFilePath);
        const fileSizeInBytes = stats.size;
        console.log('File size:', fileSizeInBytes, 'bytes');
        let totalBytesUploaded = 0;

        const response = await youtube.videos.insert(uploadParams, {
            onUploadProgress: evt => {
                if (evt.bytesRead) {
                    totalBytesUploaded += evt.bytesRead;
                    const progressPercentage = Math.min((totalBytesUploaded / fileSizeInBytes) * 100, 100);
                    console.log(`Upload Progress: ${progressPercentage.toFixed(2)}%`);

                } else {
                    console.log('No bytes uploaded yet.');
                }
            }
        });

        console.log('Video uploaded:', response.data);
        res.json({
          msg:"video is sended"
        })
        
    } catch (error) {
        console.error('Error uploading video:', error);
        res.status(500).json({ error: "Error uploading video" });
    }
}
// router.post('/upload_video', authMiddleware, async (req, res) => {
//     try {
//       const { success, error } = checkvideodetails.safeParse(req.body.body);
  
//       if (error) {
//         console.log("Validation error:", error);
//         return res.json({ msg: error });
//       }
  
//       if (success) {
//         const video_id = req.body.body.id;
//         const updated_description = req.body.body.description;
//         console.log(updated_description);
  
//         let videodata = await videos.find({ _id: video_id }).select('-__v');
//         const dbdescription = videodata[0].video_description;
  
//         if (updated_description.localeCompare(dbdescription) !== 0) {
//           console.log("Description changed");
//           const filter = { _id: video_id };
//           const update = { video_description: updated_description };
//           await videos.findOneAndUpdate(filter, update);
  
//           videodata = await videos.find({ _id: video_id }).select('-__v');
//           console.log("Update successful");
//         }
  
//         const videoTitle = videodata[0].video_title;
//         const videoDescription = videodata[0].video_description;
//         const thumbnailfilename = videodata[0].thumbnail_name;
//         const thumbnailFilePath = path.join(__dirname, '..', 'thumbnails', thumbnailfilename);
//         const videoFileName = videodata[0].video_name;
//         const videoFilePath = path.join(__dirname, '..', 'videos', videoFileName);
  
//         const AnotherToken = req.headers['anothertoken'];
//         const authHeader = req.headers['authorization'];
  
//         if (AnotherToken == "null") {
//           console.log("Redirected to signup");
//           return res.json({ msg: "token is not set" });
//         }
//         if (authHeader === "Bearer null") {
//           return res.json({ msg: "youtube token is not set" });
//         }
  
//         console.log("\n\nStarting video upload\n\n");
//         fs.readFile('client_secret.json', (err, content) => {
//           if (err) {
//             console.log('Error loading client secret file:', err);
//             return;
//           }
//           authorize(JSON.parse(content), res, authHeader, (oauth2Client) => {
//             uploadVideo(oauth2Client, req, res, video_id, videoTitle, videoDescription, videoFilePath, thumbnailFilePath);
//           });
//         });
//       }
//     } catch (e) {
//       console.log("Error in upload:", e);
//     }
//   });
  
//   // Function to upload a video to YouTube
//   async function uploadVideo(auth, req, res, videoId, videoTitle, videoDescription, videoFilePath, thumbnailFilePath) {
//     const youtube = google.youtube({ version: 'v3', auth });
//     try {
//       const videoFile = fs.createReadStream(videoFilePath);
//       const uploadParams = {
//         part: 'snippet,status',
//         requestBody: {
//           snippet: { title: videoTitle, description: videoDescription },
//           status: { privacyStatus: 'private', selfDeclaredMadeForKids: true }
//         },
//         media: { body: videoFile }
//       };
  
//       const stats = fs.statSync(videoFilePath);
//       const fileSizeInBytes = stats.size;
//       console.log('File size:', fileSizeInBytes, 'bytes');
//       let totalBytesUploaded = 0;
  
//       const response = await youtube.videos.insert(uploadParams, {
//         onUploadProgress: evt => {
//           if (evt.bytesRead) {
//             totalBytesUploaded += evt.bytesRead;
//             const progressPercentage = Math.min((totalBytesUploaded / fileSizeInBytes) * 100, 100);
//             console.log(`Upload Progress: ${progressPercentage.toFixed(2)}%`);
//             uploadProgress[videoId] = progressPercentage.toFixed(2);
//           } else {
//             console.log('No bytes uploaded yet.');
//           }
//         }
//       });
  
//       console.log('Video uploaded:', response.data);
//       uploadProgress[videoId] = 100;
//     } catch (error) {
//       console.error('Error uploading video:', error);
//       res.status(500).json({ error: "Error uploading video" });
//     }
//   }
  
//   router.get('/upload_progress/:videoId', (req, res) => {
//     const { videoId } = req.params;
//     const progress = uploadProgress[videoId] || 0;
//     res.json({ progress });
//   });
  
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
