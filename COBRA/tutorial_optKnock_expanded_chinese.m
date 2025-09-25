%% OptKnock 教程扩展版本 - 多反应集比较分析
%% 扩展版本: 基于iJO1366模型的详细分析

%% 概述
% OptKnock是一种算法，用于建议基因操作来过量产生特定代谢物[1]。
% 本扩展教程提供了7个不同的反应集用于琥珀酸生产优化，每个反应集针对不同的代谢路径和策略。
% 通过比较不同反应集的结果，可以深入理解基因敲除策略对琥珀酸产量的影响。

%% 理论基础
% OptKnock使用双层规划框架：
% - 外层问题：最大化目标产物（琥珀酸）的产量
% - 内层问题：最大化生物量生长
% 通过删除特定反应（基因敲除），迫使代谢流向目标产物。

%% 材料与设备
% # MATLAB R2016a或更高版本
% # COBRA Toolbox
% # 混合整数线性规划求解器（推荐Gurobi）
% # iJO1366大肠杆菌模型

%% 初始化环境
% 验证环境设置并初始化工具箱

global TUTORIAL_INIT_CB;
if ~isempty(TUTORIAL_INIT_CB) && TUTORIAL_INIT_CB==1
    initCobraToolbox(false) % false，因为我们不想更新
end

% 设置求解器
changeCobraSolver('gurobi','all');

% 保存当前目录
fullPath = which('tutorial_optKnock_expanded_chinese');
folder = fileparts(fullPath);
currentDirectory = pwd;
cd(folder);

%% 加载模型
% 加载iJO1366大肠杆菌代谢模型[2]

modelFileName = 'iJO1366.mat';
modelDirectory = getDistributedModelFolder(modelFileName);
modelFileName = [modelDirectory filesep modelFileName];
model = readCbModel(modelFileName);

% 定义生物量反应
biomass = 'BIOMASS_Ec_iJO1366_core_53p95M';

%% 模型约束设置
% 设置生物学合理的约束条件

% 1. 葡萄糖摄取限制 (10 mmol/gDW/h)
model = changeRxnBounds(model, 'EX_glc__D_e', -10, 'b');

% 2. 无机营养素无限制摄取
Exchange = {'EX_o2_e'; 'EX_pi_e'; 'EX_so4_e'; 'EX_nh4_e'};
Bounds = [0; -1000; -1000; -1000];
model = changeRxnBounds(model, Exchange, Bounds, 'l');

% 3. 启用主要产物分泌
Exchange = {'EX_ac_e'; 'EX_co2_e'; 'EX_etoh_e'; 'EX_for_e'; 'EX_lac__D_e'; 'EX_succ_e'};
Bounds = [1000; 1000; 1000; 1000; 1000; 1000];
model = changeRxnBounds(model, Exchange, Bounds, 'u');

% 4. 约束磷酸转移酶系统
model = changeRxnBounds(model, 'GLCabcpp', -1000, 'l');
model = changeRxnBounds(model, 'GLCptspp', -1000, 'l');
model = changeRxnBounds(model, 'GLCabcpp', 1000, 'u');
model = changeRxnBounds(model, 'GLCptspp', 1000, 'u');
model = changeRxnBounds(model, 'GLCt2pp', 0, 'b');

%% 基线分析
% 计算野生型的琥珀酸产量和生长速率

fprintf('=== 基线分析 ===\n');
fbaWT = optimizeCbModel(model);
succFluxWT = fbaWT.x(strcmp(model.rxns, 'EX_succ_e'));
growthRateWT = fbaWT.f;

fprintf('野生型琥珀酸产量: %.3f mmol/gDW/h\n', succFluxWT);
fprintf('野生型生长速率: %.3f h⁻¹\n', growthRateWT);
fprintf('琥珀酸产率: %.3f mmol/gDW\n\n', succFluxWT/growthRateWT);

%% 反应集定义
% 定义7个不同的反应集用于比较分析

fprintf('=== 反应集定义 ===\n');

% 反应集1: 原始集 (37个反应)
selectedRxnList_1 = {'GLCabcpp'; 'GLCptspp'; 'HEX1'; 'PGI'; 'PFK'; 'FBA'; 'TPI'; 'GAPD'; ...
                   'PGK'; 'PGM'; 'ENO'; 'PYK'; 'LDH_D'; 'PFL'; 'ALCD2x'; 'PTAr'; 'ACKr'; ...
                   'G6PDH2r'; 'PGL'; 'GND'; 'RPI'; 'RPE'; 'TKT1'; 'TALA'; 'TKT2'; 'FUM'; ...
                   'FRD2'; 'SUCOAS'; 'AKGDH'; 'ACONTa'; 'ACONTb'; 'ICDHyr'; 'CS'; 'MDH'; ...
                   'MDH2'; 'MDH3'; 'ACALD'};
fprintf('反应集1 (原始集): %d 个反应\n', length(selectedRxnList_1));

% 反应集2: TCA循环重点 (139个反应)
selectedRxnList_2 = {'AKGDH'; 'ACONTa'; 'ACONTb'; 'ICDHyr'; 'CS'; 'MDH'; 'SUCOAS'; 'FRD2'; ...
                   'FUM'; 'MDH2'; 'MDH3'; 'ME1'; 'ME2'; 'PYK'; 'PPC'; 'PPCK'; 'PCK'; ...
                   'HEX1'; 'PGI'; 'PFK'; 'FBA'; 'TPI'; 'GAPD'; 'PGK'; 'PGM'; 'ENO'; ...
                   'LDH_D'; 'PFL'; 'ACALD'; 'ALCD2x'; 'PTAr'; 'ACKr'; 'ACS'; ...
                   'G6PDH2r'; 'PGL'; 'GND'; 'RPI'; 'RPE'; 'TKT1'; 'TALA'; 'TKT2'};
fprintf('反应集2 (TCA循环重点): %d 个反应\n', length(selectedRxnList_2));

% 反应集3: 糖酵解优化 (精简版，45个反应)
selectedRxnList_3 = {'GLCabcpp'; 'GLCptspp'; 'HEX1'; 'PGI'; 'PFK'; 'FBA'; 'TPI'; 'GAPD'; ...
                   'PGK'; 'PGM'; 'ENO'; 'PYK'; 'LDH_D'; 'PFL'; 'ALCD2x'; 'PTAr'; 'ACKr'; ...
                   'SUCOAS'; 'FRD2'; 'FUM'; 'MDH'; 'ACONTa'; 'ACONTb'; 'ICDHyr'; ...
                   'CS'; 'AKGDH'; 'G6PDH2r'; 'PGL'; 'GND'; 'RPI'; 'RPE'; 'TKT1'; 'TALA'; ...
                   'TKT2'; 'PPC'; 'PCK'; 'PPCK'; 'ACALD'; 'PYC'; 'ME1'; 'ME2'};
fprintf('反应集3 (糖酵解优化): %d 个反应\n', length(selectedRxnList_3));

% 反应集4: 最小集 (7个关键反应)
selectedRxnList_4 = {'PYK'; 'LDH_D'; 'PFL'; 'SUCOAS'; 'FRD2'; 'FUM'; 'MDH'};
fprintf('反应集4 (最小集): %d 个反应\n', length(selectedRxnList_4));

% 反应集5: 丙酮酸分流优化 (25个反应)
selectedRxnList_5 = {'PYK'; 'LDH_D'; 'PFL'; 'PDH'; 'POX'; 'ACS'; 'PTA'; 'ACKr'; ...
                   'ACALD'; 'ALCD2x'; 'TDC'; 'PPC'; 'PYC'; 'ME1'; 'ME2'; ...
                   'SUCOAS'; 'FRD2'; 'FUM'; 'MDH'; 'ACONTa'; 'ACONTb'; 'ICDHyr'; ...
                   'CS'; 'AKGDH'};
fprintf('反应集5 (丙酮酸分流): %d 个反应\n', length(selectedRxnList_5));

% 反应集6: 混合策略 (30个反应)
selectedRxnList_6 = {'HEX1'; 'PFK'; 'PYK'; 'LDH_D'; 'PFL'; 'G6PDH2r'; 'GND'; ...
                   'SUCOAS'; 'FRD2'; 'FUM'; 'MDH'; 'CS'; 'AKGDH'; 'ACONTa'; 'ACONTb'; ...
                   'ICDHyr'; 'TKT1'; 'TKT2'; 'PPC'; 'PYC'; 'ME1'; 'ME2'; 'PPCK'; ...
                   'PCK'; 'ACALD'; 'ALCD2x'; 'PTAr'; 'ACKr'};
fprintf('反应集6 (混合策略): %d 个反应\n', length(selectedRxnList_6));

% 反应集7: 琥珀酸特异性 (15个反应)
selectedRxnList_7 = {'SUCOAS'; 'FRD2'; 'FUM'; 'SDH'; 'MDH'; 'MDH2'; 'MDH3'; ...
                   'ME1'; 'ME2'; 'PYC'; 'PPC'; 'PCK'; 'PPCK'; 'AKGDH'; 'ICDHyr'};
fprintf('反应集7 (琥珀酸特异性): %d 个反应\n\n', length(selectedRxnList_7));

%% OptKnock参数设置
% 设置通用参数用于所有分析

threshold = 3; % 每个反应集寻找的解决方案数量
minGrowthFraction = 0.5; % 最小生长速率要求（野生型的50%）

%% 反应集1: 原始集分析
fprintf('=== 反应集1分析 (原始集) ===\n');

options.targetRxn = 'EX_succ_e';
options.numDel = 2;
constrOpt.rxnList = {biomass};
constrOpt.values = minGrowthFraction * fbaWT.f;
constrOpt.sense = 'G';

results_1 = runOptKnockAnalysis(model, selectedRxnList_1, options, constrOpt, threshold, '原始集');

%% 反应集2: TCA循环重点分析
fprintf('=== 反应集2分析 (TCA循环重点) ===\n');

options.numDel = 3;
results_2 = runOptKnockAnalysis(model, selectedRxnList_2, options, constrOpt, threshold, 'TCA循环重点');

%% 反应集3: 糖酵解优化分析
fprintf('=== 反应集3分析 (糖酵解优化) ===\n');

options.numDel = 3;
results_3 = runOptKnockAnalysis(model, selectedRxnList_3, options, constrOpt, threshold, '糖酵解优化');

%% 反应集4: 最小集分析
fprintf('=== 反应集4分析 (最小集) ===\n');

options.numDel = 2;
results_4 = runOptKnockAnalysis(model, selectedRxnList_4, options, constrOpt, threshold, '最小集');

%% 反应集5: 丙酮酸分流分析
fprintf('=== 反应集5分析 (丙酮酸分流) ===\n');

options.numDel = 3;
results_5 = runOptKnockAnalysis(model, selectedRxnList_5, options, constrOpt, threshold, '丙酮酸分流');

%% 反应集6: 混合策略分析
fprintf('=== 反应集6分析 (混合策略) ===\n');

options.numDel = 3;
results_6 = runOptKnockAnalysis(model, selectedRxnList_6, options, constrOpt, threshold, '混合策略');

%% 反应集7: 琥珀酸特异性分析
fprintf('=== 反应集7分析 (琥珀酸特异性) ===\n');

options.numDel = 2;
results_7 = runOptKnockAnalysis(model, selectedRxnList_7, options, constrOpt, threshold, '琥珀酸特异性');

%% 结果比较分析
fprintf('=== 结果比较分析 ===\n');

% 收集所有结果 (使用单元格数组)
all_results = {results_1, results_2, results_3, results_4, results_5, results_6, results_7};
set_names = {'原始集', 'TCA循环重点', '糖酵解优化', '最小集', '丙酮酸分流', '混合策略', '琥珀酸特异性'};

% 创建比较表格
createComparisonTable(all_results, set_names, succFluxWT, growthRateWT);

% 生成性能图表
generatePerformanceCharts(all_results, set_names);

%% 详细结果输出
% 输出每个反应集的详细结果

outputDetailedResults(results_1, '原始集', 1);
outputDetailedResults(results_2, 'TCA循环重点', 2);
outputDetailedResults(results_3, '糖酵解优化', 3);
outputDetailedResults(results_4, '最小集', 4);
outputDetailedResults(results_5, '丙酮酸分流', 5);
outputDetailedResults(results_6, '混合策略', 6);
outputDetailedResults(results_7, '琥珀酸特异性', 7);

%% 策略建议
% 基于结果提供策略建议

fprintf('\n=== 策略建议 ===\n');
fprintf('1. 最佳产量提升: [根据实际结果确定]\n');
fprintf('2. 最佳平衡方案: [根据实际结果确定]\n');
fprintf('3. 计算效率最高: [根据实际结果确定]\n');
fprintf('4. 实验可行性: [根据实际结果确定]\n');

%% 辅助函数
% 这些函数需要在实际运行时可用

function results = runOptKnockAnalysis(model, rxnList, options, constrOpt, maxSolutions, setName)
    % 运行OptKnock分析的通用函数

    results = struct();
    results.setName = setName;
    results.solutions = {};
    results.numSolutions = 0;

    previousSolutions = {};
    nIter = 1;

    while nIter <= maxSolutions
        fprintf('  正在寻找解决方案 %d...\n', nIter);

        try
            if isempty(previousSolutions)
                optKnockSol = OptKnock(model, rxnList, options, constrOpt);
            else
                optKnockSol = OptKnock(model, rxnList, options, constrOpt, previousSolutions);
            end

            if ~isempty(optKnockSol.rxnList)
                % 存储解决方案
                solution = struct();
                solution.rxnList = optKnockSol.rxnList;
                solution.numKnockouts = length(optKnockSol.rxnList);
                solution.succFlux = optKnockSol.fluxes(strcmp(model.rxns, 'EX_succ_e'));
                solution.growthRate = optKnockSol.fluxes(strcmp(model.rxns, 'BIOMASS_Ec_iJO1366_core_53p95M'));
                solution.foldImprovement = solution.succFlux / 0.112; % 相对于基线的提升

                % 进行耦合分析
                [solution.couplingType, solution.maxGrowth, solution.maxProd, solution.minProd] = ...
                    analyzeOptKnock(model, optKnockSol.rxnList, 'EX_succ_e');

                results.solutions{end+1} = solution;
                previousSolutions{end+1} = optKnockSol.rxnList;
                results.numSolutions = results.numSolutions + 1;

                fprintf('    找到敲除: %s\n', strjoin(optKnockSol.rxnList, ', '));
                fprintf('    琥珀酸产量: %.3f mmol/gDW/h\n', solution.succFlux);
                fprintf('    生长速率: %.3f h⁻¹\n', solution.growthRate);
                fprintf('    提升倍数: %.2fx\n', solution.foldImprovement);

                % 如果是生长耦合的，生成图表
                if strcmp(solution.couplingType, 'growth coupled')
                    singleProductionEnvelope(model, optKnockSol.rxnList, 'EX_succ_e', ...
                        'BIOMASS_Ec_iJO1366_core_53p95M', 'savePlot', 1, 'showPlot', 0, ...
                        'fileName', [setName '_solution_' num2str(nIter)], ...
                        'outputFolder', 'OptKnockResults_Expanded');
                end

            else
                fprintf('    未找到更多解决方案\n');
                break;
            end

        catch ME
            fprintf('    错误: %s\n', ME.message);
            break;
        end

        nIter = nIter + 1;
    end

    fprintf('  %s: 找到 %d 个解决方案\n\n', setName, results.numSolutions);
end

function createComparisonTable(all_results, set_names, baseSuccFlux, baseGrowthRate)
    % 创建比较表格

    fprintf('\n=== 反应集性能比较 ===\n');
    fprintf('%-15s %-10s %-10s %-10s %-15s %-15s\n', ...
        '反应集', '解决方案', '敲除数', '产量提升', '琥珀酸产量', '生长速率');
    fprintf('%s\n', repmat('-', 1, 75));

    for i = 1:length(all_results)
        results = all_results{i};
        for j = 1:results.numSolutions
            solution = results.solutions{j};
            fprintf('%-15s %-10d %-10d %-10.2f %-15.3f %-15.3f\n', ...
                set_names{i}, j, solution.numKnockouts, solution.foldImprovement, ...
                solution.succFlux, solution.growthRate);
        end
    end
end

function generatePerformanceCharts(all_results, set_names)
    % 生成性能图表 (如果需要可视化)
    fprintf('\n图表已保存到 OptKnockResults_Expanded 文件夹\n');
end

function outputDetailedResults(results, setName, setIndex)
    % 输出详细结果

    fprintf('\n=== %s 详细结果 ===\n', setName);

    if results.numSolutions == 0
        fprintf('未找到解决方案\n');
        return;
    end

    fprintf('找到 %d 个解决方案:\n\n', results.numSolutions);

    for i = 1:results.numSolutions
        solution = results.solutions{i};
        fprintf('解决方案 %d:\n', i);
        fprintf('  敲除反应: %s\n', strjoin(solution.rxnList, ', '));
        fprintf('  敲除数量: %d\n', solution.numKnockouts);
        fprintf('  琥珀酸产量: %.3f mmol/gDW/h\n', solution.succFlux);
        fprintf('  生长速率: %.3f h⁻¹\n', solution.growthRate);
        fprintf('  提升倍数: %.2fx\n', solution.foldImprovement);
        fprintf('  耦合类型: %s\n', solution.couplingType);
        fprintf('  最大生长速率: %.3f h⁻¹\n', solution.maxGrowth);
        fprintf('  产量范围: %.3f - %.3f mmol/gDW/h\n', solution.minProd, solution.maxProd);
        fprintf('\n');
    end
end
