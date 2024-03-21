import React, { useEffect, useState } from 'react';
import Sidebar from '../../components/creatorsidebar';
import axios from 'axios';
import Popup from 'reactjs-popup';
import 'reactjs-popup/dist/index.css';

function Edited_videos(){
    const string = localStorage.getItem('string');
    const [videodata, setvideodata] = useState([]);
    const [videourl, setvideourl] = useState([]);
    const [thumbnailurl,setthumbnailurl]=useState([]);

    useEffect(() => {
        const getvideos = async () => {
            try {
                const response = await axios.post('http://localhost:3000/api/v1/creator/edited_video', { string });
                console.log(response);
                const videoData = response.data.videodata;

                if (videoData.length > 0) {
                    const videoUrls = await Promise.all(videoData.map(async (video) => {
                        const videoName = video.video_name;
                        const videoResponse = await axios.get(`http://localhost:3000/api/v1/creator/video/${videoName}`);
                        return videoResponse.request.responseURL;
                    }));

                    setvideourl(videoUrls);
                }

                if (videoData.length > 0) {
                    const thumbnailUrls = await Promise.all(videoData.map(async (thumbnail) => {
                        const thumbnailName = thumbnail.thumbnail_name;
                        const thumbnailResponse = await axios.get(`http://localhost:3000/api/v1/creator/thumbnails/${thumbnailName}`);
                        return thumbnailResponse.request.responseURL;
                    }));

                    setthumbnailurl(thumbnailUrls);
                }
                setvideodata(videoData);
            } catch (error) {
                console.error('Error fetching videos:', error);
            }
        };

        getvideos();
    }, []);
console.log(videourl);
console.log(thumbnailurl);
    return (
        <div className='flex'>
            <Sidebar />
            <div className="container mx-auto ml-5">
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-1 gap-4">
                    {videodata.map((video, index) => (
                        <div key={index} className="bg-white w-full rounded-lg shadow-md ">
                            {/* <video controls className="w-full  ">
                                <source src={thumbnailurl[index]} type="video/mp4" />
                                Your browser does not support the video tag.
                            </video> */}
                            <img src={thumbnailurl[index]} alt="Thumbnail" className="w-full" />

                            {/* <div className="p-4">
                                <h2 className="text-xl font-bold mb-2">{video.video_title}</h2>
                                <p className="text-gray-600 mb-4">{video.video_description}</p>
                                <div className="flex items-center">
                                    <p className="text-sm text-gray-700">Sent by: {video.creator_email}</p>
                                </div>
                            </div> */}
                        </div>
                    ))}
                </div>
            </div>
        </div>
    );
}

export default Edited_videos;
