>> tutorial_optKnock_expanded_chinese
Could not find installation of dqqMinos, so it cannot be tested
Could not find installation of mosek, so it cannot be tested
Could not find installation of quadMinos, so it cannot be tested
Could not find installation of tomlab_snopt, so it cannot be tested
removing: D:\Professional\MATLAB\toolbox\cobratoolbox\src\analysis\thermo\componentContribution\new
removing: D:\Professional\MATLAB\toolbox\cobratoolbox\src\analysis\thermo\groupContribution\new
removing: D:\Professional\MATLAB\toolbox\cobratoolbox\src\analysis\thermo\inchi\new
removing: D:\Professional\MATLAB\toolbox\cobratoolbox\src\analysis\thermo\molFiles\new
removing: D:\Professional\MATLAB\toolbox\cobratoolbox\src\analysis\thermo\protons\new
removing: D:\Professional\MATLAB\toolbox\cobratoolbox\src\analysis\thermo\trainingModel\new

 > changeCobraSolver: Gurobi interface added to MATLAB path.
 > changeCobraSolver: Solver for LP problems has been set to gurobi.

 > changeCobraSolver: Gurobi interface added to MATLAB path.
 > changeCobraSolver: Solver for MILP problems has been set to gurobi.

 > changeCobraSolver: Gurobi interface added to MATLAB path.
 > changeCobraSolver: Solver for QP problems has been set to gurobi.

 > changeCobraSolver: Gurobi interface added to MATLAB path.
 > changeCobraSolver: Solver for MIQP problems has been set to gurobi.
 > changeCobraSolver: Solver gurobi not supported for problems of type CLP. No solver set for this problemtype 
 > changeCobraSolver: Solver gurobi not supported for problems of type EP. No solver set for this problemtype 
 > changeCobraSolver: Solver gurobi not supported for problems of type NLP. No solver set for this problemtype 
Each model.subSystems{x} is a character array, and this format is retained.
=== 基线分析 ===
野生型琥珀酸产量: 0.080 mmol/gDW/h
野生型生长速率: 0.242 h⁻¹
琥珀酸产率: 0.331 mmol/gDW

=== 反应集定义 ===
反应集1 (原始集): 37 个反应
反应集2 (TCA循环重点): 41 个反应
反应集3 (糖酵解优化): 41 个反应
反应集4 (最小集): 7 个反应
反应集5 (丙酮酸分流): 24 个反应
反应集6 (混合策略): 28 个反应
反应集7 (琥珀酸特异性): 15 个反应

=== 反应集1分析 (原始集) ===
  正在寻找解决方案 1...
  不包含字段的 struct。

警告: optProblem.F missing 
> 位置：optimizeCbModel (第 897 行)
位置: analyzeOptKnock (第 49 行)
位置: tutorial_optKnock_expanded_chinese>runOptKnockAnalysis (第 257 行)
位置: tutorial_optKnock_expanded_chinese (第 151 行) 
  不包含字段的 struct。

警告: optProblem.F missing 
> 位置：optimizeCbModel (第 897 行)
位置: analyzeOptKnock (第 56 行)
位置: tutorial_optKnock_expanded_chinese>runOptKnockAnalysis (第 257 行)
位置: tutorial_optKnock_expanded_chinese (第 151 行) 
  不包含字段的 struct。

警告: optProblem.F missing 
> 位置：optimizeCbModel (第 897 行)
位置: analyzeOptKnock (第 57 行)
位置: tutorial_optKnock_expanded_chinese>runOptKnockAnalysis (第 257 行)
位置: tutorial_optKnock_expanded_chinese (第 151 行) 
    找到敲除: PFL, RPI
    琥珀酸产量: 2.745 mmol/gDW/h
    生长速率: 0.139 h⁻¹
    提升倍数: 24.51x
  正在寻找解决方案 2...
  不包含字段的 struct。

警告: optProblem.F missing 
> 位置：optimizeCbModel (第 897 行)
位置: analyzeOptKnock (第 49 行)
位置: tutorial_optKnock_expanded_chinese>runOptKnockAnalysis (第 257 行)
位置: tutorial_optKnock_expanded_chinese (第 151 行) 
  不包含字段的 struct。

警告: optProblem.F missing 
> 位置：optimizeCbModel (第 897 行)
位置: analyzeOptKnock (第 56 行)
位置: tutorial_optKnock_expanded_chinese>runOptKnockAnalysis (第 257 行)
位置: tutorial_optKnock_expanded_chinese (第 151 行) 
  不包含字段的 struct。

警告: optProblem.F missing 
> 位置：optimizeCbModel (第 897 行)
位置: analyzeOptKnock (第 57 行)
位置: tutorial_optKnock_expanded_chinese>runOptKnockAnalysis (第 257 行)
位置: tutorial_optKnock_expanded_chinese (第 151 行) 
    找到敲除: PFL, TKT2
    琥珀酸产量: 1.679 mmol/gDW/h
    生长速率: 0.217 h⁻¹
    提升倍数: 14.99x
  正在寻找解决方案 3...
  不包含字段的 struct。

警告: optProblem.F missing 
> 位置：optimizeCbModel (第 897 行)
位置: analyzeOptKnock (第 49 行)
位置: tutorial_optKnock_expanded_chinese>runOptKnockAnalysis (第 257 行)
位置: tutorial_optKnock_expanded_chinese (第 151 行) 
  不包含字段的 struct。

警告: optProblem.F missing 
> 位置：optimizeCbModel (第 897 行)
位置: analyzeOptKnock (第 56 行)
位置: tutorial_optKnock_expanded_chinese>runOptKnockAnalysis (第 257 行)
位置: tutorial_optKnock_expanded_chinese (第 151 行) 
  不包含字段的 struct。

警告: optProblem.F missing 
> 位置：optimizeCbModel (第 897 行)
位置: analyzeOptKnock (第 57 行)
位置: tutorial_optKnock_expanded_chinese>runOptKnockAnalysis (第 257 行)
位置: tutorial_optKnock_expanded_chinese (第 151 行) 
    找到敲除: PFL, RPE
    琥珀酸产量: 1.443 mmol/gDW/h
    生长速率: 0.219 h⁻¹
    提升倍数: 12.88x
  原始集: 找到 3 个解决方案

=== 反应集2分析 (TCA循环重点) ===
  正在寻找解决方案 1...
  不包含字段的 struct。

警告: optProblem.F missing 
> 位置：optimizeCbModel (第 897 行)
位置: analyzeOptKnock (第 49 行)
位置: tutorial_optKnock_expanded_chinese>runOptKnockAnalysis (第 257 行)
位置: tutorial_optKnock_expanded_chinese (第 157 行) 
  不包含字段的 struct。

警告: optProblem.F missing 
> 位置：optimizeCbModel (第 897 行)
位置: analyzeOptKnock (第 56 行)
位置: tutorial_optKnock_expanded_chinese>runOptKnockAnalysis (第 257 行)
位置: tutorial_optKnock_expanded_chinese (第 157 行) 
  不包含字段的 struct。

警告: optProblem.F missing 
> 位置：optimizeCbModel (第 897 行)
位置: analyzeOptKnock (第 57 行)
位置: tutorial_optKnock_expanded_chinese>runOptKnockAnalysis (第 257 行)
位置: tutorial_optKnock_expanded_chinese (第 157 行) 
    找到敲除: ALCD2x, LDH_D, PFL
    琥珀酸产量: 8.809 mmol/gDW/h
    生长速率: 0.150 h⁻¹
    提升倍数: 78.65x
  正在寻找解决方案 2...
  不包含字段的 struct。

警告: optProblem.F missing 
> 位置：optimizeCbModel (第 897 行)
位置: analyzeOptKnock (第 49 行)
位置: tutorial_optKnock_expanded_chinese>runOptKnockAnalysis (第 257 行)
位置: tutorial_optKnock_expanded_chinese (第 157 行) 
  不包含字段的 struct。

警告: optProblem.F missing 
> 位置：optimizeCbModel (第 897 行)
位置: analyzeOptKnock (第 56 行)
位置: tutorial_optKnock_expanded_chinese>runOptKnockAnalysis (第 257 行)
位置: tutorial_optKnock_expanded_chinese (第 157 行) 
  不包含字段的 struct。

警告: optProblem.F missing 
> 位置：optimizeCbModel (第 897 行)
位置: analyzeOptKnock (第 57 行)
位置: tutorial_optKnock_expanded_chinese>runOptKnockAnalysis (第 257 行)
位置: tutorial_optKnock_expanded_chinese (第 157 行) 
    找到敲除: ACALD, LDH_D, PFL
    琥珀酸产量: 8.809 mmol/gDW/h
    生长速率: 0.150 h⁻¹
    提升倍数: 78.65x
  正在寻找解决方案 3...
  不包含字段的 struct。

警告: optProblem.F missing 
> 位置：optimizeCbModel (第 897 行)
位置: analyzeOptKnock (第 49 行)
位置: tutorial_optKnock_expanded_chinese>runOptKnockAnalysis (第 257 行)
位置: tutorial_optKnock_expanded_chinese (第 157 行) 
  不包含字段的 struct。

警告: optProblem.F missing 
> 位置：optimizeCbModel (第 897 行)
位置: analyzeOptKnock (第 56 行)
位置: tutorial_optKnock_expanded_chinese>runOptKnockAnalysis (第 257 行)
位置: tutorial_optKnock_expanded_chinese (第 157 行) 
  不包含字段的 struct。

警告: optProblem.F missing 
> 位置：optimizeCbModel (第 897 行)
位置: analyzeOptKnock (第 57 行)
位置: tutorial_optKnock_expanded_chinese>runOptKnockAnalysis (第 257 行)
位置: tutorial_optKnock_expanded_chinese (第 157 行) 
    找到敲除: G6PDH2r, PFL, RPI
    琥珀酸产量: 2.745 mmol/gDW/h
    生长速率: 0.139 h⁻¹
    提升倍数: 24.51x
  TCA循环重点: 找到 3 个解决方案

=== 反应集3分析 (糖酵解优化) ===
  正在寻找解决方案 1...
  不包含字段的 struct。

警告: optProblem.F missing 
> 位置：optimizeCbModel (第 897 行)
位置: analyzeOptKnock (第 49 行)
位置: tutorial_optKnock_expanded_chinese>runOptKnockAnalysis (第 257 行)
位置: tutorial_optKnock_expanded_chinese (第 163 行) 
  不包含字段的 struct。

警告: optProblem.F missing 
> 位置：optimizeCbModel (第 897 行)
位置: analyzeOptKnock (第 56 行)
位置: tutorial_optKnock_expanded_chinese>runOptKnockAnalysis (第 257 行)
位置: tutorial_optKnock_expanded_chinese (第 163 行) 
  不包含字段的 struct。

警告: optProblem.F missing 
> 位置：optimizeCbModel (第 897 行)
位置: analyzeOptKnock (第 57 行)
位置: tutorial_optKnock_expanded_chinese>runOptKnockAnalysis (第 257 行)
位置: tutorial_optKnock_expanded_chinese (第 163 行) 
    找到敲除: ALCD2x, LDH_D, PFL
    琥珀酸产量: 8.809 mmol/gDW/h
    生长速率: 0.150 h⁻¹
    提升倍数: 78.65x
  正在寻找解决方案 2...
  不包含字段的 struct。

警告: optProblem.F missing 
> 位置：optimizeCbModel (第 897 行)
位置: analyzeOptKnock (第 49 行)
位置: tutorial_optKnock_expanded_chinese>runOptKnockAnalysis (第 257 行)
位置: tutorial_optKnock_expanded_chinese (第 163 行) 
  不包含字段的 struct。

警告: optProblem.F missing 
> 位置：optimizeCbModel (第 897 行)
位置: analyzeOptKnock (第 56 行)
位置: tutorial_optKnock_expanded_chinese>runOptKnockAnalysis (第 257 行)
位置: tutorial_optKnock_expanded_chinese (第 163 行) 
  不包含字段的 struct。

警告: optProblem.F missing 
> 位置：optimizeCbModel (第 897 行)
位置: analyzeOptKnock (第 57 行)
位置: tutorial_optKnock_expanded_chinese>runOptKnockAnalysis (第 257 行)
位置: tutorial_optKnock_expanded_chinese (第 163 行) 
    找到敲除: ACALD, LDH_D, PFL
    琥珀酸产量: 8.809 mmol/gDW/h
    生长速率: 0.150 h⁻¹
    提升倍数: 78.65x
  正在寻找解决方案 3...
  不包含字段的 struct。

警告: optProblem.F missing 
> 位置：optimizeCbModel (第 897 行)
位置: analyzeOptKnock (第 49 行)
位置: tutorial_optKnock_expanded_chinese>runOptKnockAnalysis (第 257 行)
位置: tutorial_optKnock_expanded_chinese (第 163 行) 
  不包含字段的 struct。

警告: optProblem.F missing 
> 位置：optimizeCbModel (第 897 行)
位置: analyzeOptKnock (第 56 行)
位置: tutorial_optKnock_expanded_chinese>runOptKnockAnalysis (第 257 行)
位置: tutorial_optKnock_expanded_chinese (第 163 行) 
  不包含字段的 struct。

警告: optProblem.F missing 
> 位置：optimizeCbModel (第 897 行)
位置: analyzeOptKnock (第 57 行)
位置: tutorial_optKnock_expanded_chinese>runOptKnockAnalysis (第 257 行)
位置: tutorial_optKnock_expanded_chinese (第 163 行) 
    找到敲除: ALCD2x, PFL, RPI
    琥珀酸产量: 2.745 mmol/gDW/h
    生长速率: 0.139 h⁻¹
    提升倍数: 24.51x
  糖酵解优化: 找到 3 个解决方案

=== 反应集4分析 (最小集) ===
  正在寻找解决方案 1...
  不包含字段的 struct。

警告: optProblem.F missing 
> 位置：optimizeCbModel (第 897 行)
位置: analyzeOptKnock (第 49 行)
位置: tutorial_optKnock_expanded_chinese>runOptKnockAnalysis (第 257 行)
位置: tutorial_optKnock_expanded_chinese (第 169 行) 
  不包含字段的 struct。

警告: optProblem.F missing 
> 位置：optimizeCbModel (第 897 行)
位置: analyzeOptKnock (第 56 行)
位置: tutorial_optKnock_expanded_chinese>runOptKnockAnalysis (第 257 行)
位置: tutorial_optKnock_expanded_chinese (第 169 行) 
  不包含字段的 struct。

警告: optProblem.F missing 
> 位置：optimizeCbModel (第 897 行)
位置: analyzeOptKnock (第 57 行)
位置: tutorial_optKnock_expanded_chinese>runOptKnockAnalysis (第 257 行)
位置: tutorial_optKnock_expanded_chinese (第 169 行) 
    找到敲除: FUM, PYK
    琥珀酸产量: 0.286 mmol/gDW/h
    生长速率: 0.275 h⁻¹
    提升倍数: 2.56x
  正在寻找解决方案 2...
  不包含字段的 struct。

警告: optProblem.F missing 
> 位置：optimizeCbModel (第 897 行)
位置: analyzeOptKnock (第 49 行)
位置: tutorial_optKnock_expanded_chinese>runOptKnockAnalysis (第 257 行)
位置: tutorial_optKnock_expanded_chinese (第 169 行) 
  不包含字段的 struct。

警告: optProblem.F missing 
> 位置：optimizeCbModel (第 897 行)
位置: analyzeOptKnock (第 56 行)
位置: tutorial_optKnock_expanded_chinese>runOptKnockAnalysis (第 257 行)
位置: tutorial_optKnock_expanded_chinese (第 169 行) 
  不包含字段的 struct。

警告: optProblem.F missing 
> 位置：optimizeCbModel (第 897 行)
位置: analyzeOptKnock (第 57 行)
位置: tutorial_optKnock_expanded_chinese>runOptKnockAnalysis (第 257 行)
位置: tutorial_optKnock_expanded_chinese (第 169 行) 
    找到敲除: FUM, SUCOAS
    琥珀酸产量: 0.286 mmol/gDW/h
    生长速率: 0.275 h⁻¹
    提升倍数: 2.56x
  正在寻找解决方案 3...
  不包含字段的 struct。

警告: optProblem.F missing 
> 位置：optimizeCbModel (第 897 行)
位置: analyzeOptKnock (第 49 行)
位置: tutorial_optKnock_expanded_chinese>runOptKnockAnalysis (第 257 行)
位置: tutorial_optKnock_expanded_chinese (第 169 行) 
  不包含字段的 struct。

警告: optProblem.F missing 
> 位置：optimizeCbModel (第 897 行)
位置: analyzeOptKnock (第 56 行)
位置: tutorial_optKnock_expanded_chinese>runOptKnockAnalysis (第 257 行)
位置: tutorial_optKnock_expanded_chinese (第 169 行) 
  不包含字段的 struct。

警告: optProblem.F missing 
> 位置：optimizeCbModel (第 897 行)
位置: analyzeOptKnock (第 57 行)
位置: tutorial_optKnock_expanded_chinese>runOptKnockAnalysis (第 257 行)
位置: tutorial_optKnock_expanded_chinese (第 169 行) 
    找到敲除: FUM, LDH_D
    琥珀酸产量: 0.286 mmol/gDW/h
    生长速率: 0.275 h⁻¹
    提升倍数: 2.56x
  最小集: 找到 3 个解决方案

=== 反应集5分析 (丙酮酸分流) ===
  正在寻找解决方案 1...
  不包含字段的 struct。

警告: optProblem.F missing 
> 位置：optimizeCbModel (第 897 行)
位置: analyzeOptKnock (第 49 行)
位置: tutorial_optKnock_expanded_chinese>runOptKnockAnalysis (第 257 行)
位置: tutorial_optKnock_expanded_chinese (第 175 行) 
  不包含字段的 struct。

警告: optProblem.F missing 
> 位置：optimizeCbModel (第 897 行)
位置: analyzeOptKnock (第 56 行)
位置: tutorial_optKnock_expanded_chinese>runOptKnockAnalysis (第 257 行)
位置: tutorial_optKnock_expanded_chinese (第 175 行) 
  不包含字段的 struct。

警告: optProblem.F missing 
> 位置：optimizeCbModel (第 897 行)
位置: analyzeOptKnock (第 57 行)
位置: tutorial_optKnock_expanded_chinese>runOptKnockAnalysis (第 257 行)
位置: tutorial_optKnock_expanded_chinese (第 175 行) 
    找到敲除: ACALD, LDH_D, PFL
    琥珀酸产量: 8.809 mmol/gDW/h
    生长速率: 0.150 h⁻¹
    提升倍数: 78.65x
  正在寻找解决方案 2...
  不包含字段的 struct。

警告: optProblem.F missing 
> 位置：optimizeCbModel (第 897 行)
位置: analyzeOptKnock (第 49 行)
位置: tutorial_optKnock_expanded_chinese>runOptKnockAnalysis (第 257 行)
位置: tutorial_optKnock_expanded_chinese (第 175 行) 
  不包含字段的 struct。

警告: optProblem.F missing 
> 位置：optimizeCbModel (第 897 行)
位置: analyzeOptKnock (第 56 行)
位置: tutorial_optKnock_expanded_chinese>runOptKnockAnalysis (第 257 行)
位置: tutorial_optKnock_expanded_chinese (第 175 行) 
  不包含字段的 struct。

警告: optProblem.F missing 
> 位置：optimizeCbModel (第 897 行)
位置: analyzeOptKnock (第 57 行)
位置: tutorial_optKnock_expanded_chinese>runOptKnockAnalysis (第 257 行)
位置: tutorial_optKnock_expanded_chinese (第 175 行) 
    找到敲除: ALCD2x, LDH_D, PFL
    琥珀酸产量: 8.809 mmol/gDW/h
    生长速率: 0.150 h⁻¹
    提升倍数: 78.65x
  正在寻找解决方案 3...
  不包含字段的 struct。

警告: optProblem.F missing 
> 位置：optimizeCbModel (第 897 行)
位置: analyzeOptKnock (第 49 行)
位置: tutorial_optKnock_expanded_chinese>runOptKnockAnalysis (第 257 行)
位置: tutorial_optKnock_expanded_chinese (第 175 行) 
  不包含字段的 struct。

警告: optProblem.F missing 
> 位置：optimizeCbModel (第 897 行)
位置: analyzeOptKnock (第 56 行)
位置: tutorial_optKnock_expanded_chinese>runOptKnockAnalysis (第 257 行)
位置: tutorial_optKnock_expanded_chinese (第 175 行) 
  不包含字段的 struct。

警告: optProblem.F missing 
> 位置：optimizeCbModel (第 897 行)
位置: analyzeOptKnock (第 57 行)
位置: tutorial_optKnock_expanded_chinese>runOptKnockAnalysis (第 257 行)
位置: tutorial_optKnock_expanded_chinese (第 175 行) 
    找到敲除: ACALD, ALCD2x, PFL
    琥珀酸产量: 0.948 mmol/gDW/h
    生长速率: 0.223 h⁻¹
    提升倍数: 8.47x
  丙酮酸分流: 找到 3 个解决方案

=== 反应集6分析 (混合策略) ===
  正在寻找解决方案 1...
  不包含字段的 struct。

警告: optProblem.F missing 
> 位置：optimizeCbModel (第 897 行)
位置: analyzeOptKnock (第 49 行)
位置: tutorial_optKnock_expanded_chinese>runOptKnockAnalysis (第 257 行)
位置: tutorial_optKnock_expanded_chinese (第 181 行) 
  不包含字段的 struct。

警告: optProblem.F missing 
> 位置：optimizeCbModel (第 897 行)
位置: analyzeOptKnock (第 56 行)
位置: tutorial_optKnock_expanded_chinese>runOptKnockAnalysis (第 257 行)
位置: tutorial_optKnock_expanded_chinese (第 181 行) 
  不包含字段的 struct。

警告: optProblem.F missing 
> 位置：optimizeCbModel (第 897 行)
位置: analyzeOptKnock (第 57 行)
位置: tutorial_optKnock_expanded_chinese>runOptKnockAnalysis (第 257 行)
位置: tutorial_optKnock_expanded_chinese (第 181 行) 
    找到敲除: ALCD2x, LDH_D, PFL
    琥珀酸产量: 8.809 mmol/gDW/h
    生长速率: 0.150 h⁻¹
    提升倍数: 78.65x
  正在寻找解决方案 2...
  不包含字段的 struct。

警告: optProblem.F missing 
> 位置：optimizeCbModel (第 897 行)
位置: analyzeOptKnock (第 49 行)
位置: tutorial_optKnock_expanded_chinese>runOptKnockAnalysis (第 257 行)
位置: tutorial_optKnock_expanded_chinese (第 181 行) 
  不包含字段的 struct。

警告: optProblem.F missing 
> 位置：optimizeCbModel (第 897 行)
位置: analyzeOptKnock (第 56 行)
位置: tutorial_optKnock_expanded_chinese>runOptKnockAnalysis (第 257 行)
位置: tutorial_optKnock_expanded_chinese (第 181 行) 
  不包含字段的 struct。

警告: optProblem.F missing 
> 位置：optimizeCbModel (第 897 行)
位置: analyzeOptKnock (第 57 行)
位置: tutorial_optKnock_expanded_chinese>runOptKnockAnalysis (第 257 行)
位置: tutorial_optKnock_expanded_chinese (第 181 行) 
    找到敲除: ACALD, LDH_D, PFL
    琥珀酸产量: 8.809 mmol/gDW/h
    生长速率: 0.150 h⁻¹
    提升倍数: 78.65x
  正在寻找解决方案 3...
  不包含字段的 struct。

警告: optProblem.F missing 
> 位置：optimizeCbModel (第 897 行)
位置: analyzeOptKnock (第 49 行)
位置: tutorial_optKnock_expanded_chinese>runOptKnockAnalysis (第 257 行)
位置: tutorial_optKnock_expanded_chinese (第 181 行) 
  不包含字段的 struct。

警告: optProblem.F missing 
> 位置：optimizeCbModel (第 897 行)
位置: analyzeOptKnock (第 56 行)
位置: tutorial_optKnock_expanded_chinese>runOptKnockAnalysis (第 257 行)
位置: tutorial_optKnock_expanded_chinese (第 181 行) 
  不包含字段的 struct。

警告: optProblem.F missing 
> 位置：optimizeCbModel (第 897 行)
位置: analyzeOptKnock (第 57 行)
位置: tutorial_optKnock_expanded_chinese>runOptKnockAnalysis (第 257 行)
位置: tutorial_optKnock_expanded_chinese (第 181 行) 
    找到敲除: PFL, TKT2
    琥珀酸产量: 1.679 mmol/gDW/h
    生长速率: 0.217 h⁻¹
    提升倍数: 14.99x
  混合策略: 找到 3 个解决方案

=== 反应集7分析 (琥珀酸特异性) ===
  正在寻找解决方案 1...
  不包含字段的 struct。

警告: optProblem.F missing 
> 位置：optimizeCbModel (第 897 行)
位置: analyzeOptKnock (第 49 行)
位置: tutorial_optKnock_expanded_chinese>runOptKnockAnalysis (第 257 行)
位置: tutorial_optKnock_expanded_chinese (第 187 行) 
  不包含字段的 struct。

警告: optProblem.F missing 
> 位置：optimizeCbModel (第 897 行)
位置: analyzeOptKnock (第 56 行)
位置: tutorial_optKnock_expanded_chinese>runOptKnockAnalysis (第 257 行)
位置: tutorial_optKnock_expanded_chinese (第 187 行) 
  不包含字段的 struct。

警告: optProblem.F missing 
> 位置：optimizeCbModel (第 897 行)
位置: analyzeOptKnock (第 57 行)
位置: tutorial_optKnock_expanded_chinese>runOptKnockAnalysis (第 257 行)
位置: tutorial_optKnock_expanded_chinese (第 187 行) 
    找到敲除: MDH, ME2
    琥珀酸产量: 0.287 mmol/gDW/h
    生长速率: 0.275 h⁻¹
    提升倍数: 2.56x
  正在寻找解决方案 2...
  不包含字段的 struct。

警告: optProblem.F missing 
> 位置：optimizeCbModel (第 897 行)
位置: analyzeOptKnock (第 49 行)
位置: tutorial_optKnock_expanded_chinese>runOptKnockAnalysis (第 257 行)
位置: tutorial_optKnock_expanded_chinese (第 187 行) 
  不包含字段的 struct。

警告: optProblem.F missing 
> 位置：optimizeCbModel (第 897 行)
位置: analyzeOptKnock (第 56 行)
位置: tutorial_optKnock_expanded_chinese>runOptKnockAnalysis (第 257 行)
位置: tutorial_optKnock_expanded_chinese (第 187 行) 
  不包含字段的 struct。

警告: optProblem.F missing 
> 位置：optimizeCbModel (第 897 行)
位置: analyzeOptKnock (第 57 行)
位置: tutorial_optKnock_expanded_chinese>runOptKnockAnalysis (第 257 行)
位置: tutorial_optKnock_expanded_chinese (第 187 行) 
    找到敲除: FRD2, FUM
    琥珀酸产量: 0.286 mmol/gDW/h
    生长速率: 0.275 h⁻¹
    提升倍数: 2.56x
  正在寻找解决方案 3...
  不包含字段的 struct。

警告: optProblem.F missing 
> 位置：optimizeCbModel (第 897 行)
位置: analyzeOptKnock (第 49 行)
位置: tutorial_optKnock_expanded_chinese>runOptKnockAnalysis (第 257 行)
位置: tutorial_optKnock_expanded_chinese (第 187 行) 
  不包含字段的 struct。

警告: optProblem.F missing 
> 位置：optimizeCbModel (第 897 行)
位置: analyzeOptKnock (第 56 行)
位置: tutorial_optKnock_expanded_chinese>runOptKnockAnalysis (第 257 行)
位置: tutorial_optKnock_expanded_chinese (第 187 行) 
  不包含字段的 struct。

警告: optProblem.F missing 
> 位置：optimizeCbModel (第 897 行)
位置: analyzeOptKnock (第 57 行)
位置: tutorial_optKnock_expanded_chinese>runOptKnockAnalysis (第 257 行)
位置: tutorial_optKnock_expanded_chinese (第 187 行) 
    找到敲除: FUM, ME2
    琥珀酸产量: 0.286 mmol/gDW/h
    生长速率: 0.275 h⁻¹
    提升倍数: 2.56x
  琥珀酸特异性: 找到 3 个解决方案

=== 结果比较分析 ===

=== 反应集性能比较 ===
反应集             解决方案       敲除数        产量提升       琥珀酸产量           生长速率           
---------------------------------------------------------------------------
原始集             1          2          24.51      2.745           0.139          
原始集             2          2          14.99      1.679           0.217          
原始集             3          2          12.88      1.443           0.219          
TCA循环重点         1          3          78.65      8.809           0.150          
TCA循环重点         2          3          78.65      8.809           0.150          
TCA循环重点         3          3          24.51      2.745           0.139          
糖酵解优化           1          3          78.65      8.809           0.150          
糖酵解优化           2          3          78.65      8.809           0.150          
糖酵解优化           3          3          24.51      2.745           0.139          
最小集             1          2          2.56       0.286           0.275          
最小集             2          2          2.56       0.286           0.275          
最小集             3          2          2.56       0.286           0.275          
丙酮酸分流           1          3          78.65      8.809           0.150          
丙酮酸分流           2          3          78.65      8.809           0.150          
丙酮酸分流           3          3          8.47       0.948           0.223          
混合策略            1          3          78.65      8.809           0.150          
混合策略            2          3          78.65      8.809           0.150          
混合策略            3          2          14.99      1.679           0.217          
琥珀酸特异性          1          2          2.56       0.287           0.275          
琥珀酸特异性          2          2          2.56       0.286           0.275          
琥珀酸特异性          3          2          2.56       0.286           0.275          

图表已保存到 OptKnockResults_Expanded 文件夹

=== 原始集 详细结果 ===
找到 3 个解决方案:

解决方案 1:
  敲除反应: PFL, RPI
  敲除数量: 2
  琥珀酸产量: 2.745 mmol/gDW/h
  生长速率: 0.139 h⁻¹
  提升倍数: 24.51x
  耦合类型: growth coupled non unique
  最大生长速率: 0.117 h⁻¹
  产量范围: 0.039 - 2.313 mmol/gDW/h

解决方案 2:
  敲除反应: PFL, TKT2
  敲除数量: 2
  琥珀酸产量: 1.679 mmol/gDW/h
  生长速率: 0.217 h⁻¹
  提升倍数: 14.99x
  耦合类型: growth coupled non unique
  最大生长速率: 0.183 h⁻¹
  产量范围: 0.061 - 1.415 mmol/gDW/h

解决方案 3:
  敲除反应: PFL, RPE
  敲除数量: 2
  琥珀酸产量: 1.443 mmol/gDW/h
  生长速率: 0.219 h⁻¹
  提升倍数: 12.88x
  耦合类型: growth coupled non unique
  最大生长速率: 0.185 h⁻¹
  产量范围: 0.061 - 1.215 mmol/gDW/h


=== TCA循环重点 详细结果 ===
找到 3 个解决方案:

解决方案 1:
  敲除反应: ALCD2x, LDH_D, PFL
  敲除数量: 3
  琥珀酸产量: 8.809 mmol/gDW/h
  生长速率: 0.150 h⁻¹
  提升倍数: 78.65x
  耦合类型: growth coupled
  最大生长速率: 0.113 h⁻¹
  产量范围: 9.109 - 9.109 mmol/gDW/h

解决方案 2:
  敲除反应: ACALD, LDH_D, PFL
  敲除数量: 3
  琥珀酸产量: 8.809 mmol/gDW/h
  生长速率: 0.150 h⁻¹
  提升倍数: 78.65x
  耦合类型: growth coupled non unique
  最大生长速率: 0.113 h⁻¹
  产量范围: 4.234 - 9.109 mmol/gDW/h

解决方案 3:
  敲除反应: G6PDH2r, PFL, RPI
  敲除数量: 3
  琥珀酸产量: 2.745 mmol/gDW/h
  生长速率: 0.139 h⁻¹
  提升倍数: 24.51x
  耦合类型: growth coupled non unique
  最大生长速率: 0.117 h⁻¹
  产量范围: 0.039 - 2.313 mmol/gDW/h


=== 糖酵解优化 详细结果 ===
找到 3 个解决方案:

解决方案 1:
  敲除反应: ALCD2x, LDH_D, PFL
  敲除数量: 3
  琥珀酸产量: 8.809 mmol/gDW/h
  生长速率: 0.150 h⁻¹
  提升倍数: 78.65x
  耦合类型: growth coupled
  最大生长速率: 0.113 h⁻¹
  产量范围: 9.109 - 9.109 mmol/gDW/h

解决方案 2:
  敲除反应: ACALD, LDH_D, PFL
  敲除数量: 3
  琥珀酸产量: 8.809 mmol/gDW/h
  生长速率: 0.150 h⁻¹
  提升倍数: 78.65x
  耦合类型: growth coupled non unique
  最大生长速率: 0.113 h⁻¹
  产量范围: 4.234 - 9.109 mmol/gDW/h

解决方案 3:
  敲除反应: ALCD2x, PFL, RPI
  敲除数量: 3
  琥珀酸产量: 2.745 mmol/gDW/h
  生长速率: 0.139 h⁻¹
  提升倍数: 24.51x
  耦合类型: growth coupled non unique
  最大生长速率: 0.117 h⁻¹
  产量范围: 0.039 - 2.313 mmol/gDW/h


=== 最小集 详细结果 ===
找到 3 个解决方案:

解决方案 1:
  敲除反应: FUM, PYK
  敲除数量: 2
  琥珀酸产量: 0.286 mmol/gDW/h
  生长速率: 0.275 h⁻¹
  提升倍数: 2.56x
  耦合类型: growth coupled
  最大生长速率: 0.240 h⁻¹
  产量范围: 0.250 - 0.250 mmol/gDW/h

解决方案 2:
  敲除反应: FUM, SUCOAS
  敲除数量: 2
  琥珀酸产量: 0.286 mmol/gDW/h
  生长速率: 0.275 h⁻¹
  提升倍数: 2.56x
  耦合类型: growth coupled
  最大生长速率: 0.240 h⁻¹
  产量范围: 0.250 - 0.250 mmol/gDW/h

解决方案 3:
  敲除反应: FUM, LDH_D
  敲除数量: 2
  琥珀酸产量: 0.286 mmol/gDW/h
  生长速率: 0.275 h⁻¹
  提升倍数: 2.56x
  耦合类型: growth coupled
  最大生长速率: 0.240 h⁻¹
  产量范围: 0.250 - 0.250 mmol/gDW/h


=== 丙酮酸分流 详细结果 ===
找到 3 个解决方案:

解决方案 1:
  敲除反应: ACALD, LDH_D, PFL
  敲除数量: 3
  琥珀酸产量: 8.809 mmol/gDW/h
  生长速率: 0.150 h⁻¹
  提升倍数: 78.65x
  耦合类型: growth coupled non unique
  最大生长速率: 0.113 h⁻¹
  产量范围: 4.234 - 9.109 mmol/gDW/h

解决方案 2:
  敲除反应: ALCD2x, LDH_D, PFL
  敲除数量: 3
  琥珀酸产量: 8.809 mmol/gDW/h
  生长速率: 0.150 h⁻¹
  提升倍数: 78.65x
  耦合类型: growth coupled
  最大生长速率: 0.113 h⁻¹
  产量范围: 9.109 - 9.109 mmol/gDW/h

解决方案 3:
  敲除反应: ACALD, ALCD2x, PFL
  敲除数量: 3
  琥珀酸产量: 0.948 mmol/gDW/h
  生长速率: 0.223 h⁻¹
  提升倍数: 8.47x
  耦合类型: growth coupled non unique
  最大生长速率: 0.188 h⁻¹
  产量范围: 0.062 - 0.799 mmol/gDW/h


=== 混合策略 详细结果 ===
找到 3 个解决方案:

解决方案 1:
  敲除反应: ALCD2x, LDH_D, PFL
  敲除数量: 3
  琥珀酸产量: 8.809 mmol/gDW/h
  生长速率: 0.150 h⁻¹
  提升倍数: 78.65x
  耦合类型: growth coupled
  最大生长速率: 0.113 h⁻¹
  产量范围: 9.109 - 9.109 mmol/gDW/h

解决方案 2:
  敲除反应: ACALD, LDH_D, PFL
  敲除数量: 3
  琥珀酸产量: 8.809 mmol/gDW/h
  生长速率: 0.150 h⁻¹
  提升倍数: 78.65x
  耦合类型: growth coupled non unique
  最大生长速率: 0.113 h⁻¹
  产量范围: 4.234 - 9.109 mmol/gDW/h

解决方案 3:
  敲除反应: PFL, TKT2
  敲除数量: 2
  琥珀酸产量: 1.679 mmol/gDW/h
  生长速率: 0.217 h⁻¹
  提升倍数: 14.99x
  耦合类型: growth coupled non unique
  最大生长速率: 0.183 h⁻¹
  产量范围: 0.061 - 1.415 mmol/gDW/h


=== 琥珀酸特异性 详细结果 ===
找到 3 个解决方案:

解决方案 1:
  敲除反应: MDH, ME2
  敲除数量: 2
  琥珀酸产量: 0.287 mmol/gDW/h
  生长速率: 0.275 h⁻¹
  提升倍数: 2.56x
  耦合类型: growth coupled
  最大生长速率: 0.240 h⁻¹
  产量范围: 0.165 - 0.251 mmol/gDW/h

解决方案 2:
  敲除反应: FRD2, FUM
  敲除数量: 2
  琥珀酸产量: 0.286 mmol/gDW/h
  生长速率: 0.275 h⁻¹
  提升倍数: 2.56x
  耦合类型: growth coupled
  最大生长速率: 0.240 h⁻¹
  产量范围: 0.250 - 0.250 mmol/gDW/h

解决方案 3:
  敲除反应: FUM, ME2
  敲除数量: 2
  琥珀酸产量: 0.286 mmol/gDW/h
  生长速率: 0.275 h⁻¹
  提升倍数: 2.56x
  耦合类型: growth coupled
  最大生长速率: 0.240 h⁻¹
  产量范围: 0.250 - 0.250 mmol/gDW/h


=== 策略建议 ===
1. 最佳产量提升: [根据实际结果确定]
2. 最佳平衡方案: [根据实际结果确定]
3. 计算效率最高: [根据实际结果确定]
4. 实验可行性: [根据实际结果确定]
>> 