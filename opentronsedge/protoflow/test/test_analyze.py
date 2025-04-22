import requests
import json
import tempfile
import os
from pathlib import Path

# API endpoint
API_URL = "http://localhost:8000/analyze"

def test_protocol_analyzer():
    """Test the Opentrons protocol analyzer API by sending a simple protocol file."""
    
    # Create a temporary protocol file
    with tempfile.NamedTemporaryFile(suffix=".py", mode="w+", delete=False) as temp_file:
        # Write a simple Opentrons protocol
        temp_file.write("""
from opentrons import protocol_api

metadata = {
    'protocolName': 'Test Protocol',
    'author': 'Test User',
    'description': 'A simple test protocol for the analyzer API',
    'apiLevel': '2.10'
}

def run(protocol: protocol_api.ProtocolContext):
    # Load labware
    plate = protocol.load_labware('corning_96_wellplate_360ul_flat', '1')
    tiprack = protocol.load_labware('opentrons_96_tiprack_300ul', '2')
    
    # Load pipette
    pipette = protocol.load_instrument('p300_single', 'right', tip_racks=[tiprack])
    
    # Perform a simple transfer
    pipette.pick_up_tip()
    pipette.aspirate(100, plate['A1'])
    pipette.dispense(100, plate['A2'])
    pipette.drop_tip()
""")
        protocol_path = temp_file.name
    
    try:
        print(f"Testing with protocol file: {protocol_path}")
        
        # Test 1: Basic protocol analysis
        with open(protocol_path, 'rb') as file:
            files = {'files': (os.path.basename(protocol_path), file, 'text/plain')}
            
            # Send request to the API
            print("Sending request to analyze protocol...")
            response = requests.post(API_URL, files=files)
            
            # Check response
            if response.status_code == 200:
                result = response.json()
                print("Analysis successful!")
                print(f"Protocol result: {result.get('result', 'unknown')}")
                print(f"Robot type: {result.get('robotType', 'unknown')}")
                
                # Print equipment summary
                print("\nEquipment summary:")
                print(f"  Labware: {len(result.get('labware', []))}")
                print(f"  Pipettes: {len(result.get('pipettes', []))}")
                print(f"  Modules: {len(result.get('modules', []))}")
                
                # Print command summary
                print(f"\nCommands: {len(result.get('commands', []))}")
                
                # Check for errors
                errors = result.get('errors', [])
                if errors:
                    print(f"\nErrors detected: {len(errors)}")
                    for i, error in enumerate(errors):
                        print(f"  Error {i+1}: {error.get('error', {}).get('message', 'Unknown error')}")
                else:
                    print("\nNo errors detected.")
                
                # Save full response to file for inspection
                with open("analysis_response.json", "w") as output_file:
                    json.dump(result, output_file, indent=2)
                    print(f"\nFull response saved to analysis_response.json")
            else:
                print(f"Analysis failed with status code: {response.status_code}")
                print(f"Error message: {response.text}")
        
    finally:
        # Clean up temporary file
        if os.path.exists(protocol_path):
            os.remove(protocol_path)
            print(f"Removed temporary protocol file: {protocol_path}")

if __name__ == "__main__":
    test_protocol_analyzer()