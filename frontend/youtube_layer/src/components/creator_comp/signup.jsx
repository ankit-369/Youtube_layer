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
        <div>
        <h2>Sign Up</h2>
        <form onSubmit={handleSignup} >
          <div>
            <label htmlFor="name">Name:</label>
            <input type="text" id="name" value={name} onChange={handleNameChange} />
          </div>
          <div>
            <label htmlFor="email">Email:</label>
            <input type="email" id="email" value={email} onChange={handleEmailChange} />
          </div>
          <div>
            <label htmlFor="password">Password:</label>
            <input type="password" id="password" value={password} onChange={handlePasswordChange} />
          </div>
          <div>
            <label>Role:</label>
            <label>
              <input type="radio" name="role" value="creator" checked={role === 'creator'} onChange={handleRoleChange} />
              Creator
            </label>
            <label>
              <input type="radio" name="role" value="editor" checked={role === 'editor'} onChange={handleRoleChange} />
              Editor
            </label>
          </div>
          <div>
            <label htmlFor="image">Image:</label>
            <input type="file" id="image" accept="image/*" onChange={handleImageChange} />
            <img src={image} />

          </div>
          <button type="submit">Sign Up</button>
        </form>
      </div>
    );
}

export default SignupPage;
