import requests
import json
import time

# 服务器URL
BASE_URL = "http://localhost:5000"  # 替换为你的服务器URL

def test_heater_shaker_close():
    """测试关闭热震荡仪夹具"""
    url = f"{BASE_URL}/heater-shaker-close"
    
    # 创建关闭夹具的测试数据
    data = {
        "plate_type": "corning_96_wellplate_360ul_flat",
        # 可以添加其他可选参数
        "tracking_id": "close_clamp_test_001"
    }
    
    try:
        print("\n===== 测试关闭热震荡仪夹具 =====")
        print(f"发送数据: {json.dumps(data, indent=2)}")
        
        response = requests.post(url, json=data)
        response.raise_for_status()
        
        print("关闭热震荡仪夹具请求成功发送。响应:")
        print(json.dumps(response.json(), indent=2))
        return response.json()
    except requests.exceptions.RequestException as e:
        print(f"发送关闭热震荡仪夹具请求时出错: {e}")
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
    
    # 测试关闭热震荡仪夹具
    test_heater_shaker_close() 