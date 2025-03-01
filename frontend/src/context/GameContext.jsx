
import React, { createContext, useState, useContext, useRef } from 'react';
import { 
  startGame, 
  addGameRound, 
  submitAnswer,
  endGame
} from '../services/api';
import { useUser } from './UserContext';
import { useNavigate } from 'react-router-dom';

// Create context
export const GameContext = createContext();

export const GameProvider = ({ children }) => {
  const { user, updateStats } = useUser();
  const navigate = useNavigate();
  
  const [game, setGame] = useState(null);
  const [currentRound, setCurrentRound] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [result, setResult] = useState(null);
  const [showFeedback, setShowFeedback] = useState(false);
  const [isRoundComplete, setIsRoundComplete] = useState(false);
  
  // Add a reference to track the current question ID to prevent unwanted updates
  const currentQuestionIdRef = useRef(null);
  // Add a reference to track if we're waiting for user to click "Next Destination"
  const awaitingNextClickRef = useRef(false);

  // Start a new game
  const newGame = async () => {
    if (!user) return null;
    
    try {
      setLoading(true);
      setError(null);
      setGame(null);
      setCurrentRound(null);
      setResult(null);
      setShowFeedback(false);
      setIsRoundComplete(false);
      awaitingNextClickRef.current = false;
      currentQuestionIdRef.current = null;
      
      const response = await startGame(user.id);
      if (response && response.game) {
        setGame(response.game);
        // Get the first round
        await getNextRound(response.game.id);
        return response.game;
      }
    } catch (err) {
      console.error('Error starting game:', err);
      setError('Failed to start game');
      return null;
    } finally {
      setLoading(false);
    }
  };

  // Get the next round
  const getNextRound = async (gameId) => {
    // CRITICAL: Don't get next round if we're waiting for user to click "Next Destination"
    if ((!gameId && !game) || awaitingNextClickRef.current) {
      console.log("Prevented automatic round advance - waiting for user action");
      return null;
    }
    
    try {
      setLoading(true);
      setError(null);
      setResult(null);
      setShowFeedback(false);
      setIsRoundComplete(false);
      
      const id = gameId || game.id || game._id;
      const response = await addGameRound(id, user?.id);
      
      if (response && response.round) {
        // Update the current question ID reference
        currentQuestionIdRef.current = response.round.destination_id;
        console.log("Setting new question ID:", currentQuestionIdRef.current);
        
        // Now it's safe to update the current round
        setCurrentRound(response.round);
        setGame(response.game);
        return response.round;
      }
    } catch (err) {
      console.error('Error getting next round:', err);
      setError('Failed to get next destination');
      return null;
    } finally {
      setLoading(false);
    }
  };

  // Submit an answer
  const submitPlayerAnswer = async (answer) => {
    if (!game || !currentRound) return null;
    
    try {
      setLoading(true);
      setError(null);
      
      const gameId = game.id || game._id;
      console.log("Submitting answer with game ID:", gameId);
      
      // Make sure to pass auto_advance: false to the backend
      const response = await submitAnswer(
        gameId,
        currentRound.destination_id,
        answer,
        currentRound.round_index
        // auto_advance: false is in your API implementation
      );
      
      console.log("Submit answer response:", response);
      
      if (response) {
        // CRITICAL FIX: Set a flag to indicate we're waiting for user to click "Next"
        awaitingNextClickRef.current = true;
        
        // IMPORTANT: Don't update currentRound here, even if the response includes a new round
        // Only set the feedback and result data
        setResult(response);
        
        // We can update the game object as long as we don't change the current round
        if (response.game) {
          const updatedGame = {...response.game};
          setGame(updatedGame);
        }
        
        setShowFeedback(true);
        setIsRoundComplete(true);
        
        // Update user stats
        if (user) {
          updateStats(response.is_correct);
        }
        
        return response;
      }
    } catch (err) {
      console.error('Error submitting answer:', err);
      setError('Failed to submit answer');
      return null;
    } finally {
      setLoading(false);
    }
  };

  // THIS IS THE CRITICAL FUNCTION - only called when user clicks "Next Destination"
  const advanceToNextRound = async () => {
    // Reset the awaiting flag before advancing
    awaitingNextClickRef.current = false;
    // Now get the next round
    return await getNextRound();
  };

  // Finish the game
  const finishGame = async () => {
    if (!game) return;
    
    try {
      const gameId = game.id || game._id;
      console.log("Ending game with ID:", gameId);
      
      const response = await endGame(gameId);
      if (response && response.game) {
        setGame(response.game);
      }
    } catch (err) {
      console.error('Error ending game:', err);
    }
  };

  // Context value
  const value = {
    game,
    currentRound,
    loading,
    error,
    result,
    showFeedback,
    isRoundComplete,
    newGame,
    getNextRound: advanceToNextRound, // Replace with our controlled version
    submitPlayerAnswer,
    finishGame,
    setShowFeedback,
    setIsRoundComplete,
    setCurrentRound
  };

  return <GameContext.Provider value={value}>{children}</GameContext.Provider>;
};

// Custom hook to use the game context
export const useGame = () => {
  const context = useContext(GameContext);
  if (context === undefined) {
    throw new Error('useGame must be used within a GameProvider');
  }
  return context;
};