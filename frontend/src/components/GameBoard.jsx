
// frontend/src/components/GameBoard.jsx
import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import Clue from './Clue';
import AnswerOptions from './AnswerOptions';
import Feedback from './Feedback';
import ScoreBoard from './ScoreBoard';
import { useGame } from '../context/GameContext';
import { useUser } from '../context/UserContext';
import { updateStatsDirect, resetStatsDirect } from '../utils/DirectStatsUpdate';

const GameBoard = ({ challengeMode = false, challengerStats = null }) => {
  const navigate = useNavigate();
  const { user, updateStats } = useUser();
  const { 
    currentRound, 
    loading, 
    error, 
    result, 
    showFeedback,
    submitPlayerAnswer, 
    getNextRound, 
    newGame,
    finishGame
  } = useGame();
  
  const [selectedAnswer, setSelectedAnswer] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [localFeedback, setLocalFeedback] = useState(null);
  const [questionCount, setQuestionCount] = useState(0);
  
  // Local stats for the current game session
  const [gameStats, setGameStats] = useState({
    correct: 0,
    incorrect: 0,
    total: 0
  });
  
  const initialRenderRef = useRef(true);
  const firstQuestionSetRef = useRef(false);
  const statsResetRef = useRef(false);
  const MAX_QUESTIONS = 5;

  // Check if we need to reset stats on page load or component mount
  useEffect(() => {
    // Check for reset flag in sessionStorage
    const needsReset = sessionStorage.getItem('forceStatsReset') === 'true';
    
    if (needsReset || !statsResetRef.current) {
      console.log("Resetting game stats to zero");
      setGameStats({
        correct: 0,
        incorrect: 0,
        total: 0
      });
      // Also directly reset the DOM elements
      resetStatsDirect();
      
      statsResetRef.current = true;
      
      // Clear the flag
      sessionStorage.removeItem('forceStatsReset');
    }
  }, []);

  // On game start/reset
  useEffect(() => {
    if (currentRound && !firstQuestionSetRef.current) {
      // First question of a new game - reset stats
      console.log("New game started - resetting stats");
      const resetStats = {
        correct: 0,
        incorrect: 0,
        total: 0
      };
      
      setGameStats(resetStats);
      // Also directly reset the DOM elements
      resetStatsDirect();
      
      setQuestionCount(1);
      firstQuestionSetRef.current = true;
    }
  }, [currentRound]);

  // Update DOM when stats change in React state
  useEffect(() => {
    // Update DOM elements directly when state changes
    updateStatsDirect(gameStats);
  }, [gameStats]);

  // Handle selecting an answer
  const handleSelectAnswer = (city) => {
    if (showFeedback || localFeedback) return; // Prevent selection while showing feedback
    setSelectedAnswer(city);
  };

  // Handle submitting an answer
  const handleSubmitAnswer = async () => {
    if (!selectedAnswer || isSubmitting) return;
    
    setIsSubmitting(true);
    console.log("Submitting answer:", selectedAnswer);
    
    try {
      const response = await submitPlayerAnswer(selectedAnswer);
      
      if (response) {
        console.log("Answer submitted successfully:", response);
        
        // Get whether the answer is correct
        const isCorrect = response.is_correct;
        console.log("Answer is correct:", isCorrect);
        
        // Create updated stats
        const updatedStats = {
          correct: isCorrect ? gameStats.correct + 1 : gameStats.correct,
          incorrect: !isCorrect ? gameStats.incorrect + 1 : gameStats.incorrect,
          total: gameStats.total + 1
        };
        
        console.log("Updating stats to:", updatedStats);
        
        // Update React state
        setGameStats(updatedStats);
        
        // Also update DOM directly as a backup
        updateStatsDirect(updatedStats);
        
        // Call context updateStats if available
        if (typeof updateStats === 'function') {
          console.log("Calling updateStats in context");
          updateStats(isCorrect);
        }
        
        // Set local feedback
        setLocalFeedback({
          isCorrect,
          fact: response.fact || "No fact available",
          correctAnswer: response.correct_answer
        });
      } else {
        console.error("No response received from submitPlayerAnswer");
      }
    } catch (error) {
      console.error("Error submitting answer:", error);
    } finally {
      setIsSubmitting(false);
    }
  };

  // Handle next round
  const handleNextRound = async () => {
    console.log("Next round button clicked");
    setSelectedAnswer('');
    setLocalFeedback(null);  // Clear local feedback
    
    // Increment question count here when user explicitly goes to next question
    const nextCount = questionCount + 1;
    
    // Check if we've reached the max questions
    if (nextCount > MAX_QUESTIONS) {
      console.log("Maximum questions reached, ending game...");
      
      // Save the final score before navigating away
      const finalScore = {
        correct: gameStats.correct,
        incorrect: gameStats.incorrect,
        total: gameStats.total
      };
      
      // Store in sessionStorage so it can be accessed on the challenge page
      sessionStorage.setItem('finalGameScore', JSON.stringify(finalScore));
      console.log("Final score saved:", finalScore);
      
      await finishGame();
      
      // Set a flag to force stats reset next time
      sessionStorage.setItem('forceStatsReset', 'true');
      
      navigate('/challenge'); // Redirect to challenge page
    } else {
      setQuestionCount(nextCount);
      console.log("Moving to question", nextCount);
      await getNextRound();
    }
  };

  // Reset for a new game
  const handleNewGame = async () => {
    console.log("Starting new game - resetting all state");
    setSelectedAnswer('');
    setLocalFeedback(null);
    setQuestionCount(0);
    firstQuestionSetRef.current = false;
    
    // IMPORTANT: Reset game stats to zero
    const resetStats = {
      correct: 0,
      incorrect: 0,
      total: 0
    };
    setGameStats(resetStats);
    
    // Also reset DOM directly
    resetStatsDirect();
    
    await newGame();
  };

  // Render loading state
  if (loading && !currentRound) {
    return (
      <div className="flex justify-center items-center h-64">
        <div 
          style={{
            borderRadius: '50%',
            width: '4rem',
            height: '4rem',
            borderTop: '4px solid #3b82f6',
            borderRight: '4px solid transparent',
            animation: 'spin 1s linear infinite'
          }}
        ></div>
        <style jsx>{`
          @keyframes spin {
            to { transform: rotate(360deg); }
          }
        `}</style>
      </div>
    );
  }

  // Render error state
  if (error && !currentRound) {
    return (
      <div style={{ textAlign: 'center', padding: '2rem' }}>
        <h2 style={{ 
          fontSize: '1.5rem', 
          fontWeight: 'bold', 
          color: '#dc2626', 
          marginBottom: '1rem' 
        }}>
          Oops! Something went wrong
        </h2>
        <p style={{ marginBottom: '1rem' }}>{error}</p>
        <button 
          style={{
            backgroundColor: '#3b82f6',
            color: 'white',
            padding: '0.75rem 1.5rem',
            borderRadius: '0.5rem',
            fontWeight: 'bold',
            border: 'none',
            cursor: 'pointer'
          }}
          onClick={handleNewGame}
        >
          Try Again
        </button>
      </div>
    );
  }

  // Render main game board
  return (
    <div className="game-board">
      {/* Progress indicator */}
      {currentRound && (
        <div style={{ 
          display: 'flex', 
          alignItems: 'center', 
          justifyContent: 'space-between',
          marginBottom: '1rem'
        }}>
          <div style={{ fontSize: '0.875rem', color: '#4b5563' }}>
            Question {questionCount}/{MAX_QUESTIONS}
          </div>
          <div style={{ 
            width: '66.666667%', 
            backgroundColor: '#e5e7eb',
            height: '0.625rem',
            borderRadius: '9999px',
            overflow: 'hidden'
          }}>
            <div 
              style={{ 
                width: `${(questionCount / MAX_QUESTIONS) * 100}%`,
                backgroundColor: '#2563eb',
                height: '100%',
                borderRadius: '9999px',
                transition: 'width 0.3s ease-in-out'
              }}
            ></div>
          </div>
        </div>
      )}
      
      {/* Score display */}
      <ScoreBoard 
        stats={gameStats} 
        challengerStats={challengeMode ? challengerStats : null} 
        challengeMode={challengeMode}
      />
      
      {currentRound ? (
        <>
          {/* Clues */}
          <div style={{ marginBottom: '1.5rem' }}>
            <h2 style={{ 
              fontSize: '1.25rem', 
              fontWeight: 'bold', 
              marginBottom: '1rem' 
            }}>
              Where am I?
            </h2>
            {currentRound.clues.map((clue, index) => (
              <Clue key={`${currentRound.destination_id}-clue-${index}`} text={clue} index={index} />
            ))}
          </div>
          
          {/* Answer options */}
          <div style={{ marginBottom: '1.5rem' }}>
            <h3 style={{ 
              fontSize: '1.125rem', 
              fontWeight: '600', 
              marginBottom: '0.75rem' 
            }}>
              Select your answer:
            </h3>
            <AnswerOptions 
              options={currentRound.answer_options} 
              selectedAnswer={selectedAnswer}
              correctAnswer={result?.correct_answer?.city || localFeedback?.correctAnswer?.city}
              showResult={showFeedback || localFeedback !== null}
              onSelectAnswer={handleSelectAnswer}
            />
          </div>
          
          {/* Submit button - only show if not showing feedback */}
          {!showFeedback && !localFeedback && (
            <div style={{ textAlign: 'center', marginBottom: '1.5rem' }}>
              <button 
                style={{
                  backgroundColor: selectedAnswer ? '#3b82f6' : '#9ca3af',
                  color: 'white',
                  padding: '0.75rem 1.5rem',
                  borderRadius: '0.5rem',
                  fontWeight: '500',
                  border: 'none',
                  cursor: selectedAnswer ? 'pointer' : 'not-allowed',
                  display: 'inline-flex',
                  alignItems: 'center',
                  justifyContent: 'center'
                }}
                onClick={handleSubmitAnswer}
                disabled={!selectedAnswer || isSubmitting}
              >
                {isSubmitting ? 'Submitting...' : 'Submit Answer'}
              </button>
            </div>
          )}
          
          {/* Feedback - use either context state or local state */}
          {(showFeedback && result) || localFeedback ? (
            <Feedback 
              isCorrect={result?.is_correct || localFeedback?.isCorrect}
              fact={result?.fact || localFeedback?.fact}
              correctAnswer={result?.correct_answer || localFeedback?.correctAnswer}
              onNextRound={handleNextRound}
              isLastQuestion={questionCount >= MAX_QUESTIONS}
            />
          ) : null}
        </>
      ) : (
        <div style={{ textAlign: 'center', padding: '2rem' }}>
          <h2 style={{ 
            fontSize: '1.25rem', 
            fontWeight: 'bold', 
            marginBottom: '1rem' 
          }}>
            Ready to start?
          </h2>
          <button
          style={{
            backgroundColor: '#3b82f6',
            color: 'white',
            padding: '0.75rem 1.5rem',
            borderRadius: '0.5rem',
            fontWeight: 'bold',
            border: 'none',
            cursor: 'pointer'
          }}
          onClick={handleNewGame}
        >
          Start New Game
        </button>
      </div>
    )}
  </div>
);
};

export default GameBoard;