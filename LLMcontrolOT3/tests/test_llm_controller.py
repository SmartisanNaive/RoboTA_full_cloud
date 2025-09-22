import requests
import json
import time
from typing import Dict, Any

# 控制器URL
BASE_URL = "http://localhost:5002"  # 替换为代理服务的URL

def test_robot_command(command: str, session_id: str = None) -> Dict[str, Any]:
    """测试机器人命令解析"""
    url = f"{BASE_URL}/api/v1/robot"
    
    # 构建请求体
    payload = {
        "message": command
    }
    
    if session_id:
        payload["external_session_id"] = session_id
    
    try:
        print(f"\n===== 测试命令: {command} =====")
        response = requests.post(url, json=payload)
        response.raise_for_status()
        
        result = response.json()
        print(f"响应状态: {'成功' if 'error' not in result else '失败'}")
        
        if "error" in result:
            print(f"错误: {result['error']}")
        else:
            print(f"响应内容: {json.dumps(result, indent=2, ensure_ascii=False)}")
            
            # 保存会话ID
            session_id = result.get("external_session_id")
            print(f"会话ID: {session_id}")
            
            # 如果成功解析为API调用
            if "api_call" in result:
                print("\n解析结果:")
                print(f"意图: {result['api_call']['intent']}")
                print(f"参数: {json.dumps(result['api_call']['parameters'], indent=2, ensure_ascii=False)}")
        
        return result
    
    except requests.exceptions.RequestException as e:
        print(f"请求出错: {str(e)}")
        if hasattr(e, 'response') and e.response is not None:
            print(f"服务器响应: {e.response.text}")
        return {"error": str(e)}

def test_translate_command(instruction: str) -> Dict[str, Any]:
    """测试单次指令翻译"""
    url = f"{BASE_URL}/api/v1/translate"
    
    try:
        print(f"\n===== 测试翻译指令: {instruction} =====")
        response = requests.post(url, json={"instruction": instruction})
        response.raise_for_status()
        
        result = response.json()
        print(f"响应状态: {'成功' if 'error' not in result.get('robot_command', {}) else '失败'}")
        print(f"响应内容: {json.dumps(result, indent=2, ensure_ascii=False)}")
        
        return result
    
    except requests.exceptions.RequestException as e:
        print(f"请求出错: {str(e)}")
        if hasattr(e, 'response') and e.response is not None:
            print(f"服务器响应: {e.response.text}")
        return {"error": str(e)}

def test_analyze_experiment(description: str) -> Dict[str, Any]:
    """测试实验分析"""
    url = f"{BASE_URL}/api/v1/analyze"
    
    try:
        print(f"\n===== 测试实验分析 =====")
        print(f"实验描述: {description}")
        response = requests.post(url, json={"description": description})
        response.raise_for_status()
        
        result = response.json()
        print(f"响应状态: {'成功' if 'error' not in result else '失败'}")
        print(f"响应内容: {json.dumps(result, indent=2, ensure_ascii=False)}")
        
        return result
    
    except requests.exceptions.RequestException as e:
        print(f"请求出错: {str(e)}")
        if hasattr(e, 'response') and e.response is not None:
            print(f"服务器响应: {e.response.text}")
        return {"error": str(e)}

def main():
    """主测试函数"""
    # 测试命令
    test_commands = [
        "将A1孔的100微升样本转移到B1孔",
        "热循环仪设置为95°C，保持30秒",
        "将96孔板从1号位置移到2号位置",
        "设置热震荡仪温度为37°C，震荡速度为500rpm，持续15分钟"
    ]
    
    session_id = None
    
    # 测试一系列命令
    for command in test_commands:
        result = test_robot_command(command, session_id)
        session_id = result.get("external_session_id")
        time.sleep(1)  # 短暂暂停
    
    # 测试单次指令翻译
    test_translate_command("将20微升样本从A1转移到C5孔")
    
    # 测试实验分析
    test_analyze_experiment("提取DNA样本，包括裂解细胞，洗涤，然后进行PCR扩增。使用96孔板，每个样本处理100微升。")

if __name__ == "__main__":
    main() 