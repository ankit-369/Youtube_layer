import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import Popup from 'reactjs-popup';
import 'reactjs-popup/dist/index.css';
import ReactLoading from "react-loading";
import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

// toast.configure(); // Call toast.configure() to initialize

const Editor_home = () => {
  const navigate = useNavigate();
  const token = localStorage.getItem('token');
  const [loading, setLoading] = useState(false); // State to track loading

  const initialSearch = localStorage.getItem('search') || '';
  const [search, setsearch] = useState(initialSearch);
  useEffect(() => {
    // Save search state to localStorage whenever it changes
    localStorage.setItem('search', search);
  }, [search]);
  const [creator, setcreator] = useState(null);
  const [imageUrl, setImageUrl] = useState('');

  ///   code for handle popup
  const [videotitle, setvideotitle] = useState('');
  const [videodescription, setvideodescription] = useState('');
  const[thumbnailFile,setThumbnailFile]=useState(null)
  const [videoFile, setvideoFile] = useState(null);
  const handlevideo = (e) => {
    setvideoFile(e.target.files[0]);
  };
  const handleThumbnail = (e) => {
    const file = e.target.files[0];
    setThumbnailFile(file);
  };

  //    end handle popup
  useEffect(() => {
    if (!token) {
      navigate('/signup')
    }
  }, [token]);


  const handlesearch = async (event) => {
    event.preventDefault();
    console.log(search);

    try {

      const response = await axios.post('http://localhost:3000/api/v1/editor/creatordata', { string: search })

      console.log(response.data);
      setcreator(response.data.creatordata);

      const imgresponse = await axios.get(`http://localhost:3000/api/v1/editor/image/${response.data.creatordata.image}`)
      setImageUrl(imgresponse.request.responseURL);
    } catch (e) {
      console.log('error in fatching data :- ', e);
    }
  }

  const sendvideo = async (event) => {
    event.preventDefault();
    setLoading(true);

    const videObjData = new FormData();
    videObjData.append('token', token);
    videObjData.append('video', videoFile);
    videObjData.append('thumbnail', thumbnailFile);
    videObjData.append('videodescription', videodescription);
    videObjData.append('videotitle', videotitle);
    videObjData.append('search', search);

    try {
      const videoResponse = await axios.post('http://localhost:3000/api/v1/editor/sendvideo', videObjData, {
        headers: {
          'Content-Type': 'multipart/form-data'
        }
      });
      console.log(videoResponse.data);
      setLoading(false);
      if (videoResponse.data.success) {
        console.log("hah success");
        
      }
    } catch (error) {
      console.error('Error uploading video:', error);
      setLoading(false);
    }
  };
  
  const setsearchfun = (e) => setsearch(e.target.value)

  if(loading){
    return (
      <LoadingComponent />
    )
  }

  return (

    <div className="h-screen flex flex-col gap-4">
      <form onSubmit={handlesearch}>
        <header className="bg-gray-800 text-white p-4 flex flex-row gap-11">
          <input placeholder="Search..." type="text" value={search} onChange={setsearchfun} className="w-full px-3 py-2 rounded-md bg-gray-700 text-white" />
          <button type="submit" className="inline-flex bg-gray-700 text-white items-center justify-center whitespace-nowrap text-sm font-medium ring-offset-background transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 bg-primary text-primary-foreground hover:bg-primary/90 h-11 px-8 rounded-full">Search</button>
        </header>
      </form>
      <ToastContainer/>
      <div className="grid grid-cols-12 gap-4">
        <div className="col-span-2 bg-gray-700 text-white">
          <div className="flex flex-col items-center gap-4 p-4">
            <img src={imageUrl} width="100" height="100" alt="Profile Image" className="rounded-full" style={{ aspectRatio: '80 / 80', objectFit: 'cover' }} />
            <div className="text-center">
              <p className="text-sm font-medium">{creator && creator.name ? creator.name : "user name"}</p>
              <p className="text-xs text-gray-400">{creator && creator.email ? creator.email : "user@gmail.com"}</p>
            </div>
          </div>
        </div>

        <div className="col-span-10">
          <div className="flex items-center gap-4">
            <button className="inline-flex items-center justify-center whitespace-nowrap text-sm font-medium ring-offset-background transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 hover:bg-accent hover:text-accent-foreground h-10 w-10 rounded-full">
              <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="w-4 h-4">
                <path d="m15 18-6-6 6-6"></path>
              </svg>
            </button>
            <h1 className="text-lg font-bold">Sent Videos</h1>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            <div className="rounded-lg border bg-card text-card-foreground shadow-sm" data-v0-t="card">
              <div className="aspect-16/9 relative">
                <img src="https://img.etimg.com/thumb/msid-96863993,width-300,height-225,imgsize-48048,resizemode-75/vinland-saga-season-2-episode-1-all-you-need-to-know.jpg" width="400" height="225" alt="Thumbnail" className="object-cover rounded-t-lg" style={{ aspectRatio: '400 / 225', objectFit: 'cover' }} />
                <div className="inline-flex items-center rounded-full whitespace-nowrap border px-2.5 py-0.5 w-fit text-xs font-semibold transition-colors focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 border-transparent bg-primary text-primary-foreground hover:bg-primary/80 absolute top-2 right-2">
                  Live
                </div>
              </div>
              <div className="p-4 flex flex-col gap-2">
                <p className="text-sm leading-none text-gray-500">Video</p>
                <h3 className="font-semibold whitespace-nowrap tracking-tight text-base">Introduction to JavaScript</h3>
                <p className="text-sm leading-none text-gray-500">5:32</p>
              </div>
            </div>
            <div className="rounded-lg border bg-card text-card-foreground shadow-sm" data-v0-t="card">
              <div className="aspect-16/9 relative">
                <img src="https://img.etimg.com/thumb/msid-96863993,width-300,height-225,imgsize-48048,resizemode-75/vinland-saga-season-2-episode-1-all-you-need-to-know.jpg" width="400" height="225" alt="Thumbnail" className="object-cover rounded-t-lg" style={{ aspectRatio: '400 / 225', objectFit: 'cover' }} />
              </div>
              <div className="p-4 flex flex-col gap-2">
                <p className="text-sm leading-none text-gray-500">Video</p>
                <h3 className="font-semibold whitespace-nowrap tracking-tight text-base">Styling with Tailwind CSS</h3>
                <p className="text-sm leading-none text-gray-500">10:17</p>
              </div>
            </div>
            <div className="rounded-lg border bg-card text-card-foreground shadow-sm" data-v0-t="card">
              <div className="aspect-16/9 relative">
                <img src="/placeholder.svg" width="400" height="225" alt="Thumbnail" className="object-cover rounded-t-lg" style={{ aspectRatio: '400 / 225', objectFit: 'cover' }} />
              </div>
              <div className="p-4 flex flex-col gap-2">
                <p className="text-sm leading-none text-gray-500">Video</p>
                <h3 className="font-semibold whitespace-nowrap tracking-tight text-base">Creating a Next.js App</h3>
                <p className="text-sm leading-none text-gray-500">7:45</p>
              </div>
            </div>
          </div>
        </div>
        <div className="col-span-2 ">
          <div className="flex flex-col gap-4">
            <Popup
              trigger={
                <button className="inline-flex bg-gray-700 text-white items-center justify-center whitespace-nowrap text-sm font-medium ring-offset-background transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 bg-primary text-primary-foreground hover:bg-primary/90 h-11 px-8 rounded-full">
                  Add Video
                </button>
              }
              modal
              nested
              position="right center"
              closeOnDocumentClick // Add this prop to close the popup when clicking outside
            >
              {(close) => (
                <div className="fixed inset-0 flex items-center justify-center bg-gray-800 bg-opacity-50" onClick={close}>
                  <div className="relative w-96 mx-auto p-6 bg-gray-100 rounded-lg shadow-md" onClick={(e) => e.stopPropagation()}>
                    {/* Stop propagation to prevent closing when clicking inside the popup */}
                    <button onClick={close} className="absolute top-0 right-2 bg-transparent border-none outline-none text-gray-700 hover:text-green-600">
                      <i className="fa fa-close"></i>
                    </button>
                    <h2 className="text-2xl font-semibold mb-4">Upload Your Video</h2>
                  
                    <form onSubmit={sendvideo} >
                      <div className="mb-4">
                        <label htmlFor="title" className="block text-gray-700 font-semibold mb-2">Title</label>
                        <input onChange={(e) => {
                          setTimeout(() => {
                            setvideotitle(e.target.value);
                          }, 3000); // Delay of 1000 milliseconds (1 second)
                        }}
                          type="text"
                          id="title"
                          className="w-full px-3 py-2 rounded-md border-gray-300 focus:outline-none focus:border-blue-500"
                          placeholder="Enter title"
                          required
                        />
                      </div>
                      <div className="mb-4">
                        <label htmlFor="description" className="block text-gray-700 font-semibold mb-2">Description</label>
                        <textarea onChange={(e) => {
                          setTimeout(() => {
                            setvideodescription(e.target.value);
                          }, 3000);
                        }}
                          id="description"
                          className="w-full px-3 py-2 rounded-md border-gray-300 focus:outline-none focus:border-blue-500"
                          placeholder="Enter description"
                          rows="4"
                          required
                        ></textarea>
                      </div>
                      <div className="mb-4">
  <label htmlFor="thumbnail" className="block text-gray-700 font-semibold mb-2">Upload Thumbnail</label>
  <input
    type="file"
    id="thumbnail"
    className="hidden"
    accept="image/*"
    onChange={handleThumbnail}
  />
  <label
    htmlFor="thumbnail"
    className="inline-block bg-blue-500 hover:bg-blue-600 text-white font-semibold py-2 px-4 rounded-lg cursor-pointer transition duration-300"
  >
    Choose Thumbnail
  </label>
  <span className="ml-2" id="thumbnail-name">{thumbnailFile ? thumbnailFile.name : ""}</span>
</div>
                      <div className="mb-4">
                        <label htmlFor="video" className="block text-gray-700 font-semibold mb-2">Upload Video</label>
                        <input
                          type="file"
                          // name="video"
                          id="video"
                          className="hidden"
                          accept="video/*"
                          onChange={handlevideo}
                        />
                        <label
                          htmlFor="video"
                          className="inline-block bg-blue-500 hover:bg-blue-600 text-white font-semibold py-2 px-4 rounded-lg cursor-pointer transition duration-300"
                        >
                          Choose Video
                        </label>
                        <span className="ml-2" id="video-name">{videoFile ? videoFile.name : ""}</span>
                      </div>
                      <button
                        type="submit"
                        className="bg-green-500 hover:bg-green-600 text-white font-semibold py-2 px-4 rounded-lg transition duration-300"
                      >
                        Submit
                      </button>
                    </form>
                  </div>
                </div>
              )}
            </Popup>

          </div>
        </div>
      </div>
    </div>
  )
}



function LoadingComponent(){
  return (
       <div>
           <h2>Loading in ReactJs - GeeksforGeeks</h2>
           <ReactLoading type="balls" color="#0000FF"
               height={100} width={50} />
           <ReactLoading type="bars" color="#0000FF"
               height={100} width={50} />
           <ReactLoading type="bubbles" color="#0000FF"
               height={100} width={50} />
           <ReactLoading type="cubes" color="#0000FF"
               height={100} width={50} />
           <ReactLoading type="cylon" color="#0000FF"
               height={100} width={50} />
           <ReactLoading type="spin" color="#0000FF"
               height={100} width={50} />
           <ReactLoading type="spokes" color="#0000FF"
               height={100} width={50} />
           <ReactLoading
               type="spinningBubbles"
               color="#0000FF"
               height={100}
               width={50}
           />
       </div>
   );
}

// const notify = () => toast("Wow so easy!");

export default Editor_home;