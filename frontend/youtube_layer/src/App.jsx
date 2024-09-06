import { BrowserRouter, Routes, Route } from "react-router-dom";
import Home from './pages/creator_comp/home'
import SignupPage from './pages/creator_comp/signup'
import Save from './pages/creator_comp/save'
import Edited_videos from "./pages/creator_comp/edited_videos";
import Editor_home from "./pages/editor_comp/editor_home";
import Login from "./pages/creator_comp/login";
const App = () => {
  
  
  
  return (
    <BrowserRouter>
      <Routes>
        <Route path='/' element={<Save />}>  </Route>
        <Route path='/home' element={<Home />}>  </Route>
        <Route path='/signup' element={<SignupPage />}>  </Route>
        <Route path='/edited_videos' element={<Edited_videos />}>  </Route>

        {/* editor route */}
        <Route path='/editor' element={<Editor_home />}>  </Route>
        
        <Route path='/login' element={<Login />}>  </Route>


      </Routes>
    </BrowserRouter>
  );
};



export default App;

