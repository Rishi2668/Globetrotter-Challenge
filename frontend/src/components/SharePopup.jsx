// frontend/src/components/SharePopup.jsx
import React, { useRef, useEffect } from 'react';
import { WhatsappShareButton, WhatsappIcon } from 'react-share';
import { motion } from 'framer-motion';
import { toast } from 'react-toastify';

const SharePopup = ({ challengeData, onClose }) => {
  const popupRef = useRef(null);
  const linkRef = useRef(null);
  const canvasRef = useRef(null);

  // Create a dynamic share image using canvas
  useEffect(() => {
    if (!challengeData || !canvasRef.current) return;

    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d');
    
    // Set canvas dimensions
    canvas.width = 600;
    canvas.height = 315;
    
    // Draw background
    const gradient = ctx.createLinearGradient(0, 0, canvas.width, canvas.height);
    gradient.addColorStop(0, '#4264FB');
    gradient.addColorStop(1, '#9C27B0');
    
    ctx.fillStyle = gradient;
    ctx.fillRect(0, 0, canvas.width, canvas.height);
    
    // Draw text
    ctx.fillStyle = 'white';
    ctx.textAlign = 'center';
    
    // Title
    ctx.font = 'bold 48px Poppins, sans-serif';
    ctx.fillText('GLOBETROTTER', canvas.width / 2, 80);
    
    // Challenge message
    ctx.font = '28px Poppins, sans-serif';
    ctx.fillText('Can you beat my geography score?', canvas.width / 2, 150);
    
    // Username and score
    ctx.font = 'bold 36px Poppins, sans-serif';
    const scorePercentage = Math.round(
      (challengeData.game_stats.correct_answers / 
        Math.max(1, challengeData.game_stats.total_played)) * 100
    );
    ctx.fillText(
      `${challengeData.username}: ${scorePercentage}%`, 
      canvas.width / 2, 
      220
    );
    
    // Call to action
    ctx.font = '24px Poppins, sans-serif';
    ctx.fillText('Can you do better? Click to play!', canvas.width / 2, 280);
  }, [challengeData]);

  // Close when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (popupRef.current && !popupRef.current.contains(event.target)) {
        onClose();
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [onClose]);

  // Copy link to clipboard
  const copyLinkToClipboard = () => {
    if (!linkRef.current) return;
    
    linkRef.current.select();
    document.execCommand('copy');
    toast.success('Challenge link copied to clipboard!');
  };

  if (!challengeData) return null;

  return (
    <div className="share-popup">
      <motion.div 
        className="share-content"
        ref={popupRef}
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.3 }}
      >
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-xl font-bold">Challenge a Friend</h2>
          <button 
            className="text-gray-500 hover:text-gray-700"
            onClick={onClose}
          >
            ✕
          </button>
        </div>

        <div className="share-image">
          <canvas 
            ref={canvasRef} 
            className="w-full h-full object-cover rounded-lg"
          />
        </div>

        <p className="mb-4">
          Share this challenge with your friends to see if they can beat your score!
        </p>

        <div className="mb-4">
          <label className="block text-sm font-bold mb-2">
            Challenge Link:
          </label>
          <div className="flex">
            <input
              ref={linkRef}
              type="text"
              value={challengeData.challenge_link}
              readOnly
              className="form-input rounded-r-none flex-grow"
            />
            <button
              className="bg-blue-600 text-white px-4 py-2 rounded-r-lg hover:bg-blue-700"
              onClick={copyLinkToClipboard}
            >
              Copy
            </button>
          </div>
        </div>

        <div className="share-buttons">
          <WhatsappShareButton
            url={challengeData.challenge_link}
            title={`Can you beat my Globetrotter score? ${
              Math.round(
                (challengeData.game_stats.correct_answers / 
                  Math.max(1, challengeData.game_stats.total_played)
                ) * 100
              )}% - Challenge me now!`}
            className="share-button"
          >
            <div className="flex items-center px-4 py-2 bg-green-500 text-white rounded-lg">
              <WhatsappIcon size={24} round className="mr-2" />
              <span>Share on WhatsApp</span>
            </div>
          </WhatsappShareButton>
        </div>
      </motion.div>
    </div>
  );
};

export default SharePopup;