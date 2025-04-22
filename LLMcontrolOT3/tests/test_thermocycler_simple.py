import requests
import json
import time

# 服务器URL
BASE_URL = "http://localhost:5000"  # 替换为你的服务器URL

def stop_all_runs():
    """停止所有正在运行的任务"""
    try:
        response = requests.post(f"{BASE_URL}/stop-runs/")
        print("已停止所有运行")
        return response.json()
    except Exception as e:
        print(f"停止运行时出错: {e}")
        return None

def test_thermocycler_simple():
    """测试热循环仪操作（简化版）"""
    url = f"{BASE_URL}/thermocycler"
    
    # 简化的测试数据 - 只打开盖子
    data = {
        "cycles": 0,  # 不需要运行循环
        "plate_type": "nest_96_wellplate_100ul_pcr_full_skirt",
        "open_lid": True,  # 打开盖子
        "steps": []  # 不需要温度步骤
    }
    
    try:
        print("\n===== 测试热循环仪操作（打开盖子）=====")
        print(f"发送数据: {json.dumps(data, indent=2)}")
        
        response = requests.post(url, json=data)
        response.raise_for_status()
        
        print("热循环仪操作请求成功发送。响应:")
        print(json.dumps(response.json(), indent=2))
        return response.json()
    except requests.exceptions.RequestException as e:
        print(f"发送热循环仪请求时出错: {e}")
        if hasattr(e, 'response') and e.response is not None:
            print(f"服务器响应: {e.response.text}")
        return None

if __name__ == "__main__":
    # 先停止所有运行
    stop_all_runs()
    time.sleep(1)
    
    # 测试热循环仪操作（打开盖子）
    test_thermocycler_simple() 