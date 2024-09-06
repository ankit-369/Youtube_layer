require('dotenv').config();

const mongoose = require('mongoose');
const { Schema } = mongoose;

const mongoDBUrl = process.env.MONGODB_URL;
mongoose.connect(mongoDBUrl);


const users_schema = new Schema({
    name: String, // String is shorthand for {type: String}
    email: String,
    password: String,
    role:String,
    image:String,
    string : String
  });

const video_schema = new Schema({
  editor_email : String,
  thumbnail_name : String,
  video_name : String,
  creator_email : String,
  creator_string : String,
  video_title : String,
  video_description : String
})

const users = mongoose.model('users', users_schema);
const videos = mongoose.model('videos',video_schema);
// const editor = mongoose.model('editor',editor_schema);

module.exports ={
  users,videos
}