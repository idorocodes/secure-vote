import Home from "./Home"
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import Login from "./Login";


const App = () =>{
  return(
  <BrowserRouter>
      <Routes>

        <Route path="/" element={<Home/>}/>
          <Route path="/login" element={<Login/>}/>

        </Routes>
        </BrowserRouter>
  )
}


export default App;