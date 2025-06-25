import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import IngestEmail from './pages/IngestEmail';
import Dashboard from './pages/Dashboard';
import EmailDetail from './pages/EmailDetail';
import './App.css';

function App() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<IngestEmail />} />
        <Route path="/dashboard" element={<Dashboard />} />
        <Route path="/email/:id" element={<EmailDetail />} />
      </Routes>
    </Router>
  );
}

export default App;
