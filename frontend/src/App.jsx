// frontend/src/App.jsx
import React from 'react';
import { Routes, Route } from 'react-router-dom';
import { UserProvider } from './context/UserContext';
// Remove the direct import of GameProvider
// import { GameProvider } from './context/GameContext';
import Home from './pages/Home';
import Game from './pages/Game';
import Challenge from './pages/Challenge';
import ChallengesList from './pages/ChallengesList';
// Import the GameInterceptorWrapper instead
import { GameInterceptorWrapper } from './context/GameContextInterceptor';

function App() {
  return (
    <UserProvider>
      {/* Replace GameProvider with GameInterceptorWrapper */}
      <GameInterceptorWrapper>
        <div className="app-container">
          <Routes>
            <Route path="/" element={<Home />} />
            <Route path="/game" element={<Game />} />
            <Route path="/challenge" element={<ChallengesList />} />
            <Route path="/challenge/:challengeId" element={<Challenge />} />
          </Routes>
        </div>
      </GameInterceptorWrapper>
    </UserProvider>
  );
}

export default App;