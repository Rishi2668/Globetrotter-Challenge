// frontend/src/pages/ChallengesList.jsx
import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { useUser } from '../context/UserContext';
import ChallengeButton from '../components/ChallengeButton';

const ChallengesList = () => {
  const { user } = useUser();
  const [finalScore, setFinalScore] = useState(null);
  
  // Effect to get final score from sessionStorage when component mounts
  useEffect(() => {
    // Check if there's a final score in sessionStorage
    const storedScore = sessionStorage.getItem('finalGameScore');
    if (storedScore) {
      try {
        const scoreData = JSON.parse(storedScore);
        setFinalScore(scoreData);
        // Clean up after retrieving
        sessionStorage.removeItem('finalGameScore');
      } catch (error) {
        console.error("Error parsing final score:", error);
      }
    }
  }, []);

  // Calculate percentage
  const calculatePercentage = (correct, total) => {
    if (!total) return 0;
    return Math.round((correct / total) * 100);
  };

  // Handler for Play Again button
  const handlePlayAgain = () => {
    // Set a flag to force stats reset next time
    sessionStorage.setItem('forceStatsReset', 'true');
    
    // Force page reload to ensure clean state
    window.location.href = '/game';
  };

  return (
    <div className="challenges-page py-8">
      <div className="flex justify-between items-center mb-6">
        <Link to="/" className="text-blue-600 hover:text-blue-800">
          ← Back to Home
        </Link>
        
        {user && (
          <div className="user-info">
            <span className="font-semibold">{user.username}</span>
          </div>
        )}
      </div>
      
      {/* Final Score Display */}
      {finalScore && (
        <div className="bg-white shadow-md rounded-lg p-6 mb-8 border-t-4 border-blue-500">
          <h2 className="text-2xl font-bold text-center mb-4">Game Results</h2>
          
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mb-4">
            <div className="p-3 bg-green-50 rounded text-center">
              <div className="text-sm text-green-700">Correct</div>
              <div className="font-bold text-2xl text-green-800">{finalScore.correct}</div>
            </div>
            
            <div className="p-3 bg-red-50 rounded text-center">
              <div className="text-sm text-red-700">Incorrect</div>
              <div className="font-bold text-2xl text-red-800">{finalScore.incorrect}</div>
            </div>
            
            <div className="p-3 bg-blue-50 rounded text-center">
              <div className="text-sm text-blue-700">Total</div>
              <div className="font-bold text-2xl text-blue-800">{finalScore.total}</div>
            </div>
            
            <div className="p-3 bg-purple-50 rounded text-center">
              <div className="text-sm text-purple-700">Score</div>
              <div className="font-bold text-2xl text-purple-800">
                {calculatePercentage(finalScore.correct, finalScore.total)}%
              </div>
            </div>
          </div>
          
          <div className="text-center">
            <p className="text-gray-700 mb-4">
              {calculatePercentage(finalScore.correct, finalScore.total) >= 80 
                ? "Amazing job! You're a geography expert!" 
                : calculatePercentage(finalScore.correct, finalScore.total) >= 60
                  ? "Great work! You know your geography well!"
                  : calculatePercentage(finalScore.correct, finalScore.total) >= 40
                    ? "Good effort! Keep exploring the world!"
                    : "Keep learning! Every geography journey starts somewhere!"}
            </p>
          </div>
        </div>
      )}
      
      <div className="text-center mb-8">
        <h1 className="text-3xl font-bold mb-4">Challenges</h1>
        <p className="text-lg mb-6">Create a challenge and share it with your friends!</p>
        
        {/* Play Again button */}
        <div className="mb-6">
          <button
            onClick={handlePlayAgain}
            className="bg-green-600 hover:bg-green-700 text-white font-bold py-3 px-6 rounded-lg shadow-md transition duration-300 ease-in-out transform hover:scale-105"
          >
            Play Again
          </button>
        </div>
        
        {user ? (
          <ChallengeButton />
        ) : (
          <div className="bg-yellow-50 border-l-4 border-yellow-400 p-4 rounded-md">
            <p>You need to be logged in to create challenges.</p>
            <Link to="/" className="text-blue-600 mt-2 inline-block">
              Go to Home to Register
            </Link>
          </div>
        )}
      </div>
      
      {user && (
        <div className="mt-8">
          <h2 className="text-xl font-bold mb-4">Your Challenge Link</h2>
          <div className="bg-gray-50 p-4 rounded-lg">
            <p>Your permanent challenge link:</p>
            <div className="mt-2 p-2 bg-blue-50 rounded border border-blue-200 font-mono text-sm break-all">
              {window.location.origin}/challenge/{user.challenge_id}
            </div>
            <p className="mt-2 text-sm text-gray-600">
              Share this link with friends to challenge them!
            </p>
          </div>
        </div>
      )}
    </div>
  );
};

export default ChallengesList;