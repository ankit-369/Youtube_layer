import React, { useEffect } from 'react';
import { useNavigate } from "react-router-dom";

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
    // history.push('http://localhost:5173/home');
    navigate('/home');

  },[]);

  return (
    <div>
My Protected Component    </div>
  );
}

export default Save;
