import requests
import json
import time

# 服务器URL
BASE_URL = "http://localhost:5000"  # 替换为你的服务器URL

def test_heater_shaker():
    """测试热震荡仪操作"""
    url = f"{BASE_URL}/heater-shaker"
    
    # 创建热震荡仪的测试数据
    data = {
        "operation_type": "run",  # 明确指定操作类型为运行热震荡程序
        "plate_type": "corning_96_wellplate_360ul_flat",
        "temperature": 37,  # 37°C
        "shake_speed": 500,  # 500 rpm
        "shake_duration": 60,  # 震荡60秒
        "hold_time": 300,  # 保持温度5分钟
        "deactivate_at_end": True,
        # 可选：如果需要从其他位置移动板子到热震荡仪
        "plate_source_type": "corning_96_wellplate_360ul_flat",
        "plate_source_slot": "D2",
        "tracking_id": "thermal_shake_test_001"
    }
    
    try:
        print("\n===== 测试热震荡仪操作 =====")
        print(f"发送数据: {json.dumps(data, indent=2)}")
        
        response = requests.post(url, json=data)
        response.raise_for_status()
        
        print("热震荡仪操作请求成功发送。响应:")
        print(json.dumps(response.json(), indent=2))
        return response.json()
    except requests.exceptions.RequestException as e:
        print(f"发送热震荡仪请求时出错: {e}")
        if hasattr(e, 'response') and e.response is not None:
            print(f"服务器响应: {e.response.text}")
        return None

def test_complete_workflow():
    """测试完整的热震荡仪工作流程：打开夹具 -> 关闭夹具 -> 运行程序 -> 打开夹具"""
    try:
        print("\n===== 测试完整热震荡仪工作流程 =====")
        
        # 1. 打开夹具
        open_data = {
            "plate_type": "corning_96_wellplate_360ul_flat",
            "tracking_id": "workflow_test_001"
        }
        print("\n1. 打开夹具...")
        open_response = requests.post(f"{BASE_URL}/heater-shaker-open", json=open_data)
        open_response.raise_for_status()
        print("夹具已打开")
        time.sleep(5)  # 等待操作完成
        
        # 2. 关闭夹具
        close_data = {
            "plate_type": "corning_96_wellplate_360ul_flat",
            "tracking_id": "workflow_test_001"
        }
        print("\n2. 关闭夹具...")
        close_response = requests.post(f"{BASE_URL}/heater-shaker-close", json=close_data)
        close_response.raise_for_status()
        print("夹具已关闭")
        time.sleep(5)  # 等待操作完成
        
        # 3. 运行热震荡程序
        run_data = {
            "operation_type": "run",
            "plate_type": "corning_96_wellplate_360ul_flat",
            "temperature": 37,
            "shake_speed": 500,
            "shake_duration": 30,
            "hold_time": 60,
            "tracking_id": "workflow_test_001"
        }
        print("\n3. 运行热震荡程序...")
        run_response = requests.post(f"{BASE_URL}/heater-shaker", json=run_data)
        run_response.raise_for_status()
        print("热震荡程序已启动")
        time.sleep(120)  # 等待程序完成
        
        # 4. 打开夹具取出板
        print("\n4. 打开夹具取出板...")
        final_open_response = requests.post(f"{BASE_URL}/heater-shaker-open", json=open_data)
        final_open_response.raise_for_status()
        print("夹具已打开，可以取出板")
        
        print("\n工作流程测试完成!")
        return True
        
    except requests.exceptions.RequestException as e:
        print(f"工作流程测试出错: {e}")
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
    
    # 测试热震荡仪操作
    test_heater_shaker()
    
    # 取消下面的注释来测试完整工作流程
    # time.sleep(2)
    # test_complete_workflow() 