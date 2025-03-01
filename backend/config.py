# backend/config.py
import os
from dotenv import load_dotenv

# Load environment variables
load_dotenv()

# MongoDB configuration
MONGO_URI = os.getenv('MONGO_URI', 'mongodb://localhost:27017/globetrotter')

# Application configuration
DEBUG = os.getenv('DEBUG', 'False').lower() == 'true'
PORT = int(os.getenv('PORT', 5000))
HOST = os.getenv('HOST', '0.0.0.0')

# Frontend URL (for CORS and challenge links)
FRONTEND_URL = os.getenv('FRONTEND_URL', 'http://localhost:3000')

# OpenAI API key (for dataset expansion)
OPENAI_API_KEY = os.getenv('OPENAI_API_KEY', '')