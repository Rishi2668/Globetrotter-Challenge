// frontend/src/pages/Home.jsx
import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import UserRegistration from '../components/UserRegistration';
import { useUser } from '../context/UserContext';

const Home = () => {
  const { user, loading } = useUser();
  const navigate = useNavigate();
  const [showRegistration, setShowRegistration] = useState(false);

  // Redirect to game page if user is already registered
  useEffect(() => {
    if (user && !loading) {
      setShowRegistration(false);
    }
  }, [user, loading]);

  const handleStartGame = () => {
    if (user) {
      navigate('/game');
    } else {
      setShowRegistration(true);
    }
  };

  const handleRegistrationComplete = () => {
    navigate('/game');
  };

  return (
    <div className="home-page py-8">
      <motion.div 
        className="text-center mb-12"
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
      >
        <h1 className="text-4xl md:text-6xl font-bold text-blue-600 mb-4">
          GLOBETROTTER
        </h1>
        <p className="text-xl text-gray-700 max-w-2xl mx-auto">
          Test your geography knowledge with cryptic clues about famous places around the world!
        </p>
      </motion.div>

      {showRegistration ? (
        <UserRegistration onComplete={handleRegistrationComplete} />
      ) : (
        <motion.div 
          className="card max-w-md mx-auto"
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.4, delay: 0.2 }}
        >
          <div className="card-body text-center">
            <h2 className="text-2xl font-bold mb-6">Ready for an adventure?</h2>
            
            <div className="space-y-4">
              <button
                className="btn btn-primary w-full"
                onClick={handleStartGame}
              >
                {user ? 'Start Playing' : 'Register & Play'}
              </button>
              
              {user && (
                <Link 
                  to="/challenge"
                  className="block text-blue-600 hover:text-blue-800"
                >
                  View Challenges
                </Link>
              )}
            </div>
            
            <div className="mt-8 text-left">
              <h3 className="font-bold text-lg mb-2">How to Play:</h3>
              <ul className="list-disc pl-5 space-y-1 text-gray-700">
                <li>You'll see clues about a famous destination</li>
                <li>Choose the correct place from the options</li>
                <li>Learn fun facts about each location</li>
                <li>Challenge your friends to beat your score</li>
              </ul>
            </div>
          </div>
        </motion.div>
      )}
    </div>
  );
};

export default Home;