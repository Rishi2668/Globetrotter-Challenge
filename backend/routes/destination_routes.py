# backend/routes/destination_routes.py
from flask import Blueprint, request, jsonify, current_app
from models.destination import Destination
from models.user import User
import random

destination_bp = Blueprint('destinations', __name__)

@destination_bp.route('/random', methods=['GET'])
def get_random_destination():
    """Get a random destination with clues"""
    db = current_app.config['DB']
    destination_model = Destination(db)
    
    # Get excluded destination IDs from user if provided
    user_id = request.args.get('user_id')
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
    
    # Select a random fun fact
    fun_fact = random.choice(destination['fun_facts']) if destination['fun_facts'] else None
    
    # If user is logged in, mark destination as played
    if user_id:
        user_model = User(db)
        user_model.add_played_destination(user_id, str(destination['_id']))
    
    # Prepare response
    response = {
        'destination_id': str(destination['_id']),
        'clues': selected_clues,
        'answer_options': answer_options,
        'fun_fact': fun_fact,
        'correct_answer': {
            'city': destination['city'],
            'country': destination['country']
        }
    }
    
    return jsonify(response)

@destination_bp.route('/validate', methods=['POST'])
def validate_answer():
    """Validate a user's answer"""
    db = current_app.config['DB']
    data = request.json
    
    # Extract data from request
    destination_id = data.get('destination_id')
    user_answer = data.get('answer')
    user_id = data.get('user_id')
    game_id = data.get('game_id')
    round_index = data.get('round_index', 0)
    
    # Validate destination
    destination_model = Destination(db)
    destination = destination_model.get_destination_by_id(destination_id)
    
    if not destination:
        return jsonify({'error': 'Destination not found'}), 404
    
    # Check if answer is correct
    is_correct = destination['city'] == user_answer
    
    # Get a random fact to display
    if is_correct:
        facts = destination['fun_facts']
    else:
        facts = destination['trivia']
    
    random_fact = random.choice(facts) if facts else "No fact available"
    
    # Update user stats if user is logged in
    if user_id:
        user_model = User(db)
        user_model.update_stats(user_id, is_correct)
    
    # Update game if part of a game
    if game_id:
        game_model = Game(db)
        game_model.update_round(game_id, round_index, user_answer, is_correct, random_fact)
    
    # Prepare response
    response = {
        'is_correct': is_correct,
        'fact': random_fact,
        'correct_answer': {
            'city': destination['city'],
            'country': destination['country'],
            'image_url': destination.get('image_url')
        }
    }
    
    return jsonify(response)

@destination_bp.route('/', methods=['GET'])
def get_all_destinations():
    """Get all destinations (admin only)"""
    db = current_app.config['DB']
    destination_model = Destination(db)
    
    destinations = destination_model.get_all_destinations()
    
    # Convert ObjectId to string for JSON serialization
    for destination in destinations:
        destination['_id'] = str(destination['_id'])
    
    return jsonify(destinations)

@destination_bp.route('/', methods=['POST'])
def add_destination():
    """Add a new destination (admin only)"""
    db = current_app.config['DB']
    destination_model = Destination(db)
    data = request.json
    
    # Extract data from request
    city = data.get('city')
    country = data.get('country')
    clues = data.get('clues', [])
    fun_facts = data.get('fun_facts', [])
    trivia = data.get('trivia', [])
    continent = data.get('continent')
    image_url = data.get('image_url')
    
    # Validate required fields
    if not city or not country:
        return jsonify({'error': 'City and country are required'}), 400
    
    # Create destination
    destination_id = destination_model.create_destination(
        city, country, clues, fun_facts, trivia, continent, image_url
    )
    
    return jsonify({'destination_id': destination_id}), 201

@destination_bp.route('/import', methods=['POST'])
def import_destinations():
    """Import multiple destinations (admin only)"""
    db = current_app.config['DB']
    destination_model = Destination(db)
    data = request.json
    
    # Validate data
    if not isinstance(data, list):
        return jsonify({'error': 'Data must be a list of destinations'}), 400
    
    # Import destinations
    count = destination_model.import_destinations(data)
    
    return jsonify({'message': f'Successfully imported {count} destinations'}), 201

@destination_bp.route('/count', methods=['GET'])
def count_destinations():
    """Count the number of destinations"""
    db = current_app.config['DB']
    destination_model = Destination(db)
    
    count = destination_model.count_destinations()
    
    return jsonify({'count': count})

# Import missing dependencies to avoid circular imports
from models.game import Game