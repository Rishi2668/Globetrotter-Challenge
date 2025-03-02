import os
from flask import Flask, jsonify
from flask_cors import CORS
from dotenv import load_dotenv
from pymongo import MongoClient

# Import routes
from routes.destination_routes import destination_bp
from routes.user_routes import user_bp
from routes.game_routes import game_bp

# Load environment variables
load_dotenv()

# Initialize Flask app
app = Flask(__name__)
CORS(app, resources={r"/api/*": {"origins": ["https://fantastic-lollipop-bbbcf3.netlify.app", "http://localhost:3000"]}})

# Configure MongoDB
# app.config['MONGO_URI'] = os.getenv('MONGO_URI', 'mongodb://localhost:27017/')
# db_name = os.getenv('MONGO_DB_NAME', 'globetrotter')
mongo_uri = os.getenv('MONGO_URI', 'mongodb://localhost:27017')
db_name = os.getenv('MONGO_DB_NAME', 'globetrotter')
app.config['MONGO_URI'] = mongo_uri
mongo_client = MongoClient(mongo_uri)
db = mongo_client[db_name]
# mongo_client = MongoClient(app.config['MONGO_URI'])
# db = mongo_client.get_database()

# Register blueprints
app.register_blueprint(destination_bp, url_prefix='/api/destinations')
app.register_blueprint(user_bp, url_prefix='/api/users')
app.register_blueprint(game_bp, url_prefix='/api/games')

# Make the database instance available to routes
@app.before_request
def before_request():
    app.config['DB'] = db

# Root route
@app.route('/')
def index():
    return jsonify({'message': 'Globetrotter API is running'})

# Error handlers
@app.errorhandler(404)
def not_found(error):
    return jsonify({'error': 'Not found'}), 404

@app.errorhandler(500)
def server_error(error):
    return jsonify({'error': 'Server error'}), 500

if __name__ == '__main__':
    port = int(os.getenv('PORT', 5000))
    app.run(host='0.0.0.0', port=port, debug=os.getenv('DEBUG', 'False').lower() == 'true')