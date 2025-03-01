// frontend/src/components/FeedbackWrapper.jsx
import React, { useEffect, useRef } from 'react';
import Feedback from './Feedback';

const FeedbackWrapper = (props) => {
  const containerRef = useRef(null);
  const hasShownRef = useRef(false);
  const propsRef = useRef(props);
  
  // Update props ref when they change
  useEffect(() => {
    propsRef.current = props;
  }, [props]);
  
  // Only call onNextRound when the button is explicitly clicked
  // Wrap the onNextRound callback to add extra protection
  const safeNextRound = (e) => {
    e.preventDefault();
    e.stopPropagation();
    
    console.log("FeedbackWrapper: Next round button clicked");
    
    if (typeof propsRef.current.onNextRound === 'function') {
      // Add a small delay to ensure any race conditions are resolved
      setTimeout(() => {
        propsRef.current.onNextRound();
      }, 50);
    }
  };
  
  // One-time setup - prevent any automatic next round triggers
  // by intercepting all possible events on the container
  useEffect(() => {
    if (!hasShownRef.current && containerRef.current) {
      console.log("FeedbackWrapper: Setting up event interception");
      
      const preventAutoProgress = (e) => {
        // Only prevent events that would navigate without user action
        if (!e.isTrusted) {
          console.log("FeedbackWrapper: Intercepted automatic event", e.type);
          e.stopPropagation();
        }
      };
      
      // Intercept all potential events that could cause navigation
      const container = containerRef.current;
      const allEvents = ['submit', 'click', 'keydown', 'keyup', 'animationend', 'transitionend'];
      
      allEvents.forEach(event => {
        container.addEventListener(event, preventAutoProgress, true);
      });
      
      hasShownRef.current = true;
      
      // Cleanup function
      return () => {
        allEvents.forEach(event => {
          if (container) {
            container.removeEventListener(event, preventAutoProgress, true);
          }
        });
      };
    }
  }, []);
  
  return (
    <div ref={containerRef} className="feedback-wrapper">
      <Feedback {...props} onNextRound={safeNextRound} />
    </div>
  );
};

export default FeedbackWrapper;