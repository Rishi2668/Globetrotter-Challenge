# backend/utils/helpers.py
import json
import os
import random
from bson import ObjectId

class JSONEncoder(json.JSONEncoder):
    """Custom JSON encoder that can handle MongoDB ObjectId"""
    def default(self, obj):
        if isinstance(obj, ObjectId):
            return str(obj)
        return super(JSONEncoder, self).default(obj)

def load_json_file(file_path):
    """Load JSON data from a file"""
    try:
        with open(file_path, 'r', encoding='utf-8') as file:
            return json.load(file)
    except (FileNotFoundError, json.JSONDecodeError) as e:
        print(f"Error loading JSON file: {e}")
        return None

def save_json_file(data, file_path):
    """Save JSON data to a file"""
    try:
        with open(file_path, 'w', encoding='utf-8') as file:
            json.dump(data, file, cls=JSONEncoder, indent=2, ensure_ascii=False)
        return True
    except Exception as e:
        print(f"Error saving JSON file: {e}")
        return False

def generate_unique_id():
    """Generate a unique ID"""
    import uuid
    return str(uuid.uuid4())

def select_random_items(items, count=1):
    """Select random items from a list"""
    if not items:
        return []
    
    count = min(count, len(items))
    return random.sample(items, count)

def shuffle_list(items):
    """Shuffle a list and return the shuffled copy"""
    shuffled = items.copy()
    random.shuffle(shuffled)
    return shuffled