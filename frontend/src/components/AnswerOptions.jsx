// frontend/src/components/AnswerOptions.jsx
import React from 'react';
import { motion } from 'framer-motion';

const AnswerOptions = ({ 
  options, 
  selectedAnswer, 
  correctAnswer, 
  showResult, 
  onSelectAnswer 
}) => {
  // Get button class based on state
  const getButtonClass = (option) => {
    let className = 'option-button';
    
    // Check if this option is currently selected
    if (option.city === selectedAnswer) {
      className += ' selected';
    }
    
    // If showing result, check if correct or incorrect
    if (showResult) {
      if (option.city === correctAnswer) {
        className += ' correct';
      } else if (option.city === selectedAnswer && option.city !== correctAnswer) {
        className += ' incorrect';
      }
    }
    
    return className;
  };

  return (
    <div className="answer-options-grid">
      {options.map((option, index) => (
        <motion.button
          key={index}
          className={getButtonClass(option)}
          onClick={() => onSelectAnswer(option.city)}
          disabled={showResult}
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3, delay: index * 0.1 }}
        >
          <div className="font-bold">{option.city}</div>
          <div className="text-sm text-gray-600">{option.country}</div>
          
          {showResult && option.city === correctAnswer && (
            <div className="mt-1 text-green-600 font-semibold">✓ Correct Answer</div>
          )}
          
          {showResult && option.city === selectedAnswer && option.city !== correctAnswer && (
            <div className="mt-1 text-red-600 font-semibold">✗ Your Answer</div>
          )}
        </motion.button>
      ))}
    </div>
  );
};

export default AnswerOptions;