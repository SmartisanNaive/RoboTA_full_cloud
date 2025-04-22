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

def test_open_lid():
    """测试打开热循环仪盖子"""
    url = f"{BASE_URL}/thermocycler/open-lid"
    
    data = {
        "plate_type": "nest_96_wellplate_100ul_pcr_full_skirt"
    }
    
    try:
        print("\n===== 测试打开热循环仪盖子 =====")
        print(f"发送数据: {json.dumps(data, indent=2)}")
        
        response = requests.post(url, json=data)
        response.raise_for_status()
        
        print("打开盖子请求成功发送。响应:")
        print(json.dumps(response.json(), indent=2))
        return response.json()
    except requests.exceptions.RequestException as e:
        print(f"发送打开盖子请求时出错: {e}")
        if hasattr(e, 'response') and e.response is not None:
            print(f"服务器响应: {e.response.text}")
        return None

def test_close_lid():
    """测试关闭热循环仪盖子"""
    url = f"{BASE_URL}/thermocycler/close-lid"
    
    data = {
        "plate_type": "nest_96_wellplate_100ul_pcr_full_skirt"
    }
    
    try:
        print("\n===== 测试关闭热循环仪盖子 =====")
        print(f"发送数据: {json.dumps(data, indent=2)}")
        
        response = requests.post(url, json=data)
        response.raise_for_status()
        
        print("关闭盖子请求成功发送。响应:")
        print(json.dumps(response.json(), indent=2))
        return response.json()
    except requests.exceptions.RequestException as e:
        print(f"发送关闭盖子请求时出错: {e}")
        if hasattr(e, 'response') and e.response is not None:
            print(f"服务器响应: {e.response.text}")
        return None

def test_set_temperature():
    """测试设置热循环仪温度"""
    url = f"{BASE_URL}/thermocycler/set-temperature"
    
    data = {
        "plate_type": "nest_96_wellplate_100ul_pcr_full_skirt",
        "temperature": 37,  # 设置温度为37°C
        "hold_time": 60  # 保持60秒
    }
    
    try:
        print("\n===== 测试设置热循环仪温度 =====")
        print(f"发送数据: {json.dumps(data, indent=2)}")
        
        response = requests.post(url, json=data)
        response.raise_for_status()
        
        print("设置温度请求成功发送。响应:")
        print(json.dumps(response.json(), indent=2))
        return response.json()
    except requests.exceptions.RequestException as e:
        print(f"发送设置温度请求时出错: {e}")
        if hasattr(e, 'response') and e.response is not None:
            print(f"服务器响应: {e.response.text}")
        return None

if __name__ == "__main__":
    # 先停止所有运行
    stop_all_runs()
    time.sleep(1)
    
    # 测试打开盖子
    test_open_lid()
    time.sleep(5)  # 等待盖子打开
    
    # 测试关闭盖子
    test_close_lid()
    time.sleep(5)  # 等待盖子关闭
    
    # 测试设置温度
    test_set_temperature() 