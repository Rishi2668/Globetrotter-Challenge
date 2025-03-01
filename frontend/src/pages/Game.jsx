
// frontend/src/pages/Game.jsx
import React, { useEffect, useRef } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import GameBoard from '../components/GameBoard';
import ChallengeButton from '../components/ChallengeButton';
import { useUser } from '../context/UserContext';
import { useGame } from '../context/GameContext';

const Game = () => {
  const { user, loading: userLoading } = useUser();
  const { newGame, loading: gameLoading } = useGame();
  const navigate = useNavigate();
  const gameStartedRef = useRef(false);

  // Check for reset flag
  useEffect(() => {
    const resetFlag = sessionStorage.getItem('resetGame');
    if (resetFlag === 'true') {
      // Clear the flag
      sessionStorage.removeItem('resetGame');
    }
  }, []);

  // Redirect to home if user is not logged in
  useEffect(() => {
    if (!userLoading && !user) {
      navigate('/');
    }
  }, [user, userLoading, navigate]);

  // Start a new game on component mount
  useEffect(() => {
    if (user && !gameLoading && !gameStartedRef.current) {
      gameStartedRef.current = true;
      console.log("Starting new game for user:", user.username);
      newGame();
    }
  }, [user, gameLoading, newGame]);

  // Loading state
  if (userLoading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-16 w-16 border-t-2 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  // If not logged in, redirect will happen via effect
  if (!user) {
    return null;
  }

  return (
    <div className="game-page">
      <div className="flex justify-between items-center mb-6">
        <Link to="/" className="text-blue-600 hover:text-blue-800">
          ← Back to Home
        </Link>
        
        <div className="user-info">
          <span className="font-semibold">{user.username}</span>
        </div>
      </div>
      
      <GameBoard />
      
      <div className="mt-8 text-center">
        <ChallengeButton />
      </div>
    </div>
  );
};

export default Game;