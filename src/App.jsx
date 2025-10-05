import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import ModelUpload from './pages/model-upload';
function Dashboard() { return <div className="p-6">Dashboard (placeholder)</div>; }
function CustomerDashboard() { return <div className="p-6">Customer Dashboard (placeholder)</div>; }

export default function App() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<Navigate to="/model-upload" replace />} />
        <Route path="/model-upload" element={<ModelUpload />} />
        <Route path="/dashboard" element={<Dashboard />} />
        <Route path="/customer-dashboard" element={<CustomerDashboard />} />
        <Route path="*" element={<Navigate to="/model-upload" replace />} />
      </Routes>
    </Router>
  );
}