
# backend/models/destination.py
from bson import ObjectId
import random

class Destination:
    collection_name = 'destinations'
    
    def __init__(self, db):
        self.collection = db[self.collection_name]
    
    def create_destination(self, city, country, clues, fun_facts, trivia, continent=None, image_url=None):
        """Create a new destination in the database"""
        destination = {
            'city': city,
            'country': country,
            'continent': continent,
            'clues': clues,
            'fun_facts': fun_facts,
            'trivia': trivia,
            'image_url': image_url
        }
        
        result = self.collection.insert_one(destination)
        return str(result.inserted_id)
    
    def get_destination_by_id(self, destination_id):
        """Get a destination by its ID"""
        destination = self.collection.find_one({'_id': ObjectId(destination_id)})
        return destination
    
    def get_random_destination(self, excluded_ids=None):
        """Get a random destination, optionally excluding certain IDs"""
        query = {}
        if excluded_ids:
            # Convert string IDs to ObjectId
            excluded_object_ids = [ObjectId(id) for id in excluded_ids if id]
            query = {'_id': {'$nin': excluded_object_ids}}
        
        # Count matching documents
        count = self.collection.count_documents(query)
        
        if count == 0:
            # If all destinations have been seen, just get a random one
            count = self.collection.count_documents({})
            if count == 0:
                return None
            random_index = random.randint(0, count - 1)
            return self.collection.find_one({}, skip=random_index)
        
        # Get a random document
        random_index = random.randint(0, count - 1)
        return self.collection.find_one(query, skip=random_index)
    
    def get_multiple_choice_options(self, correct_destination, num_options=3):
        """Get random destinations for multiple choice options"""
        # Exclude the correct destination
        excluded_id = correct_destination['_id']
        
        # Use MongoDB's aggregation to get unique cities
        options = list(self.collection.aggregate([
            {'$match': {'_id': {'$ne': excluded_id}}},
            {'$sample': {'size': num_options}},
            {'$project': {'city': 1, 'country': 1}}
        ]))
        
        # Add the correct destination to options
        correct_option = {
            'city': correct_destination['city'],
            'country': correct_destination['country'],
            '_id': str(correct_destination['_id'])
        }
        options.append(correct_option)
        
        # Shuffle the options
        random.shuffle(options)
        
        # Make sure all options are unique by city name
        unique_options = []
        unique_cities = set()
        
        for option in options:
            if option['city'] not in unique_cities:
                unique_cities.add(option['city'])
                option['_id'] = str(option['_id'])
                unique_options.append(option)
        
        # If we removed duplicates and don't have enough options, get more
        while len(unique_options) < 4:
            # Get another random destination that's not already in our options
            additional_option = self.collection.aggregate([
                {'$match': {
                    '_id': {'$ne': excluded_id},
                    'city': {'$nin': list(unique_cities)}
                }},
                {'$sample': {'size': 1}},
                {'$project': {'city': 1, 'country': 1}}
            ]).next()
            
            # Add it to our options if we found one
            if additional_option:
                city = additional_option['city']
                if city not in unique_cities:
                    unique_cities.add(city)
                    additional_option['_id'] = str(additional_option['_id'])
                    unique_options.append(additional_option)
        
        return unique_options
    
    def get_all_destinations(self):
        """Get all destinations"""
        return list(self.collection.find({}, {'city': 1, 'country': 1}))
    
    def import_destinations(self, destinations_data):
        """Import multiple destinations from a list"""
        if not destinations_data:
            return 0
        
        # Transform data to match our schema if needed
        transformed_data = []
        for destination in destinations_data:
            # Handle the case where keys might be different
            transformed = {
                'city': destination.get('city', ''),
                'country': destination.get('country', ''),
                'continent': destination.get('continent', None),
                'clues': destination.get('clues', []),
                'fun_facts': destination.get('fun_fact', []),  # Handle different key names
                'trivia': destination.get('trivia', []),
                'image_url': destination.get('image_url', None)
            }
            transformed_data.append(transformed)
        
        # Insert the data
        if transformed_data:
            result = self.collection.insert_many(transformed_data)
            return len(result.inserted_ids)
        return 0
    
    def count_destinations(self):
        """Count the number of destinations in the database"""
        return self.collection.count_documents({})