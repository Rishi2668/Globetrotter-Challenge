# scripts/expand_dataset.py
"""
Script to expand the Globetrotter dataset using web scraping
and import the results into MongoDB.

This script performs the following steps:
1. Runs the web scraper to gather data from Wikipedia
2. Imports the expanded dataset into MongoDB
"""

import os
import sys
import time
import subprocess

def run_command(command, description):
    """Run a command and print its output"""
    print(f"\n{'=' * 80}")
    print(f"📋 {description}")
    print(f"{'=' * 80}\n")
    
    try:
        # Run the command and capture output
        process = subprocess.run(
            command,
            stdout=subprocess.PIPE,
            stderr=subprocess.STDOUT,
            text=True,
            check=True
        )
        print(process.stdout)
        return True
    except subprocess.CalledProcessError as e:
        print(f"❌ Command failed with exit code {e.returncode}")
        print(e.stdout)
        return False

def main():
    """Run the dataset expansion and import process"""
    print("\n🌍 GLOBETROTTER DATASET EXPANSION 🌍")
    print("This script will expand the destination dataset using web scraping.\n")
    
    # Get the directory of this script
    script_dir = os.path.dirname(os.path.abspath(__file__))
    
    # Step 1: Run the web scraper
    print("\n🕸️  Step 1: Web Scraping")
    scraper_path = os.path.join(script_dir, "web_scraper.py")
    if not run_command(["python", scraper_path], "Running web scraper"):
        print("\n❌ Web scraping failed. Aborting.")
        return
    
    # Step 2: Import the expanded dataset
    print("\n📥 Step 2: Importing Dataset")
    import_path = os.path.join(script_dir, "import_expanded_dataset.py")
    if not run_command(["python", import_path], "Importing expanded dataset"):
        print("\n❌ Dataset import failed.")
        return
    
    print("\n✅ Dataset expansion process completed!")
    print("You can now start your Globetrotter application and enjoy a richer dataset.")

if __name__ == "__main__":
    main()