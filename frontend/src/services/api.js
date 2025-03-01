
import axios from 'axios';

// Create an axios instance with default config
const api = axios.create({
  baseURL: '/api',
  headers: {
    'Content-Type': 'application/json'
  }
});

// User API calls
export const registerUser = async (username) => {
  try {
    const response = await api.post('/users/register', { username });
    return response.data;
  } catch (error) {
    throw error;
  }
};

export const getUserById = async (userId) => {
  try {
    const response = await api.get(`/users/${userId}`);
    return response.data;
  } catch (error) {
    throw error;
  }
};

export const getUserByChallenge = async (challengeId) => {
  try {
    const response = await api.get(`/users/challenge/${challengeId}`);
    return response.data;
  } catch (error) {
    throw error;
  }
};

export const createChallenge = async (userId) => {
  try {
    const response = await api.post('/users/challenge', { user_id: userId });
    return response.data;
  } catch (error) {
    throw error;
  }
};

export const acceptChallenge = async (challengeId, username) => {
  try {
    const response = await api.post('/users/challenge/accept', { 
      challenge_id: challengeId, 
      username 
    });
    return response.data;
  } catch (error) {
    throw error;
  }
};
// Add this new function to update user stats
export const updateUserStats = async (userId, stats) => {
    try {
      const response = await api.put(`/users/${userId}/stats`, {
        game_stats: stats
      });
      console.log("Stats reset response:", response.data);
      return response.data;
    } catch (error) {
      console.error("Error updating user stats:", error);
      throw error;
    }
  };

// Game API calls
export const startGame = async (userId) => {
  try {
    const response = await api.post('/games', { user_id: userId });
    return response.data;
  } catch (error) {
    throw error;
  }
};

export const getGameById = async (gameId) => {
  try {
    const response = await api.get(`/games/${gameId}`);
    return response.data;
  } catch (error) {
    throw error;
  }
};

export const addGameRound = async (gameId, userId) => {
  try {
    console.log("Requesting new round for game:", gameId);
    const response = await api.post(`/games/${gameId}/round`, { 
      // Don't include game_id in body as it's already in the URL
      // Only include user_id if provided
      ...(userId ? { user_id: userId } : {})
    });
    console.log("New round response:", response.data);
    return response.data;
  } catch (error) {
    console.error("Error getting next round:", error);
    throw error;
  }
};

// export const submitAnswer = async (gameId, destinationId, answer, roundIndex) => {
//   try {
//     console.log("API submitAnswer called with:", {
//       gameId, destinationId, answer, roundIndex
//     });
    
//     const response = await api.post(`/games/${gameId}/answer`, {
//       destination_id: destinationId,
//       answer,
//       round_index: roundIndex,
//       // Add a flag to tell backend not to auto-advance
//       auto_advance: false
//     });
    
//     console.log("API submitAnswer response:", response.data);
//     return response.data;
//   } catch (error) {
//     console.error("API submitAnswer error:", error);
//     if (error.response) {
//       console.error("Response data:", error.response.data);
//       console.error("Response status:", error.response.status);
//     }
//     throw error;
//   }
// };

// In your api.js file
export const submitAnswer = async (gameId, destinationId, answer, roundIndex) => {
    try {
      console.log("API submitAnswer called with:", {
        gameId, destinationId, answer, roundIndex
      });
      
      const response = await api.post(`/games/${gameId}/answer`, {
        destination_id: destinationId,
        answer,
        round_index: roundIndex,
        auto_advance: false  // Make absolutely sure this is false
      });
      
      console.log("API submitAnswer response:", response.data);
      
      // IMPORTANT: If the response contains a new round/question, 
      // we need to ignore it here to prevent auto-advancing
      const responseData = response.data;
      
      // If the backend is returning a new round in the response, remove it
      if (responseData && responseData.next_round) {
        console.log("Ignoring next_round from response to prevent auto-advance");
        delete responseData.next_round;
      }
      
      return responseData;
    } catch (error) {
      console.error("API submitAnswer error:", error);
      if (error.response) {
        console.error("Response data:", error.response.data);
        console.error("Response status:", error.response.status);
      }
      throw error;
    }
  };

export const endGame = async (gameId) => {
  try {
    console.log("Ending game:", gameId);
    const response = await api.post(`/games/${gameId}/end`);
    console.log("End game response:", response.data);
    return response.data;
  } catch (error) {
    console.error("Error ending game:", error);
    throw error;
  }
};

export const getUserGames = async (userId) => {
  try {
    const response = await api.get(`/games/user/${userId}`);
    return response.data;
  } catch (error) {
    throw error;
  }
};

// Destination API calls
export const getRandomDestination = async (userId) => {
  try {
    const response = await api.get('/destinations/random', {
      params: { user_id: userId }
    });
    return response.data;
  } catch (error) {
    throw error;
  }
};

export const validateAnswer = async (destinationId, answer, userId, gameId) => {
  try {
    const response = await api.post('/destinations/validate', {
      destination_id: destinationId,
      answer,
      user_id: userId,
      game_id: gameId
    });
    return response.data;
  } catch (error) {
    throw error;
  }
};