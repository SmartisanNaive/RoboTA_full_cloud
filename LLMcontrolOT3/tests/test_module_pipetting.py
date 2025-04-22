import requests
import json

# 服务器URL
BASE_URL = "http://localhost:5000"  # 替换为你的服务器URL

def test_module_pipetting():
    """测试从PCR板到热震荡模块上的PCR板的转移"""
    url = f"{BASE_URL}/pipette"
    
    # 测试数据
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

if __name__ == "__main__":
    # 先停止所有运行
    try:
        requests.post(f"{BASE_URL}/stop-runs/")
        print("已停止所有运行")
    except Exception as e:
        print(f"停止运行时出错: {e}")
    
    # 测试模块间移液操作
    test_module_pipetting() 