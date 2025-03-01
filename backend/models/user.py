# backend/models/user.py
from bson import ObjectId
import uuid

class User:
    collection_name = 'users'
    
    def __init__(self, db):
        self.collection = db[self.collection_name]
    
    def create_user(self, username):
        """Create a new user"""
        # Check if username exists
        if self.collection.find_one({'username': username}):
            return None
        
        # Create new user with a unique challenge ID
        user = {
            'username': username,
            'challenge_id': str(uuid.uuid4()),
            'game_stats': {
                'correct_answers': 0,
                'incorrect_answers': 0,
                'total_played': 0
            },
            'played_destinations': []
        }
        
        result = self.collection.insert_one(user)
        user['_id'] = str(result.inserted_id)
        return user
    
    def get_user_by_id(self, user_id):
        """Get a user by ID"""
        user = self.collection.find_one({'_id': ObjectId(user_id)})
        if user:
            user['_id'] = str(user['_id'])
            return user
        return None
    
    def get_user_by_username(self, username):
        """Get a user by username"""
        user = self.collection.find_one({'username': username})
        if user:
            user['_id'] = str(user['_id'])
            return user
        return None
    
    def get_user_by_challenge_id(self, challenge_id):
        """Get a user by challenge ID"""
        user = self.collection.find_one({'challenge_id': challenge_id})
        if user:
            user['_id'] = str(user['_id'])
            return user
        return None
    
    def update_stats(self, user_id, is_correct):
        """Update user's game statistics"""
        updates = {
            '$inc': {
                'game_stats.total_played': 1
            }
        }
        
        if is_correct:
            updates['$inc']['game_stats.correct_answers'] = 1
        else:
            updates['$inc']['game_stats.incorrect_answers'] = 1
        
        result = self.collection.update_one(
            {'_id': ObjectId(user_id)}, 
            updates
        )
        
        return result.modified_count > 0
    
    def add_played_destination(self, user_id, destination_id):
        """Add a destination to user's played list"""
        result = self.collection.update_one(
            {'_id': ObjectId(user_id)},
            {'$addToSet': {'played_destinations': destination_id}}
        )
        
        return result.modified_count > 0
    
    def get_played_destinations(self, user_id):
        """Get list of destinations played by user"""
        user = self.collection.find_one(
            {'_id': ObjectId(user_id)},
            {'played_destinations': 1}
        )
        
        if user and 'played_destinations' in user:
            return user['played_destinations']
        return []
    
    def suggest_username(self, base_username):
        """Suggest a username if the requested one is taken"""
        import random
        suggested = f"{base_username}{random.randint(1, 999)}"
        while self.collection.find_one({'username': suggested}):
            suggested = f"{base_username}{random.randint(1, 999)}"
        return suggested