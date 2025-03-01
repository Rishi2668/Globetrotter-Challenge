//Feedback.jsx
import React, { useEffect } from 'react';

const Feedback = ({ isCorrect, fact, correctAnswer, onNextRound, isLastQuestion = false }) => {
  useEffect(() => {
    console.log("Feedback mounted with:", { isCorrect, fact, correctAnswer, isLastQuestion });
    
    // Simple confetti effect for correct answers
    if (isCorrect) {
      try {
        const colors = ['#ff0000', '#00ff00', '#0000ff', '#ffff00', '#ff00ff'];
        for (let i = 0; i < 100; i++) {
          const div = document.createElement('div');
          div.style.position = 'fixed';
          div.style.zIndex = '1000';
          div.style.width = '10px';
          div.style.height = '10px';
          div.style.backgroundColor = colors[Math.floor(Math.random() * colors.length)];
          div.style.left = Math.random() * 100 + 'vw';
          div.style.top = -20 + 'px';
          
          document.body.appendChild(div);
          
          // Animate falling
          setTimeout(() => {
            div.style.transition = 'top 1s ease-out, opacity 0.7s ease-out';
            div.style.top = Math.random() * 100 + 'vh';
            div.style.opacity = '0';
            
            // Remove element after animation
            setTimeout(() => {
              document.body.removeChild(div);
            }, 1000);
          }, Math.random() * 500);
        }
      } catch (e) {
        console.error("Animation error:", e);
      }
    }
    
    // Important: Removed any auto-advancing logic that might have been here
    // Only the button click should trigger the next question
    
  }, [isCorrect, fact, correctAnswer, isLastQuestion]);

  return (
    <div style={{
      textAlign: 'center',
      padding: '20px',
      margin: '20px 0',
      borderWidth: '2px',
      borderStyle: 'solid',
      borderRadius: '10px',
      backgroundColor: isCorrect ? '#f0fdf4' : '#fef2f2',
      borderColor: isCorrect ? '#22c55e' : '#ef4444',
      maxWidth: '100%',
      boxSizing: 'border-box'
    }}>
      {isCorrect ? (
        // Correct answer feedback
        <div>
          <div style={{ 
            fontSize: '72px', 
            marginBottom: '15px',
            display: 'inline-block',
            animation: 'bounce 1s ease infinite'
          }}>
            🎉
          </div>
          <h2 style={{ 
            fontSize: '24px', 
            fontWeight: 'bold', 
            color: '#16a34a', 
            marginBottom: '10px' 
          }}>
            Correct!
          </h2>
          <p style={{ fontSize: '18px', marginBottom: '15px' }}>
            {correctAnswer?.city || "This destination"}, {correctAnswer?.country || ""} is the right answer!
          </p>
        </div>
      ) : (
        // Incorrect answer feedback
        <div>
          <div style={{ 
            fontSize: '72px', 
            marginBottom: '15px',
            display: 'inline-block'
          }}>
            😢
          </div>
          <h2 style={{ 
            fontSize: '24px', 
            fontWeight: 'bold', 
            color: '#dc2626', 
            marginBottom: '10px' 
          }}>
            Not quite right...
          </h2>
          <p style={{ fontSize: '18px', marginBottom: '15px' }}>
            The correct answer is {correctAnswer?.city || "another destination"}, {correctAnswer?.country || ""}.
          </p>
        </div>
      )}

      {/* Fun fact box */}
      <div style={{
        padding: '15px',
        marginTop: '15px',
        backgroundColor: '#fefce8',
        borderRadius: '10px',
        borderLeft: '4px solid #facc15',
        textAlign: 'left'
      }}>
        <h3 style={{ fontWeight: 'bold', marginBottom: '8px' }}>Did you know?</h3>
        <p>{fact || "This destination has a rich history and culture!"}</p>
      </div>
      
      {/* Last question message */}
      {isLastQuestion && (
        <div style={{
          backgroundColor: '#f0f9ff',
          padding: '10px',
          borderRadius: '8px',
          marginTop: '15px',
          border: '1px solid #bae6fd'
        }}>
          <p style={{ fontWeight: 'bold', color: '#0284c7' }}>
            This is the last question!
          </p>
        </div>
      )}
      
      {/* Next round button - different text for last question */}
      <button 
        onClick={onNextRound}
        style={{
          marginTop: '20px',
          padding: '12px 24px',
          backgroundColor: isLastQuestion ? '#4f46e5' : '#2563eb',
          color: 'white',
          borderRadius: '8px',
          fontWeight: 'bold',
          cursor: 'pointer',
          border: 'none',
          transition: 'background-color 0.3s, transform 0.2s'
        }}
        onMouseOver={(e) => e.target.style.backgroundColor = isLastQuestion ? '#4338ca' : '#1d4ed8'}
        onMouseOut={(e) => e.target.style.backgroundColor = isLastQuestion ? '#4f46e5' : '#2563eb'}
        onMouseDown={(e) => e.target.style.transform = 'scale(0.98)'}
        onMouseUp={(e) => e.target.style.transform = 'scale(1)'}
      >
        {isLastQuestion ? 'Finish Game' : 'Next Destination'}
      </button>
      
      <style jsx>{`
        @keyframes bounce {
          0%, 100% { transform: translateY(0); }
          50% { transform: translateY(-15px); }
        }
      `}</style>
    </div>
  );
};

export default Feedback;