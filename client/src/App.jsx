import Home from "./Home";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import Login from "./Login";
import ProtectedRoute from "./protected";
import Dashboard from "./Dashboard";

const App = () => {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/login" element={<Login />} />
        <Route element={<ProtectedRoute />}>
          <Route path="/dashboard" element={<Dashboard/>} />
        </Route>
      </Routes>
    </BrowserRouter>
  );
};

export default App;
