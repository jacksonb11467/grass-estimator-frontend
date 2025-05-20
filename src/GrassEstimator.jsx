import React, { useState } from 'react';
import axios from 'axios';
import { motion, AnimatePresence } from 'framer-motion';

export default function GrassEstimator() {
  const [files, setFiles] = useState([]);
  const [objectName, setObjectName] = useState('');
  const [knownHeight, setKnownHeight] = useState('');
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState(null);
  const [error, setError] = useState(null);
  const [scanning, setScanning] = useState(false);

  const maxFiles = 3;

  const handleFileChange = (e) => {
    const selected = Array.from(e.target.files).slice(0, maxFiles);
    setFiles(selected);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setResult(null);
    setError(null);

    if (files.length === 0) {
      setError('Please upload at least one photo.');
      return;
    }

    setScanning(true);
    setLoading(true);

    const formData = new FormData();
    files.forEach(file => formData.append('files', file));
    if (objectName) formData.append('object_name', objectName);
    if (knownHeight) formData.append('known_height', knownHeight);

    try {
      const res = await axios.post('https://grass-area-api.onrender.com/upload', formData);
      setResult(res.data.result);
    } catch (err) {
      setError('Something went wrong. Please try again.');
    } finally {
      setScanning(false);
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#f4f4f5] text-[#2c3e50] px-4 py-10 flex items-center justify-center">
      <div className="w-full max-w-3xl space-y-10 text-center">
        <header>
          <h1 className="text-5xl font-semibold tracking-tight mb-2">Grass Area Estimator</h1>
          <p className="text-gray-500 text-lg">Upload up to 3 photos to estimate the grass area in square metres</p>
        </header>

        <div className="text-left bg-white p-6 rounded-2xl shadow text-sm text-gray-600">
          <p className="font-medium mb-2">📸 Photo Guidelines:</p>
          <ul className="list-disc pl-5 space-y-1">
            <li>Stand at one corner of the garden and capture as much as possible.</li>
            <li>Take one photo from the back corner, one from the front, and one overhead (if safe).</li>
            <li>Try to avoid shadows or dark lighting — clear daytime photos work best.</li>
            <li>Make sure grass edges are visible (fences, garden beds, etc.).</li>
          </ul>
        </div>

        <form onSubmit={handleSubmit} className="bg-white rounded-3xl shadow-md p-8 space-y-6 text-left">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Upload Images (max {maxFiles})</label>
            <input
              type="file"
              accept="image/*"
              multiple
              onChange={handleFileChange}
              className="w-full px-3 py-2 rounded-xl border border-gray-300 file:bg-[#1e2a36] file:text-white file:rounded-md"
            />
            {files.length > 0 && (
              <div className="mt-2 text-sm text-gray-600">
                Selected: {files.map((f) => f.name).join(', ')}
              </div>
            )}
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Known Object (optional)</label>
            <input
              type="text"
              value={objectName}
              onChange={(e) => setObjectName(e.target.value)}
              placeholder="e.g. fence"
              className="w-full px-3 py-2 rounded-xl border border-gray-300 placeholder:text-gray-400"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Object Height in Metres (optional)</label>
            <input
              type="number"
              step="0.01"
              value={knownHeight}
              onChange={(e) => setKnownHeight(e.target.value)}
              placeholder="e.g. 1.85"
              className="w-full px-3 py-2 rounded-xl border border-gray-300 placeholder:text-gray-400"
            />
          </div>
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.97 }}
            type="submit"
            disabled={loading}
            className="w-full bg-gradient-to-r from-[#2c3e50] to-[#4b6584] text-white py-3 rounded-xl font-semibold tracking-wide shadow hover:shadow-lg transition duration-200"
          >
            {loading ? 'Analysing...' : 'Estimate Area'}
          </motion.button>
        </form>

        {/* 🔁 AI Scanning Animation */}
        <AnimatePresence>
          {scanning && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 bg-black bg-opacity-70 backdrop-blur-sm flex items-center justify-center z-50"
            >
              <div className="bg-white rounded-xl p-6 shadow-lg text-center space-y-4 animate-pulse max-w-sm w-full">
                <p className="text-lg font-semibold">🧠 Scanning your property...</p>
                
                <div className="flex justify-center items-center space-x-2">
                  <div className="w-4 h-4 rounded-full bg-[#4b6584] animate-bounce" />
                  <div className="w-4 h-4 rounded-full bg-[#4b6584] animate-bounce [animation-delay:.1s]" />
                  <div className="w-4 h-4 rounded-full bg-[#4b6584] animate-bounce [animation-delay:.2s]" />
                </div>

                <p className="text-sm text-gray-500 italic">
                  Cutting grass, detecting zones, analysing overhead layout...
                </p>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* ✅ Result Display */}
        <AnimatePresence>
          {result && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: 20 }}
              className="bg-white rounded-3xl shadow p-6 text-center"
            >
              <p className="text-sm text-gray-500 mb-1">Estimated Result</p>
              <p className="text-xl font-semibold text-[#2c3e50]">{result}</p>
            </motion.div>
          )}

          {error && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: 20 }}
              className="bg-red-100 text-red-700 p-6 rounded-3xl shadow text-center"
            >
              {error}
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}