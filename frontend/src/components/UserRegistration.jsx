// frontend/src/components/UserRegistration.jsx
import React, { useState } from 'react';
import { useUser } from '../context/UserContext';
import { motion } from 'framer-motion';

const UserRegistration = ({ onComplete }) => {
  const [username, setUsername] = useState('');
  const [errorMessage, setErrorMessage] = useState('');
  const [suggestedUsername, setSuggestedUsername] = useState('');
  const { register, loading } = useUser();

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!username.trim()) {
      setErrorMessage('Please enter a username');
      return;
    }
    
    try {
      const result = await register(username);
      
      if (result) {
        if (result.error) {
          setErrorMessage(result.error);
          if (result.suggested_username) {
            setSuggestedUsername(result.suggested_username);
          }
        } else {
          // Registration successful
          if (onComplete) {
            onComplete(result);
          }
        }
      }
    } catch (error) {
      setErrorMessage('Registration failed. Please try again.');
    }
  };

  const useSuggestedUsername = () => {
    if (suggestedUsername) {
      setUsername(suggestedUsername);
      setSuggestedUsername('');
    }
  };

  return (
    <motion.div 
      className="user-registration card max-w-md mx-auto"
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4 }}
    >
      <div className="card-header">
        <h2 className="text-xl font-bold">Welcome to Globetrotter!</h2>
      </div>
      
      <div className="card-body">
        <p className="mb-4">Choose a username to start your adventure.</p>
        
        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label htmlFor="username" className="form-label">Username</label>
            <input
              type="text"
              id="username"
              className="form-input"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              placeholder="Enter your username"
              maxLength={30}
              disabled={loading}
            />
          </div>
          
          {errorMessage && (
            <div className="text-red-600 mb-4">
              {errorMessage}
            </div>
          )}
          
          {suggestedUsername && (
            <div className="bg-blue-50 p-3 rounded-lg mb-4">
              <p className="text-sm">That username is already taken. How about:</p>
              <div className="flex items-center mt-1">
                <span className="font-medium">{suggestedUsername}</span>
                <button
                  type="button"
                  className="ml-3 text-blue-600 hover:text-blue-800 text-sm"
                  onClick={useSuggestedUsername}
                >
                  Use this
                </button>
              </div>
            </div>
          )}
          
          <button
            type="submit"
            className={`btn ${loading ? 'btn-disabled' : 'btn-primary'} w-full`}
            disabled={loading}
          >
            {loading ? 'Registering...' : 'Let\'s Play!'}
          </button>
        </form>
      </div>
    </motion.div>
  );
};

export default UserRegistration;