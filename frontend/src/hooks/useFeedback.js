// frontend/src/hooks/useFeedback.js
import { useState, useEffect } from 'react';

export const useFeedback = (resultData, showFeedbackState) => {
  const [feedback, setFeedback] = useState(null);

  useEffect(() => {
    // Update local feedback when result data changes
    if (resultData && showFeedbackState) {
      console.log("Setting feedback from result data:", resultData);
      
      // Ensure we have all required fields
      setFeedback({
        isCorrect: resultData.is_correct,
        fact: resultData.fact || "This destination has a fascinating history!",
        correctAnswer: resultData.correct_answer || {
          city: "Unknown city",
          country: "Unknown country"
        }
      });
    }
  }, [resultData, showFeedbackState]);

  // Method to manually set feedback
  const setFeedbackData = (data) => {
    console.log("Manually setting feedback data:", data);
    setFeedback(data);
  };

  // Method to clear feedback
  const clearFeedback = () => {
    setFeedback(null);
  };

  return { feedback, setFeedbackData, clearFeedback };
};

export default useFeedback;