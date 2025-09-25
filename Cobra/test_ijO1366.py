#!/usr/bin/env python3
"""
测试iJO1366模型加载和基本功能
"""

import sys
import os
sys.path.insert(0, os.path.join(os.path.dirname(__file__), 'venv/lib/python3.13/site-packages'))

import cobra
import numpy as np
import pandas as pd
import matplotlib.pyplot as plt

def test_ijO1366_loading():
    """测试iJO1366模型加载"""
    print("=== 测试iJO1366模型加载 ===")

    model_path = "iJO1366.xml"

    try:
        print(f"正在加载 {model_path}...")
        model = cobra.io.read_sbml_model(model_path)
        print("✓ 成功加载iJO1366模型")

        print(f"模型名称: {model.id}")
        print(f"反应数量: {len(model.reactions)}")
        print(f"代谢物数量: {len(model.metabolites)}")
        print(f"基因数量: {len(model.genes)}")

        return True, model
    except Exception as e:
        print(f"✗ 加载模型失败: {e}")
        return False, None

def test_model_functionality(model):
    """测试模型基本功能"""
    print("\n=== 测试模型基本功能 ===")

    try:
        # 寻找生物质反应
        biomass_rxns = [rxn for rxn in model.reactions if "biomass" in rxn.id.lower()]
        if biomass_rxns:
            biomass_rxn = biomass_rxns[0]
            print(f"找到生物质反应: {biomass_rxn.id}")
        else:
            # 寻找可能的生物质反应
            for rxn in model.reactions:
                if rxn.objective_coefficient > 0:
                    biomass_rxn = rxn
                    break
            else:
                print("未找到生物质反应")
                return False

        # 设置目标并优化
        model.objective = biomass_rxn.id
        solution = model.optimize()

        print(f"✓ FBA优化成功")
        print(f"  目标值: {solution.objective_value:.4f}")
        print(f"  状态: {solution.status}")

        # 寻找琥珀酸相关反应
        succ_rxns = [rxn for rxn in model.reactions if "succ" in rxn.id.lower() and "EX_" in rxn.id]
        print(f"琥珀酸交换反应: {[rxn.id for rxn in succ_rxns]}")

        if succ_rxns:
            target_rxn = succ_rxns[0]
            succ_flux = solution.fluxes[target_rxn.id]
            print(f"琥珀酸生产通量: {succ_flux:.4f}")

        return True
    except Exception as e:
        print(f"✗ 模型功能测试失败: {e}")
        return False

def test_fva_analysis(model):
    """测试FVA分析"""
    print("\n=== 测试FVA分析 ===")

    try:
        from cobra.flux_analysis import flux_variability_analysis as FVA

        # 进行简化的FVA（只测试部分反应）
        print("进行FVA分析...")
        fva_result = FVA(model, fraction_of_optimum=0.9, loopless=False)

        print(f"✓ FVA完成，分析了 {len(fva_result)} 个反应")

        # 显示一些关键反应的变异性
        key_reactions = ['EX_glc__D_e', 'EX_o2_e', 'BIOMASS_Ec_iJO1366_core_53p95M']
        for rxn_id in key_reactions:
            if rxn_id in fva_result.index:
                row = fva_result.loc[rxn_id]
                print(f"{rxn_id}: [{row['minimum']:.3f}, {row['maximum']:.3f}]")

        return True
    except Exception as e:
        print(f"✗ FVA分析失败: {e}")
        return False

def main():
    """主测试函数"""
    print("iJO1366模型功能测试")
    print("=" * 40)

    # 测试模型加载
    success, model = test_ijO1366_loading()
    if not success:
        print("模型加载失败，退出测试")
        return False

    # 测试模型功能
    if not test_model_functionality(model):
        print("模型功能测试失败")
        return False

    # 测试FVA分析
    if not test_fva_analysis(model):
        print("FVA分析测试失败，但可以继续")

    print("\n" + "=" * 40)
    print("✓ iJO1366模型测试完成！")
    print("模型已准备好用于OptKnock分析")

    return True

if __name__ == "__main__":
    main()