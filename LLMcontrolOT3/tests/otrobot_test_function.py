import requests
import json
import argparse
import sys
import os
import tempfile
import shutil
from time import sleep

# 服务器URL
BASE_URL = "http://localhost:5000"  # 替换为你的服务器URL

def stop_all_runs():
    """停止所有正在运行的任务"""
    try:
        response = requests.post(f"{BASE_URL}/stop-runs/")
        response.raise_for_status()
        print("已停止所有运行")
        return True
    except requests.exceptions.RequestException as e:
        print(f"停止运行时出错: {e}")
        if hasattr(e, 'response') and e.response is not None:
            print(f"服务器响应: {e.response.text}")
        return False

# ===== 移液测试功能 =====

def test_basic_pipetting():
    """测试基本移液操作：从管架到PCR板的转移"""
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
        response = requests.post(url, json=data)
        response.raise_for_status()
        print("基本移液操作请求成功发送。响应:")
        print(json.dumps(response.json(), indent=2))
        return response.json()
    except requests.exceptions.RequestException as e:
        print(f"发送基本移液请求时出错: {e}")
        if hasattr(e, 'response') and e.response is not None:
            print(f"服务器响应: {e.response.text}")
        return None

def test_module_pipetting():
    """测试从PCR板到热震荡模块上的PCR板的转移"""
    url = f"{BASE_URL}/pipette"
    
    data = {
        "source_wells": ["A1", "A2", "A3"],
        "dest_wells": ["A1", "A2", "A3"],
        "volumes": [75, 75, 75],
        "source_labware_type": "opentrons_96_wellplate_200ul_pcr_full_skirt",
        "dest_labware_type": "opentrons_96_wellplate_200ul_pcr_full_skirt",
        "source_slot": "D2",
        "dest_slot": "D1",  # 加热震荡模块位置
        "pipette_type": "flex_1channel_1000",
        "tiprack_type": "opentrons_flex_96_tiprack_200ul",
        "tiprack_slot": "C3",
        "mount": "right"
    }
    
    try:
        response = requests.post(url, json=data)
        response.raise_for_status()
        print("模块间移液操作请求成功发送。响应:")
        print(json.dumps(response.json(), indent=2))
        return response.json()
    except requests.exceptions.RequestException as e:
        print(f"发送模块间移液请求时出错: {e}")
        if hasattr(e, 'response') and e.response is not None:
            print(f"服务器响应: {e.response.text}")
        return None

def test_magnetic_module_pipetting():
    """测试从管架到磁性模块上的PCR板的转移"""
    url = f"{BASE_URL}/pipette"
    
    data = {
        "source_wells": ["A1", "B1"],
        "dest_wells": ["A1", "B1"],
        "volumes": [100, 100],
        "source_labware_type": "opentrons_24_tuberack_eppendorf_1.5ml_safelock_snapcap",
        "dest_labware_type": "opentrons_96_wellplate_200ul_pcr_full_skirt",
        "source_slot": "B2",
        "dest_slot": "C1",  # 磁性模块位置
        "pipette_type": "flex_1channel_1000",
        "tiprack_type": "opentrons_flex_96_tiprack_200ul",
        "tiprack_slot": "C3",
        "mount": "right"
    }
    
    try:
        response = requests.post(url, json=data)
        response.raise_for_status()
        print("磁性模块移液操作请求成功发送。响应:")
        print(json.dumps(response.json(), indent=2))
        return response.json()
    except requests.exceptions.RequestException as e:
        print(f"发送磁性模块移液请求时出错: {e}")
        if hasattr(e, 'response') and e.response is not None:
            print(f"服务器响应: {e.response.text}")
        return None

def test_multichannel_pipetting():
    """测试多通道移液操作"""
    url = f"{BASE_URL}/pipette"
    
    data = {
        "source_wells": ["A1", "A2", "A3"],
        "dest_wells": ["H1", "H2", "H3"],
        "volumes": [50, 50, 50],
        "source_labware_type": "opentrons_96_wellplate_200ul_pcr_full_skirt",
        "dest_labware_type": "opentrons_96_wellplate_200ul_pcr_full_skirt",
        "source_slot": "D2",
        "dest_slot": "D2",  # 同一个板内转移
        "pipette_type": "flex_8channel_1000",  # 使用8通道移液枪
        "tiprack_type": "opentrons_flex_96_tiprack_200ul",
        "tiprack_slot": "C3",
        "mount": "left"  # 通常8通道移液枪安装在左侧
    }
    
    try:
        response = requests.post(url, json=data)
        response.raise_for_status()
        print("多通道移液操作请求成功发送。响应:")
        print(json.dumps(response.json(), indent=2))
        return response.json()
    except requests.exceptions.RequestException as e:
        print(f"发送多通道移液请求时出错: {e}")
        if hasattr(e, 'response') and e.response is not None:
            print(f"服务器响应: {e.response.text}")
        return None

# ===== 热循环仪测试功能 =====

def test_thermocycler():
    """测试热循环仪操作"""
    url = f"{BASE_URL}/thermocycler"
    
    data = {
        "cycles": 3,
        "plate_type": "nest_96_wellplate_100ul_pcr_full_skirt",
        "lid_temperature": 105,
        "initial_temperature": 95,
        "initial_hold_time": 120,
        "steps": [
            {"temperature": 95, "hold_time": 30},
            {"temperature": 55, "hold_time": 30},
            {"temperature": 72, "hold_time": 60}
        ],
        "final_temperature": 4,
        "open_lid_at_end": True
    }
    
    try:
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

def test_thermocycler_with_plate_transfer():
    """测试将板子移动到热循环仪并执行PCR"""
    url = f"{BASE_URL}/thermocycler"
    
    data = {
        "cycles": 3,
        "plate_type": "nest_96_wellplate_100ul_pcr_full_skirt",
        "plate_source_type": "nest_96_wellplate_100ul_pcr_full_skirt",
        "plate_source_slot": 5,
        "lid_temperature": 105,
        "initial_temperature": 95,
        "initial_hold_time": 120,
        "steps": [
            {"temperature": 95, "hold_time": 30},
            {"temperature": 55, "hold_time": 30},
            {"temperature": 72, "hold_time": 60}
        ],
        "final_temperature": 4,
        "open_lid_at_end": True
    }
    
    try:
        response = requests.post(url, json=data)
        response.raise_for_status()
        print("热循环仪板子转移操作请求成功发送。响应:")
        print(json.dumps(response.json(), indent=2))
        return response.json()
    except requests.exceptions.RequestException as e:
        print(f"发送热循环仪板子转移请求时出错: {e}")
        if hasattr(e, 'response') and e.response is not None:
            print(f"服务器响应: {e.response.text}")
        return None

# ===== 热震荡仪测试功能 =====

def test_heater_shaker():
    """测试热震荡仪操作"""
    url = f"{BASE_URL}/heater-shaker"
    
    data = {
        "plate_type": "corning_96_wellplate_360ul_flat",
        "temperature": 37,
        "shake_speed": 500,
        "shake_duration": 60,
        "hold_time": 300,
        "deactivate_at_end": True
    }
    
    try:
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

def test_heater_shaker_with_plate_transfer():
    """测试将板子移动到热震荡仪并执行操作"""
    url = f"{BASE_URL}/heater-shaker"
    
    data = {
        "plate_type": "corning_96_wellplate_360ul_flat",
        "plate_source_type": "corning_96_wellplate_360ul_flat",
        "plate_source_slot": 9,
        "temperature": 37,
        "shake_speed": 500,
        "shake_duration": 60,
        "hold_time": 300,
        "deactivate_at_end": True
    }
    
    try:
        response = requests.post(url, json=data)
        response.raise_for_status()
        print("热震荡仪板子转移操作请求成功发送。响应:")
        print(json.dumps(response.json(), indent=2))
        return response.json()
    except requests.exceptions.RequestException as e:
        print(f"发送热震荡仪板子转移请求时出错: {e}")
        if hasattr(e, 'response') and e.response is not None:
            print(f"服务器响应: {e.response.text}")
        return None

# ===== 板子移动测试功能 =====

def test_move_labware():
    """测试板子移动操作"""
    url = f"{BASE_URL}/move-labware"
    
    data = {
        "source_slot": 9,
        "destination_slot": 5,
        "plate_name": "corning_96_wellplate_360ul_flat"
    }
    
    try:
        response = requests.post(url, json=data)
        response.raise_for_status()
        print("板子移动操作请求成功发送。响应:")
        print(json.dumps(response.json(), indent=2))
        return response.json()
    except requests.exceptions.RequestException as e:
        print(f"发送板子移动请求时出错: {e}")
        if hasattr(e, 'response') and e.response is not None:
            print(f"服务器响应: {e.response.text}")
        return None

# ===== 命令行界面 =====

def print_menu():
    """打印测试菜单"""
    print("\n===== OT-3机器人测试菜单 =====")
    print("1. 基本移液测试 (从管架到PCR板)")
    print("2. 模块间移液测试 (从PCR板到热震荡模块)")
    print("3. 磁性模块移液测试 (从管架到磁性模块)")
    print("4. 多通道移液测试")
    print("5. 热循环仪测试")
    print("6. 热循环仪板子转移测试")
    print("7. 热震荡仪测试")
    print("8. 热震荡仪板子转移测试")
    print("9. 板子移动测试")
    print("0. 退出")
    print("===========================")

def run_test(choice):
    """根据用户选择运行测试"""
    # 先停止所有运行
    stop_all_runs()
    sleep(1)  # 等待一秒，确保所有运行都已停止
    
    if choice == '1':
        test_basic_pipetting()
    elif choice == '2':
        test_module_pipetting()
    elif choice == '3':
        test_magnetic_module_pipetting()
    elif choice == '4':
        test_multichannel_pipetting()
    elif choice == '5':
        test_thermocycler()
    elif choice == '6':
        test_thermocycler_with_plate_transfer()
    elif choice == '7':
        test_heater_shaker()
    elif choice == '8':
        test_heater_shaker_with_plate_transfer()
    elif choice == '9':
        test_move_labware()
    else:
        print("无效的选择")

def main():
    """主函数"""
    parser = argparse.ArgumentParser(description='OT-3机器人测试工具')
    parser.add_argument('--test', type=str, help='要运行的测试编号 (1-9)')
    parser.add_argument('--all', action='store_true', help='运行所有测试')
    
    args = parser.parse_args()
    
    if args.all:
        print("运行所有测试...")
        for i in range(1, 10):
            print(f"\n运行测试 {i}...")
            run_test(str(i))
            sleep(2)  # 测试之间等待2秒
        return
    
    if args.test:
        run_test(args.test)
        return
    
    # 交互式菜单
    while True:
        print_menu()
        choice = input("请选择要运行的测试 (0-9): ")
        
        if choice == '0':
            print("退出测试程序")
            break
        
        run_test(choice)
        input("\n按Enter键继续...")

if __name__ == "__main__":
    main() 