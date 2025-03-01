# scripts/import_expanded_dataset.py
import os
import sys
import json
from dotenv import load_dotenv
from pymongo import MongoClient

# Add parent directory to path
sys.path.append(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))

from models.destination import Destination
from utils.helpers import load_json_file

def main():
    """Import the expanded dataset into MongoDB"""
    # Load environment variables
    load_dotenv()
    
    # Connect to MongoDB
    mongo_uri = os.getenv('MONGO_URI', 'mongodb://localhost:27017/globetrotter')
    client = MongoClient(mongo_uri)
    db = client.get_database()
    
    # Initialize destination model
    destination_model = Destination(db)
    
    # Check current count
    current_count = destination_model.count_destinations()
    print(f"Current destination count: {current_count}")
    
    # Check if starter dataset file exists
    data_dir = os.path.join(os.path.dirname(os.path.dirname(os.path.abspath(__file__))), 'data')
    starter_file = os.path.join(data_dir, 'starter_dataset.json')
    expanded_file = os.path.join(data_dir, 'expanded_dataset.json')
    
    # Import starter dataset if it hasn't been imported yet
    if current_count == 0 and os.path.exists(starter_file):
        starter_data = load_json_file(starter_file)
        if starter_data:
            starter_count = destination_model.import_destinations(starter_data)
            print(f"Imported {starter_count} destinations from starter dataset")
            current_count = destination_model.count_destinations()
    
    # Check if we have the expanded dataset
    if not os.path.exists(expanded_file):
        print("Expanded dataset file not found. Please run the web_scraper.py script first.")
        return
    
    # Load expanded dataset
    expanded_data = load_json_file(expanded_file)
    if not expanded_data:
        print("Failed to load expanded dataset.")
        return
    
    print(f"Loaded {len(expanded_data)} destinations from expanded dataset.")
    
    # Filter out destinations that might already be in the database (checking by city name)
    existing_cities = []
    for dest in destination_model.get_all_destinations():
        if 'city' in dest:
            existing_cities.append(dest['city'])
    
    new_data = [dest for dest in expanded_data if dest['city'] not in existing_cities]
    
    print(f"Found {len(new_data)} new destinations to import.")
    
    if new_data:
        # Import new destinations
        import_count = destination_model.import_destinations(new_data)
        print(f"Successfully imported {import_count} new destinations.")
    else:
        print("No new destinations to import.")
    
    # Get final count
    final_count = destination_model.count_destinations()
    print(f"Final destination count: {final_count}")
    
    if final_count >= 100:
        print("✅ Success! Dataset now contains 100+ destinations.")
    else:
        print(f"⚠️ Dataset contains {final_count} destinations, which is less than the target of 100.")
        print("Run the web_scraper.py script again to gather more destinations.")

if __name__ == "__main__":
    main()