# backend/routes/game_routes.py
from flask import Blueprint, request, jsonify, current_app
from models.game import Game
from models.user import User
from models.destination import Destination
from bson.objectid import ObjectId

game_bp = Blueprint('games', __name__)

@game_bp.route('/', methods=['POST'])
def start_game():
    """Start a new game session"""
    db = current_app.config['DB']
    game_model = Game(db)
    data = request.json
    
    # Extract user ID from request
    user_id = data.get('user_id')
    
    if not user_id:
        return jsonify({'error': 'User ID is required'}), 400
    
    # Validate user exists
    user_model = User(db)
    user = user_model.get_user_by_id(user_id)
    
    if not user:
        return jsonify({'error': 'User not found'}), 404
    
    # Create a new game
    game = game_model.create_game(user_id)
    
    return jsonify({
        'game': {
            'id': game['_id'],
            'score': game['score'],
            'rounds': game['rounds'],
            'active': game['active']
        }
    }), 201

@game_bp.route('/<game_id>/round', methods=['POST'])
def add_round(game_id):  # Add game_id as parameter here
    """Add a new round to the game"""
    db = current_app.config['DB']
    game_model = Game(db)
    destination_model = Destination(db)
    data = request.json
    
    # Extract data from request
    user_id = data.get('user_id')
    
    if not game_id:
        return jsonify({'error': 'Game ID is required'}), 400
    
    # Get the game
    game = game_model.get_game(game_id)
    
    if not game:
        return jsonify({'error': 'Game not found'}), 404
    
    # If game is not active, return error
    if not game['active']:
        return jsonify({'error': 'Game is not active'}), 400
    
    # Get excluded destination IDs from user if provided
    excluded_ids = []
    if user_id:
        user_model = User(db)
        excluded_ids = user_model.get_played_destinations(user_id)
    
    # Get a random destination
    destination = destination_model.get_random_destination(excluded_ids)
    
    if not destination:
        return jsonify({'error': 'No destinations found'}), 404
    
    # Get answer options for multiple choice
    answer_options = destination_model.get_multiple_choice_options(destination)
    
    # Select 1-2 random clues
    clues = destination['clues']
    num_clues = min(2, len(clues))
    selected_clues = random.sample(clues, num_clues)
    
    # If user is logged in, mark destination as played
    if user_id:
        user_model = User(db)
        user_model.add_played_destination(user_id, str(destination['_id']))
    
    # Add the round to the game
    game_model.add_round(
        game_id, 
        str(destination['_id']), 
        selected_clues,
        answer_options
    )
    
    # Get the updated game
    updated_game = game_model.get_game(game_id)
    
    # Prepare response
    response = {
        'game': updated_game,
        'round': {
            'destination_id': str(destination['_id']),
            'clues': selected_clues,
            'answer_options': answer_options,
            'round_index': len(updated_game['rounds']) - 1,
            'correct_answer': {
                'city': destination['city'],
                'country': destination['country']
            }
        }
    }
    
    return jsonify(response)

@game_bp.route('/<game_id>/answer', methods=['POST'])
def submit_answer(game_id):
    """Submit an answer for the current round"""
    db = current_app.config['DB']
    game_model = Game(db)
    user_model = User(db)
    destination_model = Destination(db)
    data = request.json
    
    # Extract data from request
    destination_id = data.get('destination_id')
    user_answer = data.get('answer')
    round_index = data.get('round_index', 0)
    
    if not game_id or not destination_id or not user_answer:
        return jsonify({'error': 'Game ID, destination ID, and answer are required'}), 400
    
    # Get the game
    game = game_model.get_game(game_id)
    
    if not game:
        return jsonify({'error': 'Game not found'}), 404
    
    # If game is not active, return error
    if not game['active']:
        return jsonify({'error': 'Game is not active'}), 400
    
    # Get the destination
    destination = destination_model.get_destination_by_id(destination_id)
    
    if not destination:
        return jsonify({'error': 'Destination not found'}), 404
    
    # Check if answer is correct
    is_correct = destination['city'] == user_answer
    
    # Get a random fact to display - THIS IS THE IMPORTANT PART TO FIX
    if is_correct:
        if 'fun_facts' in destination and destination['fun_facts']:
            facts = destination['fun_facts']
        elif 'fun_fact' in destination and destination['fun_fact']:
            facts = destination['fun_fact']
        else:
            facts = [f"{destination['city']} is a fascinating destination!"]
    else:
        if 'trivia' in destination and destination['trivia']:
            facts = destination['trivia']
        else:
            facts = [f"{destination['city']} has many interesting aspects to explore."]

    random_fact = random.choice(facts)
    
    # Make sure we have at least one fact, otherwise use a default
    if facts and len(facts) > 0:
        random_fact = random.choice(facts)
    else:
        # Provide default facts based on whether answer was correct
        if is_correct:
            random_fact = f"{destination['city']} is a fascinating destination with a rich history and culture!"
        else:
            random_fact = f"{destination['city']} is known for its unique attractions and landmarks."
    
    # Update the round
    game_model.update_round(
        game_id, 
        round_index, 
        user_answer, 
        is_correct, 
        random_fact
    )
    
    # Update user stats
    user_id = game['user_id']
    user_model.update_stats(user_id, is_correct)
    
    # Get the updated game
    updated_game = game_model.get_game(game_id)
    
    # Prepare response
    response = {
        'is_correct': is_correct,
        'fact': random_fact,
        'game': updated_game,
        'correct_answer': {
            'city': destination['city'],
            'country': destination['country'],
            'image_url': destination.get('image_url')
        }
    }
    
    return jsonify(response)

@game_bp.route('/<game_id>', methods=['GET'])
def get_game(self, game_id):
    """Get a game by ID"""
    try:
        game = self.collection.find_one({'_id': ObjectId(game_id)})
        if game:
            game['_id'] = str(game['_id'])
            return game
        return None
    except Exception as e:
        # Handle invalid ID or other errors
        print(f"Error retrieving game with ID {game_id}: {e}")
        return None

@game_bp.route('/<game_id>/end', methods=['POST'])
def end_game(game_id):
    """End a game session"""
    db = current_app.config['DB']
    game_model = Game(db)
    
    # Get the game
    game = game_model.get_game(game_id)
    
    if not game:
        return jsonify({'error': 'Game not found'}), 404
    
    # End the game
    game_model.end_game(game_id)
    
    # Get the updated game
    updated_game = game_model.get_game(game_id)
    
    return jsonify({'game': updated_game})

@game_bp.route('/user/<user_id>', methods=['GET'])
def get_user_games(user_id):
    """Get all games for a user"""
    db = current_app.config['DB']
    game_model = Game(db)
    
    games = game_model.get_user_games(user_id)
    
    return jsonify({'games': games})

# Import missing dependencies
import random