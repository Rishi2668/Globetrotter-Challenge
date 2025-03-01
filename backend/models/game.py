# backend/models/game.py
from bson import ObjectId
import datetime

class Game:
    collection_name = 'games'
    
    def __init__(self, db):
        self.collection = db[self.collection_name]
    
    def create_game(self, user_id, is_challenge=False, challenged_by=None):
        """Create a new game session"""
        game = {
            'user_id': user_id,
            'is_challenge': is_challenge,
            'challenged_by': challenged_by,
            'score': 0,
            'rounds': [],
            'active': True,
            'created_at': datetime.datetime.utcnow()
        }
        
        result = self.collection.insert_one(game)
        game['_id'] = str(result.inserted_id)
        return game
    
    def add_round(self, game_id, destination_id, clues_shown, answer_options=None):
        """Add a new round to the game"""
        # Prepare the round data
        round_data = {
            'destination_id': destination_id,
            'clues_shown': clues_shown,
            'answer_options': answer_options,
            'user_answer': None,
            'is_correct': None,
            'fact_shown': None
        }
        
        # Add the round to the game
        result = self.collection.update_one(
            {'_id': ObjectId(game_id)},
            {'$push': {'rounds': round_data}}
        )
        
        return result.modified_count > 0
    
    def update_round(self, game_id, round_index, user_answer, is_correct, fact_shown):
        """Update a round with the user's answer and result"""
        # Get the current rounds
        game = self.collection.find_one({'_id': ObjectId(game_id)})
        if not game or 'rounds' not in game or round_index >= len(game['rounds']):
            return False
        
        # Update the round with user's answer
        rounds = game['rounds']
        rounds[round_index]['user_answer'] = user_answer
        rounds[round_index]['is_correct'] = is_correct
        rounds[round_index]['fact_shown'] = fact_shown
        
        # Calculate new score
        new_score = sum(1 for round in rounds if round.get('is_correct', False))
        
        # Update the game
        result = self.collection.update_one(
            {'_id': ObjectId(game_id)},
            {
                '$set': {
                    'rounds': rounds,
                    'score': new_score
                }
            }
        )
        
        return result.modified_count > 0
    
    def get_game(self, game_id):
        """Get a game by ID"""
        game = self.collection.find_one({'_id': ObjectId(game_id)})
        if game:
            game['_id'] = str(game['_id'])
            return game
        return None
    
    def get_user_games(self, user_id):
        """Get all games for a user"""
        cursor = self.collection.find({'user_id': user_id}).sort('created_at', -1)
        games = []
        for game in cursor:
            game['_id'] = str(game['_id'])
            games.append(game)
        return games
    
    def end_game(self, game_id):
        """Mark a game as inactive"""
        result = self.collection.update_one(
            {'_id': ObjectId(game_id)},
            {'$set': {'active': False}}
        )
        
        return result.modified_count > 0