const express = require('express');
const router = express.Router();
const path = require('path');
var cors = require('cors')
const { users } = require('../db')
const app = express();
app.use(cors());
app.use(express.json());
const z = require('zod')

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




module.exports = router;
