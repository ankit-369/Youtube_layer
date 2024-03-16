import { BrowserRouter, Routes, Route } from "react-router-dom";
import Home from './components/creator_comp/home'
import SignupPage from './components/creator_comp/signup'
import Save from './components/creator_comp/save'
import Editor_home from "./components/editor_comp/editor_home";
const App = () => {
  
  
  
  return (
    <BrowserRouter>
      <Routes>
        <Route path='/' element={<Save />}>  </Route>
        <Route path='/home' element={<Home />}>  </Route>
        <Route path='/signup' element={<SignupPage />}>  </Route>
        <Route path='/editor' element={<Editor_home />}>  </Route>

      </Routes>
    </BrowserRouter>
  );
};



export default App;

