import React from "react";
import { BrowserRouter as Router, Routes, Route, Link } from "react-router-dom";
import Login from "./Login";
import Signup from "./Signup1";  

import OrganizationHome from "./OrganizationHome";
import SamaritanHome from "./SamaritanHome";

export default function App() {
  return (
    <Router>
      <div className="min-h-screen flex items-center justify-center bg-gray-100">
        <Routes>
          <Route path="/" element={<Login />} />
          <Route path="/login" element={<Login />} />
          <Route path="/signup" element={<Signup />} /> 
          <Route path="/samaritan" element={<SamaritanHome />} />
          <Route path="/organization" element={<OrganizationHome />} />
        </Routes>
      </div>
    </Router>
  );
}
