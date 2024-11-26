import React from "react";
import { BrowserRouter as Router, Routes, Route, Link } from "react-router-dom";
import Login from "./Login";  // Import Login component
import Signup from "./Signup";  // Import Signup component
import Samaritan from "./SamaritanHome";
import Organization from "./OrganizationHome";

export default function App() {
  return (
    <Router>
      <div className="min-h-screen flex items-center justify-center bg-gray-100">
        <Routes>
          <Route path="/" element={<Login />} />
          <Route path="/login" element={<Login />} />
          <Route path="/signup" element={<Signup />} />
          <Route path="/samaritan" element={<Samaritan />} />
          <Route path="/organization" element={<Organization />} />
        </Routes>
      </div>
    </Router>
  );
}
