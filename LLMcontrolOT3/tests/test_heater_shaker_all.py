import requests
import json
import time

# 服务器URL
BASE_URL = "http://localhost:5000"  # 替换为你的服务器URL

def test_heater_shaker_all_operations():
    """测试热震荡仪的所有操作：打开夹具、关闭夹具、运行程序"""
    try:
        print("\n===== 测试热震荡仪所有操作 =====")
        
        # 1. 打开夹具
        open_data = {
            "plate_type": "corning_96_wellplate_360ul_flat",
            "tracking_id": "all_ops_test_001"
        }
        print("\n1. 打开夹具...")
        open_response = requests.post(f"{BASE_URL}/heater-shaker-open", json=open_data)
        open_response.raise_for_status()
        print("夹具已打开，响应:")
        print(json.dumps(open_response.json(), indent=2))
        time.sleep(5)  # 等待操作完成
        
        # 2. 关闭夹具
        close_data = {
            "plate_type": "corning_96_wellplate_360ul_flat",
            "tracking_id": "all_ops_test_001"
        }
        print("\n2. 关闭夹具...")
        close_response = requests.post(f"{BASE_URL}/heater-shaker-close", json=close_data)
        close_response.raise_for_status()
        print("夹具已关闭，响应:")
        print(json.dumps(close_response.json(), indent=2))
        time.sleep(5)  # 等待操作完成
        
        # 3. 运行热震荡程序
        run_data = {
            "operation_type": "run",
            "plate_type": "corning_96_wellplate_360ul_flat",
            "temperature": 37,
            "shake_speed": 500,
            "shake_duration": 30,
            "hold_time": 60,
            "tracking_id": "all_ops_test_001"
        }
        print("\n3. 运行热震荡程序...")
        run_response = requests.post(f"{BASE_URL}/heater-shaker", json=run_data)
        run_response.raise_for_status()
        print("热震荡程序已启动，响应:")
        print(json.dumps(run_response.json(), indent=2))
        
        print("\n所有操作测试完成!")
        return True
        
    except requests.exceptions.RequestException as e:
        print(f"测试出错: {e}")
        if hasattr(e, 'response') and e.response is not None:
            print(f"服务器响应: {e.response.text}")
        return False

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
    
    # 测试所有热震荡仪操作
    test_heater_shaker_all_operations() 