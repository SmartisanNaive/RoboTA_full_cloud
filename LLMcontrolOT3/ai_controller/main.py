"""
AI控制器主模块
负责协调各个组件完成用户指令的处理和执行
"""

from .command_parser import CommandParser
import requests
from config.ai_settings import SERVER_HOST, SERVER_PORT, FUNCTION_MAPPINGS

class AIController:
    def __init__(self):
        self.command_parser = CommandParser()
        self.base_url = f"http://{SERVER_HOST}:{SERVER_PORT}"
        
    def process_command(self, user_input):
        """
        处理用户输入的自然语言指令, 验证参数并执行
        
        Args:
            user_input (str): 用户输入的指令
            
        Returns:
            dict: 执行结果或错误/缺失信息
        """
        # 解析命令
        command = self.command_parser.parse_command(user_input)
        if not command or "operation" not in command or "params" not in command:
            # Check if the response indicates an LLM-detected error/missing info
            if isinstance(command, dict) and command.get("status") == "error":
                return command
            return {"status": "error", "message": "Failed to parse command into valid JSON format"}

        operation = command["operation"]
        params = command["params"]

        # 检查操作是否支持
        if operation not in FUNCTION_MAPPINGS:
            return {"status": "error", "message": f"Unsupported operation: {operation}"}

        # 验证必需参数
        mapping = FUNCTION_MAPPINGS[operation]
        required_params = mapping["required_params"]
        missing_params = []
        for param_name in required_params.keys():
            if param_name not in params:
                missing_params.append(param_name)

        if missing_params:
            return {
                "status": "missing_info",
                "message": f"Missing required parameters for operation '{operation}': {', '.join(missing_params)}"
            }

        # 执行命令
        try:
            if operation == "move_labware":
                # Note: SYSTEM_PROMPT now asks for integer slots, conversion might not be needed
                # If conversion is still needed based on LLM output:
                # params["source_slot"] = self._convert_position_to_slot(params["source_slot"])
                # params["destination_slot"] = self._convert_position_to_slot(params["destination_slot"])
                # Add default plate_name if not provided
                params.setdefault("plate_name", "corning_96_wellplate_360ul_flat")
                return self._execute_command(operation, params)
            elif operation == "pipette":
                return self._execute_command(operation, params)
            elif operation == "thermocycler":
                return self._execute_command(operation, params)
            elif operation == "heater_shaker":
                return self._execute_command(operation, params)
            else:
                # This case should ideally not be reached due to the check above
                return {"status": "error", "message": f"Unsupported operation (internal error): {operation}"}
        except Exception as e:
            return {"status": "error", "message": f"Error during execution of '{operation}': {str(e)}"}

    def _execute_command(self, operation, params):
        """
        通用命令执行函数
        
        Args:
            operation (str): 操作类型 (e.g., "move_labware")
            params (dict): 操作参数
            
        Returns:
            dict: 执行结果
        """
        if operation not in FUNCTION_MAPPINGS:
             return {"status": "error", "message": f"Operation '{operation}' not found in FUNCTION_MAPPINGS."}   
        
        endpoint = f"{self.base_url}{FUNCTION_MAPPINGS[operation]['endpoint']}"
        try:
            print(f"Sending POST to {endpoint} with JSON: {params}") # Debug print
            response = requests.post(endpoint, json=params)
            response.raise_for_status() # Raise HTTPError for bad responses (4xx or 5xx)
            response_json = response.json()
            print(f"Received response: {response_json}") # Debug print
            # Assuming server returns { "status": "success", "message": "...", ... } or similar on success
            # Or { "error": "..." } on failure
            if response_json.get("status") == "success":
                return {"status": "success", "message": f"Operation '{operation}' executed successfully.", "details": response_json.get("message", "")}
            elif "error" in response_json:
                 return {"status": "error", "message": f"Server error during '{operation}': {response_json['error']}"}
            else:
                 # Handle cases where the response might not follow the expected success/error structure
                 return {"status": "success", "message": f"Operation '{operation}' request sent, but response format unclear.", "response": response_json}

        except requests.exceptions.RequestException as e:
            print(f"RequestException for {operation}: {str(e)}") # Debug print
            return {"status": "error", "message": f"Network error executing '{operation}': {str(e)}"}
        except Exception as e:
            print(f"Generic Exception for {operation}: {str(e)}") # Debug print
            return {"status": "error", "message": f"Unexpected error executing '{operation}': {str(e)}"}

    def _convert_position_to_slot(self, position):
        """
        将字母数字位置标识（如A1、B2）转换为槽位编号 (DEPRECATED if LLM provides integers)
        
        Args:
            position (str or int): 位置标识（如"B3" or already an int)
            
        Returns:
            int or None: 槽位编号, or None if invalid
        """
        if isinstance(position, int):
             return position # Already an integer
        if not isinstance(position, str):
             return None # Invalid input type
        
        # 位置映射表 (Example mapping, adjust based on actual robot deck layout)
        position_map = {
            'A1': 10, 'A2': 11, 'A3': 12,
            'B1': 7,  'B2': 8,  'B3': 9,
            'C1': 4,  'C2': 5,  'C3': 6,
            'D1': 1,  'D2': 2,  'D3': 3
        }
        return position_map.get(position.upper())

# Example Usage (for testing purposes)
if __name__ == '__main__':
    controller = AIController()
    
    # Test case 1: Valid move command
    # result1 = controller.process_command("将 B3 的板子移动到 A2") # Old format
    result1 = controller.process_command("将9号槽的板子移动到11号槽")
    print("Test 1 (Move):")
    print(result1)
    print("---")

    # Test case 2: Pipette command (assuming LLM provides full details)
    pipette_cmd = "用 p1000 从1号槽的A1孔吸取100微升到2号槽的B1孔, 源板corning_96_wellplate_360ul_flat, 目标板nest_96_wellplate_100ul_pcr_full_skirt, 枪头架opentrons_96_tiprack_1000ul在11号槽"
    result2 = controller.process_command(pipette_cmd)
    print("Test 2 (Pipette - Complete):")
    print(result2)
    print("---")

    # Test case 3: Pipette command (missing info)
    pipette_cmd_missing = "从 A1 吸取 100ul 到 B1"
    result3 = controller.process_command(pipette_cmd_missing)
    print("Test 3 (Pipette - Missing Info):")
    print(result3)
    print("---")

    # Test case 4: Thermocycler command
    thermo_cmd = "用PCR板跑30个循环, 95度30秒, 55度30秒, 72度60秒。板子类型nest_96_wellplate_100ul_pcr_full_skirt"
    result4 = controller.process_command(thermo_cmd)
    print("Test 4 (Thermocycler):")
    print(result4)
    print("---")

    # Test case 5: Heater-shaker command
    hs_cmd = "将康宁96孔板在加热震荡模块上 60 度 1000 rpm 摇晃 10 分钟"
    result5 = controller.process_command(hs_cmd)
    print("Test 5 (Heater-Shaker):")
    print(result5)
    print("---")
    
    # Test case 6: Unsupported operation (if LLM hallucinates)
    unsupported_cmd = "给我泡杯咖啡"
    result6 = controller.process_command(unsupported_cmd)
    print("Test 6 (Unsupported):")
    print(result6)
    print("---")

    # Test case 7: Thermocycler command (missing cycles)
    thermo_cmd_missing = "用PCR板跑循环, 95度30秒, 55度30秒, 72度60秒。板子类型nest_96_wellplate_100ul_pcr_full_skirt"
    result7 = controller.process_command(thermo_cmd_missing)
    print("Test 7 (Thermocycler - Missing Info):")
    print(result7)
    print("---") 