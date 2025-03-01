# backend/routes/user_routes.py
from flask import Blueprint, request, jsonify, current_app
from models.user import User
from models.game import Game
import random
user_bp = Blueprint('users', __name__)

@user_bp.route('/register', methods=['POST'])
def register_user():
    """Register a new user"""
    db = current_app.config['DB']
    user_model = User(db)
    data = request.json
    
    # Extract username from request
    username = data.get('username')
    
    if not username:
        return jsonify({'error': 'Username is required'}), 400
    
    # Create user
    user = user_model.create_user(username)
    
    if not user:
        # Username is taken, suggest a new one
        suggested_username = user_model.suggest_username(username)
        return jsonify({
            'error': 'Username already taken',
            'suggested_username': suggested_username
        }), 400
    
    return jsonify({
        'user': {
            'id': user['_id'],
            'username': user['username'],
            'challenge_id': user['challenge_id'],
            'game_stats': user['game_stats']
        }
    }), 201

@user_bp.route('/<user_id>', methods=['GET'])
def get_user(user_id):
    """Get user by ID"""
    db = current_app.config['DB']
    user_model = User(db)
    
    user = user_model.get_user_by_id(user_id)
    
    if not user:
        return jsonify({'error': 'User not found'}), 404
    
    return jsonify({
        'user': {
            'id': user['_id'],
            'username': user['username'],
            'challenge_id': user['challenge_id'],
            'game_stats': user['game_stats']
        }
    })

@user_bp.route('/username/<username>', methods=['GET'])
def get_user_by_username(username):
    """Get user by username"""
    db = current_app.config['DB']
    user_model = User(db)
    
    user = user_model.get_user_by_username(username)
    
    if not user:
        return jsonify({'error': 'User not found'}), 404
    
    return jsonify({
        'user': {
            'id': user['_id'],
            'username': user['username'],
            'challenge_id': user['challenge_id'],
            'game_stats': user['game_stats']
        }
    })

@user_bp.route('/challenge/<challenge_id>', methods=['GET'])
def get_user_by_challenge(challenge_id):
    """Get user by challenge ID"""
    db = current_app.config['DB']
    user_model = User(db)
    
    user = user_model.get_user_by_challenge_id(challenge_id)
    
    if not user:
        return jsonify({'error': 'Challenge not found'}), 404
    
    return jsonify({
        'user': {
            'id': user['_id'],
            'username': user['username'],
            'game_stats': user['game_stats']
        }
    })

@user_bp.route('/challenge', methods=['POST'])
def create_challenge():
    """Create a challenge link"""
    db = current_app.config['DB']
    user_model = User(db)
    game_model = Game(db)
    data = request.json
    
    # Extract user ID from request
    user_id = data.get('user_id')
    
    if not user_id:
        return jsonify({'error': 'User ID is required'}), 400
    
    # Get user
    user = user_model.get_user_by_id(user_id)
    
    if not user:
        return jsonify({'error': 'User not found'}), 404
    
    # Create a new game for the challenge
    game = game_model.create_game(user_id, is_challenge=True)
    
    # Generate challenge link
    frontend_url = request.headers.get('Origin', 'http://localhost:3000')
    challenge_link = f"{frontend_url}/challenge/{user['challenge_id']}"
    
    return jsonify({
        'challenge_link': challenge_link,
        'challenge_id': user['challenge_id'],
        'username': user['username'],
        'game_stats': user['game_stats'],
        'game_id': game['_id']
    })

@user_bp.route('/challenge/accept', methods=['POST'])
def accept_challenge():
    """Accept a challenge"""
    db = current_app.config['DB']
    user_model = User(db)
    game_model = Game(db)
    data = request.json
    
    # Extract data from request
    challenge_id = data.get('challenge_id')
    username = data.get('username')
    
    if not challenge_id:
        return jsonify({'error': 'Challenge ID is required'}), 400
    
    # Get challenger
    challenger = user_model.get_user_by_challenge_id(challenge_id)
    
    if not challenger:
        return jsonify({'error': 'Challenge not found'}), 404
    
    # Create or get user
    user = None
    if username:
        # Try to get existing user
        user = user_model.get_user_by_username(username)
        
        if not user:
            # Create new user
            user = user_model.create_user(username)
            
            if not user:
                # Username is taken, suggest a new one
                suggested_username = user_model.suggest_username(username)
                return jsonify({
                    'error': 'Username already taken',
                    'suggested_username': suggested_username
                }), 400
    else:
        # Create anonymous user
        anonymous_username = f"Player_{challenger['username']}_{int(random.random() * 10000)}"
        user = user_model.create_user(anonymous_username)
    
    # Create a new game for the challenged user
    game = game_model.create_game(
        user['_id'], 
        is_challenge=True, 
        challenged_by=challenger['_id']
    )
    
    return jsonify({
        'user': {
            'id': user['_id'],
            'username': user['username'],
            'game_stats': user['game_stats']
        },
        'challenger': {
            'id': challenger['_id'],
            'username': challenger['username'],
            'game_stats': challenger['game_stats']
        },
        'game': {
            'id': game['_id']
        }
    })

# Import missing dependencies
