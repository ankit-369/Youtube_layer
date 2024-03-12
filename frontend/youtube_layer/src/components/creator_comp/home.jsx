import React, { useEffect, useState } from 'react';
import axios from 'axios';

const Home = () => {
  const [videos, setVideos] = useState([]);
  const [channels, setChannels] = useState([]);

  useEffect(() => {
    const youtubekey = localStorage.getItem('youtubekey');
    const headers = youtubekey ? { Authorization: `Bearer ${youtubekey}` } : {};

    const fetchData = async () => {
      try {
        const [videosResponse, channelsResponse] = await Promise.all([
          axios.get('http://localhost:3000/api/v1/creator/video', { headers }),
          axios.get('http://localhost:3000/api/v1/creator/info', { headers })
        ]);
        setVideos(videosResponse.data.videos);
        setChannels(channelsResponse.data.channels);
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
      {channels.length === 0 ? (
        <button onClick={handleRedirect}>Login first</button>
      ) : (
        <>
          <div className="flex">
            <aside className="w-64 h-screen bg-gray-800 p-4">
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
            </aside>
            <main className="flex-1">
              <div className="grid grid-cols-4 gap-4 p-4">
                {videos.map((video, index) => (
                  <div className="col-span-1" key={index}>
                    <img
                      onClick={() => window.open(video.videoUrl,'_blank')}
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
        </>
      )}
    </div>
  );
};

export default Home;
