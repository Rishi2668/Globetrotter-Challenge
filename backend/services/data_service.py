# backend/services/data_service.py
import os
import json
import requests
from openai import OpenAI
from models.destination import Destination
from utils.helpers import load_json_file, save_json_file

class DataService:
    def __init__(self, db, openai_api_key=None):
        self.db = db
        self.destination_model = Destination(db)
        self.openai_client = OpenAI(api_key=openai_api_key) if openai_api_key else None
        self.data_dir = os.path.join(os.path.dirname(os.path.dirname(__file__)), 'data')
        
        # Create data directory if it doesn't exist
        if not os.path.exists(self.data_dir):
            os.makedirs(self.data_dir)
    
    def import_starter_dataset(self, file_path=None):
        """Import starter dataset from a file"""
        if not file_path:
            file_path = os.path.join(self.data_dir, 'starter_dataset.json')
        
        data = load_json_file(file_path)
        if not data:
            return 0
        
        return self.destination_model.import_destinations(data)
    
    def expand_dataset_with_ai(self, prompts_count=30):
        """Expand dataset using OpenAI API"""
        if not self.openai_client:
            raise ValueError("OpenAI API key is required for dataset expansion")
        
        # Get a list of destination examples to guide the AI
        existing_count = self.destination_model.count_destinations()
        
        # If we already have 100+ destinations, no need to expand
        if existing_count >= 100:
            return 0
        
        # Determine how many more destinations we need
        destinations_to_generate = max(100 - existing_count, 0)
        batch_size = min(prompts_count, destinations_to_generate)
        
        if batch_size <= 0:
            return 0
        
        # Get example destinations for reference
        all_destinations = list(self.destination_model.collection.find({}, {'_id': 0}))
        examples = all_destinations[:min(3, len(all_destinations))]
        
        expanded_destinations = []
        continents = [
            "Africa", "Antarctica", "Asia", "Europe", 
            "North America", "Oceania", "South America"
        ]
        
        for batch in range(0, destinations_to_generate, batch_size):
            batch_destinations = []
            
            # Add continent-specific requests to ensure diversity
            for i in range(batch_size):
                if batch + i >= destinations_to_generate:
                    break
                
                continent = continents[(batch + i) % len(continents)]
                
                prompt = f"""
                Generate {batch_size} unique tourist destinations for the Globetrotter quiz game about famous places around the world.
                Focus on destinations in {continent}.
                
                Each destination should include:
                1. City name
                2. Country
                3. Continent
                4. 3-4 cryptic clues that hint at the destination
                5. 3-4 fun facts about the destination
                6. 3-4 trivia items about the destination
                7. (Optional) An image URL for the destination
                
                Format the output as a JSON array.
                
                Here are some examples of the format:
                {json.dumps(examples, indent=2)}
                
                Make sure to generate destinations that are not in the examples. Create unique, interesting destinations with engaging clues and facts.
                """
                
                try:
                    response = self.openai_client.chat.completions.create(
                        model="gpt-3.5-turbo-0125",
                        messages=[
                            {"role": "system", "content": "You are a travel expert and data generation assistant."},
                            {"role": "user", "content": prompt}
                        ],
                        temperature=0.7,
                        max_tokens=2500
                    )
                    
                    # Extract the generated content
                    content = response.choices[0].message.content
                    
                    # Extract JSON data from the response
                    import re
                    json_match = re.search(r'```json\n([\s\S]*?)\n```', content)
                    if json_match:
                        json_str = json_match.group(1)
                    else:
                        json_str = content
                    
                    # Try to parse the JSON
                    try:
                        new_destinations = json.loads(json_str)
                        if isinstance(new_destinations, list):
                            batch_destinations.extend(new_destinations)
                    except json.JSONDecodeError:
                        print(f"Error parsing JSON from AI response")
                    
                except Exception as e:
                    print(f"Error calling OpenAI API: {e}")
            
            # Add the new destinations to our collection
            expanded_destinations.extend(batch_destinations)
        
        # Save the expanded dataset
        expanded_file_path = os.path.join(self.data_dir, 'expanded_dataset.json')
        save_json_file(expanded_destinations, expanded_file_path)
        
        # Import the expanded dataset
        import_count = self.destination_model.import_destinations(expanded_destinations)
        
        return import_count
    
    def get_destination_count(self):
        """Get the number of destinations in the database"""
        return self.destination_model.count_destinations()