"""
LLM控制器示例脚本
演示如何使用自然语言控制OT-3机器人
"""

import requests
import json
import time
import sys
import os
import argparse

# 添加项目根目录到Python路径
sys.path.append(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))

# 导入LLM控制器
from ai_interface.llm_controller import LLMController

# 代理服务URL
PROXY_URL = "http://localhost:5002/api/v1/robot"

def use_direct_controller(commands):
    """直接使用LLM控制器"""
    print("\n===== 使用LLM控制器直接处理命令 =====")
    
    # 创建控制器
    controller = LLMController()
    
    # 处理多条命令，维持上下文
    for i, command in enumerate(commands):
        print(f"\n命令 {i+1}: {command}")
        
        # 处理命令
        result = controller.process_command(command)
        
        # 打印结果
        print(f"解析结果: {'成功' if 'error' not in result else '失败'}")
        print(json.dumps(result, indent=2, ensure_ascii=False))
        
        time.sleep(1)  # 短暂暂停
    
    # 清除历史
    controller.clear_history()

def use_proxy_api(commands):
    """使用代理服务API"""
    print("\n===== 使用代理服务API处理命令 =====")
    
    session_id = None
    
    # 处理多条命令，维持会话
    for i, command in enumerate(commands):
        print(f"\n命令 {i+1}: {command}")
        
        # 构建请求
        payload = {
            "message": command
        }
        
        if session_id:
            payload["external_session_id"] = session_id
        
        # 发送请求
        try:
            response = requests.post(PROXY_URL, json=payload)
            response.raise_for_status()
            
            # 解析响应
            result = response.json()
            session_id = result.get("external_session_id")
            
            # 打印结果
            print(f"解析结果: {'成功' if 'error' not in result else '失败'}")
            print(json.dumps(result, indent=2, ensure_ascii=False))
            
        except requests.exceptions.RequestException as e:
            print(f"请求出错: {str(e)}")
            if hasattr(e, 'response') and e.response is not None:
                print(f"服务器响应: {e.response.text}")
        
        time.sleep(1)  # 短暂暂停
    
    # 重置会话
    if session_id:
        try:
            requests.post(f"{PROXY_URL}/reset", json={"external_session_id": session_id})
            print(f"\n会话 {session_id} 已重置")
        except:
            pass

def run_demo():
    """运行演示"""
    # 测试命令
    test_commands = [
        "将A1孔的100微升样本转移到B1孔",
        "设置热循环仪温度为95°C，保持30秒",
        "将96孔板从1号位置移动到2号位置",
        "设置热震荡仪温度为37°C，震荡速度为500rpm，持续15分钟",
        "从A1-H1孔分别取20微升样本放入A2-H2孔中",
    ]
    
    parser = argparse.ArgumentParser(description="LLM控制器示例")
    parser.add_argument("--mode", type=str, choices=["direct", "api", "both"], 
                        default="both", help="运行模式")
    
    args = parser.parse_args()
    
    if args.mode == "direct" or args.mode == "both":
        use_direct_controller(test_commands)
    
    if args.mode == "api" or args.mode == "both":
        use_proxy_api(test_commands)

if __name__ == "__main__":
    run_demo() 