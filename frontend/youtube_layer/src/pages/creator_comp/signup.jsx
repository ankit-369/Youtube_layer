import React, { useState } from 'react';
import axios from 'axios';
import { useNavigate } from "react-router-dom";


function SignupPage() {
    const navigate = useNavigate();

    const [name, setName] = useState('');
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [role, setRole] = useState('creator');
    const [image, setImage] = useState(null);


    const handleNameChange = (e) => setName(e.target.value);
    const handleEmailChange = (e) => setEmail(e.target.value);
    const handlePasswordChange = (e) => setPassword(e.target.value);
    const handleRoleChange = (e) => setRole(e.target.value);
    const handleImageChange = (e) => setImage(e.target.files[0]);
  
    const handleSignup = async (e) => {
        e.preventDefault();
        
        // Create FormData object to append form data including the image
        const formData = new FormData();
        formData.append('name', name);
        formData.append('email', email);
        formData.append('password', password);
        formData.append('role', role);
        formData.append('image', image); // Assuming `image` is a File object
        
        try {
          // Send POST request with FormData
          const response = await axios.post('http://localhost:3000/api/v1/auth/signup', formData, {
            headers: {
              'Content-Type': 'multipart/form-data' // Important to set the content type for file uploads
            }
          });
      
          // Handle response data as needed
          const mytoken = response.data.token;
          const mystring = response.data.string;
          if(role == "editor"){
            localStorage.setItem('token', `Bearer ${mytoken}`);
            navigate('/editor'); // Assuming `navigate` is defined elsewhere

          }
          if(role == "creator"){
            if(mystring){
              localStorage.setItem('string',mystring);
            }
            localStorage.setItem('token', `Bearer ${mytoken}`);
            navigate('/'); // Assuming `navigate` is defined elsewhere
          }
        } catch (error) {
          console.error('Error signing up:', error);
        }
      };

    return (
      <div className="bg-gray-900 text-white min-h-screen flex items-center justify-center">
      <div className="bg-gray-800 rounded-lg shadow-lg p-8 max-w-md w-full">
        <h2 className="text-3xl font-bold mb-8 text-center">Join Our Community</h2>
        <form onSubmit={handleSignup}>
          <div className="mb-6">
            <label htmlFor="name" className="block font-semibold mb-2">
              Your Name
            </label>
            <input
              type="text"
              id="name"
              value={name}
              onChange={handleNameChange}
              className="w-full bg-gray-700 text-white p-3 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-600"
              placeholder="Enter your name"
            />
          </div>
          <div className="mb-6">
            <label htmlFor="email" className="block font-semibold mb-2">
              Email Address
            </label>
            <input
              type="email"
              id="email"
              value={email}
              onChange={handleEmailChange}
              className="w-full bg-gray-700 text-white p-3 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-600"
              placeholder="Enter your email"
            />
          </div>
          <div className="mb-6">
            <label htmlFor="password" className="block font-semibold mb-2">
              Password
            </label>
            <input
              type="password"
              id="password"
              value={password}
              onChange={handlePasswordChange}
              className="w-full bg-gray-700 text-white p-3 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-600"
              placeholder="Enter your password"
            />
          </div>
          <div className="mb-6">
            <label className="block font-semibold mb-2">Your Role</label>
            <div className="flex items-center">
              <label className="mr-4 flex items-center">
                <input
                  type="radio"
                  name="role"
                  value="creator"
                  checked={role === 'creator'}
                  onChange={handleRoleChange}
                  className="mr-2 focus:ring-indigo-600"
                />
                <span className="text-gray-400">Creator</span>
              </label>
              <label className="flex items-center">
                <input
                  type="radio"
                  name="role"
                  value="editor"
                  checked={role === 'editor'}
                  onChange={handleRoleChange}
                  className="mr-2 focus:ring-indigo-600"
                />
                <span className="text-gray-400">Editor</span>
              </label>
            </div>
          </div>
          <div className="mb-6">
            <label htmlFor="image" className="block font-semibold mb-2">
              Profile Picture
            </label>
            <div className="flex items-center">
              <input
                type="file"
                id="image"
                accept="image/*"
                onChange={handleImageChange}
                className="mr-4 focus:outline-none"
              />
              {image && (
                <img
                  src={URL.createObjectURL(image)}
                  className="h-20 w-20 rounded-full object-cover"
                  alt="Uploaded Image"
                />
              )}
            </div>
          </div>
          <button
            type="submit"
            className="w-full bg-indigo-600 hover:bg-indigo-700 text-white font-semibold py-3 px-6 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-600 focus:ring-offset-2"
          >
            Sign Up
          </button>
        </form>
      </div>
    </div>
    );
}

export default SignupPage;
