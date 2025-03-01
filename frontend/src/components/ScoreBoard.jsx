// frontend/src/components/ScoreBoard.jsx
import React, { useEffect } from 'react';

const ScoreBoard = ({ stats, challengerStats, challengeMode = false }) => {
  // Add debug logging when stats change
  useEffect(() => {
    console.log("ScoreBoard received stats:", stats);
  }, [stats]);

  // Calculate percentages safely
  const calculatePercentage = (correct, total) => {
    if (!total) return 0; // Return 0 instead of NaN when total is 0
    return Math.round((correct / total) * 100);
  };

  // Get user stats with safe defaults and console log them
  const userCorrect = stats?.correct || 0;
  const userIncorrect = stats?.incorrect || 0;
  const userTotal = stats?.total || 0;
  const userPercentage = calculatePercentage(userCorrect, userTotal);

  console.log("ScoreBoard rendering with:", {
    userCorrect,
    userIncorrect,
    userTotal,
    userPercentage
  });

  // Get challenger stats (if in challenge mode)
  const challengerCorrect = challengerStats?.correct || 0;
  const challengerIncorrect = challengerStats?.incorrect || 0;
  const challengerTotal = challengerStats?.total || 0;
  const challengerPercentage = calculatePercentage(challengerCorrect, challengerTotal);

  return (
    <div className="scoreboard mb-6">
      <div className="flex flex-wrap justify-between gap-4">
        {/* User stats */}
        <div className={`user-stats flex-1 ${challengeMode ? 'border-r pr-4' : ''}`}>
          {challengeMode && <h3 className="text-sm font-bold mb-2">Your Score</h3>}
          
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
            <div className="stat-box p-2 bg-green-50 rounded">
              <div className="text-xs text-green-700">Correct</div>
              <div className="font-bold text-green-800 scoreboard-stat-value" data-stat-type="correct">{userCorrect}</div>
            </div>
            
            <div className="stat-box p-2 bg-red-50 rounded">
              <div className="text-xs text-red-700">Incorrect</div>
              <div className="font-bold text-red-800 scoreboard-stat-value" data-stat-type="incorrect">{userIncorrect}</div>
            </div>
            
            <div className="stat-box p-2 bg-blue-50 rounded">
              <div className="text-xs text-blue-700">Total</div>
              <div className="font-bold text-blue-800 scoreboard-stat-value" data-stat-type="total">{userTotal}</div>
            </div>
            
            <div className="stat-box p-2 bg-purple-50 rounded">
              <div className="text-xs text-purple-700">Score</div>
              <div className="font-bold text-purple-800 scoreboard-percent" data-stat-type="percentage">{userPercentage}%</div>
            </div>
          </div>
        </div>
        
        {/* Challenger stats (only shown in challenge mode) */}
        {challengeMode && challengerStats && (
          <div className="challenger-stats flex-1">
            <h3 className="text-sm font-bold mb-2">Challenger's Score</h3>
            
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
              <div className="stat-box p-2 bg-green-50 rounded">
                <div className="text-xs text-green-700">Correct</div>
                <div className="font-bold text-green-800">{challengerCorrect}</div>
              </div>
              
              <div className="stat-box p-2 bg-red-50 rounded">
                <div className="text-xs text-red-700">Incorrect</div>
                <div className="font-bold text-red-800">{challengerIncorrect}</div>
              </div>
              
              <div className="stat-box p-2 bg-blue-50 rounded">
                <div className="text-xs text-blue-700">Total</div>
                <div className="font-bold text-blue-800">{challengerTotal}</div>
              </div>
              
              <div className="stat-box p-2 bg-purple-50 rounded">
                <div className="text-xs text-purple-700">Score</div>
                <div className="font-bold text-purple-800">{challengerPercentage}%</div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default ScoreBoard;