import sys
import os
import requests
import json

# 添加项目根目录到Python路径
sys.path.append(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))

# 导入配置
from config.settings import SERVER_HOST, SERVER_PORT

# 服务器URL
BASE_URL = f"http://{SERVER_HOST}:{SERVER_PORT}"

def test_pipetting():
    """测试移液操作"""
    url = f"{BASE_URL}/pipette"
    
    # 基于实验设置创建测试数据
    data = {
        "source_wells": ["A1", "B1", "C1"],
        "dest_wells": ["A1", "B1", "C1"],
        "volumes": [50, 50, 50],
        # 从管架到PCR板的转移
        "source_labware_type": "opentrons_24_tuberack_eppendorf_1.5ml_safelock_snapcap",
        "dest_labware_type": "opentrons_96_wellplate_200ul_pcr_full_skirt",
        "source_slot": "B2",  # 管架位置
        "dest_slot": "D2",    # PCR板位置
        "pipette_type": "flex_1channel_1000",
        "tiprack_type": "opentrons_flex_96_tiprack_200ul",
        "tiprack_slot": "C3",
        "mount": "left"
    }
    
    try:
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

if __name__ == "__main__":
    # 先停止所有运行
    try:
        requests.post(f"{BASE_URL}/stop-runs/")
        print("已停止所有运行")
    except Exception as e:
        print(f"停止运行时出错: {e}")
    
    # 测试移液操作
    test_pipetting() 