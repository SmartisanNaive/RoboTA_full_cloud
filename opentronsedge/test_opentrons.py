import requests
import pytest
import os
import json
from pathlib import Path

# Test configuration
BASE_URL = "http://localhost:8000"
TEST_PROTOCOL = '''
from opentrons import protocol_api

metadata = {
    'apiLevel': '2.19',
    'protocolName': 'Simple Transfer Protocol',
    'description': 'A simple transfer protocol with explicit liquid handling',
    'author': 'Virtual Lab'
}

def run(protocol: protocol_api.ProtocolContext):
    # Load labware
    source_plate = protocol.load_labware('corning_96_wellplate_360ul_flat', '1')
    dest_plate = protocol.load_labware('corning_96_wellplate_360ul_flat', '2')
    tiprack = protocol.load_labware('opentrons_96_tiprack_300ul', '3')
    
    # Load pipette
    pipette = protocol.load_instrument(
        'p300_single', 
        'right', 
        tip_racks=[tiprack]
    )
    
    # Define liquid
    water = protocol.define_liquid(
        name="water",
        description="water sample",
        display_color="#3182CE"
    )
    
    # Define starting well contents
    source_plate.wells()[0].load_liquid(water, volume=200)
    
    # Transfer with explicit aspirate and dispense
    pipette.pick_up_tip()
    pipette.aspirate(100, source_plate['A1'])
    pipette.dispense(100, dest_plate['A1'])
    pipette.drop_tip()
'''

class TestOpentrons:
    @classmethod
    def setup_class(cls):
        """Set up test environment"""
        # Create test protocol file
        cls.protocol_file = Path("test_protocol.py")
        with open(cls.protocol_file, "w") as f:
            f.write(TEST_PROTOCOL)
        cls.analysis_id = None  # Initialize analysis_id

    @classmethod
    def teardown_class(cls):
        """Clean up test environment"""
        if cls.protocol_file.exists():
            cls.protocol_file.unlink()

    def test_health_check(self):
        """Test health check endpoint"""
        response = requests.get(f"{BASE_URL}/health")
        assert response.status_code == 200
        assert response.json()["status"] == "healthy"

    def test_protocol_analysis(self):
        """Test protocol analysis functionality"""
        # Prepare file upload
        files = {
            'files': ('test_protocol.py', open(self.protocol_file, 'rb'), 'text/plain')
        }
        
        # Send analysis request
        response = requests.post(
            f"{BASE_URL}/api/analyze",
            files=files,
            data={
                'rtp_values': '{}',
                'rtp_files': '{}'
            }
        )
        
        assert response.status_code == 200
        result = response.json()
        assert 'analysisId' in result
        
        # Save analysis ID for subsequent tests
        self.analysis_id = result['analysisId']
        return self.analysis_id

    def test_get_analysis_result(self):
        """Test getting analysis result"""
        # First perform analysis to get ID
        analysis_id = self.test_protocol_analysis()
        
        # Get analysis result
        response = requests.get(f"{BASE_URL}/api/analysis/{analysis_id}")
        assert response.status_code == 200
        
        result = response.json()
        # Verify result contains expected fields
        assert 'metadata' in result
        assert result['metadata']['protocolName'] == 'Simple Transfer Protocol'
        assert result['metadata']['apiLevel'] == '2.19'
        
        # Verify key information in analysis result
        assert 'labware' in result
        assert 'pipettes' in result
        assert 'commands' in result

    def test_list_analyses(self):
        """Test getting analysis list"""
        # Ensure we have an analysis ID by running analysis first if needed
        if not hasattr(self, 'analysis_id') or self.analysis_id is None:
            self.analysis_id = self.test_protocol_analysis()

        response = requests.get(f"{BASE_URL}/api/analyses")
        assert response.status_code == 200
        analyses = response.json()
        assert isinstance(analyses, list)
        
        # Verify list contains our previously created analysis
        assert any(analysis['id'] == self.analysis_id for analysis in analyses)

    def test_error_handling(self):
        """Test error handling"""
        # Test invalid analysis ID
        response = requests.get(f"{BASE_URL}/api/analysis/invalid-id")
        assert response.status_code == 404

        # Test empty file upload
        files = {
            'files': ('empty.py', b'', 'text/plain')
        }
        response = requests.post(
            f"{BASE_URL}/api/analyze",
            files=files,
            data={
                'rtp_values': '{}',
                'rtp_files': '{}'
            }
        )
        assert response.status_code in [400, 500]

if __name__ == "__main__":
    # Run tests
    pytest.main([__file__, "-v"]) 