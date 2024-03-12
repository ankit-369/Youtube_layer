import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { BrowserRouter, Routes, Route, Router } from "react-router-dom";
import Home from './components/creator_comp/home'
import SignupPage from './components/creator_comp/signup'
import Save from './components/creator_comp/save'
const App = () => {


  return (
    <BrowserRouter>
      <Routes>
        <Route path='/' element={<Save />}>  </Route>
        <Route path='/home' element={<Home />}>  </Route>
        <Route path='/signup' element={<SignupPage />}>  </Route>
      </Routes>
    </BrowserRouter>
  );
};

export default App;

