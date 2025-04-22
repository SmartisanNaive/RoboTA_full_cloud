import requests
import json
import time

# 服务器URL
BASE_URL = "http://localhost:5000"  # 替换为你的服务器URL

def test_pipetting_scenario(scenario_name, data):
    """测试特定移液场景"""
    url = f"{BASE_URL}/pipette"
    
    try:
        print(f"\n===== 测试场景: {scenario_name} =====")
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
    
    # 场景1: 从管架到PCR板的转移
    scenario1_data = {
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
    test_pipetting_scenario("从管架到PCR板的转移", scenario1_data)
    
    # 等待一段时间，确保上一个操作完成
    time.sleep(2)
    stop_all_runs()
    time.sleep(2)
    
    # 场景2: 从PCR板到磁性模块上的PCR板
    scenario2_data = {
        "source_wells": ["A1", "A2"],
        "dest_wells": ["A1", "A2"],
        "volumes": [100, 100],
        "source_labware_type": "opentrons_96_wellplate_200ul_pcr_full_skirt",
        "dest_labware_type": "opentrons_96_wellplate_200ul_pcr_full_skirt",
        "source_slot": "D2",
        "dest_slot": "C1",  # 磁性模块位置
        "pipette_type": "flex_1channel_1000",
        "tiprack_type": "opentrons_flex_96_tiprack_200ul",
        "tiprack_slot": "C3",
        "mount": "right"
    }
    test_pipetting_scenario("从PCR板到磁性模块上的PCR板", scenario2_data)
    
    # 等待一段时间，确保上一个操作完成
    time.sleep(2)
    stop_all_runs()
    time.sleep(2)
    
    # 场景3: 从PCR板到加热震荡模块上的PCR板
    scenario3_data = {
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
    test_pipetting_scenario("从PCR板到加热震荡模块上的PCR板", scenario3_data)
    
    print("\n===== 所有测试场景完成 =====") 