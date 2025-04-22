import unittest
import sys
import os
import json

# Add project root to the Python path
project_root = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
sys.path.insert(0, project_root)

from ai_controller.main import AIController
# Mock requests.post to avoid actual HTTP calls during testing
from unittest.mock import patch

# Define mock responses for different scenarios
def mock_requests_post(*args, **kwargs):
    class MockResponse:
        def __init__(self, json_data, status_code):
            self._json_data = json_data
            self.status_code = status_code

        def json(self):
            return self._json_data

        def raise_for_status(self):
            if self.status_code >= 400:
                raise requests.exceptions.HTTPError(f"{self.status_code} Client Error")

    endpoint = args[0] # The first argument is the URL/endpoint
    json_payload = kwargs.get('json', {})
    
    print(f"Mock POST to {endpoint} with data: {json_payload}") # Debugging mock call

    # Default successful response
    response_data = {"status": "success", "message": "Mock operation successful."}
    status_code = 200

    # Customize mock response based on endpoint or payload if needed
    if "move-labware" in endpoint:
        if not all(k in json_payload for k in ["source_slot", "destination_slot"]):
             response_data = {"error": "Missing required parameters"}
             status_code = 400
        else:
            response_data = {"status": "success", "message": f"Mock moving from {json_payload.get('source_slot')} to {json_payload.get('destination_slot')}"}
    elif "pipette" in endpoint:
         # Add more specific mock logic for pipette if necessary
         response_data = {"status": "success", "message": "Mock pipetting done."}
    elif "thermocycler" in endpoint:
         response_data = {"status": "success", "message": "Mock thermocycling done."}
    elif "heater-shaker" in endpoint:
         response_data = {"status": "success", "message": "Mock heating/shaking done."}
    else: # Fallback for unmocked endpoints, maybe simulate an error
        response_data = {"error": "Endpoint not specifically mocked"}
        status_code = 404 # Not Found

    return MockResponse(response_data, status_code)


class TestAIController(unittest.TestCase):

    def setUp(self):
        self.controller = AIController()
        # We need to mock the command parser as well to control its output
        self.patcher = patch('ai_controller.command_parser.CommandParser.parse_command')
        self.mock_parse_command = self.patcher.start()
        self.addCleanup(self.patcher.stop) # Ensure patch stops even if tests fail

    # Use the mock for requests.post in all tests within this class
    @patch('requests.post', side_effect=mock_requests_post)
    def test_move_labware_success(self, mock_post):
        user_input = "将9号槽的板子移动到11号槽"
        parsed_command = {
            "operation": "move_labware",
            "params": {"source_slot": 9, "destination_slot": 11}
        }
        self.mock_parse_command.return_value = parsed_command
        
        result = self.controller.process_command(user_input)
        print(f"Result test_move_labware_success: {result}") # Debug
        self.assertEqual(result["status"], "success")
        self.assertIn("executed successfully", result["message"])
        mock_post.assert_called_once()
        # Check the actual payload sent
        call_args, call_kwargs = mock_post.call_args
        self.assertIn("/move-labware", call_args[0])
        self.assertEqual(call_kwargs['json']['source_slot'], 9)
        self.assertEqual(call_kwargs['json']['destination_slot'], 11)
        self.assertEqual(call_kwargs['json']['plate_name'], "corning_96_wellplate_360ul_flat") # Check default


    @patch('requests.post', side_effect=mock_requests_post)
    def test_move_labware_missing_info(self, mock_post):
        user_input = "将板子移动到11号槽" # Missing source
        parsed_command = {
            "operation": "move_labware",
            "params": {"destination_slot": 11} # LLM hypothetically returns this
        }
        self.mock_parse_command.return_value = parsed_command

        result = self.controller.process_command(user_input)
        print(f"Result test_move_labware_missing_info: {result}") # Debug
        self.assertEqual(result["status"], "missing_info")
        self.assertIn("Missing required parameters", result["message"])
        self.assertIn("source_slot", result["message"])
        mock_post.assert_not_called() # Should not call API if info is missing


    @patch('requests.post', side_effect=mock_requests_post)
    def test_pipette_success(self, mock_post):
        user_input = "用 p1000 从1号槽的A1孔吸取100微升到2号槽的B1孔, 源板corning_96_wellplate_360ul_flat, 目标板nest_96_wellplate_100ul_pcr_full_skirt, 枪头架opentrons_96_tiprack_1000ul在11号槽"
        parsed_command = {
            "operation": "pipette",
            "params": {
                "source_wells": ["A1"],
                "dest_wells": ["B1"],
                "volumes": [100],
                "source_labware_type": "corning_96_wellplate_360ul_flat",
                "dest_labware_type": "nest_96_wellplate_100ul_pcr_full_skirt",
                "source_slot": 1,
                "dest_slot": 2,
                "pipette_type": "p1000_single_gen2",
                "tiprack_type": "opentrons_96_tiprack_1000ul",
                "tiprack_slot": 11
            }
        }
        self.mock_parse_command.return_value = parsed_command

        result = self.controller.process_command(user_input)
        print(f"Result test_pipette_success: {result}") # Debug
        self.assertEqual(result["status"], "success")
        self.assertIn("executed successfully", result["message"])
        mock_post.assert_called_once()
        call_args, call_kwargs = mock_post.call_args
        self.assertIn("/pipette", call_args[0])
        self.assertEqual(call_kwargs['json'], parsed_command['params'])


    @patch('requests.post', side_effect=mock_requests_post)
    def test_pipette_missing_info(self, mock_post):
        user_input = "从 A1 吸取 100ul 到 B1" # Missing lots of info
        parsed_command = {
            "operation": "pipette",
            "params": {"source_wells": ["A1"], "dest_wells": ["B1"], "volumes": [100]}
        }
        self.mock_parse_command.return_value = parsed_command

        result = self.controller.process_command(user_input)
        print(f"Result test_pipette_missing_info: {result}") # Debug
        self.assertEqual(result["status"], "missing_info")
        self.assertIn("Missing required parameters", result["message"])
        self.assertIn("source_labware_type", result["message"])
        self.assertIn("dest_labware_type", result["message"])
        self.assertIn("source_slot", result["message"])
        # ... check for others ...
        mock_post.assert_not_called()


    @patch('requests.post', side_effect=mock_requests_post)
    def test_thermocycler_success(self, mock_post):
        user_input = "用PCR板跑30个循环, 95度180秒, 然后30次(95度30秒, 55度30秒, 72度60秒), 最后72度300秒。板子类型nest_96_wellplate_100ul_pcr_full_skirt"
        parsed_command = {
            "operation": "thermocycler",
            "params": {
                "cycles": 30,
                "plate_type": "nest_96_wellplate_100ul_pcr_full_skirt",
                "steps": [
                    {"temperature": 95, "hold_time": 180},
                    {"temperature": 95, "hold_time": 30},
                    {"temperature": 55, "hold_time": 30},
                    {"temperature": 72, "hold_time": 60},
                    {"temperature": 72, "hold_time": 300}
                ]
            }
        }
        self.mock_parse_command.return_value = parsed_command

        result = self.controller.process_command(user_input)
        print(f"Result test_thermocycler_success: {result}") # Debug
        self.assertEqual(result["status"], "success")
        mock_post.assert_called_once()
        call_args, call_kwargs = mock_post.call_args
        self.assertIn("/thermocycler", call_args[0])
        self.assertEqual(call_kwargs['json'], parsed_command['params'])


    @patch('requests.post', side_effect=mock_requests_post)
    def test_thermocycler_missing_info(self, mock_post):
        user_input = "跑循环, 95度30秒, 55度30秒" # Missing cycles, plate_type
        parsed_command = {
            "operation": "thermocycler",
            "params": {
                "steps": [{"temperature": 95, "hold_time": 30}, {"temperature": 55, "hold_time": 30}]
            }
        }
        self.mock_parse_command.return_value = parsed_command

        result = self.controller.process_command(user_input)
        print(f"Result test_thermocycler_missing_info: {result}") # Debug
        self.assertEqual(result["status"], "missing_info")
        self.assertIn("cycles", result["message"])
        self.assertIn("plate_type", result["message"])
        mock_post.assert_not_called()


    @patch('requests.post', side_effect=mock_requests_post)
    def test_heater_shaker_success(self, mock_post):
        user_input = "将康宁96孔板在加热震荡模块上 60 度 1000 rpm 摇晃 10 分钟"
        parsed_command = {
            "operation": "heater_shaker",
            "params": {
                "plate_type": "corning_96_wellplate_360ul_flat",
                "temperature": 60,
                "shake_speed": 1000,
                "shake_duration": 600 # 10 min = 600 sec
            }
        }
        self.mock_parse_command.return_value = parsed_command

        result = self.controller.process_command(user_input)
        print(f"Result test_heater_shaker_success: {result}") # Debug
        self.assertEqual(result["status"], "success")
        mock_post.assert_called_once()
        call_args, call_kwargs = mock_post.call_args
        self.assertIn("/heater-shaker", call_args[0])
        self.assertEqual(call_kwargs['json'], parsed_command['params'])


    @patch('requests.post', side_effect=mock_requests_post)
    def test_heater_shaker_missing_info(self, mock_post):
        user_input = "加热震荡板子到60度" # Missing speed, duration, plate_type
        parsed_command = {
            "operation": "heater_shaker",
            "params": {"temperature": 60}
        }
        self.mock_parse_command.return_value = parsed_command

        result = self.controller.process_command(user_input)
        print(f"Result test_heater_shaker_missing_info: {result}") # Debug
        self.assertEqual(result["status"], "missing_info")
        self.assertIn("plate_type", result["message"])
        self.assertIn("shake_speed", result["message"])
        self.assertIn("shake_duration", result["message"])
        mock_post.assert_not_called()


    @patch('requests.post', side_effect=mock_requests_post)
    def test_unsupported_operation(self, mock_post):
        user_input = "给我泡杯咖啡"
        parsed_command = {
            "operation": "make_coffee", # LLM might hallucinate
            "params": {}
        }
        self.mock_parse_command.return_value = parsed_command

        result = self.controller.process_command(user_input)
        print(f"Result test_unsupported_operation: {result}") # Debug
        self.assertEqual(result["status"], "error")
        self.assertIn("Unsupported operation: make_coffee", result["message"])
        mock_post.assert_not_called()

    @patch('requests.post', side_effect=mock_requests_post)
    def test_invalid_parse_format(self, mock_post):
        user_input = "移动"
        # Simulate parser returning something unusable
        parsed_command = "just a string, not a dict" 
        self.mock_parse_command.return_value = parsed_command

        result = self.controller.process_command(user_input)
        print(f"Result test_invalid_parse_format: {result}") # Debug
        self.assertEqual(result["status"], "error")
        self.assertIn("Failed to parse command", result["message"])
        mock_post.assert_not_called()

    @patch('requests.post', side_effect=mock_requests_post)
    def test_llm_reported_error(self, mock_post):
        user_input = "非常模糊的指令"
        # Simulate LLM itself reporting missing info via the specified format
        parsed_command = {
            "status": "error",
            "message": "Missing information: please specify the action."
        }
        self.mock_parse_command.return_value = parsed_command

        result = self.controller.process_command(user_input)
        print(f"Result test_llm_reported_error: {result}") # Debug
        self.assertEqual(result["status"], "error") # Pass through LLM error
        self.assertIn("Missing information: please specify the action.", result["message"])
        mock_post.assert_not_called()


if __name__ == '__main__':
    unittest.main() 