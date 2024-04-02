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
    <div className="App">
      { videos ? ( // Check if channels and videos exist
        <div className="flex">
          <Sidebar/>
          {/* <aside className="w-64 h-screen bg-gray-800 p-4">
            {channels.map(channel => (
              <div key={channel.id} className="flex flex-col items-center">
                <img
                  alt="Profile image"
                  className="w-20 h-20 rounded-full"
                  height="100"
                  src={channel.snippet.thumbnails.default.url}
                  style={{
                    aspectRatio: "100/100",
                    objectFit: "cover",
                  }}
                  width="100"
                />
                <span className="mt-2 text-white">{channel.snippet.title}</span>
                <p className="text-gray-400 text-xs mt-1">{channel.snippet.description}</p>
                <div className="text-gray-400 text-xs mt-1">
                  <p>Subscribers: {channel.statistics.subscriberCount}</p>
                  <p>Videos: {channel.statistics.videoCount}</p>
                </div>
              </div>
            ))}
            <textarea className='bg-gray-800 text-white pt-10'
              value={string}
              onChange={(e) => setTextToCopy(e.target.value)}
              placeholder="Type or paste text here..."
            />
            <CopyToClipboard text={string} onCopy={onCopyHandler}>
              <button className='text-gray-400'>Copy to Clipboard</button>
            </CopyToClipboard>
            {copyStatus && <p className='text-gray-400'>Text copied to clipboard!</p>}

            <button className="w-full bg-gradient-to-r from-gray-800 via-gray-900 to-black text-white font-bold py-2 px-4 rounded-md shadow-md hover:from-gray-900 hover:via-gray-800 hover:to-gray-900 transition duration-300 mt-4">
  Edited Videos
</button>


          </aside> */}
          <main className="flex-1">
            <div className="grid grid-cols-4 gap-4 p-4">
              {videos.map((video, index) => (
                <div className="col-span-1" key={index}>
                  <img
                    onClick={() => window.open(video.videoUrl, '_blank')}
                    alt="Video thumbnail"
                    className="w-full h-auto cursor-pointer"
                    height="200"
                    src={video.thumbnail}
                    style={{
                      aspectRatio: "200/200",
                      objectFit: "cover",
                    }}
                    width="200"
                  />
                  <h3 className="mt-2 font-bold">{video.title}</h3>
                  <p>{video.description}</p>
                </div>
              ))}
            </div>
          </main>
        </div>
      ) : (
        <p>Loading...</p> // Render a loading indicator while waiting for data
      )}
    </div>
  );

};

export default Home;
