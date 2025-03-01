// frontend/src/context/UserContext.jsx
import React, { createContext, useState, useEffect, useContext } from 'react';
import { registerUser, getUserById } from '../services/api';

// Create context
export const UserContext = createContext();

export const UserProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  // Check for existing user on mount
  useEffect(() => {
    const savedUserId = localStorage.getItem('globetrotter_user_id');
    if (savedUserId) {
      fetchUser(savedUserId);
    }
  }, []);

  // Fetch user data
  const fetchUser = async (userId) => {
    try {
      setLoading(true);
      const response = await getUserById(userId);
      if (response && response.user) {
        setUser(response.user);
        localStorage.setItem('globetrotter_user_id', response.user.id);
      }
    } catch (err) {
      console.error('Error fetching user:', err);
      setError('Failed to load user data');
      // Clear invalid user ID
      localStorage.removeItem('globetrotter_user_id');
    } finally {
      setLoading(false);
    }
  };

  // Register a new user
  const register = async (username) => {
    try {
      setLoading(true);
      setError(null);
      const response = await registerUser(username);
      if (response && response.user) {
        setUser(response.user);
        localStorage.setItem('globetrotter_user_id', response.user.id);
        return response.user;
      }
    } catch (err) {
      console.error('Error registering user:', err);
      if (err.response && err.response.data) {
        setError(err.response.data.error || 'Registration failed');
        return err.response.data;
      } else {
        setError('Registration failed');
      }
      return null;
    } finally {
      setLoading(false);
    }
  };

  // Log out
  const logout = () => {
    setUser(null);
    localStorage.removeItem('globetrotter_user_id');
  };

  // Update user stats
  const updateStats = (isCorrect) => {
    if (!user) return;

    setUser((prevUser) => {
      const updatedStats = { ...prevUser.game_stats };
      updatedStats.total_played += 1;
      
      if (isCorrect) {
        updatedStats.correct_answers += 1;
      } else {
        updatedStats.incorrect_answers += 1;
      }

      return {
        ...prevUser,
        game_stats: updatedStats
      };
    });
  };

  // Context value
  const value = {
    user,
    loading,
    error,
    register,
    logout,
    updateStats,
    fetchUser
  };

  return <UserContext.Provider value={value}>{children}</UserContext.Provider>;
};

// Custom hook to use the user context
export const useUser = () => {
  const context = useContext(UserContext);
  if (context === undefined) {
    throw new Error('useUser must be used within a UserProvider');
  }
  return context;
};