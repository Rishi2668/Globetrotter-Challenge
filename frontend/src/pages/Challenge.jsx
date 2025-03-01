
// frontend/src/pages/Challenge.jsx
import React, { useState, useEffect } from 'react';
import { Link, useParams, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import GameBoard from '../components/GameBoard';
import UserRegistration from '../components/UserRegistration';
import { getUserByChallenge, acceptChallenge } from '../services/api';
import { useUser } from '../context/UserContext';
import { useGame } from '../context/GameContext';
import { toast } from 'react-toastify';

const Challenge = () => {
  const { challengeId } = useParams();
  const navigate = useNavigate();
  const { user } = useUser();
  const { newGame, game, finishGame } = useGame(); // Make sure to get finishGame from context
  
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [challengerData, setChallengerData] = useState(null);
  const [showRegistration, setShowRegistration] = useState(false);
  const [gameStarted, setGameStarted] = useState(false);
  const [gameCompleted, setGameCompleted] = useState(false);

  // Check if the user just finished a game
  useEffect(() => {
    if (game && !game.active) {
      setGameCompleted(true);
      setGameStarted(false); // Make sure gameStarted is false when game is completed
    }
  }, [game]);

  // Fetch challenge data on component mount
  useEffect(() => {
    const fetchChallengeData = async () => {
      if (!challengeId) {
        // No challenge ID - this is just the challenge page
        setLoading(false);
        return;
      }
      
      try {
        setLoading(true);
        const response = await getUserByChallenge(challengeId);
        
        if (response && response.user) {
          setChallengerData(response.user);
        }
      } catch (error) {
        console.error('Error fetching challenge data:', error);
        setError('Challenge not found or has expired');
      } finally {
        setLoading(false);
      }
    };

    fetchChallengeData();
  }, [challengeId]);

  // Handle accepting the challenge
  const handleAcceptChallenge = async () => {
    if (user) {
      // User is already registered, accept challenge directly
      await startChallenge();
    } else {
      // Show registration form first
      setShowRegistration(true);
    }
  };

  // Start the challenge game
  const startChallenge = async () => {
    try {
      setLoading(true);
      
      if (challengeId) {
        const response = await acceptChallenge(challengeId, user?.username);
        
        if (response && response.game) {
          // Reset game context and mark game as started
          await newGame();
          setGameStarted(true);
          setGameCompleted(false); // Reset game completed state
          toast.success('Challenge accepted! Good luck!');
        }
      } else {
        // No challenge ID, just start a new game
        await newGame();
        setGameStarted(true);
        setGameCompleted(false); // Reset game completed state
      }
    } catch (error) {
      console.error('Error starting game:', error);
      setError('Failed to start game');
      toast.error('Failed to start game');
    } finally {
      setLoading(false);
    }
  };

  // Handle registration completion
  const handleRegistrationComplete = async (userData) => {
    if (userData) {
      // After registration, start the challenge
      await startChallenge();
    }
  };
  
  // Handle Play Again button
  const handlePlayAgain = async () => {
    try {
      console.log("Play Again clicked, starting new game...");
      setGameCompleted(false);
      
      // Start a new game first
      await newGame();
      
      // Then set game started to true to show the game board
      setGameStarted(true);
      
      // Log the state change
      console.log("Game state updated: gameStarted=true, gameCompleted=false");
      
      // Optional: force navigation to game page
      // navigate('/game');
    } catch (error) {
      console.error("Error starting new game:", error);
      toast.error("Failed to start new game. Please try again.");
    }
  };

  // Render loading state
  if (loading && !gameStarted) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-16 w-16 border-t-2 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  // Render error state
  if (error && !gameStarted) {
    return (
      <div className="text-center p-8">
        <h2 className="text-xl font-bold text-red-600 mb-4">Oops! Something went wrong</h2>
        <p className="mb-4">{error}</p>
        <Link to="/" className="btn btn-primary">
          Go Home
        </Link>
      </div>
    );
  }

  // Render registration form
  if (showRegistration) {
    return (
      <div className="py-8">
        <div className="mb-6">
          <Link to="/" className="text-blue-600 hover:text-blue-800">
            ← Back to Home
          </Link>
        </div>
        
        <h2 className="text-2xl font-bold text-center mb-6">
          Register to Accept the Challenge
        </h2>
        
        <UserRegistration onComplete={handleRegistrationComplete} />
      </div>
    );
  }
  
  // Game completed screen
  if (gameCompleted && !gameStarted) {
    return (
      <div className="challenge-page py-4">
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
        
        <motion.div 
          className="card max-w-md mx-auto"
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.4 }}
        >
          <div className="card-header">
            <h2 className="text-xl font-bold">Game Completed!</h2>
          </div>
          
          <div className="card-body">
            <div className="text-center">
              <div className="text-5xl mb-6">🏆</div>
              <h3 className="text-xl font-semibold mb-2">Congratulations!</h3>
              <p className="mb-6">You've completed all {game?.rounds?.length || 15} questions!</p>
              
              {user && (
                <div className="bg-blue-50 p-4 rounded-lg mb-6">
                  <p className="text-sm font-bold mb-2">Your Final Score:</p>
                  <div className="flex justify-between text-lg">
                    <div className="text-green-600 font-bold">{user.game_stats.correct_answers} Correct</div>
                    <div className="text-red-600 font-bold">{user.game_stats.incorrect_answers} Incorrect</div>
                  </div>
                  <div className="mt-2 text-xl font-bold">
                    {Math.round((user.game_stats.correct_answers / Math.max(1, user.game_stats.total_played)) * 100)}% Success Rate
                  </div>
                </div>
              )}
              
              <div className="flex flex-col gap-3">
                <button 
                  onClick={handlePlayAgain}
                  style={{ 
                    backgroundColor: '#4f46e5',
                    color: 'white',
                    padding: '0.75rem 1.5rem',
                    borderRadius: '0.5rem',
                    fontWeight: 'bold',
                    cursor: 'pointer',
                    border: 'none',
                    width: '100%'
                  }}
                  className="btn btn-primary"
                >
                  Play Again
                </button>
                
                <Link to="/" className="text-blue-600 hover:text-blue-800 mt-2">
                  Return to Home
                </Link>
              </div>
            </div>
          </div>
        </motion.div>
      </div>
    );
  }

  // Show challenge info or game board
  return (
    <div className="challenge-page py-4">
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
      
      {gameStarted ? (
        // Show the game board once challenge is accepted
        <GameBoard 
          challengeMode={!!challengeId}
          challengerStats={challengeId ? challengerData : null}
        />
      ) : (
        // Show challenge invitation or normal challenge page
        <motion.div 
          className="card max-w-md mx-auto"
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.4 }}
        >
          <div className="card-header">
            <h2 className="text-xl font-bold">
              {challengeId ? "You've Been Challenged!" : "Start a New Challenge"}
            </h2>
          </div>
          
          <div className="card-body">
            {challengeId ? (
              // Challenge invitation
              <>
                <p className="mb-4">
                  <strong>{challengerData?.username}</strong> has challenged you to a geography quiz!
                </p>
                
                <div className="bg-blue-50 p-4 rounded-lg mb-6">
                  <p className="text-sm text-gray-600 mb-1">Their score:</p>
                  <div className="flex justify-between">
                    <div>
                      <span className="font-bold text-green-600">{challengerData?.game_stats?.correct_answers || 0}</span> correct
                    </div>
                    <div>
                      <span className="font-bold text-red-600">{challengerData?.game_stats?.incorrect_answers || 0}</span> incorrect
                    </div>
                    <div>
                      <span className="font-bold">
                        {Math.round(
                          (challengerData?.game_stats?.correct_answers / 
                            Math.max(1, challengerData?.game_stats?.total_played)) * 100
                        ) || 0}%
                      </span> score
                    </div>
                  </div>
                </div>
                
                <p className="text-center mb-6">Think you can do better?</p>
              </>
            ) : (
              // Normal challenge page
              <>
                <p className="mb-4">
                  Test your geography knowledge with our Globetrotter quiz!
                </p>
                
                <div className="bg-blue-50 p-4 rounded-lg mb-6">
                  <p className="font-semibold mb-2">How to play:</p>
                  <ul className="list-disc pl-5 space-y-1">
                    <li>You'll get 15 questions about famous destinations</li>
                    <li>Each destination has cryptic clues to help you guess</li>
                    <li>Choose the correct answer from multiple options</li>
                    <li>Learn fun facts about each location!</li>
                  </ul>
                </div>
              </>
            )}
            
            <button
              className="btn btn-primary w-full"
              onClick={handleAcceptChallenge}
              style={{ 
                backgroundColor: '#4f46e5',
                color: 'white',
                padding: '0.75rem 1.5rem',
                borderRadius: '0.5rem',
                fontWeight: 'bold',
                cursor: 'pointer',
                border: 'none',
                width: '100%'
              }}
            >
              {challengeId ? 'Accept Challenge' : 'Start Playing'}
            </button>
          </div>
        </motion.div>
      )}
    </div>
  );
};

export default Challenge;