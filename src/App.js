import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import HomePage from './HomePage';
import GrassEstimator from './GrassEstimator';
import ManualEstimator from './ManualEstimator'; // you can stub this for now

function App() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<HomePage />} />
        <Route path="/upload" element={<GrassEstimator />} />
        <Route path="/manual" element={<ManualEstimator />} />
      </Routes>
    </Router>
  );
}

export default App;