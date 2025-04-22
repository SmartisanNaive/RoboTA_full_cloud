"""
使用DeepSeek API与LLMcontrolOT3系统交互的示例
此示例展示了如何使用DeepSeek模型生成实验指令，并通过API调用机器人控制器
"""

import requests
import json
from openai import OpenAI

# 配置
DEEPSEEK_API_KEY = "sk-6a58c74845004701b700dfcd6f577c08"
DEEPSEEK_MODEL = "deepseek-chat"  # 或 "deepseek-reasoner"
DEEPSEEK_API_BASE = "https://api.deepseek.com"

AI_SERVICE_URL = "http://localhost:5001/api/chat"

# 初始化DeepSeek客户端
client = OpenAI(api_key=DEEPSEEK_API_KEY, base_url=DEEPSEEK_API_BASE)

def generate_experiment_instruction(user_request):
    """使用DeepSeek模型生成实验指令"""
    try:
        response = client.chat.completions.create(
            model=DEEPSEEK_MODEL,
            messages=[
                {"role": "system", "content": """你是一个生物实验助手，负责将用户的高级实验请求转换为具体的机器人指令。
                
请仔细分析用户的实验需求，转换为明确的、步骤化的机器人指令。指令应该精确指定：
- 具体的孔位（例如A1、B2等）
- 精确的体积（单位为微升，如100µL）
- 明确的温度（单位为摄氏度，如37°C）
- 具体的时间（单位为秒或分钟，如60秒）

指令应该简洁明了，避免不必要的解释。每条指令只包含一个操作步骤。
"""}, 
                {"role": "user", "content": user_request}
            ],
            temperature=0.3,
            max_tokens=1000
        )
        
        return response.choices[0].message.content
    except Exception as e:
        return f"生成实验指令时出错: {str(e)}"

def send_to_robot(instruction, session_id=None):
    """将指令发送到机器人控制服务"""
    payload = {
        "message": instruction
    }
    
    if session_id:
        payload["session_id"] = session_id
    
    try:
        response = requests.post(AI_SERVICE_URL, json=payload)
        response.raise_for_status()
        return response.json()
    except requests.exceptions.RequestException as e:
        print(f"发送指令时出错: {e}")
        if hasattr(e, 'response') and e.response is not None:
            print(f"服务器响应: {e.response.text}")
        return {"error": str(e)}

def main():
    print("=== DeepSeek + LLMcontrolOT3 集成示例 ===\n")
    
    # 示例1：简单PCR实验
    user_request = "我需要设计一个简单的PCR实验，将A1、A2和A3孔中的DNA样本扩增，使用30个PCR循环"
    print(f"用户请求: {user_request}")
    
    # 1. 使用DeepSeek生成具体指令
    experiment_instruction = generate_experiment_instruction(user_request)
    print(f"\nDeepSeek生成的指令:\n{experiment_instruction}\n")
    
    # 2. 将指令发送到机器人控制服务
    robot_response = send_to_robot(experiment_instruction)
    
    if "error" in robot_response:
        print(f"错误: {robot_response['error']}")
    else:
        print(f"机器人响应:\n{robot_response['response']}\n")
        session_id = robot_response["session_id"]
        
        # 示例2：继续同一个实验，使用相同会话
        user_request2 = "现在需要在37°C下震荡这些样本5分钟"
        print(f"用户后续请求: {user_request2}")
        
        experiment_instruction2 = generate_experiment_instruction(user_request2)
        print(f"\nDeepSeek生成的后续指令:\n{experiment_instruction2}\n")
        
        robot_response2 = send_to_robot(experiment_instruction2, session_id)
        
        if "error" in robot_response2:
            print(f"错误: {robot_response2['error']}")
        else:
            print(f"机器人响应:\n{robot_response2['response']}")

if __name__ == "__main__":
    main() 