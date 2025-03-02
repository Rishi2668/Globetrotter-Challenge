# 🧩 The Globetrotter Challenge

The Ultimate Travel Guessing Game - Test your geography knowledge by guessing destinations from around the world!

## Table of Contents
- [Overview](#overview)
- [Features](#features)
- [Setup and Installation](#setup-and-installation)
- [Running the Application](#running-the-application)
- [Game Flow](#game-flow)
- [Technical Challenges](#technical-challenges)
- [Future Enhancements](#future-enhancements)
- [API Documentation](#api-documentation)

## Overview

"The Globetrotter Challenge" is an interactive geography quiz application that challenges players to guess cities around the world based on clues. Each game consists of five questions, with the player's score tracked throughout the game. Players can also create challenges for friends to test their geography knowledge against each other.

## Features

- **Interactive Quiz Gameplay**: Answer questions about global destinations based on historical and geographical clues.
- **Scoring System**: Track correct and incorrect answers with percentage calculation.
- **Results Summary**: Review your performance at the end of each game.
- **Challenge Mode**: Create challenges and share them with friends.
- **User Authentication**: Simple username-based login system.
- **Responsive Design**: Mobile-friendly interface for geography fun on-the-go.

## Setup and Installation

### Prerequisites
- Python (3.8 or higher)
- MongoDB
- Node.js (v14 or higher)
- npm or yarn

### Backend Setup (Python & MongoDB)

1. Clone the repository:
   ```bash
   git clone https://github.com/your-username/globetrotter-challenge.git
   cd globetrotter-challenge
   ```
2. Navigate to the backend directory:
   ```bash
   cd backend
   ```
3. Create a `.env` file in the backend directory and add the following:
   ```ini
   MONGO_URI=mongodb://localhost:27017/
   DEBUG=True
   PORT=5000
   HOST=0.0.0.0
   FRONTEND_URL=http://localhost:3000
   MONGO_DB_NAME=globetrotter
   ```
4. Install dependencies:
   ```bash
   pip install -r requirements.txt
   ```
5. Expand the dataset:
   ```bash
   python3 scripts/expand_dataset.py
   ```
6. Start the backend server:
   ```bash
   python3 app.py
   ```

### Frontend Setup (React)

1. Open a new terminal window/tab.
2. Navigate to the frontend directory:
   ```bash
   cd frontend
   ```
3. Install frontend dependencies:
   ```bash
   npm install
   ```
4. Create a .env file in the frontend directory with the following content:
   ```bash
   VITE_API_URL=http://127.0.0.1:5000
   ```

5. Start the frontend development server:
   ```bash
   npm run dev
   ```

## Running the Application

1. Ensure both backend and frontend servers are running.
2. Open your browser and navigate to `http://localhost:3000`.
3. Register with a username or log in if you already have an account.
4. Start playing or create a challenge for friends!

## Game Flow

1. **Home Page**: Register or login with a username.
2. **Game Page**: Start a new game.
3. **Gameplay**:
   - Read clues about a destination.
   - Select your answer from the options.
   - Get immediate feedback.
   - Continue to the next question.
4. **End of Game**: View your final score and performance summary.
5. **Challenge Page**: Share your challenge with friends.
---

🧩 **The Globetrotter Challenge** - Discover the world one clue at a time!

