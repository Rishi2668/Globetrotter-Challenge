# scripts/web_scraper.py
import json
import os
import random
import requests
from bs4 import BeautifulSoup
import time
from urllib.parse import quote

def fetch_page(url):
    """Fetch a web page and return the soup"""
    headers = {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36'
    }
    try:
        response = requests.get(url, headers=headers)
        response.raise_for_status()
        return BeautifulSoup(response.text, 'html.parser')
    except Exception as e:
        print(f"Error fetching {url}: {e}")
        return None

def get_continent_by_country(country):
    """Get continent based on country"""
    continent_mapping = {
        'Afghanistan': 'Asia', 'Albania': 'Europe', 'Algeria': 'Africa', 'Andorra': 'Europe',
        'Angola': 'Africa', 'Argentina': 'South America', 'Armenia': 'Asia', 'Australia': 'Oceania',
        'Austria': 'Europe', 'Azerbaijan': 'Asia', 'Bahamas': 'North America', 'Bahrain': 'Asia',
        'Bangladesh': 'Asia', 'Barbados': 'North America', 'Belarus': 'Europe', 'Belgium': 'Europe',
        'Belize': 'North America', 'Benin': 'Africa', 'Bhutan': 'Asia', 'Bolivia': 'South America',
        'Bosnia and Herzegovina': 'Europe', 'Botswana': 'Africa', 'Brazil': 'South America',
        'Brunei': 'Asia', 'Bulgaria': 'Europe', 'Burkina Faso': 'Africa', 'Burundi': 'Africa',
        'Cambodia': 'Asia', 'Cameroon': 'Africa', 'Canada': 'North America', 'Cape Verde': 'Africa',
        'Central African Republic': 'Africa', 'Chad': 'Africa', 'Chile': 'South America',
        'China': 'Asia', 'Colombia': 'South America', 'Comoros': 'Africa', 'Costa Rica': 'North America',
        'Croatia': 'Europe', 'Cuba': 'North America', 'Cyprus': 'Europe', 'Czech Republic': 'Europe',
        'Democratic Republic of the Congo': 'Africa', 'Denmark': 'Europe', 'Djibouti': 'Africa',
        'Dominica': 'North America', 'Dominican Republic': 'North America', 'East Timor': 'Asia',
        'Ecuador': 'South America', 'Egypt': 'Africa', 'El Salvador': 'North America',
        'Equatorial Guinea': 'Africa', 'Eritrea': 'Africa', 'Estonia': 'Europe', 'Eswatini': 'Africa',
        'Ethiopia': 'Africa', 'Fiji': 'Oceania', 'Finland': 'Europe', 'France': 'Europe',
        'Gabon': 'Africa', 'Gambia': 'Africa', 'Georgia': 'Asia', 'Germany': 'Europe',
        'Ghana': 'Africa', 'Greece': 'Europe', 'Grenada': 'North America', 'Guatemala': 'North America',
        'Guinea': 'Africa', 'Guinea-Bissau': 'Africa', 'Guyana': 'South America', 'Haiti': 'North America',
        'Honduras': 'North America', 'Hungary': 'Europe', 'Iceland': 'Europe', 'India': 'Asia',
        'Indonesia': 'Asia', 'Iran': 'Asia', 'Iraq': 'Asia', 'Ireland': 'Europe', 'Israel': 'Asia',
        'Italy': 'Europe', 'Ivory Coast': 'Africa', 'Jamaica': 'North America', 'Japan': 'Asia',
        'Jordan': 'Asia', 'Kazakhstan': 'Asia', 'Kenya': 'Africa', 'Kiribati': 'Oceania',
        'North Korea': 'Asia', 'South Korea': 'Asia', 'Kosovo': 'Europe', 'Kuwait': 'Asia',
        'Kyrgyzstan': 'Asia', 'Laos': 'Asia', 'Latvia': 'Europe', 'Lebanon': 'Asia',
        'Lesotho': 'Africa', 'Liberia': 'Africa', 'Libya': 'Africa', 'Liechtenstein': 'Europe',
        'Lithuania': 'Europe', 'Luxembourg': 'Europe', 'Madagascar': 'Africa', 'Malawi': 'Africa',
        'Malaysia': 'Asia', 'Maldives': 'Asia', 'Mali': 'Africa', 'Malta': 'Europe',
        'Marshall Islands': 'Oceania', 'Mauritania': 'Africa', 'Mauritius': 'Africa',
        'Mexico': 'North America', 'Micronesia': 'Oceania', 'Moldova': 'Europe', 'Monaco': 'Europe',
        'Mongolia': 'Asia', 'Montenegro': 'Europe', 'Morocco': 'Africa', 'Mozambique': 'Africa',
        'Myanmar': 'Asia', 'Namibia': 'Africa', 'Nauru': 'Oceania', 'Nepal': 'Asia',
        'Netherlands': 'Europe', 'New Zealand': 'Oceania', 'Nicaragua': 'North America',
        'Niger': 'Africa', 'Nigeria': 'Africa', 'North Macedonia': 'Europe', 'Norway': 'Europe',
        'Oman': 'Asia', 'Pakistan': 'Asia', 'Palau': 'Oceania', 'Palestine': 'Asia',
        'Panama': 'North America', 'Papua New Guinea': 'Oceania', 'Paraguay': 'South America',
        'Peru': 'South America', 'Philippines': 'Asia', 'Poland': 'Europe', 'Portugal': 'Europe',
        'Qatar': 'Asia', 'Romania': 'Europe', 'Russia': 'Europe', 'Rwanda': 'Africa',
        'Saint Kitts and Nevis': 'North America', 'Saint Lucia': 'North America',
        'Saint Vincent and the Grenadines': 'North America', 'Samoa': 'Oceania',
        'San Marino': 'Europe', 'Sao Tome and Principe': 'Africa', 'Saudi Arabia': 'Asia',
        'Senegal': 'Africa', 'Serbia': 'Europe', 'Seychelles': 'Africa', 'Sierra Leone': 'Africa',
        'Singapore': 'Asia', 'Slovakia': 'Europe', 'Slovenia': 'Europe', 'Solomon Islands': 'Oceania',
        'Somalia': 'Africa', 'South Africa': 'Africa', 'South Sudan': 'Africa', 'Spain': 'Europe',
        'Sri Lanka': 'Asia', 'Sudan': 'Africa', 'Suriname': 'South America', 'Sweden': 'Europe',
        'Switzerland': 'Europe', 'Syria': 'Asia', 'Taiwan': 'Asia', 'Tajikistan': 'Asia',
        'Tanzania': 'Africa', 'Thailand': 'Asia', 'Togo': 'Africa', 'Tonga': 'Oceania',
        'Trinidad and Tobago': 'North America', 'Tunisia': 'Africa', 'Turkey': 'Asia',
        'Turkmenistan': 'Asia', 'Tuvalu': 'Oceania', 'Uganda': 'Africa', 'Ukraine': 'Europe',
        'United Arab Emirates': 'Asia', 'United Kingdom': 'Europe', 'United States': 'North America',
        'Uruguay': 'South America', 'Uzbekistan': 'Asia', 'Vanuatu': 'Oceania',
        'Vatican City': 'Europe', 'Venezuela': 'South America', 'Vietnam': 'Asia',
        'Yemen': 'Asia', 'Zambia': 'Africa', 'Zimbabwe': 'Africa',
        'USA': 'North America', 'UK': 'Europe', 'UAE': 'Asia'
    }
    
    return continent_mapping.get(country, "Unknown")

def extract_paragraphs(soup, max_paragraphs=5):
    """Extract paragraphs from the page content"""
    content_div = soup.find('div', {'id': 'mw-content-text'})
    if not content_div:
        return []
    
    paragraphs = content_div.find_all('p')
    text_paragraphs = []
    
    for p in paragraphs[:max_paragraphs]:
        text = p.get_text().strip()
        if text and len(text) > 50:  # Skip short or empty paragraphs
            text_paragraphs.append(text)
    
    return text_paragraphs

def generate_clues(paragraphs, city_name):
    """Generate clues based on the extracted paragraphs"""
    clues = []
    
    # Try to find interesting facts for clues
    for paragraph in paragraphs:
        sentences = paragraph.split('. ')
        for sentence in sentences:
            # Skip sentences that directly mention the city name (too obvious)
            if city_name.lower() not in sentence.lower() and len(sentence) > 30:
                # Clean the sentence
                cleaned = sentence.strip().replace('\n', ' ')
                if cleaned and len(cleaned) > 30 and cleaned[-1] != '.':
                    cleaned += '.'
                
                if cleaned and len(cleaned) > 30:
                    clues.append(cleaned)
    
    # Select up to 3 clues
    selected_clues = []
    for clue in clues:
        if len(selected_clues) >= 3:
            break
        if clue not in selected_clues:
            selected_clues.append(clue)
    
    # If we don't have enough clues, generate some generic ones
    generic_clues = [
        f"This city is located in {city_name.split(',')[1].strip() if ',' in city_name else 'its country'}.",
        "This destination is known for its unique culture and history.",
        "Visitors come from around the world to experience this location.",
        "This place has distinctive architecture and urban planning."
    ]
    
    while len(selected_clues) < 3:
        clue = random.choice(generic_clues)
        if clue not in selected_clues:
            selected_clues.append(clue)
    
    return selected_clues

def generate_fun_facts(paragraphs, city_name):
    """Generate fun facts based on the extracted paragraphs"""
    facts = []
    
    # Extract statistics and interesting information
    for paragraph in paragraphs:
        sentences = paragraph.split('. ')
        for sentence in sentences:
            if any(keyword in sentence.lower() for keyword in ['largest', 'oldest', 'first', 'famous', 'popular', 'unique', 'founded']):
                cleaned = sentence.strip().replace('\n', ' ')
                if cleaned and len(cleaned) > 20 and cleaned[-1] != '.':
                    cleaned += '.'
                
                if cleaned and len(cleaned) > 20:
                    facts.append(cleaned)
    
    # Select up to 3 fun facts
    selected_facts = []
    for fact in facts:
        if len(selected_facts) >= 3:
            break
        if fact not in selected_facts:
            selected_facts.append(fact)
    
    # If we don't have enough facts, generate some generic ones
    generic_facts = [
        f"{city_name} has a rich history dating back many centuries.",
        f"The local cuisine in {city_name} is renowned for its unique flavors.",
        f"Tourism is one of the major industries in {city_name}.",
        f"{city_name} experiences diverse weather patterns throughout the year."
    ]
    
    while len(selected_facts) < 3:
        fact = random.choice(generic_facts)
        if fact not in selected_facts:
            selected_facts.append(fact)
    
    return selected_facts

def generate_trivia(paragraphs, city_name):
    """Generate trivia based on the extracted paragraphs"""
    trivia = []
    
    # Look for trivia information
    for paragraph in paragraphs:
        sentences = paragraph.split('. ')
        for sentence in sentences:
            if any(keyword in sentence.lower() for keyword in ['tradition', 'annual', 'celebration', 'festival', 'event', 'known for', 'population']):
                cleaned = sentence.strip().replace('\n', ' ')
                if cleaned and len(cleaned) > 20 and cleaned[-1] != '.':
                    cleaned += '.'
                
                if cleaned and len(cleaned) > 20:
                    trivia.append(cleaned)
    
    # Select up to 3 trivia items
    selected_trivia = []
    for item in trivia:
        if len(selected_trivia) >= 3:
            break
        if item not in selected_trivia:
            selected_trivia.append(item)
    
    # If we don't have enough trivia, generate some generic ones
    generic_trivia = [
        f"The name {city_name} has an interesting etymology in the local language.",
        f"Local public transportation is a unique experience in {city_name}.",
        f"The city has undergone significant changes in the past few decades.",
        f"Many famous historical figures have visited or lived in {city_name}."
    ]
    
    while len(selected_trivia) < 3:
        item = random.choice(generic_trivia)
        if item not in selected_trivia:
            selected_trivia.append(item)
    
    return selected_trivia

def scrape_popular_cities():
    """Scrape a list of popular cities from Wikipedia"""
    wiki_url = "https://en.wikipedia.org/wiki/List_of_cities_proper_by_population"
    soup = fetch_page(wiki_url)
    
    if not soup:
        return []
    
    cities = []
    table = soup.find('table', {'class': 'wikitable'})
    
    if not table:
        return []
    
    rows = table.find_all('tr')[1:]  # Skip header row
    
    for row in rows:
        cols = row.find_all('td')
        if len(cols) >= 3:
            city_col = cols[1]
            country_col = cols[2]
            
            city_link = city_col.find('a')
            country_link = country_col.find('a')
            
            if city_link and country_link:
                city_name = city_link.get_text().strip()
                country_name = country_link.get_text().strip()
                
                cities.append((city_name, country_name))
    
    return cities

def scrape_tourist_destinations():
    """Scrape a list of tourist destinations"""
    wiki_url = "https://en.wikipedia.org/wiki/List_of_most_visited_cities"
    soup = fetch_page(wiki_url)
    
    if not soup:
        return []
    
    cities = []
    tables = soup.find_all('table', {'class': 'wikitable'})
    
    if not tables:
        return []
    
    for table in tables:
        rows = table.find_all('tr')[1:]  # Skip header row
        
        for row in rows:
            cols = row.find_all('td')
            if len(cols) >= 2:
                city_col = cols[1]
                
                city_text = city_col.get_text().strip()
                
                # Extract city and country
                if ',' in city_text:
                    parts = city_text.split(',')
                    city_name = parts[0].strip()
                    country_name = parts[1].strip()
                    cities.append((city_name, country_name))
    
    return cities

def main():
    """Main function to run the scraper"""
    print("Starting web scraper to build destination dataset...")
    
    # Set up paths
    data_dir = os.path.join(os.path.dirname(os.path.dirname(os.path.abspath(__file__))), 'data')
    output_file = os.path.join(data_dir, 'expanded_dataset.json')
    
    # Create data directory if it doesn't exist
    os.makedirs(data_dir, exist_ok=True)
    
    # Load existing dataset if it exists
    try:
        with open(output_file, 'r', encoding='utf-8') as f:
            existing_data = json.load(f)
            print(f"Loaded {len(existing_data)} existing destinations.")
    except (FileNotFoundError, json.JSONDecodeError):
        existing_data = []
        print("No existing dataset found. Creating a new one.")
    
    # Get cities we've already processed
    existing_cities = {item['city'] for item in existing_data}
    
    # Get cities to scrape
    print("Gathering cities to scrape...")
    cities_to_scrape = []
    
    # Add popular cities
    popular_cities = scrape_popular_cities()
    print(f"Found {len(popular_cities)} popular cities.")
    cities_to_scrape.extend(popular_cities)
    
    # Add tourist destinations
    tourist_cities = scrape_tourist_destinations()
    print(f"Found {len(tourist_cities)} tourist destinations.")
    cities_to_scrape.extend(tourist_cities)
    
    # Additional famous cities
    additional_cities = [
        ("Paris", "France"),
        ("New York City", "United States"),
        ("London", "United Kingdom"),
        ("Rome", "Italy"),
        ("Barcelona", "Spain"),
        ("Istanbul", "Turkey"),
        ("Dubai", "UAE"),
        ("Tokyo", "Japan"),
        ("Sydney", "Australia"),
        ("Rio de Janeiro", "Brazil"),
        ("Cairo", "Egypt"),
        ("Marrakech", "Morocco"),
        ("Cape Town", "South Africa"),
        ("Amsterdam", "Netherlands"),
        ("Prague", "Czech Republic"),
        ("Vienna", "Austria"),
        ("Venice", "Italy"),
        ("Athens", "Greece"),
        ("Bangkok", "Thailand"),
        ("Singapore", "Singapore")
    ]
    
    cities_to_scrape.extend(additional_cities)
    
    # Remove duplicates while preserving order
    seen = set()
    cities_to_scrape = [(city, country) for city, country in cities_to_scrape if city not in seen and not seen.add(city)]
    
    # Filter out cities we already have
    cities_to_scrape = [(city, country) for city, country in cities_to_scrape if city not in existing_cities]
    
    print(f"Will scrape data for {len(cities_to_scrape)} new cities.")
    
    # Limit the number of cities to scrape (to avoid overloading servers)
    max_cities = 100
    if len(cities_to_scrape) > max_cities:
        print(f"Limiting to {max_cities} cities to avoid overloading servers.")
        cities_to_scrape = cities_to_scrape[:max_cities]
    
    new_destinations = []
    
    # Scrape data for each city
    for i, (city, country) in enumerate(cities_to_scrape):
        print(f"Processing {i+1}/{len(cities_to_scrape)}: {city}, {country}")
        
        # Format Wikipedia URL
        safe_city = quote(city.replace(' ', '_'))
        wiki_url = f"https://en.wikipedia.org/wiki/{safe_city}"
        
        soup = fetch_page(wiki_url)
        if not soup:
            print(f"Could not fetch page for {city}. Skipping.")
            continue
        
        # Extract paragraphs
        paragraphs = extract_paragraphs(soup)
        if not paragraphs:
            print(f"No paragraphs found for {city}. Skipping.")
            continue
        
        # Get continent
        continent = get_continent_by_country(country)
        
        # Generate clues, fun facts, and trivia
        clues = generate_clues(paragraphs, city)
        fun_facts = generate_fun_facts(paragraphs, city)
        trivia = generate_trivia(paragraphs, city)
        
        # Create destination data
        destination = {
            "city": city,
            "country": country,
            "continent": continent,
            "clues": clues,
            "fun_facts": fun_facts,
            "trivia": trivia
        }
        
        new_destinations.append(destination)
        
        # Add delay to be nice to the server
        time.sleep(2)
    
    # Combine existing and new destinations
    all_destinations = existing_data + new_destinations
    
    # Save the data
    with open(output_file, 'w', encoding='utf-8') as f:
        json.dump(all_destinations, f, indent=2, ensure_ascii=False)
    
    print(f"Added {len(new_destinations)} new destinations.")
    print(f"Total destinations: {len(all_destinations)}")
    print(f"Dataset saved to {output_file}")

if __name__ == "__main__":
    main()