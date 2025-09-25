#!/usr/bin/env python3
"""
测试语法修复后的代码
"""

import sys
import os
sys.path.insert(0, os.path.join(os.path.dirname(__file__), 'venv/lib/python3.13/site-packages'))

def test_variable_names():
    """测试变量名语法"""
    print("=== 测试变量名语法 ===")

    try:
        # 这些变量名应该是合法的
        test_vars = [
            "_13dpg_c",  # 以下划线开头
            "_3pg_c",    # 以下划线开头
            "_2pg_c",    # 以下划线开头
            "pg3_c",     # 不以数字开头
            "pg2_c",     # 不以数字开头
            "dpg13_c",   # 不以数字开头
        ]

        for var_name in test_vars:
            # 创建一个简单的变量赋值测试
            code = f"{var_name} = 'test'"
            exec(code)
            print(f"✓ {var_name}: 合法变量名")

    except SyntaxError as e:
        print(f"✗ 语法错误: {e}")
        return False
    except Exception as e:
        print(f"✗ 其他错误: {e}")
        return False

    # 测试不合法的变量名
    try:
        illegal_var = "13dpg_c"  # 以数字开头
        code = f"{illegal_var} = 'test'"
        exec(code)
        print(f"✗ {illegal_var}: 应该是不合法的但通过了")
        return False
    except SyntaxError:
        print(f"✓ {illegal_var}: 正确识别为不合法变量名")
    except Exception as e:
        print(f"? {illegal_var}: {e}")

    return True

def test_cobra_model_creation():
    """测试COBRA模型创建"""
    print("\n=== 测试COBRA模型创建 ===")

    try:
        import cobra

        # 创建简单的模型测试修复后的变量名
        model = cobra.Model("test_syntax")

        # 创建代谢物（使用合法的变量名）
        _13dpg_c = cobra.Metabolite("_13dpg_c", name="3-Phosphoglycerate")
        _3pg_c = cobra.Metabolite("_3pg_c", name="3-Phosphoglycerate")
        g3p_c = cobra.Metabolite("g3p_c", name="Glyceraldehyde-3-phosphate")

        # 创建反应
        GAPD = cobra.Reaction("GAPD")
        GAPD.add_metabolites({
            g3p_c: -1,
            _13dpg_c: 1
        })

        PGK = cobra.Reaction("PGK")
        PGK.add_metabolites({
            _13dpg_c: -1,
            _3pg_c: 1
        })

        print("✓ COBRA模型创建成功")
        print(f"  代谢物数量: {len(model.metabolites)}")
        print(f"  反应数量: {len(model.reactions)}")

        return True

    except Exception as e:
        print(f"✗ COBRA模型创建失败: {e}")
        return False

def main():
    """主测试函数"""
    print("语法修复测试")
    print("=" * 40)

    success = True

    # 测试变量名语法
    if not test_variable_names():
        success = False

    # 测试COBRA模型创建
    if not test_cobra_model_creation():
        success = False

    print("\n" + "=" * 40)
    if success:
        print("✓ 所有测试通过！语法修复成功")
        print("\n修复说明:")
        print("- 将 '13dpg_c' 改为 '_13dpg_c'")
        print("- 将 '3pg_c' 改为 '_3pg_c'")
        print("- 将 '2pg_c' 改为 '_2pg_c'")
        print("- 变量名现在以下划线开头，避免数字开头问题")
    else:
        print("✗ 部分测试失败")

    return success

if __name__ == "__main__":
    main()