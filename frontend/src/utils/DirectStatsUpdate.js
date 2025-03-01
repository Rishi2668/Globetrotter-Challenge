
export const updateStatsDirect = (stats) => {
    // Find all stat elements and update them
    const correctEl = document.querySelector('[data-stat-type="correct"]');
    const incorrectEl = document.querySelector('[data-stat-type="incorrect"]');
    const totalEl = document.querySelector('[data-stat-type="total"]');
    const percentageEl = document.querySelector('[data-stat-type="percentage"]');
    
    // Calculate percentage safely
    const calculatePercentage = (correct, total) => {
      if (!total) return 0;
      return Math.round((correct / total) * 100);
    };
    
    // Update elements if they exist
    if (correctEl) correctEl.textContent = stats.correct.toString();
    if (incorrectEl) incorrectEl.textContent = stats.incorrect.toString();
    if (totalEl) totalEl.textContent = stats.total.toString();
    
    if (percentageEl) {
      const percentage = calculatePercentage(stats.correct, stats.total);
      percentageEl.textContent = `${percentage}%`;
    }
    
    console.log("DOM stats updated directly:", stats);
  };
  
  // Function to reset stats to zero
  export const resetStatsDirect = () => {
    updateStatsDirect({
      correct: 0,
      incorrect: 0,
      total: 0
    });
    console.log("DOM stats reset to zero");
  };