// frontend/src/context/GameContextInterceptor.jsx
import React, { createContext, useContext, useState, useEffect, useRef } from 'react';
import { GameContext, GameProvider } from './GameContext';

// Create a new context for the interceptor
export const GameInterceptorContext = createContext();

export const GameInterceptorProvider = ({ children }) => {
  // Access the original game context
  const originalContext = useContext(GameContext);
  
  // Create a stable reference to the original context
  const originalContextRef = useRef(originalContext);
  
  // State to intercept and control
  const [interceptedRound, setInterceptedRound] = useState(null);
  const [isLocked, setIsLocked] = useState(false);
  const [lastAnswerResponse, setLastAnswerResponse] = useState(null);
  const [pendingNextRound, setPendingNextRound] = useState(false);
  
  // Update the reference when the original context changes
  useEffect(() => {
    originalContextRef.current = originalContext;
  }, [originalContext]);
  
  // When the original context's currentRound changes, update our intercepted version
  // but ONLY if we're not locked
  useEffect(() => {
    if (!isLocked && originalContext.currentRound && 
        (!interceptedRound || 
         originalContext.currentRound.destination_id !== interceptedRound.destination_id)) {
      console.log("Interceptor: Updating round from context");
      setInterceptedRound(originalContext.currentRound);
    }
  }, [originalContext.currentRound, isLocked, interceptedRound]);
  
  // Custom version of submitPlayerAnswer that locks the current question
  const interceptedSubmitAnswer = async (answer) => {
    console.log("Interceptor: Submitting answer and locking question");
    
    // Lock question updates
    setIsLocked(true);
    
    try {
      // Call the original function
      const response = await originalContext.submitPlayerAnswer(answer);
      
      // Store the response but DON'T update the round
      setLastAnswerResponse(response);
      
      return response;
    } catch (error) {
      console.error("Error in intercepted submit answer:", error);
      throw error;
    }
  };
  
  // Custom version of getNextRound that only updates when explicitly called
  const interceptedGetNextRound = async () => {
    console.log("Interceptor: Getting next round");
    
    // Unlock to allow a new question
    setIsLocked(false);
    setPendingNextRound(true);
    
    try {
      // Clear previous answer response
      setLastAnswerResponse(null);
      
      // Call the original function
      const result = await originalContext.getNextRound();
      
      // At this point the original context will have updated,
      // and our useEffect will update interceptedRound
      
      return result;
    } catch (error) {
      console.error("Error in intercepted get next round:", error);
      throw error;
    } finally {
      setPendingNextRound(false);
    }
  };
  
  // Build our intercepted context object
  const interceptorValue = {
    ...originalContext,
    currentRound: interceptedRound,
    result: lastAnswerResponse,
    showFeedback: !!lastAnswerResponse,
    submitPlayerAnswer: interceptedSubmitAnswer,
    getNextRound: interceptedGetNextRound,
    
    // Add some additional helper methods
    isQuestionLocked: isLocked,
    isPendingNextRound: pendingNextRound,
    resetInterceptor: () => {
      setIsLocked(false);
      setLastAnswerResponse(null);
      setInterceptedRound(originalContext.currentRound);
    }
  };
  
  return (
    <GameInterceptorContext.Provider value={interceptorValue}>
      {children}
    </GameInterceptorContext.Provider>
  );
};

// Custom hook to use the intercepted game context
export const useInterceptedGame = () => {
  const context = useContext(GameInterceptorContext);
  if (context === undefined) {
    throw new Error('useInterceptedGame must be used within a GameInterceptorProvider');
  }
  return context;
};

// Wrapper component that provides both contexts
export const GameInterceptorWrapper = ({ children }) => {
  return (
    <GameProvider>
      <GameInterceptorProvider>
        {children}
      </GameInterceptorProvider>
    </GameProvider>
  );
};