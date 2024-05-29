
/*

    this cronjob file is for incase you want to delete all thumbnails and videos.

    it will delete all thumbnail and videos at 00:00 everyday 

*/


const fs = require('fs');
const path = require('path');
const cron = require('node-cron');

// Directories to clean
const directories = ['videos', 'thumbnails'];

// Function to remove all files in a directory
function cleanDirectory(dir) {
  fs.readdir(dir, (err, files) => {
    if (err) {
      console.error(`Error reading directory ${dir}:`, err);
      return;
    }

    files.forEach(file => {
      const filePath = path.join(dir, file);
      fs.unlink(filePath, err => {
        if (err) {
          console.error(`Error deleting file ${filePath}:`, err);
        } else {
          console.log(`Deleted file ${filePath}`);
        }
      });
    });
  });
}

// Schedule the cleanup to run at 00:00 every day
cron.schedule('0 0 * * *', () => {
  console.log('Running cleanup job at 00:00');
  directories.forEach(dir => {
    cleanDirectory(dir);
  });
});


console.log('Cleanup script scheduled');
