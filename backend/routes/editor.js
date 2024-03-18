const express = require('express');
const router = express.Router();
const multer = require('multer');
const path = require('path');
var cors = require('cors')
const { users , videos} = require('../db')
const app = express();
app.use(cors());
app.use(express.json());
const z = require('zod')
const { v4: uuidv4 } = require('uuid');


const mystring = z.string();


router.post('/creatordata', async (req, res) => {

    const string = mystring.parse(req.body.string);


    const creator = await users.findOne({
        string
    })

    const creatordata = {
        name: creator.name,
        email: creator.email,
        image: creator.image
    }


    res.json({
        creatordata
    })



});

router.get('/image/:imageName', (req, res) => {
    try {
      const imageName = req.params.imageName;
      const imagePath = path.join(__dirname, '..','/upload', imageName); // Adjust the path as per your setup
  
      // Send the image file as a response
      res.sendFile(imagePath);
    } catch (error) {
      console.error('Error:', error);
      res.status(500).json({ error: 'Internal Server Error' });
    }
  });


  const videoFileSchema = z.object({
    type: z.string().refine((type) => {
      const allowedTypes = ['video/mp4', 'video/mpeg', 'video/quicktime'];
      return allowedTypes.includes(type);
    }, {
      message: 'Invalid file format. Please upload a valid video file (MP4, MPEG, or QuickTime).'
    }),
  });
  
  const storage = multer.diskStorage({
    destination: function (req, file, cb) {
      cb(null, path.join(__dirname, '../videos')); // Specify the directory where uploaded files will be stored
    },
    filename: async function (req, file, cb) {
      try {
        // Validate file type
        const { type } = videoFileSchema.parse({ type: file.mimetype });
  
        // Generate unique filename
        const uniqueString = uuidv4();
        const nospace = file.originalname.replace(/\s+/g, '');
        const video = `${uniqueString}-${nospace}`;
  
        // Check if the file already exists
        // Note: Implement this logic yourself
        // Example:
        // if (fileAlreadyExists(video)) {
        //   throw new Error('File with the same name already exists');
        // }
  
        // Call the callback with the filename
        cb(null, video);
      } catch (error) {
        // Handle error properly
        console.error('Error handling file:', error);
        cb(error); // Pass the error to Multer
      }
    }
  });
  
  const upload = multer({ storage: storage });
  
  
  router.post('/sendvideo', upload.single('video'), async (req, res) => {
    try {
      const bodys = req.body;
      console.log(bodys);
      console.log(req.file);
  
      res.json({
        msg: bodys
      });
    } catch (error) {
      console.error(error); // Log the error
      res.status(500).json({ error: 'Internal Server Error' }); // Send an error response
    }
  });

module.exports = router;
