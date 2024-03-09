import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { BrowserRouter, Routes, Route, Router } from "react-router-dom";
import Home from './components/creator_comp/home'

const App = () => {


  return (
    <BrowserRouter>
      <Routes>
        <Route path='/' element={<Home />}>  </Route>
      </Routes>
    </BrowserRouter>
  );
};

export default App;

