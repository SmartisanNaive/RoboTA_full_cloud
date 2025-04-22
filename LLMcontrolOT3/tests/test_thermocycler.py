import requests
import json
import time

# 服务器URL
BASE_URL = "http://localhost:5000"  # 替换为你的服务器URL

def test_thermocycler():
    """测试热循环仪操作"""
    url = f"{BASE_URL}/thermocycler"
    
    # 创建PCR循环的测试数据
    data = {
        "cycles": 3,
        "plate_type": "nest_96_wellplate_100ul_pcr_full_skirt",
        "lid_temperature": 105,
        "initial_temperature": 95,
        "initial_hold_time": 120,  # 2分钟初始变性
        "steps": [
            {"temperature": 95, "hold_time": 30},  # 变性 30秒
            {"temperature": 55, "hold_time": 30},  # 退火 30秒
            {"temperature": 72, "hold_time": 60}   # 延伸 60秒
        ],
        "final_temperature": 4,  # 最终保持在4°C
        "open_lid_at_end": True,
        # 可选：如果需要从其他位置移动板子到热循环仪
        "plate_source_type": "nest_96_wellplate_100ul_pcr_full_skirt",
        "plate_source_slot": "D2"
    }
    
    try:
        print("\n===== 测试热循环仪操作 =====")
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

def stop_all_runs():
    """停止所有正在运行的任务"""
    try:
        response = requests.post(f"{BASE_URL}/stop-runs/")
        print("已停止所有运行")
        return response.json()
    except Exception as e:
        print(f"停止运行时出错: {e}")
        return None

if __name__ == "__main__":
    # 先停止所有运行
    stop_all_runs()
    time.sleep(1)
    
    # 测试热循环仪操作
    test_thermocycler() 