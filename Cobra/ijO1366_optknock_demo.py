#!/usr/bin/env python3
"""
iJO1366模型OptKnock演示脚本
展示如何在完整的大肠杆菌基因组尺度模型上进行OptKnock分析
"""

import sys
import os
sys.path.insert(0, os.path.join(os.path.dirname(__file__), 'venv/lib/python3.13/site-packages'))

import cobra
import numpy as np
import pandas as pd
import matplotlib.pyplot as plt
from cobra.flux_analysis import flux_variability_analysis as FVA
import time

def load_ijO1366_model():
    """加载iJO1366模型"""
    print("正在加载iJO1366模型...")
    model = cobra.io.read_sbml_model("iJO1366.xml")
    print(f"✓ 成功加载模型: {model.id}")
    print(f"  反应数: {len(model.reactions)}")
    print(f"  代谢物数: {len(model.metabolites)}")
    print(f"  基因数: {len(model.genes)}")
    return model

def analyze_wild_type(model):
    """分析野生型菌株"""
    print("\n=== 野生型分析 ===")

    # 找到生物质反应
    biomass_rxn = None
    for rxn in model.reactions:
        if "BIOMASS" in rxn.id and "Ec_iJO1366" in rxn.id:
            biomass_rxn = rxn
            break

    if not biomass_rxn:
        print("未找到生物质反应")
        return None, None, None

    model.objective = biomass_rxn.id
    solution = model.optimize()

    print(f"生物质反应: {biomass_rxn.id}")
    print(f"生长速率: {solution.objective_value:.4f} h⁻¹")

    # 检查琥珀酸生产
    succ_flux = 0
    for rxn_id in solution.fluxes.index:
        if "succ" in rxn_id.lower() and "EX_" in rxn_id:
            succ_flux = solution.fluxes[rxn_id]
            print(f"琥珀酸生产 ({rxn_id}): {succ_flux:.6f} mmol/gDW/h")
            break

    # 关键通量分析
    print("\n关键通量:")
    key_reactions = ['EX_glc__D_e', 'EX_o2_e', 'ATPM']
    for rxn_id in key_reactions:
        if rxn_id in solution.fluxes.index:
            flux = solution.fluxes[rxn_id]
            print(f"  {rxn_id}: {flux:.4f}")

    return solution.objective_value, succ_flux, biomass_rxn.id

def intelligent_candidate_selection(model, target_reaction, biomass_reaction):
    """智能选择候选敲除反应"""
    print("\n=== 选择候选敲除反应 ===")

    candidates = []

    # 策略1: 竞争途径反应
    competing_pathways = []
    for rxn in model.reactions:
        if (rxn.id not in [target_reaction, biomass_reaction] and
            not rxn.id.startswith('EX_') and
            not rxn.id.startswith('BIOMASS') and
            'biomass' not in rxn.id.lower()):

            # 检查反应是否与中心代谢相关
            if any(keyword in rxn.id.lower() for keyword in
                   ['pgm', 'enol', 'pyk', 'pps', 'pyc', 'pdh', 'cs', 'acn', 'icd',
                    'akgd', 'suc', 'sdh', 'fum', 'mdh', 'ppc', 'pck', 'mez']):
                competing_pathways.append(rxn.id)

    # 策略2: 副产物形成反应
    byproduct_reactions = []
    for rxn in model.reactions:
        if (rxn.id not in [target_reaction, biomass_reaction] and
            any(keyword in rxn.id.lower() for keyword in
                ['acet', 'lac', 'for', 'eth', 'aco']) and
            'EX_' not in rxn.id):
            byproduct_reactions.append(rxn.id)

    # 策略3: TCA循环支路
    tca_branches = []
    for rxn in model.reactions:
        if (rxn.id not in [target_reaction, biomass_reaction] and
            any(keyword in rxn.id.lower() for keyword in
                ['icd', 'akg', 'suc', 'sdh', 'fum', 'mdh']) and
            'EX_' not in rxn.id):
            tca_branches.append(rxn.id)

    # 合并候选者并限制数量
    candidates = list(set(competing_pathways + byproduct_reactions + tca_branches))
    print(f"找到 {len(candidates)} 个候选敲除反应")

    # 显示候选反应类型
    print(f"  竞争途径: {len(competing_pathways)} 个")
    print(f"  副产物形成: {len(byproduct_reactions)} 个")
    print(f"  TCA循环支路: {len(tca_branches)} 个")

    return candidates[:50]  # 限制候选者数量

def efficient_optknock(model, target_reaction, biomass_reaction, candidates):
    """高效的OptKnock实现"""
    print(f"\n=== OptKnock分析 (测试 {len(candidates)} 个候选者) ===")

    results = []
    start_time = time.time()

    for i, rxn_id in enumerate(candidates):
        if i % 10 == 0:
            elapsed = time.time() - start_time
            print(f"进度: {i+1}/{len(candidates)} (耗时: {elapsed:.1f}s)")

        try:
            model_ko = model.copy()

            # 敲除反应
            reaction = model_ko.reactions.get_by_id(rxn_id)
            original_bounds = (reaction.lower_bound, reaction.upper_bound)
            reaction.bounds = (0, 0)

            # 测试生长可行性
            model_ko.objective = biomass_reaction
            growth_solution = model_ko.optimize()

            if growth_solution.objective_value > 0.01:  # 至少1%的生长
                # 测试生产
                model_ko.objective = target_reaction
                production_solution = model_ko.optimize()

                if production_solution.objective_value > 1e-6:
                    # 重新测试生长以确保准确性
                    model_ko.objective = biomass_reaction
                    final_growth = model_ko.optimize().objective_value

                    results.append({
                        'knockout': rxn_id,
                        'reaction_name': reaction.name,
                        'growth_rate': final_growth,
                        'production_rate': production_solution.objective_value,
                        'efficiency': production_solution.objective_value / max(final_growth, 1e-6)
                    })

        except Exception as e:
            continue

    elapsed = time.time() - start_time
    print(f"✓ OptKnock分析完成，耗时: {elapsed:.1f}s")
    print(f"找到 {len(results)} 个可行策略")

    return pd.DataFrame(results)

def analyze_results(results_df, baseline_growth, baseline_production):
    """分析OptKnock结果"""
    print("\n=== 结果分析 ===")

    if len(results_df) == 0:
        print("未找到可行的敲除策略")
        return

    # 按生产效率排序
    results_df = results_df.sort_values('efficiency', ascending=False)

    print("前10个最优策略:")
    for i, (_, row) in enumerate(results_df.head(10).iterrows()):
        growth_change = (row['growth_rate'] / baseline_growth - 1) * 100
        production_change = (row['production_rate'] / max(baseline_production, 1e-6) - 1) * 100

        print(f"{i+1:2d}. {row['knockout'][:20]:<20}")
        print(f"    生长: {row['growth_rate']:.4f} ({growth_change:+5.1f}%)")
        print(f"    生产: {row['production_rate']:.6f} ({production_change:+6.1f}%)")
        print(f"    效率: {row['efficiency']:.6f}")
        print()

    # 统计分析
    print("统计分析:")
    print(f"  平均生长速率: {results_df['growth_rate'].mean():.4f}")
    print(f"  平均生产速率: {results_df['production_rate'].mean():.6f}")
    print(f"  最高生产效率: {results_df['efficiency'].max():.6f}")
    print(f"  野生型比较 - 生长维持率: {(results_df['growth_rate'].mean() / baseline_growth * 100):.1f}%")

def create_visualization(results_df, baseline_growth, baseline_production):
    """创建结果可视化"""
    if len(results_df) == 0:
        return

    fig, ((ax1, ax2), (ax3, ax4)) = plt.subplots(2, 2, figsize=(15, 12))

    # 1. 生产 vs 生长散点图
    ax1.scatter(results_df['growth_rate'], results_df['production_rate'],
               alpha=0.6, s=50, c=results_df['efficiency'], cmap='viridis')
    ax1.axvline(x=baseline_growth, color='r', linestyle='--', alpha=0.7, label='野生型生长')
    ax1.axhline(y=baseline_production, color='r', linestyle='--', alpha=0.7, label='野生型生产')
    ax1.set_xlabel('生长速率 (h⁻¹)')
    ax1.set_ylabel('琥珀酸生产 (mmol/gDW/h)')
    ax1.set_title('生产 vs 生长速率')
    ax1.legend()
    ax1.grid(True, alpha=0.3)

    # 2. 生产效率前10名
    top_efficiency = results_df.nlargest(10, 'efficiency')
    bars = ax2.barh(range(len(top_efficiency)), top_efficiency['efficiency'])
    ax2.set_yticks(range(len(top_efficiency)))
    ax2.set_yticklabels([rxn[:15] for rxn in top_efficiency['knockout']], fontsize=8)
    ax2.set_xlabel('生产效率')
    ax2.set_title('生产效率前10名')
    ax2.grid(True, alpha=0.3)

    # 3. 生长速率分布
    ax3.hist(results_df['growth_rate'], bins=15, alpha=0.7, edgecolor='black')
    ax3.axvline(x=baseline_growth, color='r', linestyle='--', label='野生型')
    ax3.set_xlabel('生长速率 (h⁻¹)')
    ax3.set_ylabel('频数')
    ax3.set_title('生长速率分布')
    ax3.legend()
    ax3.grid(True, alpha=0.3)

    # 4. 生产改进分析
    if baseline_production > 0:
        improvement = (results_df['production_rate'] / baseline_production - 1) * 100
        ax4.scatter(results_df['growth_rate'], improvement,
                   alpha=0.6, s=50, c=results_df['efficiency'], cmap='viridis')
        ax4.axhline(y=0, color='r', linestyle='--', alpha=0.7, label='无改进')
        ax4.set_xlabel('生长速率 (h⁻¹)')
        ax4.set_ylabel('生产改进 (%)')
        ax4.set_title('生产改进分析')
        ax4.legend()
        ax4.grid(True, alpha=0.3)

    plt.tight_layout()
    plt.savefig('/Users/baice/Downloads/RoboTA/Cobra/ijO1366_optknock_results.png', dpi=300, bbox_inches='tight')
    plt.show()

def main():
    """主函数"""
    print("iJO1366 OptKnock 分析演示")
    print("=" * 50)

    # 加载模型
    try:
        model = load_ijO1366_model()
    except Exception as e:
        print(f"模型加载失败: {e}")
        return

    # 野生型分析
    baseline_growth, baseline_production, biomass_rxn = analyze_wild_type(model)
    if baseline_growth is None:
        return

    # 选择目标反应
    target_reaction = "EX_succ_e"  # 琥珀酸分泌反应
    print(f"\n目标反应: {target_reaction}")

    # 智能选择候选者
    candidates = intelligent_candidate_selection(model, target_reaction, biomass_rxn)

    # 执行OptKnock
    results_df = efficient_optknock(model, target_reaction, biomass_rxn, candidates)

    # 分析结果
    analyze_results(results_df, baseline_growth, baseline_production)

    # 可视化
    create_visualization(results_df, baseline_growth, baseline_production)

    print("\n" + "=" * 50)
    print("✓ iJO1366 OptKnock分析完成！")
    print("结果已保存为: ijO1366_optknock_results.png")

if __name__ == "__main__":
    main()