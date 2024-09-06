import  { useEffect } from 'react';
import { useNavigate } from "react-router-dom";
// import { FaGithub, FaTwitter } from 'react-icons/fa';

function Save() {
  const navigate = useNavigate();

  useEffect(() => {
    // Extract token from query parameter
    const params = new URLSearchParams(location.search);
    const token = params.get('token');

    // Store token in localStorage
    if (token) {
      localStorage.setItem('youtubekey', params.get('token'));
    }

    // Redirect to another URL
    navigate('/home');

  },[]);

  return (
    <>
      this can be home page




    </>
  );
}

export default Save;
