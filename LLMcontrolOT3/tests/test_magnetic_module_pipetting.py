import requests
import json

# 服务器URL
BASE_URL = "http://localhost:5000"  # 替换为你的服务器URL

def test_magnetic_module_pipetting():
    """测试从管架到磁性模块上的PCR板的转移"""
    url = f"{BASE_URL}/pipette"
    
    # 测试数据
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

if __name__ == "__main__":
    # 先停止所有运行
    try:
        requests.post(f"{BASE_URL}/stop-runs/")
        print("已停止所有运行")
    except Exception as e:
        print(f"停止运行时出错: {e}")
    
    # 测试磁性模块移液操作
    test_magnetic_module_pipetting() 