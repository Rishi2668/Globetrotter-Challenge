# backend/services/game_service.py
import random
from models.destination import Destination
from models.user import User
from models.game import Game

class GameService:
    def __init__(self, db):
        self.db = db
        self.destination_model = Destination(db)
        self.user_model = User(db)
        self.game_model = Game(db)
    
    def start_game_for_user(self, user_id):
        """Start a new game for a user"""
        # Check if user exists
        user = self.user_model.get_user_by_id(user_id)
        if not user:
            return None
        
        # Create a new game
        game = self.game_model.create_game(user_id)
        return game
    
    def get_next_round(self, game_id, user_id=None):
        """Get the next round for a game"""
        # Get the game
        game = self.game_model.get_game(game_id)
        if not game or not game['active']:
            return None
        
        # Get excluded destination IDs from user's played list
        excluded_ids = []
        if user_id:
            excluded_ids = self.user_model.get_played_destinations(user_id)
        
        # Get a random destination
        destination = self.destination_model.get_random_destination(excluded_ids)
        if not destination:
            return None
        
        # Get answer options for multiple choice
        answer_options = self.destination_model.get_multiple_choice_options(destination)
        
        # Select 1-2 random clues
        clues = destination['clues']
        num_clues = min(2, len(clues))
        selected_clues = random.sample(clues, num_clues)
        
        # If user is logged in, mark destination as played
        if user_id:
            self.user_model.add_played_destination(user_id, str(destination['_id']))
        
        # Add the round to the game
        self.game_model.add_round(
            game_id, 
            str(destination['_id']), 
            selected_clues,
            answer_options
        )
        
        # Get the updated game
        updated_game = self.game_model.get_game(game_id)
        round_index = len(updated_game['rounds']) - 1
        
        # Prepare response
        round_data = {
            'destination_id': str(destination['_id']),
            'clues': selected_clues,
            'answer_options': answer_options,
            'round_index': round_index,
            'correct_answer': {
                'city': destination['city'],
                'country': destination['country']
            }
        }
        
        return round_data
    
    def validate_answer(self, game_id, destination_id, user_answer, round_index):
        """Validate a user's answer for a round"""
        # Get the game
        game = self.game_model.get_game(game_id)
        if not game or not game['active']:
            return None
        
        # Get the destination
        destination = self.destination_model.get_destination_by_id(destination_id)
        if not destination:
            return None
        
        # Check if answer is correct
        is_correct = destination['city'] == user_answer
        
        # Get a random fact to display
        if is_correct:
            facts = destination['fun_facts']
        else:
            facts = destination['trivia']
        
        random_fact = random.choice(facts) if facts else "No fact available"
        
        # Update the round
        self.game_model.update_round(
            game_id, 
            round_index, 
            user_answer, 
            is_correct, 
            random_fact
        )
        
        # Update user stats
        user_id = game['user_id']
        self.user_model.update_stats(user_id, is_correct)
        
        # Get the updated game
        updated_game = self.game_model.get_game(game_id)
        
        # Prepare response
        result = {
            'is_correct': is_correct,
            'fact': random_fact,
            'game': updated_game,
            'correct_answer': {
                'city': destination['city'],
                'country': destination['country'],
                'image_url': destination.get('image_url')
            }
        }
        
        return result
    
    def create_challenge(self, user_id, frontend_url):
        """Create a challenge from a user"""
        # Get user
        user = self.user_model.get_user_by_id(user_id)
        if not user:
            return None
        
        # Create a new game for the challenge
        game = self.game_model.create_game(user_id, is_challenge=True)
        
        # Generate challenge link
        challenge_link = f"{frontend_url}/challenge/{user['challenge_id']}"
        
        return {
            'challenge_link': challenge_link,
            'challenge_id': user['challenge_id'],
            'username': user['username'],
            'game_stats': user['game_stats'],
            'game_id': game['_id']
        }
    
    def accept_challenge(self, challenge_id, username=None):
        """Accept a challenge"""
        # Get challenger
        challenger = self.user_model.get_user_by_challenge_id(challenge_id)
        if not challenger:
            return None
        
        # Create or get user
        user = None
        if username:
            # Try to get existing user
            user = self.user_model.get_user_by_username(username)
            
            if not user:
                # Create new user
                user = self.user_model.create_user(username)
                
                if not user:
                    return {'error': 'Username already taken'}
        else:
            # Create anonymous user
            anonymous_username = f"Player_{challenger['username']}_{int(random.random() * 10000)}"
            user = self.user_model.create_user(anonymous_username)
        
        # Create a new game for the challenged user
        game = self.game_model.create_game(
            user['_id'], 
            is_challenge=True, 
            challenged_by=challenger['_id']
        )
        
        return {
            'user': user,
            'challenger': challenger,
            'game': game
        }
    
    def end_game(self, game_id):
        """End a game session"""
        return self.game_model.end_game(game_id)
    
    def get_user_games(self, user_id):
        """Get all games for a user"""
        return self.game_model.get_user_games(user_id)