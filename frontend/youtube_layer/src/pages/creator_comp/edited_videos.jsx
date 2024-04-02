import React, { useEffect, useState } from 'react';
import Sidebar from '../../components/creatorsidebar';
import axios from 'axios';

function Edited_videos() {
    const string = localStorage.getItem('string');
    const [videodata, setVideodata] = useState([]);
    const [selectedVideo, setSelectedVideo] = useState(null);

    useEffect(() => {
        const getVideos = async () => {
            try {
                const response = await axios.post('http://localhost:3000/api/v1/creator/edited_video', { string });
                console.log(response);
                const videoData = response.data.videodata;
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
        <div className='flex'>
            <Sidebar />
            <div className="container mx-auto ml-5">
                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
                    {videodata.map((video, index) => (
                        <div key={index} className="bg-white rounded-lg shadow-md" onClick={() => handleThumbnailClick(video)}>
                            <img src={`http://localhost:3000/api/v1/creator/thumbnails/${video.thumbnail_name}`} alt="Thumbnail" className="w-full cursor-pointer" />
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

    const [videoid, setvideoid] = useState('');
    const [videodescription, setvideodescription] = useState('');
    useEffect(() => {
        setvideodescription(description); // Set your initial description here
        setvideoid(videoId);
    }, [videoId]);

    const handleupload = async (e) => {
        // e.preventDefault();
        const youtubekey = localStorage.getItem('youtubekey');
        const token = localStorage.getItem('token');
        console.log(token);
        const headers = {
            Authorization: `Bearer ${youtubekey}`,
            Anothertoken: `${token}`
        };


        setvideoid(e.target.value)

        console.log("inside video ", videodescription);
        console.log("video id ", videoid);

        const body = {
            description: videodescription,
            id: videoid
        }
        const response = await axios.post('http://localhost:3000/api/v1/creator/upload_video', { body },{headers})
        console.log("this is response", response);
    }


    return (
        <div className="fixed top-0 left-0 w-full h-full bg-gray-800 bg-opacity-75 flex items-center justify-center overflow-auto">
            <div className="max-w-4xl mt-64  p-6 bg-white rounded-lg shadow-md flex flex-col" >
                <button onClick={onClose} className="absolute top-0 right-0 mt-2 mr-2 text-black hover:text-gray-800 focus:outline-none">
                    <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12"></path></svg>
                </button>
                <div className="w-full  h-auto mb-4">
                    <video controls className="w-full">
                        <source src={videoUrl} type="video/mp4" />
                        Your browser does not support the video tag.
                    </video>
                </div>
                <h1 className="text-3xl font-bold mb-2">{title}</h1>
                <div className="h-96">
                    <textarea onChange={(e) => { setvideodescription(e.target.value) }} className="text-gray-700 w-full h-full resize-none" value={videodescription} />
                </div>
                <div className="self-end mt-6 mr-10">
                    <button onClick={handleupload} value={videoId} className="bg-gray-800  text-white px-4 py-2 rounded-md hover:bg-green-600 focus:outline-none focus:ring-2 focus:ring-green-500">
                        Upload</button>
                </div>
            </div>
        </div>


    );
};

export default Edited_videos;
