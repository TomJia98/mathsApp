// import logo from './logo.svg';
import "./App.css";
import React from "react";
import Landing from "./pages/landing.js";
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";

function App() {
  return (
    <Router>
      <div className="App"></div>
      <Routes>
        <Route path="/" element={<Landing />} />
        {/* <Route path="/signup" element={<Signup />} />
              <Route path="/login" element={<Login />} /> */}
      </Routes>
    </Router>
  );
}

export default App;
