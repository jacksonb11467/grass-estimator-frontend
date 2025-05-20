import React, { useState } from 'react';
import axios from 'axios';
import './App.css'; // optional if you're styling later

function App() {
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
    <div style={{ padding: '2rem', maxWidth: '600px', margin: 'auto' }}>
      <h1>Grass Area Estimator</h1>
      <form onSubmit={handleSubmit}>
        <div>
          <label>Upload an Image</label><br />
          <input type="file" accept="image/*" onChange={(e) => setFile(e.target.files[0])} required />
        </div>
        <div>
          <label>Known Object (optional)</label><br />
          <input type="text" value={objectName} onChange={(e) => setObjectName(e.target.value)} placeholder="e.g. fence" />
        </div>
        <div>
          <label>Object Height in Metres (optional)</label><br />
          <input type="number" step="0.01" value={knownHeight} onChange={(e) => setKnownHeight(e.target.value)} placeholder="e.g. 1.85" />
        </div>
        <button type="submit" disabled={loading}>
          {loading ? 'Estimating...' : 'Estimate Area'}
        </button>
      </form>

      {result && (
        <div style={{ marginTop: '1rem', backgroundColor: '#e6ffe6', padding: '1rem' }}>
          <strong>Result:</strong><br />
          {result}
        </div>
      )}

      {error && (
        <div style={{ marginTop: '1rem', backgroundColor: '#ffe6e6', padding: '1rem' }}>
          {error}
        </div>
      )}
    </div>
  );
}

export default App;