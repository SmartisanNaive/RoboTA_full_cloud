"""
LLMcontrolOT3 项目配置文件
包含机器人设置、服务器设置和默认路径
"""

# 机器人设置
ROBOT_IP = "10.31.2.161"
ROBOT_PORT = 31950
ROBOT_HEADERS = {
    "Opentrons-Version": "3"
}

# 服务器设置
SERVER_HOST = "0.0.0.0"
SERVER_PORT = 5000
DEBUG_MODE = True

# 路径设置
TEMPLATE_DIR = "templates"
CONFIG_DIR = "config"
UTILS_DIR = "utils"
EXAMPLES_DIR = "examples"

# 默认模板文件
PROTOCOL_TEMPLATE = "protocol_template.py"
PIPETTING_TEMPLATE = "pipetting_template.py"
THERMOCYCLER_TEMPLATE = "thermocycler_template.py"
HEATER_SHAKER_TEMPLATE = "heater_shaker_template.py"

# 默认配置文件
MOVE_CONFIG = "move_config.json" 