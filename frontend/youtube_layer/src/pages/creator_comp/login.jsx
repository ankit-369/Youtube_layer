import React, { useState } from 'react';
import axios from 'axios';
import { useNavigate } from "react-router-dom";

function Login() {
    const navigate = useNavigate();


    const [email, setemail] = useState("");
    const [password, setpassword] = useState("");

    const handlelogin = async (event) => {
        event.preventDefault();
        const bodydata = {
            email, password
        }

        const response = await axios.post("http://localhost:3000/api/v1/auth/login", bodydata);
        console.log(response.data);

        const mytoken = response.data.token;
        const mystring = response.data.string;
        const role = response.data.role;
        if (role == "editor") {
            localStorage.setItem('token', `Bearer ${mytoken}`);
            navigate('/editor'); // Assuming `navigate` is defined elsewhere

        }
        if (role == "creator") {
            if (mystring) {
                localStorage.setItem('string', mystring);
            }
            localStorage.setItem('token', `Bearer ${mytoken}`);
            navigate('/'); // Assuming `navigate` is defined elsewhere
        }
    }


    return (
        <div className="min-h-screen flex items-center justify-center bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
            <div className="max-w-md w-full space-y-8">
                <div>
                    <h2 className="mt-6 text-center text-3xl font-extrabold text-gray-900">Sign in to your account</h2>
                </div>

                <form className="mt-8 space-y-6" onSubmit={handlelogin}>
                    <input type="hidden" name="remember" defaultValue="true" />
                    <div className="rounded-md shadow-sm -space-y-px">
                        <div>
                            <label htmlFor="email-address" className="sr-only">Email address</label>
                            <input onChange={(e) => setTimeout(() => {
                                setemail(e.target.value)
                            }, 1000)} id="email-address" name="email" type="email" required className="appearance-none rounded-none relative block w-full px-3 py-2 border border-gray-300 placeholder-gray-500 text-gray-900 rounded-t-md focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 focus:z-10 sm:text-sm" placeholder="Email address" />
                        </div>
                        <div>
                            <label htmlFor="password" className="sr-only">Password</label>
                            <input onChange={(e) => setTimeout(() => {
                                setpassword(e.target.value)
                            }, 1000)} id="password" name="password" type="password" autoComplete="current-password" required className="appearance-none rounded-none relative block w-full px-3 py-2 border border-gray-300 placeholder-gray-500 text-gray-900 rounded-b-md focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 focus:z-10 sm:text-sm" placeholder="Password" />
                        </div>
                    </div>


                    <div>
                        <button type="submit" className="group relative w-full flex justify-center py-2 px-4 border border-transparent text-sm font-medium rounded-md text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500">
                            <span className="absolute left-0 inset-y-0 flex items-center pl-3">
                                {/* Heroicon name: solid/lock-closed */}
                                <svg className="h-5 w-5 text-indigo-500 group-hover:text-indigo-400" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" aria-hidden="true">
                                    <path fillRule="evenodd" d="M10 12a2 2 0 100-4 2 2 0 000 4z" />
                                    <path fillRule="evenodd" d="M4 8V6a6 6 0 1112 0v2h1a1 1 0 011 1v7a3 3 0 01-3 3H5a3 3 0 01-3-3v-7a1 1 0 011-1h1zm5 0h2V6a4 4 0 10-2 0v2z" clipRule="evenodd" />
                                </svg>
                            </span>
                            Sign in
                        </button>
                    </div>
                </form>
                <div className="text-sm text-center">
                    <p className="text-gray-600">Don't have an account?</p>
                    <a href="/signup" className="font-medium text-indigo-600 hover:text-indigo-500">
                        Sign up here
                    </a>
                </div>
            </div>
        </div>
    )
}

export default Login;