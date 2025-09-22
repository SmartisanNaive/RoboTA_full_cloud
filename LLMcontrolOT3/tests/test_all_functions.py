import requests
import json
import time
import argparse

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

def test_pipetting():
    """测试移液操作"""
    url = f"{BASE_URL}/pipette"
    
    data = {
        "source_wells": ["A1", "B1", "C1"],
        "dest_wells": ["A1", "B1", "C1"],
        "volumes": [50, 50, 50],
        "source_labware_type": "opentrons_24_tuberack_eppendorf_1.5ml_safelock_snapcap",
        "dest_labware_type": "opentrons_96_wellplate_200ul_pcr_full_skirt",
        "source_slot": "B2",  # 管架位置
        "dest_slot": "D2",    # PCR板位置
        "pipette_type": "flex_1channel_1000",
        "tiprack_type": "opentrons_flex_96_tiprack_200ul",
        "tiprack_slot": "C3",
        "mount": "right"
    }
    
    try:
        print("\n===== 测试移液操作 =====")
        print(f"发送数据: {json.dumps(data, indent=2)}")
        
        response = requests.post(url, json=data)
        response.raise_for_status()
        
        print("移液操作请求成功发送。响应:")
        print(json.dumps(response.json(), indent=2))
        return response.json()
    except requests.exceptions.RequestException as e:
        print(f"发送移液请求时出错: {e}")
        if hasattr(e, 'response') and e.response is not None:
            print(f"服务器响应: {e.response.text}")
        return None

def test_thermocycler():
    """测试热循环仪操作"""
    url = f"{BASE_URL}/thermocycler"
    
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

def test_heater_shaker():
    """测试热震荡仪操作"""
    url = f"{BASE_URL}/heater-shaker"
    
    data = {
        "plate_type": "corning_96_wellplate_360ul_flat",
        "temperature": 37,  # 37°C
        "shake_speed": 500,  # 500 rpm
        "shake_duration": 60,  # 震荡60秒
        "hold_time": 300,  # 保持温度5分钟
        "deactivate_at_end": True,
        # 可选：如果需要从其他位置移动板子到热震荡仪
        "plate_source_type": "corning_96_wellplate_360ul_flat",
        "plate_source_slot": "D2"
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

def test_move_labware():
    """测试移动耗材"""
    url = f"{BASE_URL}/move-labware"
    
    data = {
        "source_slot": 9,
        "destination_slot": 5,
        "plate_name": "corning_96_wellplate_360ul_flat"
    }
    
    try:
        print("\n===== 测试移动耗材 =====")
        print(f"发送数据: {json.dumps(data, indent=2)}")
        
        response = requests.post(url, json=data)
        response.raise_for_status()
        
        print("移动耗材请求成功发送。响应:")
        print(json.dumps(response.json(), indent=2))
        return response.json()
    except requests.exceptions.RequestException as e:
        print(f"发送移动耗材请求时出错: {e}")
        if hasattr(e, 'response') and e.response is not None:
            print(f"服务器响应: {e.response.text}")
        return None

if __name__ == "__main__":
    parser = argparse.ArgumentParser(description='测试OT-3机器人的各种功能')
    parser.add_argument('--all', action='store_true', help='测试所有功能')
    parser.add_argument('--pipette', action='store_true', help='测试移液功能')
    parser.add_argument('--thermocycler', action='store_true', help='测试热循环仪功能')
    parser.add_argument('--heater-shaker', action='store_true', help='测试热震荡仪功能')
    parser.add_argument('--move', action='store_true', help='测试移动耗材功能')
    
    args = parser.parse_args()
    
    # 如果没有指定任何参数，默认测试所有功能
    if not any(vars(args).values()):
        args.all = True
    
    # 先停止所有运行
    stop_all_runs()
    time.sleep(1)
    
    # 根据参数执行相应的测试
    if args.all or args.pipette:
        test_pipetting()
        time.sleep(2)
        stop_all_runs()
        time.sleep(1)
    
    if args.all or args.thermocycler:
        test_thermocycler()
        time.sleep(2)
        stop_all_runs()
        time.sleep(1)
    
    if args.all or args.heater_shaker:
        test_heater_shaker()
        time.sleep(2)
        stop_all_runs()
        time.sleep(1)
    
    if args.all or args.move:
        test_move_labware()
        time.sleep(2)
        stop_all_runs()
        time.sleep(1)
    
    print("\n===== 测试完成 =====") 