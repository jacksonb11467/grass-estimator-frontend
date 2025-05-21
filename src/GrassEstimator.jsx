import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { motion, AnimatePresence } from 'framer-motion';
import emailjs from '@emailjs/browser';

export default function GrassEstimator() {
  const [files, setFiles] = useState([]);
  const [objectName, setObjectName] = useState('');
  const [knownHeight, setKnownHeight] = useState('');
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState(null);
  const [error, setError] = useState(null);
  const [scanning, setScanning] = useState(false);
  const [calculatedPrice, setCalculatedPrice] = useState(null);

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
    files.forEach(file => formData.append('file', file));
    if (objectName) formData.append('object_name', objectName);
    if (knownHeight) formData.append('known_height', knownHeight);

    try {
      const res = await axios.post('https://grass-area-api.onrender.com/upload', formData);
      const raw = res.data.result;
      const lines = raw.split('\n');
      const parsedResult = {
        area: lines[0]?.replace(/^1\./, '').trim(),
        length: lines[1]?.replace(/^2\./, '').trim(),
        condition: lines[2]?.replace(/^3\./, '').trim()
      };
      setResult(parsedResult);

      const pricing = await axios.get('/pricing.json');
      const pricePerM2 = pricing.data.pricePerM2;
      const match = parsedResult.area.match(/(\d+(\.\d+)?)/);
      const m2 = match ? parseFloat(match[1]) : 0;
      const finalPrice = (pricePerM2 * m2).toFixed(2);
      setCalculatedPrice(finalPrice);

      // Send confirmation email
      const userInfo = JSON.parse(localStorage.getItem('userInfo')) || {};
      await emailjs.send(
        'service_1a5fp9c',
        'template_r9nzzqs',
        {
          name: userInfo.name || '',
          email: userInfo.email || '',
          area: parsedResult.area,
          length: parsedResult.length,
          condition: parsedResult.condition,
          price: finalPrice
        },
        'HN65SDSs7oC9UNIpI'
      );
    } catch (err) {
      setError('Something went wrong. Please try again.');
    } finally {
      setScanning(false);
      setLoading(false);
    }
  };

  const resetForm = () => {
    setFiles([]);
    setObjectName('');
    setKnownHeight('');
    setResult(null);
    setError(null);
    setCalculatedPrice(null);
  };

  useEffect(() => {
    if (result) {
      const el = document.getElementById('result-section');
      if (el) el.scrollIntoView({ behavior: 'smooth' });
    }
  }, [result]);

  return (
    <div className="min-h-screen bg-[#f4f4f5] text-[#2c3e50] px-4 py-10 flex items-center justify-center">
      <div className="w-full max-w-3xl space-y-10 text-center">
        <img
          src="/companylogo.png"
          alt="Company Logo"
          className="w-40 mx-auto mb-4"
        />

        {!result && (
          <>
            <div className="text-left bg-white p-6 rounded-2xl shadow text-sm text-gray-600">
              <p className="font-medium mb-2">📸 Photo Guidelines:</p>
              <p className="text-gray-500 text-sm mb-2">Upload up to 3 photos to estimate the grass area in square metres.</p>
              <ul className="list-disc pl-5 space-y-1">
                <li>Capture wide shots from front, back, and above if possible.</li>
                <li>Avoid shadows or poor lighting.</li>
                <li>Ensure edges like fences or garden beds are visible.</li>
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
                  <div className="flex gap-2 mt-3">
                    {files.map((file, idx) => (
                      <img
                        key={idx}
                        src={URL.createObjectURL(file)}
                        alt={`upload-${idx}`}
                        className="w-20 h-20 object-cover rounded-lg border"
                      />
                    ))}
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
                {loading ? 'Analysing...' : 'Proceed'}
              </motion.button>
            </form>
          </>
        )}

        <AnimatePresence>
          {scanning && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 bg-black bg-opacity-70 backdrop-blur-sm flex items-center justify-center z-50"
            >
              <div className="bg-white rounded-xl p-6 shadow-lg text-center space-y-4 max-w-sm w-full">
                <p className="text-lg font-semibold">🌀 Analysing terrain… calibrating blades…</p>
                <div className="flex justify-center items-center">
                  <img src="/lawnmower.gif" alt="Loading..." className="w-16 h-16 animate-spin" />
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        <AnimatePresence>
          {result && (
            <motion.div
              id="result-section"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: 20 }}
              className="bg-white rounded-3xl shadow p-6 space-y-6 text-left"
            >
              <div className="text-2xl font-bold">📏 {result.area}</div>

              <div>
                <p className="text-sm text-gray-500 mb-1">🌿 Grass Length</p>
                <div className="flex flex-wrap gap-2 text-sm">
                  {["Recently mowed (under 4cm)", "Light growth (4–8cm)", "Moderately overgrown (8–15cm)", "Heavily overgrown (15–30cm)", "Very overgrown / Wild (over 30cm)"].map((item) => (
                    <span
                      key={item}
                      className={`px-3 py-1 rounded-full border ${result.length === item ? "bg-green-600 text-white font-semibold" : "bg-gray-100 text-gray-600"}`}
                    >
                      {item}
                    </span>
                  ))}
                </div>
              </div>

              <div>
                <p className="text-sm text-gray-500 mb-1">🌱 Grass Condition</p>
                <div className="flex flex-wrap gap-2 text-sm">
                  {["Healthy and green", "Patchy and dry", "Mostly weeds", "Mixed with debris (sticks, rocks, rubbish)"].map((item) => (
                    <span
                      key={item}
                      className={`px-3 py-1 rounded-full border ${result.condition === item ? "bg-blue-600 text-white font-semibold" : "bg-gray-100 text-gray-600"}`}
                    >
                      {item}
                    </span>
                  ))}
                </div>
              </div>

              {calculatedPrice && (
                <div className="bg-[#e9f8ec] p-6 rounded-xl shadow text-left space-y-3">
                  <h2 className="text-xl font-bold text-green-800">💰 Estimated Price</h2>
                  <p className="text-2xl text-green-700 font-semibold">${calculatedPrice}</p>
                  <button
                    className="bg-[#2c3e50] text-white px-6 py-3 rounded-lg mt-4 hover:bg-[#1e2a36] transition"
                    onClick={() => console.log('Booking clicked')}
                  >
                    Book in Service
                  </button>
                </div>
              )}
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