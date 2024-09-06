const express = require('express');
const router = express.Router();
const multer = require('multer');
const path = require('path');
var cors = require('cors')
const { users, videos } = require('../db')
const { JWT_SECRET } = require("../config");
const app = express();
const jwt = require('jsonwebtoken');
const { decodetoken, authMiddleware } = require("./functions");

app.use(cors());
app.use(express.json());
const z = require('zod')
const { v4: uuidv4 } = require('uuid');




const checkdetails = z.object({
  string: z.string(),
  token: z.string()
});

router.post('/creatordata', async (req, res) => {
  const { success, error } = checkdetails.safeParse(req.body);

  if (success) {
    const { string, token } = req.body;
    const creator = await users.findOne({ string });

    if (creator) {
      const creatordata = {
        name: creator.name,
        email: creator.email,
        image: creator.image
      };

      // console.log(token);
      const selfdata = decodetoken(token);

      // console.log(selfdata);
      const sendedvideo = await videos.find({
        editor_email : selfdata
      }).select('-_id  -__v')
// console.log(sendedvideo);
      res.json({ creatordata , sendedvideo});

    } else {
      res.json({ creatordata: "No creator found" });
    }



  } else {
    console.log(error);
    res.json({ creatordata: "Invalid request body" });
  }
});







router.get('/image/:imageName', (req, res) => {
  try {
    const imageName = req.params.imageName;
    const imagePath = path.join(__dirname, '..', '/upload', imageName); // Adjust the path as per your setup

    // Send the image file as a response
    res.sendFile(imagePath);
  } catch (error) {
    console.error('Error:', error);
    res.status(500).json({ message: 'Internal Server in editor js Error' });
  }
});


//   Send video to user
const videoFileSchema = z.object({
  type: z.string().refine((type) => {
    const allowedTypes = ['video/mp4'];
    return allowedTypes.includes(type);
  }, {
    message: 'Invalid file format. Please upload a valid video file (MP4).'
  }),
});
const imageFileSchema = z.object({
  type: z.string().refine((type) => {
    const allowedTypes = ['image/jpeg','image/jpg', 'image/png', 'image/gif']; // Add more allowed image types if needed
    return allowedTypes.includes(type);
  }, {
    message: 'Invalid file format. Please upload a valid image file (JPEG, PNG, or GIF).'
  }),
});

const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    if (file.fieldname === 'video') {
      cb(null, path.join(__dirname, '../videos')); // Specify the directory where uploaded videos will be stored
    } else if (file.fieldname === 'thumbnail') {
      cb(null, path.join(__dirname, '../thumbnails')); // Specify the directory where uploaded thumbnails will be stored
    }
  },
  filename: async function (req, file, cb) {
    try {
      let fileSchema;
      if (file.fieldname === 'video') {
        fileSchema = videoFileSchema;
      } else if (file.fieldname === 'thumbnail') {
        fileSchema = imageFileSchema;
      } else {
        throw new Error('Invalid fieldname');
      }

      // Validate file type
     fileSchema.parse({ type: file.mimetype });

      // Generate unique filename
      const uniqueString = uuidv4();
      const nospace = file.originalname.replace(/\s+/g, '');
      const filename = `${uniqueString}-${nospace}`;

      // Call the callback with the filename
      cb(null, filename);
    } catch (error) {
      // Handle error properly
      if (error instanceof z.ZodError) {
        // Extract error message from Zod validation
        const errorMessage = error.errors[0]?.message || 'Invalid file format.';
        console.error('Validation Error in editor js:', errorMessage);
        cb(new Error(errorMessage)); // Pass the error message to Multer
      } else {
        console.error('Error handling file in editor js:', error.message);
        cb(error); // Pass the generic error to Multer
      }
    }
  }
});

const upload = multer({ storage: storage });

router.post('/sendvideo', upload.fields([{ name: 'video' ,maxCount: 1}, { name: 'thumbnail',maxCount: 1 }]), async (req, res,err) => {
 
  try {
    const creator_string = req.body.search;
    const creator_data = await users.findOne({
      string: creator_string
    })

    let editor_email = "";

    const tokenParts = req.body.token.split(' ');

    jwt.verify(tokenParts[1], JWT_SECRET, async(err, decode) => {
      if (err) {
        console.log(err);
      }
      editor_email = decode.email
      
      // Access the uploaded files
      // const video_name = req.file.filename;
      const videoFile = req.files['video'][0];
      const video_name = videoFile.filename;
      
      let thumbnail_name = "no thumbinail";
      if(req.files['thumbnail']){
        const thumbnailFile = req.files['thumbnail'][0];
         thumbnail_name = thumbnailFile.filename;

      }

      const creator_email = creator_data.email;
      const video_title = req.body.videotitle;
      const video_description = req.body.videodescription;
  
      
      const data = {
        creator_string,
        creator_email,
        editor_email,
        thumbnail_name,
        video_name,
        video_title,
        video_description
      }

        const incertvideo = await videos.create({
          editor_email ,
          thumbnail_name,
          video_name ,
          creator_email ,
          creator_string ,
          video_title ,
          video_description 
      })
    
      if(incertvideo){
        res.json({
          success: true,
        message: 'Video uploaded successfully',
        
        });

      }else{

        res.status(500).json({
          success:false,
          message: 'Failed to upload video',
  
        })
      }
      
      



    })

  } catch (error) {
    console.error(error); // Log the error
    res.status(500).json({ error: 'Internal Server Error' }); // Send an error response
  }
});

module.exports = router;
