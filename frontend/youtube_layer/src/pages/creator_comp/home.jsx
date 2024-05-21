import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { useNavigate } from "react-router-dom";
import { CopyToClipboard } from 'react-copy-to-clipboard';
import Sidebar from '../../components/creatorsidebar';

const Home = () => {
  // const [textToCopy, setTextToCopy] = useState(''); // The text you want to copy
  // const [copyStatus, setCopyStatus] = useState(false); // To indicate if the text was copied
  const [videos, setVideos] = useState([]);
  // const [channels, setChannels] = useState([]);
  const navigate = useNavigate();

  // const onCopyHandler = (text, result) => {
  //   if (result) {
  //     setCopyStatus(true);
  //     setTimeout(() => setCopyStatus(false), 2500);
  //   } else {
  //     // Handle the error scenario
  //     alert('Failed to copy text. Please try again.');
  //   }
  // };
  // const string = localStorage.getItem('string');


  useEffect(() => {
    const youtubekey = localStorage.getItem('youtubekey');
    const token = localStorage.getItem('token');
    console.log(token);
    const headers = {
      Authorization: `Bearer ${youtubekey}`,
      Anothertoken: `${token}`
    };
    const fetchData = async () => {
      try {
        const [videosResponse, channelsResponse] = await Promise.all([
          axios.get('http://localhost:3000/api/v1/creator/video', { headers })
        ]);

      //   if(videosResponse.data.msg === 'wrong user token'){
      //     console.log("inside msg haha");
      //     navigate('/login');
      // }
        setVideos(videosResponse.data.videos);


      } catch (error) {
        console.error('Error fetching data:', error);
      }
    };

    fetchData();
  }, []);

  const handleRedirect = () => {
    window.location.href = "http://localhost:3000/api/v1/auth";
  };

  return (
    <div className="App bg-gray-900 text-white min-h-screen">
      {videos ? (
        // Check if channels and videos exist
        <div className="flex">
          <Sidebar />
          <div className="container mx-auto ml-5">
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
              {videos.map((video, index) => (
                <div
                  key={index}
                  className="bg-gray-800 rounded-lg shadow-lg overflow-hidden transition-transform duration-300 hover:scale-105 cursor-pointer"
                  onClick={() => window.open(video.videoUrl, '_blank')}
                >
                  <img
                    alt="Video thumbnail"
                    className="w-full h-48 object-cover rounded-t-lg"
                    src={video.thumbnail}
                    
                  />
                  <div className="p-4">
                    <h3 className="text-lg font-semibold mb-2">{video.title}</h3>
                    <p className="text-gray-400 line-clamp-2">{video.desription}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      ) : (
        <div className="flex items-center justify-center h-screen">
          <div className="animate-spin rounded-full h-32 w-32 border-t-2 border-b-2 border-gray-600"></div>
        </div>
      )}
    </div>
  );

};

export default Home;
