import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import { CopyToClipboard } from 'react-copy-to-clipboard';

const Sidebar = () => {
  const [copyStatus, setCopyStatus] = useState(false);
  const [string, setString] = useState(localStorage.getItem('string') || '');
  const [channels, setChannels] = useState([]);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchData = async () => {
      const youtubekey = localStorage.getItem('youtubekey');
      const token = localStorage.getItem('token');
      const headers = {
        Authorization: `Bearer ${youtubekey}`,
        Anothertoken: `${token}`
      };
      try {
        const channelsResponse = await axios.get('http://localhost:3000/api/v1/creator/info', { headers });

        if (channelsResponse.data.msg === 'token is not set') {
          navigate('/login');
        }

        if (channelsResponse.data.msg === 'youtube token is not set') {
          window.location.href = 'http://localhost:3000/api/v1/auth';
        }

        setChannels(channelsResponse.data.channels);
      } catch (error) {
        console.error('Error fetching data:', error);
      }
    };

    fetchData();
  }, []);

  const onCopyHandler = (text, result) => {
    if (result) {
      setCopyStatus(true);
      setTimeout(() => setCopyStatus(false), 2500);
    } else {
      // Handle the error scenario
      alert('Failed to copy text. Please try again.');
    }
  };

  return (
    <aside className="w-64 h-screen bg-gray-800 p-4">
      {channels.map(channel => (
        <div key={channel.id} className="flex flex-col items-center mb-4">
          <img
            alt="Profile image"
            className="w-20 h-20 rounded-full"
            src={channel.snippet.thumbnails.default.url}
            style={{
              aspectRatio: '100/100',
              objectFit: 'cover'
            }}
          />
          <span className="mt-2 text-white">{channel.snippet.title}</span>
          <p className="text-gray-400 text-xs mt-1">{channel.snippet.description}</p>
          <div className="text-gray-400 text-xs mt-1">
            <p>Subscribers: {channel.statistics.subscriberCount}</p>
            <p>Videos: {channel.statistics.videoCount}</p>
          </div>
        </div>
      ))}
      <textarea
        className="bg-gray-800 text-white pt-10"
        value={string}
        onChange={e => setString(e.target.value)}
        placeholder="Type or paste text here..."
      />
      <CopyToClipboard text={string} onCopy={onCopyHandler}>
        <button className="text-gray-400">Copy to Clipboard</button>
      </CopyToClipboard>
      {copyStatus && <p className="text-gray-400">Text copied to clipboard!</p>}

      <button onClick={()=>{navigate('/edited_videos')}} className="w-full bg-gradient-to-r from-gray-800 via-gray-900 to-black text-white font-bold py-2 px-4 rounded-md shadow-md hover:from-gray-900 hover:via-gray-800 hover:to-gray-900 transition duration-300 mt-4">
        Edited Videos
      </button>
    </aside>
  );
};

export default Sidebar;
