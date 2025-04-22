"""
测试优化后的提示词处理效果
"""

import sys
import os
import json

# 添加项目根目录到Python路径
sys.path.append(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))

from ai_interface.llm_controller import LLMController

def test_plate_movement():
    """测试板子移动指令解析"""
    controller = LLMController()
    
    # 测试用例
    test_cases = [
        "帮我把板子从C2移动到B3",
        "将PCR板从A1位置移到D3位置",
        "把corning_96_wellplate_360ul_flat板子从B2转移到C1"
    ]
    
    print("===== 测试板子移动指令 =====")
    for case in test_cases:
        print(f"\n输入: {case}")
        result = controller.process_command(case)
        print(f"输出: {json.dumps(result, indent=2, ensure_ascii=False)}")

def test_pipetting():
    """测试移液指令解析"""
    controller = LLMController()
    
    # 测试用例
    test_cases = [
        "将A1孔的100微升样本转移到B1孔",
        "从A1、B1、C1孔分别取50微升样本转移到D1、E1、F1孔",
        "使用8通道移液器，从A1-H1转移200微升到A2-H2，使用B2板子到D2板子"
    ]
    
    print("\n===== 测试移液指令 =====")
    for case in test_cases:
        print(f"\n输入: {case}")
        result = controller.process_command(case)
        print(f"输出: {json.dumps(result, indent=2, ensure_ascii=False)}")

def test_thermocycler():
    """测试热循环仪指令解析"""
    controller = LLMController()
    
    # 测试用例
    test_cases = [
        "设置热循环仪温度为95度，保持30秒",
        "热循环仪程序：95℃变性30秒，55℃退火30秒，72℃延伸60秒，循环35次",
        "PCR程序：98℃预变性3分钟，然后30个循环(98℃变性10秒，60℃退火30秒，72℃延伸30秒)，最后72℃延伸5分钟"
    ]
    
    print("\n===== 测试热循环仪指令 =====")
    for case in test_cases:
        print(f"\n输入: {case}")
        result = controller.process_command(case)
        print(f"输出: {json.dumps(result, indent=2, ensure_ascii=False)}")

def test_heater_shaker():
    """测试热震荡仪指令解析"""
    controller = LLMController()
    
    # 测试用例
    test_cases = [
        "将热震荡仪设置为37℃，500rpm震荡",
        "热震荡仪37度，200rpm震荡15分钟"
    ]
    
    print("\n===== 测试热震荡仪指令 =====")
    for case in test_cases:
        print(f"\n输入: {case}")
        result = controller.process_command(case)
        print(f"输出: {json.dumps(result, indent=2, ensure_ascii=False)}")

if __name__ == "__main__":
    # 运行所有测试
    test_plate_movement()
    test_pipetting()
    test_thermocycler()
    test_heater_shaker() 