import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';

export default function HomePage() {
  const [name, setName] = useState('');
  const [phone, setPhone] = useState('');
  const [email, setEmail] = useState('');
  const [address, setAddress] = useState('');
  const [errors, setErrors] = useState({});
  const navigate = useNavigate();

  useEffect(() => {
    const saved = JSON.parse(localStorage.getItem('userInfo'));
    if (saved) {
      setName(saved.name || '');
      setPhone(saved.phone || '');
      setEmail(saved.email || '');
      setAddress(saved.address || '');
    }
  }, []);

  useEffect(() => {
    if (!window.google) return;
    const input = document.getElementById('autocomplete');
    if (!input) return;

    const autocomplete = new window.google.maps.places.Autocomplete(input, {
      types: ['geocode'],
      componentRestrictions: { country: 'au' },
    });

    autocomplete.setFields(['formatted_address']);
    autocomplete.addListener('place_changed', () => {
      const place = autocomplete.getPlace();
      if (place && place.formatted_address) {
        setAddress(place.formatted_address);
      }
    });
  }, []);

  const validate = () => {
    const newErrors = {};
    const phoneRegex = /^(\+614|04)\d{8}$/;
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/;

    if (!name) newErrors.name = 'Name is required';
    if (!phone) newErrors.phone = 'Phone number is required';
    else if (!phoneRegex.test(phone)) newErrors.phone = 'Enter a valid Australian mobile number';

    if (!email) newErrors.email = 'Email is required';
    else if (!emailRegex.test(email)) newErrors.email = 'Enter a valid email address';

    if (!address) newErrors.address = 'Service address is required';

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = (route) => {
    if (!validate()) return;
    localStorage.setItem('userInfo', JSON.stringify({ name, phone, email, address }));
    navigate(route);
  };

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.5 }}
      className="min-h-screen bg-[#f9f9f9] text-[#2c3e50] px-4 py-10 flex items-center justify-center"
    >
      <div className="w-full max-w-xl space-y-8 bg-white p-6 rounded-2xl shadow-md">
        <h1 className="text-3xl font-semibold text-center mb-2">Welcome to the Grass Area Estimator</h1>
        <p className="text-center text-gray-500 text-sm">Start by entering your details below</p>

        <div className="space-y-4">
          <div>
            <input
              type="text"
              placeholder="Full Name"
              value={name}
              onChange={(e) => setName(e.target.value)}
              className={`w-full px-4 py-2 rounded-lg border ${errors.name ? 'border-red-500' : 'border-gray-300'}`}
            />
            {errors.name && <p className="text-sm text-red-500 mt-1">{errors.name}</p>}
          </div>
          <div>
            <input
              type="tel"
              placeholder="Phone Number"
              value={phone}
              onChange={(e) => setPhone(e.target.value)}
              className={`w-full px-4 py-2 rounded-lg border ${errors.phone ? 'border-red-500' : 'border-gray-300'}`}
            />
            {errors.phone && <p className="text-sm text-red-500 mt-1">{errors.phone}</p>}
          </div>
          <div>
            <input
              type="email"
              placeholder="Email Address"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className={`w-full px-4 py-2 rounded-lg border ${errors.email ? 'border-red-500' : 'border-gray-300'}`}
            />
            {errors.email && <p className="text-sm text-red-500 mt-1">{errors.email}</p>}
          </div>
          <div>
            <input
              id="autocomplete"
              type="text"
              placeholder="Service Address"
              value={address}
              onChange={(e) => setAddress(e.target.value)}
              className={`w-full px-4 py-2 rounded-lg border ${errors.address ? 'border-red-500' : 'border-gray-300'}`}
            />
            {errors.address && <p className="text-sm text-red-500 mt-1">{errors.address}</p>}
          </div>
        </div>

        <div className="flex flex-col md:flex-row gap-4 pt-4">
          <motion.button
            whileHover={{ scale: 1.03 }}
            whileTap={{ scale: 0.98 }}
            onClick={() => handleSubmit('/upload')}
            className="flex-1 bg-[#2c3e50] text-white py-3 rounded-lg font-medium hover:bg-[#1e2a36] transition"
          >
            I have access to photos
          </motion.button>
          <motion.button
            whileHover={{ scale: 1.03 }}
            whileTap={{ scale: 0.98 }}
            onClick={() => handleSubmit('/manual')}
            className="flex-1 bg-[#f4c542] text-black py-3 rounded-lg font-medium hover:bg-[#e3b528] transition"
          >
            I don’t have photos
          </motion.button>
        </div>
      </div>
    </motion.div>
  );
}