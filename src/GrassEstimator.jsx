import React, { useState } from 'react';
import axios from 'axios';
import { motion, AnimatePresence } from 'framer-motion';

export default function GrassEstimator() {
  const [file, setFile] = useState(null);
  const [objectName, setObjectName] = useState('');
  const [knownHeight, setKnownHeight] = useState('');
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState(null);
  const [error, setError] = useState(null);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setResult(null);
    setError(null);

    const formData = new FormData();
    formData.append('file', file);
    if (objectName) formData.append('object_name', objectName);
    if (knownHeight) formData.append('known_height', knownHeight);

    try {
      const res = await axios.post('https://grass-area-api.onrender.com/upload', formData);
      setResult(res.data.result);
    } catch (err) {
      setError('Something went wrong. Please try again.');
    }

    setLoading(false);
  };

  return (
    <div className="min-h-screen bg-[#f4f4f5] text-[#2c3e50] px-4 py-10 flex items-center justify-center">
      <div className="w-full max-w-2xl space-y-10 text-center">
        <header>
          <h1 className="text-5xl font-semibold tracking-tight mb-2">Grass Area Estimator</h1>
          <p className="text-gray-500 text-lg">Upload a photo to estimate the grass area in square metres</p>
        </header>

        <form onSubmit={handleSubmit} className="bg-white rounded-3xl shadow-md p-8 space-y-6 text-left">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Upload Image</label>
            <input
              type="file"
              accept="image/*"
              onChange={(e) => setFile(e.target.files[0])}
              required
              className="w-full px-3 py-2 rounded-xl border border-gray-300 file:bg-[#1e2a36] file:text-white file:rounded-md"
            />
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
            {loading ? 'Estimating...' : 'Estimate Area'}
          </motion.button>
        </form>

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