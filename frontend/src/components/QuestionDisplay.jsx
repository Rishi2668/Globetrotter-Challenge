// frontend/src/components/QuestionDisplay.jsx
import React, { useState, useEffect, useRef } from 'react';
import Clue from './Clue';
import AnswerOptions from './AnswerOptions';

// This component maintains its own copy of question data
// It only updates when explicitly told to via the updateQuestion prop
const QuestionDisplay = ({ 
  initialQuestion, 
  selectedAnswer, 
  onSelectAnswer, 
  showResult,
  correctAnswer,
  forceUpdate,
  questionCounter
}) => {
  // Maintain our own cached copy of the question
  const [question, setQuestion] = useState(initialQuestion);
  const previousQuestionIdRef = useRef(initialQuestion?.destination_id);
  const updateCountRef = useRef(0);
  
  // If forceUpdate changes or initialQuestion has a new ID, update our question
  useEffect(() => {
    // Only update if there's a new question with a different ID
    const newQuestionId = initialQuestion?.destination_id;
    
    if (newQuestionId && newQuestionId !== previousQuestionIdRef.current) {
      console.log("QUESTION DISPLAY: Updating to new question:", newQuestionId);
      console.log("Previous question was:", previousQuestionIdRef.current);
      
      setQuestion(initialQuestion);
      previousQuestionIdRef.current = newQuestionId;
      updateCountRef.current++;
    }
    else if (forceUpdate > updateCountRef.current) {
      console.log("QUESTION DISPLAY: Force updating question");
      setQuestion(initialQuestion);
      updateCountRef.current = forceUpdate;
    }
  }, [initialQuestion, forceUpdate]);
  
  // If no question is available, show placeholder
  if (!question) {
    return <div>Loading question...</div>;
  }
  
  return (
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
        {question.clues.map((clue, index) => (
          <Clue 
            key={`clue-${question.destination_id}-${index}`}
            text={clue} 
            index={index} 
          />
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
          options={question.answer_options} 
          selectedAnswer={selectedAnswer}
          correctAnswer={correctAnswer}
          showResult={showResult}
          onSelectAnswer={onSelectAnswer}
        />
      </div>
    </>
  );
};

export default QuestionDisplay;