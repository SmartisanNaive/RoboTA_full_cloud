import requests
import json
import time

# 服务器URL
BASE_URL = "http://localhost:5000"

def stop_all_runs():
    """停止所有正在运行的任务"""
    try:
        response = requests.post(f"{BASE_URL}/stop-runs/")
        print("已停止所有运行")
        return response.json()
    except Exception as e:
        print(f"停止运行时出错: {e}")
        return None

def wait_for_run_complete(run_id, max_wait=30):
    """等待运行完成"""
    print(f"等待运行 {run_id} 完成...")
    time.sleep(max_wait)  # 简单等待固定时间
    print("等待完成")

def test_heater_shaker_simple():
    """测试热震荡仪操作（简化版）"""
    try:
        # 1. 先打开夹爪
        print("\n===== 测试打开热震荡仪夹具 =====")
        open_data = {
            "plate_type": "corning_96_wellplate_360ul_flat",
            "tracking_id": "open_clamp_test_001"
        }
        print(f"发送数据: {json.dumps(open_data, indent=2)}")
        
        open_response = requests.post(f"{BASE_URL}/heater-shaker-open", json=open_data)
        open_response.raise_for_status()
        print("打开热震荡仪夹具请求成功发送。响应:")
        print(json.dumps(open_response.json(), indent=2))
        
        # 等待打开操作完成
        wait_for_run_complete(open_response.json()["run_id"])

        # 2. 关闭夹爪
        print("\n===== 测试关闭热震荡仪夹具 =====")
        close_data = {
            "plate_type": "corning_96_wellplate_360ul_flat",
            "tracking_id": "close_clamp_test_001"
        }
        print(f"发送数据: {json.dumps(close_data, indent=2)}")
        
        close_response = requests.post(f"{BASE_URL}/heater-shaker-close", json=close_data)
        close_response.raise_for_status()
        print("关闭热震荡仪夹具请求成功发送。响应:")
        print(json.dumps(close_response.json(), indent=2))
        
        # 等待关闭操作完成
        wait_for_run_complete(close_response.json()["run_id"])

        # 3. 开始热震荡操作
        print("\n===== 测试热震荡仪操作 =====")
        shake_data = {
            "plate_type": "corning_96_wellplate_360ul_flat",
            "temperature": 37,
            "shake_speed": 300,
            "shake_duration": 30
        }
        
        print(f"发送数据: {json.dumps(shake_data, indent=2)}")
        response = requests.post(f"{BASE_URL}/heater-shaker", json=shake_data)
        response.raise_for_status()
        
        print("热震荡仪操作响应:")
        print(json.dumps(response.json(), indent=2))
        
        # 等待热震荡操作完成
        wait_for_run_complete(response.json()["run_id"])
        
        # 4. 最后再次关闭夹爪
        print("\n===== 最后关闭热震荡仪夹具 =====")
        final_close_response = requests.post(f"{BASE_URL}/heater-shaker-close", json=close_data)
        final_close_response.raise_for_status()
        print("最后关闭热震荡仪夹具请求成功发送。响应:")
        print(json.dumps(final_close_response.json(), indent=2))
        
        return response.json()
        
    except requests.exceptions.RequestException as e:
        print(f"错误: {e}")
        if hasattr(e, 'response') and e.response is not None:
            print(f"服务器响应: {e.response.text}")
        return None

if __name__ == "__main__":
    # 先停止所有运行
    print("停止所有运行...")
    stop_all_runs()
    time.sleep(5)  # 增加初始等待时间
    
    # 运行测试
    test_heater_shaker_simple() 