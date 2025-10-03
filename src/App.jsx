import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import ModelUpload from './pages/model-upload';

function App() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<ModelUpload />} />
        <Route path="/model-upload" element={<ModelUpload />} />
      </Routes>
    </Router>
  );
}

export default App;
