// frontend/src/components/ChallengeButton.jsx
import React, { useState } from 'react';
import { createChallenge } from '../services/api';
import SharePopup from './SharePopup';
import { useUser } from '../context/UserContext';
import { toast } from 'react-toastify';

const ChallengeButton = () => {
  const { user } = useUser();
  const [showSharePopup, setShowSharePopup] = useState(false);
  const [challengeData, setChallengeData] = useState(null);
  const [loading, setLoading] = useState(false);

  const handleCreateChallenge = async () => {
    if (!user) {
      toast.error('You need to be logged in to create a challenge');
      return;
    }

    try {
      setLoading(true);
      const result = await createChallenge(user.id);
      
      if (result) {
        setChallengeData(result);
        setShowSharePopup(true);
      }
    } catch (error) {
      console.error('Error creating challenge:', error);
      toast.error('Failed to create challenge. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const closeSharePopup = () => {
    setShowSharePopup(false);
    setChallengeData(null);
  };

  return (
    <>
      <button
        className="btn btn-secondary"
        onClick={handleCreateChallenge}
        disabled={loading || !user}
      >
        {loading ? 'Creating Challenge...' : 'Challenge a Friend'}
      </button>

      {showSharePopup && challengeData && (
        <SharePopup
          challengeData={challengeData}
          onClose={closeSharePopup}
        />
      )}
    </>
  );
};

export default ChallengeButton;