import React, { useEffect, useState,useRef } from 'react';
import Sidebar from '../../components/creatorsidebar';
import axios from 'axios';
import { useNavigate } from "react-router-dom";


function Edited_videos() {
  const string = localStorage.getItem('string');
  const [videodata, setVideodata] = useState([]);
  const [selectedVideo, setSelectedVideo] = useState(null);
  const navigate = useNavigate();

  useEffect(() => {
    const getVideos = async () => {
      const youtubekey = localStorage.getItem('youtubekey');
      const token = localStorage.getItem('token');
      console.log(token);
      const headers = {
        Authorization: `Bearer ${youtubekey}`,
        Anothertoken: `${token}`
      };
      try {
        const response = await axios.post('http://localhost:3000/api/v1/creator/edited_video', { string }, { headers });
        // console.log("this i sedited video response " ,response);
        const videoData = response.data.videodata;

        // if(response.data.msg === 'wrong user token'){
        //     console.log("inside msg haha");

        //     navigate('/login');
        // }

        setVideodata(videoData);
      } catch (error) {
        console.error('Error fetching videos:', error);
      }
    };


    getVideos();
  }, []);

  const handleThumbnailClick = (video) => {
    setSelectedVideo(video);
  };

  const handleCloseVideoPage = () => {
    setSelectedVideo(null);
  };
  // console.log(videodata[1].video_description);
  return (
    <div className="min-h-screen bg-gradient-to-br bg-gray-900  text-white flex">
      <Sidebar />
      <div className="container mx-auto ml-5">
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
          {videodata.map((video, index) => (
            <div
              key={index}
              className="bg-gray-800 rounded-lg shadow-lg overflow-hidden transition-transform duration-300 hover:scale-105 cursor-pointer"
              onClick={() => handleThumbnailClick(video)}
            >
              <img
                src={`http://localhost:3000/api/v1/creator/thumbnails/${video.thumbnail_name}`}
                alt="Thumbnail"
                className="w-full h-48 object-cover rounded-t-lg"
              />
              <div className="p-4">
                <h3 className="text-lg font-semibold mb-2">{video.video_title}</h3>
                <p className="text-gray-400 line-clamp-2">{video.video_description}</p>
              </div>
            </div>
          ))}
        </div>
      </div>
      {selectedVideo && (
        <VideoPage
          videoId={selectedVideo._id}
          title={selectedVideo.video_title}
          description={selectedVideo.video_description}
          videoUrl={`http://localhost:3000/api/v1/creator/video/${selectedVideo.video_name}`}
          onClose={handleCloseVideoPage}
        />
      )}
    </div>
  );
}





const VideoPage = ({ videoId, title, description, videoUrl, onClose }) => {
  const [progress, setProgress] = useState(0);
  const [videoid, setVideoid] = useState(videoId);
  const [videodescription, setVideodescription] = useState(description);
  const isPollingActive = useRef(false);

  useEffect(() => {
    setVideodescription(description);
    setVideoid(videoId);

    const checkProgress = async () => {
      if (isPollingActive.current) return;

      isPollingActive.current = true;

      try {
        const response = await axios.get(`http://localhost:3000/api/v1/creator/upload_progress/${videoId}`);
        const { progress } = response.data;
        setProgress(progress);

        if (progress < 100) {
          setTimeout(() => {
            isPollingActive.current = false;
            checkProgress();
          }, 1000);
        } else {
          isPollingActive.current = false;
        }
      } catch (error) {
        console.error("Error checking progress:", error);
        isPollingActive.current = false;
      }
    };

    // Start polling when the component mounts
    checkProgress();

    // Clean up function
    return () => {
      isPollingActive.current = true; // Stop any further polling
    };
  }, [videoId, description]);
  
  const handleUpload = async () => {
    const youtubekey = localStorage.getItem('youtubekey');
    const token = localStorage.getItem('token');
    const headers = {
      Authorization: `Bearer ${youtubekey}`,
      Anothertoken: `${token}`,
    };
    const body = { description: videodescription, id: videoid };

    try {
      const url = `http://localhost:3000/api/v1/creator/upload_video`;
      const response = await axios.post(url, { body }, { headers });

      console.log("Upload response:", response);

      // Start polling for progress after the upload is initiated
      setProgress(0);
      isPollingActive.current = true;
      checkProgress();
    } catch (error) {
      console.error("Error uploading video:", error);
    }
  };

  return (
    <div className="fixed top-0 left-0 w-full h-full bg-gray-900 bg-opacity-75 flex items-center justify-center overflow-auto">
      <div className="max-w-4xl mt-64 p-8 bg-gradient-to-r from-gray-800 to-gray-700 rounded-xl shadow-2xl flex flex-col relative">
        <button
          onClick={onClose}
          className="absolute top-0 right-0 mt-4 px-3 text-white hover:text-gray-300 focus:outline-none transition-colors duration-300"
        >
          <svg
            className="w-6 h-6"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
            xmlns="http://www.w3.org/2000/svg"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth="2"
              d="M6 18L18 6M6 6l12 12"
            ></path>
          </svg>
        </button>
        <div className="w-full h-auto mb-6">
          <video controls className="w-full rounded-lg shadow-lg">
            <source src={videoUrl} type="video/mp4" />
            Your browser does not support the video tag.
          </video>
        </div>
        <h1 className="text-3xl font-bold mb-4 text-white">
          {title}
        </h1>
        <div className="h-96 mb-6">
          <textarea
            onChange={(e) => {
              setVideodescription(e.target.value);
            }}
            className="text-gray-300 w-full h-full resize-none bg-gray-800 rounded-lg p-4 shadow-lg focus:outline-none focus:ring-2 focus:ring-purple-600"
            value={videodescription}
          />
        </div>
        <div className="self-end mt-6 mr-10">
          <button
            onClick={handleUpload}
            className="bg-gradient-to-r from-purple-600 to-indigo-600 text-white px-6 py-3 rounded-md hover:from-purple-700 hover:to-indigo-700 focus:outline-none focus:ring-2 focus:ring-purple-500 transition-colors duration-300 shadow-lg"
          >
            Upload
          </button>
        </div>

        <div className="w-full bg-gray-200 mt-4 rounded-lg">
          <div className="bg-green-500 h-6 rounded-lg" style={{ width: `${progress}%` }}>
            <p className='text-center text-black'>{progress}%</p>
          </div>
        </div>
      </div>
    </div>
  );
};





// const VideoPage = ({ videoId, title, description, videoUrl, onClose }) => {
//   const [progress, setProgress] = useState(0);
//   const [videoid, setVideoid] = useState('');
//   const [videodescription, setVideodescription] = useState('');

//   useEffect(() => {
//     setVideodescription(description);
//     setVideoid(videoId);
//   }, [videoId, description]);

//   // const handleUpload = async () => {
//   //   const youtubekey = localStorage.getItem('youtubekey');
//   //   const token = localStorage.getItem('token');
//   //   const headers = {
//   //     Authorization: `Bearer ${youtubekey}`,
//   //     Anothertoken: `${token}`
//   //   };

//   //   const body = {
//   //     description: videodescription,
//   //     id: videoid
//   //   };

//   //   // try {
//   //   //   // const queryString = new URLSearchParams(body).toString();
//   //   //   const url = `http://localhost:3000/api/v1/creator/upload_video`;
    
//   //   //   const response = await axios.post(url, { body },{ headers });
//   //   //   console.log("Upload response:", response);
//   //   // } catch (error) {
//   //   //   console.error("Error uploading video:", error);
//   //   // }
   

    
   
  

//   // };

//   const handleUpload = async () => {
//     const youtubekey = localStorage.getItem('youtubekey');
//     const token = localStorage.getItem('token');
//     const headers = {
//         Authorization: `Bearer ${youtubekey}`,
//         Anothertoken: `${token}`
//     };
//     const body = { description: videodescription, id: videoid };

//     try {
//         const url = `http://localhost:3000/api/v1/creator/upload_video`;
//         const response = await axios.post('http://localhost:3000/api/v1/creator/upload_video', { body }, { headers });

//           // const response = await axios.post(url, { body },{ headers });
//           console.log("Upload response:", response);

//         // Set up WebSocket connection
//         const socket = new WebSocket(`ws://${window.location.host}`);

//         socket.onopen = () => {
//             console.log('WebSocket connection established');
//         };

//         socket.onmessage = (event) => {
//             const data = JSON.parse(event.data);
//             if (data.progress !== undefined) {
//                 const progressPercentage = parseFloat(data.progress);
//                 setProgress(progressPercentage);
//             }
//         };

//         socket.onerror = (error) => {
//             console.error('WebSocket error:', error);
//             // Handle error here, e.g., display a message to the user
//         };

//         socket.onclose = () => {
//             console.log('WebSocket connection closed');
//         };

//         // Clean up the WebSocket connection when the component unmounts
//         return () => {
//             socket.close();
//         };
//     } catch (error) {
//         console.error("Error uploading video:", error);
//     }
// };  


//   console.log("this is progress of event :-", progress);
//   return (
//     <div className="fixed top-0 left-0 w-full h-full bg-gray-900 bg-opacity-75 flex items-center justify-center overflow-auto">
//       <div className="max-w-4xl mt-64 p-8 bg-gradient-to-r from-gray-800 to-gray-700 rounded-xl shadow-2xl flex flex-col relative">
//         <button
//           onClick={onClose}
//           className="absolute top-0 right-0 mt-4 px-3 text-white hover:text-gray-300 focus:outline-none transition-colors duration-300"
//         >
//           <svg
//             className="w-6 h-6"
//             fill="none"
//             stroke="currentColor"
//             viewBox="0 0 24 24"
//             xmlns="http://www.w3.org/2000/svg"
//           >
//             <path
//               strokeLinecap="round"
//               strokeLinejoin="round"
//               strokeWidth="2"
//               d="M6 18L18 6M6 6l12 12"
//             ></path>
//           </svg>
//         </button>
//         <div className="w-full h-auto mb-6">
//           <video controls className="w-full rounded-lg shadow-lg">
//             <source src={videoUrl} type="video/mp4" />
//             Your browser does not support the video tag.
//           </video>
//         </div>
//         <h1 className="text-3xl font-bold mb-4 text-white">
//           {title}
//         </h1>
//         <div className="h-96 mb-6">
//           <textarea
//             onChange={(e) => {
//               setVideodescription(e.target.value);
//             }}
//             className="text-gray-300 w-full h-full resize-none bg-gray-800 rounded-lg p-4 shadow-lg focus:outline-none focus:ring-2 focus:ring-purple-600"
//             value={videodescription}
//           />
//         </div>
//         <div className="self-end mt-6 mr-10">
//           <button
//             onClick={handleUpload}
//             className="bg-gradient-to-r from-purple-600 to-indigo-600 text-white px-6 py-3 rounded-md hover:from-purple-700 hover:to-indigo-700 focus:outline-none focus:ring-2 focus:ring-purple-500 transition-colors duration-300 shadow-lg"
//           >
//             Upload
//           </button>
//         </div>

//         <div className="w-full bg-gray-200 mt-4 rounded-lg">
//           <div className="bg-green-500 h-6 rounded-lg" style={{ width: `${progress}%` }}>
//             <p className='text-center text-black'>{progress}%</p>
//           </div>
//         </div>
//       </div>
//     </div>
//   );
// };


export default Edited_videos;