import requests
import json

# 服务器URL
BASE_URL = "http://localhost:5000"  # 替换为你的服务器URL

def test_pipetting():
    """测试移液操作"""
    url = f"{BASE_URL}/pipette"
    
    data = {
        "source_wells": ["A1", "B1", "C1"],
        "dest_wells": ["A2", "B2", "C2"],
        "volumes": [100, 100, 100],
        "source_labware_type": "corning_96_wellplate_360ul_flat",
        "dest_labware_type": "corning_96_wellplate_360ul_flat",
        "source_slot": 1,
        "dest_slot": 2,
        "pipette_type": "flex_1channel_1000",
        "tiprack_type": "opentrons_flex_96_tiprack_200ul",
        "tiprack_slot": 6,
        "mount": "right"
    }
    
    response = requests.post(url, json=data)
    print("Pipetting Response:", response.json())
    return response.json()

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
    
    response = requests.post(url, json=data)
    print("Thermocycler Response:", response.json())
    return response.json()

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
    
    response = requests.post(url, json=data)
    print("Heater-Shaker Response:", response.json())
    return response.json()

def test_move_plate_to_module():
    """测试将板子移动到模块上"""
    url = f"{BASE_URL}/heater-shaker"
    
    data = {
        "plate_type": "corning_96_wellplate_360ul_flat",
        "plate_source_type": "corning_96_wellplate_360ul_flat",
        "plate_source_slot": 5,
        "temperature": 37,
        "shake_speed": 500,
        "shake_duration": 60,
        "hold_time": 300,
        "deactivate_at_end": True
    }
    
    response = requests.post(url, json=data)
    print("Move Plate to Module Response:", response.json())
    return response.json()

if __name__ == "__main__":
    # 停止所有运行
    requests.post(f"{BASE_URL}/stop-runs/")
    
    # 测试移液操作
    test_pipetting()
    
    # 测试热循环仪
    # test_thermocycler()
    
    # 测试热震荡仪
    # test_heater_shaker()
    
    # 测试将板子移动到模块
    # test_move_plate_to_module() 