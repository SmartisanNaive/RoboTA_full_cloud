"""
AI配置文件
包含与AI模型相关的配置
"""

import os

# DeepSeek API配置
DEEPSEEK_API_KEY = "sk-6a58c74845004701b700dfcd6f577c08"
DEEPSEEK_BASE_URL = "https://api.deepseek.com"
DEEPSEEK_MODEL = "deepseek-chat"

# 系统提示词
SYSTEM_PROMPT = f"""
You are an AI assistant controlling a laboratory robot based on user requests.
Your goal is to understand the user's natural language command and translate it into a structured JSON format that the robot control server can understand.

The robot can perform the following operations:
1.  **move_labware**: Move a piece of labware (like a 96-well plate) from one deck slot to another.
2.  **pipette**: Transfer liquid between wells of labware using a pipette.
3.  **thermocycler**: Run a temperature profile (cycling) on a plate using the thermocycler module.
4.  **heater_shaker**: Heat and/or shake a plate using the heater-shaker module.

You MUST output a JSON object containing the 'operation' and 'params' keys.
The 'operation' key specifies the type of action (e.g., "move_labware", "pipette").
The 'params' key is an object containing the necessary parameters for that operation.

Parameter Units:
- Volume: microliters (µL)
- Temperature: Celsius (°C)
- Time/Duration: seconds (s)
- Speed: revolutions per minute (rpm)
- Slots: integer numbers (1-12)
- Wells: Standard well notation (e.g., "A1", "B12")

Here are the required JSON formats for each operation:

**1. move_labware**
Moves labware between slots.
{{
  "operation": "move_labware",
  "params": {{
    "source_slot": <integer>,      // Starting slot number (e.g., 1)
    "destination_slot": <integer>, // Target slot number (e.g., 3)
    "plate_name": "<string>"      // Optional: Name of the labware definition (default: "corning_96_wellplate_360ul_flat")
  }}
}}
Example: "将1号槽的板子移动到3号槽" -> {{"operation": "move_labware", "params": {{"source_slot": 1, "destination_slot": 3}}}}

**2. pipette**
Transfers liquid.
{{
  "operation": "pipette",
  "params": {{
    "source_wells": ["<string>", ...], // List of source wells (e.g., ["A1", "B1"])
    "dest_wells": ["<string>", ...],   // List of destination wells (e.g., ["C1", "D1"])
    "volumes": [<number>, ...],       // List of volumes in µL (e.g., [50, 50]) - must match length of well lists
    "source_labware_type": "<string>",// Labware definition for the source (e.g., "corning_96_wellplate_360ul_flat")
    "dest_labware_type": "<string>",  // Labware definition for the destination (e.g., "nest_96_wellplate_100ul_pcr_full_skirt")
    "source_slot": <integer>,          // Slot number of the source labware
    "dest_slot": <integer>,            // Slot number of the destination labware
    "pipette_type": "<string>",        // Pipette model name (e.g., "p1000_single_gen2")
    "tiprack_type": "<string>",        // Tip rack definition (e.g., "opentrons_96_tiprack_1000ul")
    "tiprack_slot": <integer>          // Slot number of the tip rack
  }}
}}
Example: "用 P1000 从1号槽的 A1 孔吸取 100 微升液体，加到2号槽的 B1 孔。源板是康宁 96 孔板，目标板是 PCR 板，枪头架在 11 号槽。"
-> {{"operation": "pipette", "params": {{"source_wells": ["A1"], "dest_wells": ["B1"], "volumes": [100], "source_labware_type": "corning_96_wellplate_360ul_flat", "dest_labware_type": "nest_96_wellplate_100ul_pcr_full_skirt", "source_slot": 1, "dest_slot": 2, "pipette_type": "p1000_single_gen2", "tiprack_type": "opentrons_96_tiprack_1000ul", "tiprack_slot": 11}}}}

**3. thermocycler**
Runs a temperature profile.
{{
  "operation": "thermocycler",
  "params": {{
    "cycles": <integer>,                // Number of cycles to perform
    "plate_type": "<string>",           // Labware definition for the plate (e.g., "nest_96_wellplate_100ul_pcr_full_skirt")
    "steps": [                          // List of steps in the profile
      {{"temperature": <number>, "hold_time": <integer>}}, // Temperature in °C, hold_time in seconds
      ...
    ]
  }}
}}
Example: "使用热循环仪运行 PCR 程序：95°C 3分钟，然后进行30个循环（95°C 30秒，55°C 30秒，72°C 60秒），最后72°C 5分钟。板子类型是 nest_96_wellplate_100ul_pcr_full_skirt。"
-> {{"operation": "thermocycler", "params": {{"cycles": 30, "plate_type": "nest_96_wellplate_100ul_pcr_full_skirt", "steps": [{{"temperature": 95, "hold_time": 180}}, {{"temperature": 95, "hold_time": 30}}, {{"temperature": 55, "hold_time": 30}}, {{"temperature": 72, "hold_time": 60}}, {{"temperature": 72, "hold_time": 300}}]}}}}
Note: The initial step (95°C 3 min) and final step (72°C 5 min) are added as individual steps. The cycles parameter refers only to the repeating part. Infer the number of cycles if not explicitly stated but described (e.g., "repeat 30 times").

**4. heater_shaker**
Heats and shakes a plate.
{{
  "operation": "heater_shaker",
  "params": {{
    "plate_type": "<string>",           // Labware definition for the plate (e.g., "corning_96_wellplate_360ul_flat")
    "temperature": <number>,            // Target temperature in °C
    "shake_speed": <integer>,           // Shaking speed in rpm
    "shake_duration": <integer>         // Duration of heating and shaking in seconds
  }}
}}
Example: "将康宁96孔板在加热震荡模块上 60 度 1000 转/分 摇晃 10 分钟。"
-> {{"operation": "heater_shaker", "params": {{"plate_type": "corning_96_wellplate_360ul_flat", "temperature": 60, "shake_speed": 1000, "shake_duration": 600}}}}

**Important:**
- Ensure all required parameters for the identified operation are present in the 'params' object.
- If the user's request is ambiguous or lacks necessary information for a specific operation, DO NOT GUESS. Respond with a JSON indicating missing information:
  `{{"status": "error", "message": "Missing information: <specify what is missing>"}}`
- Adhere strictly to the JSON format specified. Do not add extra keys or change the structure.
- Pay close attention to units and convert if necessary (e.g., minutes to seconds).
- If the user gives multiple commands sequentially (e.g., "Move plate X, then pipette Y"), generate the JSON for the FIRST command only for now. Complex sequences will be handled later.
"""

# LLM配置
LLM_PROVIDER = "deepseek"  # 可选: "openai", "anthropic", "deepseek", "local"
LLM_MODEL = "deepseek-chat"  # 或 "deepseek-reasoner"
API_KEY = os.getenv("DEEPSEEK_API_KEY", "YOUR_API_KEY") # Replace with your actual API key or set environment variable
API_BASE_URL = "https://api.deepseek.com/v1" # DeepSeek API endpoint

# API模板定义
API_TEMPLATES = {
    "pipette": {
        "endpoint": "/pipette",
        "required_params": ["source_wells", "dest_wells", "volumes"],
        "optional_params": ["source_labware_type", "dest_labware_type", "source_slot", "dest_slot", 
                           "pipette_type", "tiprack_type", "tiprack_slot", "mount", 
                           "mix_before", "mix_after", "blow_out"],
        "default_values": {
            "source_labware_type": "corning_96_wellplate_360ul_flat",
            "dest_labware_type": "corning_96_wellplate_360ul_flat",
            "source_slot": "B2",
            "dest_slot": "D2",
            "pipette_type": "flex_1channel_1000",
            "tiprack_type": "opentrons_flex_96_tiprack_200ul",
            "tiprack_slot": "C3",
            "mount": "left"
        },
        "description": "执行移液操作，从源孔转移指定体积到目标孔"
    },
    "move_labware": {
        "endpoint": "/move-labware",
        "required_params": ["source_slot", "destination_slot"],
        "optional_params": ["labware_type", "speed", "force"],
        "default_values": {
            "labware_type": "corning_96_wellplate_360ul_flat"
        },
        "description": "移动实验耗材从一个位置到另一个位置"
    },
    "thermocycler": {
        "endpoint": "/thermocycler",
        "required_params": ["temperature", "hold_time"],
        "optional_params": ["lid_temperature", "cycles", "program_name", "steps"],
        "default_values": {
            "lid_temperature": 105,
            "cycles": 1
        },
        "description": "控制热循环仪温度和时间"
    },
    "heater_shaker": {
        "endpoint": "/heater-shaker",
        "required_params": ["temperature", "speed"],
        "optional_params": ["duration", "mode", "plate_type"],
        "default_values": {
            "duration": 60,
            "plate_type": "corning_96_wellplate_360ul_flat"
        },
        "description": "控制热震荡仪的温度和震荡速度"
    },
    "upload_protocol": {
        "endpoint": "/upload-protocol",
        "required_params": ["protocol_content"],
        "optional_params": ["protocol_name", "description"],
        "description": "上传自定义协议文件"
    }
}

# 会话设置
MAX_HISTORY_LENGTH = 10  # 最大历史记录长度
HISTORY_TIMEOUT = 3600  # 会话超时时间（秒）

# Define function mappings for API endpoints and parameters
FUNCTION_MAPPINGS = {
    "move_labware": {
        "endpoint": "/move-labware",
        "required_params": {"source_slot": int, "destination_slot": int},
        "optional_params": {"plate_name": str},
        "param_types": {"source_slot": int, "destination_slot": int, "plate_name": str}
    },
    "pipette": {
        "endpoint": "/pipette",
        "required_params": {
            "source_wells": list,          # e.g., ["A1", "B1"]
            "dest_wells": list,            # e.g., ["C1", "D1"]
            "volumes": list,               # e.g., [50, 50] (in µL)
            "source_labware_type": str,    # e.g., "corning_96_wellplate_360ul_flat"
            "dest_labware_type": str,      # e.g., "nest_96_wellplate_100ul_pcr_full_skirt"
            "source_slot": int,            # e.g., 1
            "dest_slot": int,              # e.g., 2
            "pipette_type": str,           # e.g., "p1000_single_gen2"
            "tiprack_type": str,           # e.g., "opentrons_96_tiprack_1000ul"
            "tiprack_slot": int            # e.g., 11
        },
        "optional_params": {}, # Add optional params if any
        "param_types": {
            "source_wells": list, "dest_wells": list, "volumes": list,
            "source_labware_type": str, "dest_labware_type": str, "source_slot": int,
            "dest_slot": int, "pipette_type": str, "tiprack_type": str, "tiprack_slot": int
        }
        # Add basic validation rules later if needed
    },
    "thermocycler": {
        "endpoint": "/thermocycler",
        "required_params": {
            "cycles": int,                 # Number of cycles
            "plate_type": str,             # e.g., "nest_96_wellplate_100ul_pcr_full_skirt"
            "steps": list                  # List of steps: [{"temperature": 95, "hold_time": 180}, ...] (temp in °C, time in seconds)
        },
        "optional_params": {},
        "param_types": {
            "cycles": int, "plate_type": str, "steps": list
        }
        # Validation for steps content (each step requires temp and time) will be handled in code
    },
    "heater_shaker": {
        "endpoint": "/heater-shaker",
        "required_params": {
            "plate_type": str,             # e.g., "corning_96_wellplate_360ul_flat"
            "temperature": (int, float),   # Target temperature in °C
            "shake_speed": int,            # Shaking speed in rpm
            "shake_duration": int          # Shaking duration in seconds
        },
        "optional_params": {},
        "param_types": {
            "plate_type": str, "temperature": (int, float), "shake_speed": int, "shake_duration": int
        }
    }
    # Add other operations like heater_shaker_open/close, thermocycler_open/close later if needed
}

# Example usage (can be removed or commented out)
if __name__ == "__main__":
    print("API Key:", API_KEY)
    print("Base URL:", API_BASE_URL)
    print("System Prompt:", SYSTEM_PROMPT)
    print("\nFunction Mappings:")
    import json
    print(json.dumps(FUNCTION_MAPPINGS, indent=2)) 