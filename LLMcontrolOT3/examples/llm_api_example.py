import requests
import json

# AI服务URL
AI_SERVICE_URL = "http://localhost:5001/api/chat"

def send_command(message, session_id=None):
    """发送命令到AI服务"""
    payload = {
        "message": message
    }
    
    if session_id:
        payload["session_id"] = session_id
    
    response = requests.post(AI_SERVICE_URL, json=payload)
    return response.json()

def main():
    """主函数"""
    print("LLMcontrolOT3 API示例")
    print("发送命令到AI服务...\n")
    
    # 第一条消息，获取会话ID
    message1 = "请执行一个简单的移液操作，将A1孔的100微升样本转移到B1孔"
    response1 = send_command(message1)
    
    print(f"用户: {message1}")
    print(f"AI助手: {response1['response']}")
    print()
    
    # 使用会话ID发送后续消息
    session_id = response1["session_id"]
    
    message2 = "现在请将板子放到热震荡仪上，温度设为37度，震荡5分钟"
    response2 = send_command(message2, session_id)
    
    print(f"用户: {message2}")
    print(f"AI助手: {response2['response']}")
    print()
    
    message3 = "实验完成后，请将板子移到热循环仪上进行PCR反应，30个循环"
    response3 = send_command(message3, session_id)
    
    print(f"用户: {message3}")
    print(f"AI助手: {response3['response']}")

if __name__ == "__main__":
    main() 