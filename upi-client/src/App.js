// src/App.js
import React from "react";
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import Login from "./components/login";
import Register from "./components/register";
import Dashboard from "./components/Dashboard";
import AddTransaction from "./components/AddTransaction"; // ✅ import

function App() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<Login />} />
        <Route path="/register" element={<Register />} />
        <Route path="/dashboard" element={<Dashboard />} />
        <Route path="/add-transaction" element={<AddTransaction />} /> {/* ✅ new route */}
      </Routes>
    </Router>
  );
}

export default App;
