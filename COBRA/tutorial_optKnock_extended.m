%% OptKnock 综合分析教程
%% 基于 tutorial_optKnock.m 的扩展版本
%% 作者：基于 Sebastián N. Mendoza 的原始代码
%% 修改为中文注释并添加更多比较分析

%% *反应集合设计说明：*
% 本程序中的反应集合是基于对iJO1366.csv文件的分析而精心设计的。
% 通过分析CSV文件中的反应信息，我们将反应分为以下4个功能类别：
%
% 1. 中心碳代谢关键反应：
%    - 包含糖酵解、TCA循环和回补反应的核心反应
%    - 参考反应：HEX1, PFK, FBA, GAPD, PYK, PDH, CS, ACONTa/b, ICDHyr, AKGDH, SUCOAS等
%    - 这些反应构成代谢网络的主干，影响整体的碳流分配
%
% 2. TCA循环和琥珀酸合成路径：
%    - 专注于与琥珀酸直接相关的反应
%    - 包括正向TCA循环（SUCOAS, SDH）和还原性琥珀酸合成（FRD2, FRD3）
%    - 以及回补反应（PPC, PPCK, PCK, PPS）和苹果酸酶（ME1, ME2）
%
% 3. 糖酵解和发酵竞争路径：
%    - 葡萄糖摄取系统（GLCabcpp, GLCptspp）
%    - 竞争性发酵产物合成路径（LDH_D, PFL, ALCD2x, PTAr, ACKr）
%    - 这些反应与琥珀酸生产竞争碳源和还原力
%
% 4. 磷酸戊糖途径和氧化还原平衡：
%    - PPP途径反应（G6PDH2r, GND, TKT1, TALA, TKT2）
%    - 影响NADPH/NADH平衡的脱氢酶（MDH2, MDH3, NDH2, GLUDy/x）
%    - 这些反应影响细胞的还原力状态，进而影响琥珀酸合成
%
% 注意：虽然反应集合的设计参考了iJO1366.csv文件的信息，
% 但在最终代码中直接使用预设的反应集合，不调用外部CSV文件。

%% *简介：*
% OptKnock 是一种算法，用于建议基因操作以过度生产指定的代谢产物。
% 该算法指出哪些反应需要从代谢网络中删除（即删除与这些反应相关的基因），
% 以获得比野生型菌株更高生产率的特定目标产物。
%
% 本教程将比较不同条件下的敲除策略，包括：
% 1. 不同葡萄糖摄取量
% 2. 是否启用乙酸盐、二氧化碳、乙醇、甲酸盐、乳酸盐和琥珀酸盐等分泌
% 3. 不同反应列表下的敲除
% 4. 原始tutorial_optKnock.m方案重现和验证
% 5. 综合比较所有方案的优势
%
% 注意：以下反应集合基于iJO1366.csv文件中的反应信息进行分类和组织，
% 但在代码中直接使用预设的反应集合，不调用外部CSV文件。

%% 所需材料与设备
%%
% # MATLAB
% # 混合整数线性规划（MILP）问题求解器。使用changeCobraSolver选择MILP问题的求解器（如Gurobi）
% # COBRA Toolbox

%% 程序步骤
% 程序包括以下步骤：
%
% 1) 加载和约束模型
% 2) 定义用于搜索敲除的反应集合
% 3) 定义要删除的反应数量、目标反应和一些约束条件
% 4) 运行optKnock算法
% 5) 比较不同方案的结果

%% 初始化环境
% 确保cobratoolbox已初始化并且求解器已设置

initCobraToolbox

% 设置求解器
changeCobraSolver('gurobi','all')
fullPath = which('tutorial_optKnock_extended');
folder = fileparts(fullPath);
currectDirectory = pwd;
cd(folder);

%% 加载E. coli模型
% 使用iJO1366模型

modelFileName = 'iJO1366.mat'
modelDirectory = getDistributedModelFolder(modelFileName) % 查找分布式模型的文件夹
modelFileName= [modelDirectory filesep modelFileName] % 获取完整路径
model = readCbModel(modelFileName)

% 定义生物质反应
biomass = 'BIOMASS_Ec_iJO1366_core_53p95M';

%% 定义基本参数
% 定义要找到的最大解数量（即可删除反应的最大数量）

threshold = 10; % 增加阈值以获得更多方案

%% 方案一：不同葡萄糖摄取量的比较
fprintf('\n=== 方案一：不同葡萄糖摄取量的比较 ===\n');

% 定义不同的葡萄糖摄取量
glucoseUptakeRates = [5, 10, 15, 20]; % mmol/grDW*hr
resultsGlucose = struct();

for i = 1:length(glucoseUptakeRates)
    glucoseUptake = glucoseUptakeRates(i);
    fprintf('\n--- 葡萄糖摄取量: %d mmol/grDW*hr ---\n', glucoseUptake);

    % 创建模型副本
    modelCurrent = model;

    % 设置葡萄糖摄取量
    modelCurrent = changeRxnBounds(modelCurrent, 'EX_glc__D_e', -glucoseUptake, 'b');

    % 设置基本约束
    % 无约束的无机磷酸盐、硫酸盐和氨摄取路径
    Exchange={'EX_o2_e';'EX_pi_e';'EX_so4_e'; 'EX_nh4_e'};
    Bounds=[0;-1000;-1000;-1000];
    modelCurrent = changeRxnBounds(modelCurrent, Exchange, Bounds, 'l');

    % 启用乙酸盐、二氧化碳、乙醇、甲酸盐、乳酸盐和琥珀酸盐的分泌路径
    Exchange={'EX_ac_e';'EX_co2_e';'EX_etoh_e';'EX_for_e';'EX_lac__D_e';'EX_succ_e'};
    Bounds=[1000;1000;1000;1000;1000;1000];
    modelCurrent = changeRxnBounds(modelCurrent, Exchange, Bounds, 'u');

    % 约束磷酸转移酶系统
    modelCurrent = changeRxnBounds(modelCurrent, 'GLCabcpp', -1000, 'l');
    modelCurrent = changeRxnBounds(modelCurrent, 'GLCptspp', -1000, 'l');
    modelCurrent = changeRxnBounds(modelCurrent, 'GLCabcpp', 1000, 'u');
    modelCurrent = changeRxnBounds(modelCurrent, 'GLCptspp', 1000, 'u');
    modelCurrent = changeRxnBounds(modelCurrent, 'GLCt2pp', 0, 'b');

    % 计算优化前的琥珀酸产量
    fbaWT = optimizeCbModel(modelCurrent);
    succFluxWT = fbaWT.x(strcmp(modelCurrent.rxns, 'EX_succ_e'));
    growthRateWT = fbaWT.f;
    fprintf('优化前的琥珀酸产量: %.1f\n', succFluxWT);
    fprintf('优化前的生长速率: %.1f\n', growthRateWT);

    % 定义要搜索敲除的反应集合
    selectedRxnList = {'GLCabcpp'; 'GLCptspp'; 'HEX1'; 'PGI'; 'PFK'; 'FBA'; 'TPI'; 'GAPD'; ...
                       'PGK'; 'PGM'; 'ENO'; 'PYK'; 'LDH_D'; 'PFL'; 'ALCD2x'; 'PTAr'; 'ACKr'; ...
                       'G6PDH2r'; 'PGL'; 'GND'; 'RPI'; 'RPE'; 'TKT1'; 'TALA'; 'TKT2'; 'FUM'; ...
                       'FRD2'; 'SUCOAS'; 'AKGDH'; 'ACONTa'; 'ACONTb'; 'ICDHyr'; 'CS'; 'MDH'; ...
                       'MDH2'; 'MDH3'; 'ACALD'};

    % 设置optKnock选项
    options = struct('targetRxn', 'EX_succ_e', 'numDel', 2);
    constrOpt = struct('rxnList', {{biomass}}, 'values', 0.5*fbaWT.f, 'sense', 'G');

    % 运行optKnock
    optKnockSol = OptKnock(modelCurrent, selectedRxnList, options, constrOpt);

    % 存储结果
    resultsGlucose(i).glucoseUptake = glucoseUptake;
    resultsGlucose(i).wildTypeSuccinate = succFluxWT;
    resultsGlucose(i).wildTypeGrowth = growthRateWT;

    if ~isempty(optKnockSol.rxnList)
        succFluxOpt = optKnockSol.fluxes(strcmp(modelCurrent.rxns, 'EX_succ_e'));
        growthRateOpt = optKnockSol.fluxes(strcmp(modelCurrent.rxns, biomass));
        resultsGlucose(i).optimizedSuccinate = succFluxOpt;
        resultsGlucose(i).optimizedGrowth = growthRateOpt;
        resultsGlucose(i).knockoutReactions = optKnockSol.rxnList;
        resultsGlucose(i).improvement = (succFluxOpt - succFluxWT) / succFluxWT * 100;

        fprintf('找到的敲除组合: ');
        for j = 1:length(optKnockSol.rxnList)
            if j == 1
                fprintf('%s', optKnockSol.rxnList{j});
            elseif j == length(optKnockSol.rxnList)
                fprintf(' 和 %s', optKnockSol.rxnList{j});
            else
                fprintf(', %s', optKnockSol.rxnList{j});
            end
        end
        fprintf('\n');
        fprintf('优化后的琥珀酸产量: %.2f\n', succFluxOpt);
        fprintf('优化后的生长速率: %.2f\n', growthRateOpt);
        fprintf('产量提升: %.1f%%\n', resultsGlucose(i).improvement);
    else
        resultsGlucose(i).optimizedSuccinate = succFluxWT;
        resultsGlucose(i).optimizedGrowth = growthRateWT;
        resultsGlucose(i).knockoutReactions = {};
        resultsGlucose(i).improvement = 0;
        fprintf('未找到有效的敲除组合\n');
    end
end

%% 方案二：是否启用不同分泌路径的比较
fprintf('\n=== 方案二：是否启用不同分泌路径的比较 ===\n');

% 定义不同的分泌路径配置
secretionConfigs = {
    {'EX_ac_e'}, % 仅乙酸盐
    {'EX_co2_e'}, % 仅二氧化碳
    {'EX_etoh_e'}, % 仅乙醇
    {'EX_for_e'}, % 仅甲酸盐
    {'EX_lac__D_e'}, % 仅乳酸盐
    {'EX_succ_e'}, % 仅琥珀酸盐
    {'EX_ac_e';'EX_co2_e';'EX_etoh_e';'EX_for_e';'EX_lac__D_e';'EX_succ_e'}, % 全部启用
    {} % 全部禁用
};

configNames = {
    '仅乙酸盐',
    '仅二氧化碳',
    '仅乙醇',
    '仅甲酸盐',
    '仅乳酸盐',
    '仅琥珀酸盐',
    '全部启用',
    '全部禁用'
};

resultsSecretion = struct();

for i = 1:length(secretionConfigs)
    fprintf('\n--- 分泌配置: %s ---\n', configNames{i});

    % 创建模型副本
    modelCurrent = model;

    % 设置葡萄糖摄取量为10
    modelCurrent = changeRxnBounds(modelCurrent, 'EX_glc__D_e', -10, 'b');

    % 设置基本约束
    Exchange={'EX_o2_e';'EX_pi_e';'EX_so4_e'; 'EX_nh4_e'};
    Bounds=[0;-1000;-1000;-1000];
    modelCurrent = changeRxnBounds(modelCurrent, Exchange, Bounds, 'l');

    % 设置分泌路径约束
    allSecretions = {'EX_ac_e';'EX_co2_e';'EX_etoh_e';'EX_for_e';'EX_lac__D_e';'EX_succ_e'};
    for j = 1:length(allSecretions)
        if ismember(allSecretions{j}, secretionConfigs{i})
            % 启用分泌
            modelCurrent = changeRxnBounds(modelCurrent, allSecretions{j}, 1000, 'u');
        else
            % 禁用分泌
            modelCurrent = changeRxnBounds(modelCurrent, allSecretions{j}, 0, 'u');
        end
    end

    % 约束磷酸转移酶系统
    modelCurrent = changeRxnBounds(modelCurrent, 'GLCabcpp', -1000, 'l');
    modelCurrent = changeRxnBounds(modelCurrent, 'GLCptspp', -1000, 'l');
    modelCurrent = changeRxnBounds(modelCurrent, 'GLCabcpp', 1000, 'u');
    modelCurrent = changeRxnBounds(modelCurrent, 'GLCptspp', 1000, 'u');
    modelCurrent = changeRxnBounds(modelCurrent, 'GLCt2pp', 0, 'b');

    % 计算优化前的琥珀酸产量
    fbaWT = optimizeCbModel(modelCurrent);
    succFluxWT = fbaWT.x(strcmp(modelCurrent.rxns, 'EX_succ_e'));
    growthRateWT = fbaWT.f;
    fprintf('优化前的琥珀酸产量: %.1f\n', succFluxWT);
    fprintf('优化前的生长速率: %.1f\n', growthRateWT);

    % 定义要搜索敲除的反应集合
    selectedRxnList = {'GLCabcpp'; 'GLCptspp'; 'HEX1'; 'PGI'; 'PFK'; 'FBA'; 'TPI'; 'GAPD'; ...
                       'PGK'; 'PGM'; 'ENO'; 'PYK'; 'LDH_D'; 'PFL'; 'ALCD2x'; 'PTAr'; 'ACKr'; ...
                       'G6PDH2r'; 'PGL'; 'GND'; 'RPI'; 'RPE'; 'TKT1'; 'TALA'; 'TKT2'; 'FUM'; ...
                       'FRD2'; 'SUCOAS'; 'AKGDH'; 'ACONTa'; 'ACONTb'; 'ICDHyr'; 'CS'; 'MDH'; ...
                       'MDH2'; 'MDH3'; 'ACALD'};

    % 设置optKnock选项
    options = struct('targetRxn', 'EX_succ_e', 'numDel', 2);
    constrOpt = struct('rxnList', {{biomass}}, 'values', 0.5*fbaWT.f, 'sense', 'G');

    % 运行optKnock
    optKnockSol = OptKnock(modelCurrent, selectedRxnList, options, constrOpt);

    % 存储结果
    resultsSecretion(i).configName = configNames{i};
    resultsSecretion(i).wildTypeSuccinate = succFluxWT;
    resultsSecretion(i).wildTypeGrowth = growthRateWT;

    if ~isempty(optKnockSol.rxnList)
        succFluxOpt = optKnockSol.fluxes(strcmp(modelCurrent.rxns, 'EX_succ_e'));
        growthRateOpt = optKnockSol.fluxes(strcmp(modelCurrent.rxns, biomass));
        resultsSecretion(i).optimizedSuccinate = succFluxOpt;
        resultsSecretion(i).optimizedGrowth = growthRateOpt;
        resultsSecretion(i).knockoutReactions = optKnockSol.rxnList;
        resultsSecretion(i).improvement = (succFluxOpt - succFluxWT) / succFluxWT * 100;

        fprintf('找到的敲除组合: ');
        for j = 1:length(optKnockSol.rxnList)
            if j == 1
                fprintf('%s', optKnockSol.rxnList{j});
            elseif j == length(optKnockSol.rxnList)
                fprintf(' 和 %s', optKnockSol.rxnList{j});
            else
                fprintf(', %s', optKnockSol.rxnList{j});
            end
        end
        fprintf('\n');
        fprintf('优化后的琥珀酸产量: %.2f\n', succFluxOpt);
        fprintf('优化后的生长速率: %.2f\n', growthRateOpt);
        fprintf('产量提升: %.1f%%\n', resultsSecretion(i).improvement);
    else
        resultsSecretion(i).optimizedSuccinate = succFluxWT;
        resultsSecretion(i).optimizedGrowth = growthRateWT;
        resultsSecretion(i).knockoutReactions = {};
        resultsSecretion(i).improvement = 0;
        fprintf('未找到有效的敲除组合\n');
    end
end

%% 方案三：不同反应列表下的敲除比较
fprintf('\n=== 方案三：不同反应列表下的敲除比较 ===\n');

% 定义4个固定的反应集合（基于iJO1366模型分析）
reactionSets = {
    % 中心碳代谢关键反应 - 涵盖糖酵解、TCA循环和回补反应
    % 参考iJO1366中的核心代谢路径：HEX1, PFK, FBA, GAPD, PYK, PDH, CS等
    {'HEX1'; 'PGI'; 'PFK'; 'FBA'; 'FBA3'; 'TPI'; 'GAPD'; 'PGK'; 'PGM'; 'ENO'; 'PYK';
     'PDH'; 'CS'; 'ACONTa'; 'ACONTb'; 'ICDHyr'; 'AKGDH'; 'SUCOAS'; 'SDH';
     'FUM'; 'MDH'; 'PPC'; 'PPCK'; 'ME1'; 'ME2'},

    % TCA循环和琥珀酸合成相关反应 - 专注于琥珀酸生产路径
    % 基于iJO1366中的TCA循环和琥珀酸相关：CS, ACONT, ICDHyr, AKGDH, SUCOAS等
    {'CS'; 'ACONTa'; 'ACONTb'; 'ICDHyr'; 'AKGDH'; 'SUCOAS'; 'SDH'; 'FUM'; 'MDH';
     'FRD2'; 'FRD3'; 'PPC'; 'PPCK'; 'ME1'; 'ME2'; 'PCK'; 'PPS'},

    % 糖酵解和发酵反应 - 主要涉及葡萄糖摄取和竞争性发酵路径
    % 参考iJO1366中的葡萄糖转运和发酵：GLCabcpp, GLCptspp, LDH_D, PFL等
    {'GLCabcpp'; 'GLCptspp'; 'HEX1'; 'PGI'; 'PFK'; 'PFK_2'; 'PFK_3'; 'FBA'; 'TPI'; 'GAPD';
     'PGK'; 'PGM'; 'ENO'; 'PYK'; 'LDH_D'; 'LDH_D2'; 'PFL'; 'ALCD2x'; 'PTAr'; 'ACKr'; 'ACALD'},

    % 磷酸戊糖途径和氧化还原平衡反应 - 影响NADPH和还原力平衡
    % 基于iJO1366中的PPP途径和脱氢酶：G6PDH2r, GND, TKT1, MDH2等
    {'G6PDH2r'; 'PGL'; 'GND'; 'RPI'; 'RPE'; 'TKT1'; 'TALA'; 'TKT2';
     'MDH2'; 'MDH3'; 'THD2'; 'NADTRHD'; 'NDH2'; 'GLUDy'; 'GLUDx'}
};

setNames = {
    '中心碳代谢关键反应（糖酵解+TCA+回补）',
    'TCA循环和琥珀酸合成路径',
    '糖酵解和发酵竞争路径',
    '磷酸戊糖途径和氧化还原平衡'
};

resultsReactionSets = struct();

for i = 1:length(reactionSets)
    fprintf('\n--- 反应集合: %s ---\n', setNames{i});

    % 创建模型副本
    modelCurrent = model;

    % 设置基本约束
    modelCurrent = changeRxnBounds(modelCurrent, 'EX_glc__D_e', -10, 'b');
    Exchange={'EX_o2_e';'EX_pi_e';'EX_so4_e'; 'EX_nh4_e'};
    Bounds=[0;-1000;-1000;-1000];
    modelCurrent = changeRxnBounds(modelCurrent, Exchange, Bounds, 'l');

    % 启用分泌路径
    Exchange={'EX_ac_e';'EX_co2_e';'EX_etoh_e';'EX_for_e';'EX_lac__D_e';'EX_succ_e'};
    Bounds=[1000;1000;1000;1000;1000;1000];
    modelCurrent = changeRxnBounds(modelCurrent, Exchange, Bounds, 'u');

    % 约束磷酸转移酶系统
    modelCurrent = changeRxnBounds(modelCurrent, 'GLCabcpp', -1000, 'l');
    modelCurrent = changeRxnBounds(modelCurrent, 'GLCptspp', -1000, 'l');
    modelCurrent = changeRxnBounds(modelCurrent, 'GLCabcpp', 1000, 'u');
    modelCurrent = changeRxnBounds(modelCurrent, 'GLCptspp', 1000, 'u');
    modelCurrent = changeRxnBounds(modelCurrent, 'GLCt2pp', 0, 'b');

    % 计算优化前的琥珀酸产量
    fbaWT = optimizeCbModel(modelCurrent);
    succFluxWT = fbaWT.x(strcmp(modelCurrent.rxns, 'EX_succ_e'));
    growthRateWT = fbaWT.f;
    fprintf('优化前的琥珀酸产量: %.1f\n', succFluxWT);
    fprintf('优化前的生长速率: %.1f\n', growthRateWT);

    % 设置optKnock选项
    options = struct('targetRxn', 'EX_succ_e', 'numDel', 2);
    constrOpt = struct('rxnList', {{biomass}}, 'values', 0.5*fbaWT.f, 'sense', 'G');

    % 运行optKnock
    optKnockSol = OptKnock(modelCurrent, reactionSets{i}, options, constrOpt);

    % 存储结果
    resultsReactionSets(i).setName = setNames{i};
    resultsReactionSets(i).numReactions = length(reactionSets{i});
    resultsReactionSets(i).wildTypeSuccinate = succFluxWT;
    resultsReactionSets(i).wildTypeGrowth = growthRateWT;

    if ~isempty(optKnockSol.rxnList)
        succFluxOpt = optKnockSol.fluxes(strcmp(modelCurrent.rxns, 'EX_succ_e'));
        growthRateOpt = optKnockSol.fluxes(strcmp(modelCurrent.rxns, biomass));
        resultsReactionSets(i).optimizedSuccinate = succFluxOpt;
        resultsReactionSets(i).optimizedGrowth = growthRateOpt;
        resultsReactionSets(i).knockoutReactions = optKnockSol.rxnList;
        resultsReactionSets(i).improvement = (succFluxOpt - succFluxWT) / succFluxWT * 100;

        fprintf('找到的敲除组合: ');
        for j = 1:length(optKnockSol.rxnList)
            if j == 1
                fprintf('%s', optKnockSol.rxnList{j});
            elseif j == length(optKnockSol.rxnList)
                fprintf(' 和 %s', optKnockSol.rxnList{j});
            else
                fprintf(', %s', optKnockSol.rxnList{j});
            end
        end
        fprintf('\n');
        fprintf('优化后的琥珀酸产量: %.2f\n', succFluxOpt);
        fprintf('优化后的生长速率: %.2f\n', growthRateOpt);
        fprintf('产量提升: %.1f%%\n', resultsReactionSets(i).improvement);
    else
        resultsReactionSets(i).optimizedSuccinate = succFluxWT;
        resultsReactionSets(i).optimizedGrowth = growthRateWT;
        resultsReactionSets(i).knockoutReactions = {};
        resultsReactionSets(i).improvement = 0;
        fprintf('未找到有效的敲除组合\n');
    end
end

%% 方案四：原始tutorial_optKnock.m方案重现
fprintf('\n=== 方案四：原始tutorial_optKnock.m方案重现 ===\n');

% 本方案重现原始tutorial_optKnock.m中的四个示例，用于对比和验证

% 创建标准配置的模型
modelOriginal = model;
modelOriginal = changeRxnBounds(modelOriginal, 'EX_glc__D_e', -10, 'b');

% 设置原始文件中的约束条件
% 无约束的无机磷酸盐、硫酸盐和氨摄取路径
Exchange={'EX_o2_e';'EX_pi_e';'EX_so4_e'; 'EX_nh4_e'};
Bounds=[0;-1000;-1000;-1000];
modelOriginal = changeRxnBounds(modelOriginal, Exchange, Bounds, 'l');

% 启用乙酸盐、二氧化碳、乙醇、甲酸盐、乳酸盐和琥珀酸盐的分泌路径
Exchange={'EX_ac_e';'EX_co2_e';'EX_etoh_e';'EX_for_e';'EX_lac__D_e';'EX_succ_e'};
Bounds=[1000;1000;1000;1000;1000;1000];
modelOriginal = changeRxnBounds(modelOriginal, Exchange, Bounds, 'u');

% 约束磷酸转移酶系统
modelOriginal = changeRxnBounds(modelOriginal, 'GLCabcpp', -1000, 'l');
modelOriginal = changeRxnBounds(modelOriginal, 'GLCptspp', -1000, 'l');
modelOriginal = changeRxnBounds(modelOriginal, 'GLCabcpp', 1000, 'u');
modelOriginal = changeRxnBounds(modelOriginal, 'GLCptspp', 1000, 'u');
modelOriginal = changeRxnBounds(modelOriginal, 'GLCt2pp', 0, 'b');

% 计算野生型基准
fbaWT_original = optimizeCbModel(modelOriginal);
succFluxWT_original = fbaWT_original.x(strcmp(modelOriginal.rxns, 'EX_succ_e'));
growthRateWT_original = fbaWT_original.f;

fprintf('原始方案基准:\n');
fprintf('  琥珀酸产量: %.2f\n', succFluxWT_original);
fprintf('  乳酸盐产量: %.2f\n', fbaWT_original.x(strcmp(modelOriginal.rxns, 'EX_lac__D_e')));
fprintf('  生长速率: %.2f\n', growthRateWT_original);

% 使用原始文件中的反应列表
selectedRxnList_original = {'GLCabcpp'; 'GLCptspp'; 'HEX1'; 'PGI'; 'PFK'; 'FBA'; 'TPI'; 'GAPD'; ...
                           'PGK'; 'PGM'; 'ENO'; 'PYK'; 'LDH_D'; 'PFL'; 'ALCD2x'; 'PTAr'; 'ACKr'; ...
                           'G6PDH2r'; 'PGL'; 'GND'; 'RPI'; 'RPE'; 'TKT1'; 'TALA'; 'TKT2'; 'FUM'; ...
                           'FRD2'; 'SUCOAS'; 'AKGDH'; 'ACONTa'; 'ACONTb'; 'ICDHyr'; 'CS'; 'MDH'; ...
                           'MDH2'; 'MDH3'; 'ACALD'};

resultsOriginal = struct();

% 原始示例1：敲除2个反应提高琥珀酸产量
fprintf('\n--- 原始示例1：敲除2个反应提高琥珀酸产量 ---\n');
options = struct('targetRxn', 'EX_succ_e', 'numDel', 2);
constrOpt = struct('rxnList', {{biomass}}, 'values', 0.5*fbaWT_original.f, 'sense', 'G');

previousSolutions = cell(3, 1);
contPreviousSolutions = 1;

for iter = 1:3
    if iter == 1
        optKnockSol = OptKnock(modelOriginal, selectedRxnList_original, options, constrOpt);
    else
        optKnockSol = OptKnock(modelOriginal, selectedRxnList_original, options, constrOpt, previousSolutions);
    end

    if ~isempty(optKnockSol.rxnList)
        succFluxOpt = optKnockSol.fluxes(strcmp(modelOriginal.rxns, 'EX_succ_e'));
        growthRateOpt = optKnockSol.fluxes(strcmp(modelOriginal.rxns, biomass));

        resultsOriginal.ex1_solutions(iter).knockoutReactions = optKnockSol.rxnList;
        resultsOriginal.ex1_solutions(iter).succinateProduction = succFluxOpt;
        resultsOriginal.ex1_solutions(iter).growthRate = growthRateOpt;
        resultsOriginal.ex1_solutions(iter).improvement = (succFluxOpt - succFluxWT_original) / succFluxWT_original * 100;

        previousSolutions{contPreviousSolutions} = optKnockSol.rxnList;
        contPreviousSolutions = contPreviousSolutions + 1;

        fprintf('解%d: ', iter);
        for j = 1:length(optKnockSol.rxnList)
            if j == 1
                fprintf('%s', optKnockSol.rxnList{j});
            elseif j == length(optKnockSol.rxnList)
                fprintf(' 和 %s', optKnockSol.rxnList{j});
            else
                fprintf(', %s', optKnockSol.rxnList{j});
            end
        end
        fprintf('\n');
        fprintf('  琥珀酸产量: %.2f (提升 %.1f%%)\n', succFluxOpt, resultsOriginal.ex1_solutions(iter).improvement);
        fprintf('  生长速率: %.2f\n', growthRateOpt);

        % 执行耦合分析
        % 为analyzeOptKnock准备模型，确保包含目标函数
        modelForAnalysis = modelOriginal;
        if ~isfield(modelForAnalysis, 'optProblem') || ~isfield(modelForAnalysis.optProblem, 'F')
            % 设置生物质为目标函数
            modelForAnalysis = changeObjective(modelForAnalysis, biomass);
        end
        [type, maxGrowth, maxProd, minProd] = analyzeOptKnock(modelForAnalysis, optKnockSol.rxnList, 'EX_succ_e');
        fprintf('  耦合类型: %s\n', type);

        if strcmp(type, 'growth coupled')
            singleProductionEnvelope(modelOriginal, optKnockSol.rxnList, 'EX_succ_e', biomass, ...
                                   'savePlot', 1, 'showPlot', 1, ...
                                   'fileName', ['original_ex1_sol' num2str(iter)], ...
                                   'outputFolder', 'OptKnockResults');
        end
    else
        fprintf('未找到更多解\n');
        break;
    end
end

% 原始示例2：敲除3个反应提高琥珀酸产量
fprintf('\n--- 原始示例2：敲除3个反应提高琥珀酸产量 ---\n');
options = struct('targetRxn', 'EX_succ_e', 'numDel', 3);
constrOpt = struct('rxnList', {{biomass}}, 'values', 0.5*fbaWT_original.f, 'sense', 'G');

previousSolutions = cell(3, 1);
contPreviousSolutions = 1;

for iter = 1:2
    if iter == 1
        optKnockSol = OptKnock(modelOriginal, selectedRxnList_original, options, constrOpt);
    else
        optKnockSol = OptKnock(modelOriginal, selectedRxnList_original, options, constrOpt, previousSolutions);
    end

    if ~isempty(optKnockSol.rxnList)
        succFluxOpt = optKnockSol.fluxes(strcmp(modelOriginal.rxns, 'EX_succ_e'));
        growthRateOpt = optKnockSol.fluxes(strcmp(modelOriginal.rxns, biomass));

        resultsOriginal.ex2_solutions(iter).knockoutReactions = optKnockSol.rxnList;
        resultsOriginal.ex2_solutions(iter).succinateProduction = succFluxOpt;
        resultsOriginal.ex2_solutions(iter).growthRate = growthRateOpt;
        resultsOriginal.ex2_solutions(iter).improvement = (succFluxOpt - succFluxWT_original) / succFluxWT_original * 100;

        previousSolutions{contPreviousSolutions} = optKnockSol.rxnList;
        contPreviousSolutions = contPreviousSolutions + 1;

        fprintf('解%d: ', iter);
        for j = 1:length(optKnockSol.rxnList)
            if j == 1
                fprintf('%s', optKnockSol.rxnList{j});
            elseif j == length(optKnockSol.rxnList)
                fprintf(' 和 %s', optKnockSol.rxnList{j});
            else
                fprintf(', %s', optKnockSol.rxnList{j});
            end
        end
        fprintf('\n');
        fprintf('  琥珀酸产量: %.2f (提升 %.1f%%)\n', succFluxOpt, resultsOriginal.ex2_solutions(iter).improvement);
        fprintf('  生长速率: %.2f\n', growthRateOpt);

        % 执行耦合分析
        % 为analyzeOptKnock准备模型，确保包含目标函数
        modelForAnalysis = modelOriginal;
        if ~isfield(modelForAnalysis, 'optProblem') || ~isfield(modelForAnalysis.optProblem, 'F')
            % 设置生物质为目标函数
            modelForAnalysis = changeObjective(modelForAnalysis, biomass);
        end
        [type, maxGrowth, maxProd, minProd] = analyzeOptKnock(modelForAnalysis, optKnockSol.rxnList, 'EX_succ_e');
        fprintf('  耦合类型: %s\n', type);
    else
        fprintf('未找到更多解\n');
        break;
    end
end

% 原始示例3：敲除3个反应提高乳酸盐产量
fprintf('\n--- 原始示例3：敲除3个反应提高乳酸盐产量 ---\n');
options = struct('targetRxn', 'EX_lac__D_e', 'numDel', 3);
constrOpt = struct('rxnList', {{biomass}}, 'values', 0.5*fbaWT_original.f, 'sense', 'G');

previousSolutions = cell(2, 1);
contPreviousSolutions = 1;

for iter = 1:2
    if iter == 1
        optKnockSol = OptKnock(modelOriginal, selectedRxnList_original, options, constrOpt);
    else
        optKnockSol = OptKnock(modelOriginal, selectedRxnList_original, options, constrOpt, previousSolutions);
    end

    if ~isempty(optKnockSol.rxnList)
        lactFluxOpt = optKnockSol.fluxes(strcmp(modelOriginal.rxns, 'EX_lac__D_e'));
        growthRateOpt = optKnockSol.fluxes(strcmp(modelOriginal.rxns, biomass));

        resultsOriginal.ex3_solutions(iter).knockoutReactions = optKnockSol.rxnList;
        resultsOriginal.ex3_solutions(iter).lactateProduction = lactFluxOpt;
        resultsOriginal.ex3_solutions(iter).growthRate = growthRateOpt;

        % 计算乳酸盐产量提升（与野生型比较）
        lactFluxWT = fbaWT_original.x(strcmp(modelOriginal.rxns, 'EX_lac__D_e'));
        if abs(lactFluxWT) < 1e-6 % 如果野生型产量接近0
            if lactFluxOpt > 1e-6
                improvement = Inf; % 从无到有，标记为无限提升
                improvement_str = '从无到有';
            else
                improvement = 0; % 都没有产量
                improvement_str = '无变化';
            end
        else
            improvement = (lactFluxOpt - lactFluxWT) / lactFluxWT * 100;
            improvement_str = sprintf('%.1f%%', improvement);
        end
        resultsOriginal.ex3_solutions(iter).improvement = improvement;

        previousSolutions{contPreviousSolutions} = optKnockSol.rxnList;
        contPreviousSolutions = contPreviousSolutions + 1;

        fprintf('解%d: ', iter);
        for j = 1:length(optKnockSol.rxnList)
            if j == 1
                fprintf('%s', optKnockSol.rxnList{j});
            elseif j == length(optKnockSol.rxnList)
                fprintf(' 和 %s', optKnockSol.rxnList{j});
            else
                fprintf(', %s', optKnockSol.rxnList{j});
            end
        end
        fprintf('\n');
        fprintf('  乳酸盐产量: %.2f (提升 %s)\n', lactFluxOpt, improvement_str);
        fprintf('  生长速率: %.2f\n', growthRateOpt);

        % 执行耦合分析
        % 为analyzeOptKnock准备模型，确保包含目标函数
        modelForAnalysis = modelOriginal;
        if ~isfield(modelForAnalysis, 'optProblem') || ~isfield(modelForAnalysis.optProblem, 'F')
            % 设置生物质为目标函数
            modelForAnalysis = changeObjective(modelForAnalysis, biomass);
        end
        [type, maxGrowth, maxProd, minProd] = analyzeOptKnock(modelForAnalysis, optKnockSol.rxnList, 'EX_lac__D_e');
        fprintf('  耦合类型: %s\n', type);
    else
        fprintf('未找到更多解\n');
        break;
    end
end

%% 方案五：综合最佳方案的详细分析
fprintf('\n=== 方案五：综合最佳方案的详细分析 ===\n');

% 创建最佳配置的模型
modelBest = model;
modelBest = changeRxnBounds(modelBest, 'EX_glc__D_e', -10, 'b');
Exchange={'EX_o2_e';'EX_pi_e';'EX_so4_e'; 'EX_nh4_e'};
Bounds=[0;-1000;-1000;-1000];
modelBest = changeRxnBounds(modelBest, Exchange, Bounds, 'l');
Exchange={'EX_ac_e';'EX_co2_e';'EX_etoh_e';'EX_for_e';'EX_lac__D_e';'EX_succ_e'};
Bounds=[1000;1000;1000;1000;1000;1000];
modelBest = changeRxnBounds(modelBest, Exchange, Bounds, 'u');
modelBest = changeRxnBounds(modelBest, 'GLCabcpp', -1000, 'l');
modelBest = changeRxnBounds(modelBest, 'GLCptspp', -1000, 'l');
modelBest = changeRxnBounds(modelBest, 'GLCabcpp', 1000, 'u');
modelBest = changeRxnBounds(modelBest, 'GLCptspp', 1000, 'u');
modelBest = changeRxnBounds(modelBest, 'GLCt2pp', 0, 'b');

% 计算野生型基准
fbaWT = optimizeCbModel(modelBest);
succFluxWT = fbaWT.x(strcmp(modelBest.rxns, 'EX_succ_e'));
growthRateWT = fbaWT.f;

fprintf('野生型基准:\n');
fprintf('  琥珀酸产量: %.2f\n', succFluxWT);
fprintf('  生长速率: %.2f\n', growthRateWT);

% 尝试不同的敲除策略
knockoutStrategies = {
    struct('name', '双敲除策略', 'numDel', 2),
    struct('name', '三敲除策略', 'numDel', 3),
    struct('name', '四敲除策略', 'numDel', 4)
};

selectedRxnListComprehensive = {'GLCabcpp'; 'GLCptspp'; 'HEX1'; 'PGI'; 'PFK'; 'FBA'; 'TPI'; 'GAPD'; ...
                               'PGK'; 'PGM'; 'ENO'; 'PYK'; 'LDH_D'; 'PFL'; 'ALCD2x'; 'PTAr'; 'ACKr'; ...
                               'G6PDH2r'; 'PGL'; 'GND'; 'RPI'; 'RPE'; 'TKT1'; 'TALA'; 'TKT2'; 'FUM'; ...
                               'FRD2'; 'SUCOAS'; 'AKGDH'; 'ACONTa'; 'ACONTb'; 'ICDHyr'; 'CS'; 'MDH'; ...
                               'MDH2'; 'MDH3'; 'ACALD'};

resultsComprehensive = struct();

for i = 1:length(knockoutStrategies)
    strategy = knockoutStrategies{i};
    fprintf('\n--- %s (最多敲除%d个反应) ---\n', strategy.name, strategy.numDel);

    % 设置optKnock选项
    options = struct('targetRxn', 'EX_succ_e', 'numDel', strategy.numDel);
    constrOpt = struct('rxnList', {{biomass}}, 'values', 0.5*fbaWT.f, 'sense', 'G');

    % 尝试找到多个解
    previousSolutions = cell(5, 1);
    contPreviousSolutions = 1;

    for j = 1:3 % 每种策略尝试3个不同的解
        if j == 1
            optKnockSol = OptKnock(modelBest, selectedRxnListComprehensive, options, constrOpt);
        else
            optKnockSol = OptKnock(modelBest, selectedRxnListComprehensive, options, constrOpt, previousSolutions);
        end

        if ~isempty(optKnockSol.rxnList)
            succFluxOpt = optKnockSol.fluxes(strcmp(modelBest.rxns, 'EX_succ_e'));
            growthRateOpt = optKnockSol.fluxes(strcmp(modelBest.rxns, biomass));

            % 执行耦合分析
            % 为analyzeOptKnock准备模型，确保包含目标函数
            modelForAnalysis = modelBest;
            if ~isfield(modelForAnalysis, 'optProblem') || ~isfield(modelForAnalysis.optProblem, 'F')
                % 设置生物质为目标函数
                modelForAnalysis = changeObjective(modelForAnalysis, biomass);
            end
            [type, maxGrowth, maxProd, minProd] = analyzeOptKnock(modelForAnalysis, optKnockSol.rxnList, 'EX_succ_e');

            % 存储结果
            resultsComprehensive(i).solutions(j).knockoutReactions = optKnockSol.rxnList;
            resultsComprehensive(i).solutions(j).succinateProduction = succFluxOpt;
            resultsComprehensive(i).solutions(j).growthRate = growthRateOpt;
            resultsComprehensive(i).solutions(j).improvement = (succFluxOpt - succFluxWT) / succFluxWT * 100;
            resultsComprehensive(i).solutions(j).couplingType = type;
            resultsComprehensive(i).solutions(j).maxGrowth = maxGrowth;
            resultsComprehensive(i).solutions(j).maxProduction = maxProd;
            resultsComprehensive(i).solutions(j).minProduction = minProd;

            previousSolutions{contPreviousSolutions} = optKnockSol.rxnList;
            contPreviousSolutions = contPreviousSolutions + 1;

            fprintf('解%d: ', j);
            for k = 1:length(optKnockSol.rxnList)
                if k == 1
                    fprintf('%s', optKnockSol.rxnList{k});
                elseif k == length(optKnockSol.rxnList)
                    fprintf(' 和 %s', optKnockSol.rxnList{k});
                else
                    fprintf(', %s', optKnockSol.rxnList{k});
                end
            end
            fprintf('\n');
            fprintf('  琥珀酸产量: %.2f (提升 %.1f%%)\n', succFluxOpt, resultsComprehensive(i).solutions(j).improvement);
            fprintf('  生长速率: %.2f\n', growthRateOpt);
            fprintf('  耦合类型: %s\n', type);
            fprintf('  最大生长速率: %.2f\n', maxGrowth);
            fprintf('  产量范围: %.2f - %.2f\n', minProd, maxProd);

            % 如果是生长耦合的，生成生产包络图
            if strcmp(type, 'growth coupled')
                singleProductionEnvelope(modelBest, optKnockSol.rxnList, 'EX_succ_e', biomass, ...
                                       'savePlot', 1, 'showPlot', 1, ...
                                       'fileName', ['comprehensive_' strategy.name '_sol' num2str(j)], ...
                                       'outputFolder', 'OptKnockResults');
            end
        else
            fprintf('未找到更多解\n');
            break;
        end
    end
    resultsComprehensive(i).strategyName = strategy.name;
    resultsComprehensive(i).numDel = strategy.numDel;
end

%% 总结与比较
fprintf('\n=== 总结与比较 ===\n');

% 1. 葡萄糖摄取量影响
fprintf('\n1. 葡萄糖摄取量对优化结果的影响:\n');
fprintf('   摄取量 | 野生型产量 | 优化后产量 | 提升幅度\n');
fprintf('   ------|-----------|-----------|--------\n');
for i = 1:length(resultsGlucose)
    fprintf('   %4d | %9.2f | %11.2f | %7.1f%%\n', ...
            resultsGlucose(i).glucoseUptake, ...
            resultsGlucose(i).wildTypeSuccinate, ...
            resultsGlucose(i).optimizedSuccinate, ...
            resultsGlucose(i).improvement);
end

% 2. 分泌路径影响
fprintf('\n2. 分泌路径配置对优化结果的影响:\n');
fprintf('   配置名称 | 野生型产量 | 优化后产量 | 提升幅度\n');
fprintf('   --------|-----------|-----------|--------\n');
for i = 1:length(resultsSecretion)
    fprintf('   %-8s | %9.2f | %11.2f | %7.1f%%\n', ...
            resultsSecretion(i).configName, ...
            resultsSecretion(i).wildTypeSuccinate, ...
            resultsSecretion(i).optimizedSuccinate, ...
            resultsSecretion(i).improvement);
end

% 3. 反应集合影响
fprintf('\n3. 反应集合对优化结果的影响:\n');
fprintf('   集合名称 | 反应数量 | 野生型产量 | 优化后产量 | 提升幅度\n');
fprintf('   --------|---------|-----------|-----------|--------\n');
for i = 1:length(resultsReactionSets)
    fprintf('   %-8s | %7d | %9.2f | %11.2f | %7.1f%%\n', ...
            resultsReactionSets(i).setName, ...
            resultsReactionSets(i).numReactions, ...
            resultsReactionSets(i).wildTypeSuccinate, ...
            resultsReactionSets(i).optimizedSuccinate, ...
            resultsReactionSets(i).improvement);
end

% 4. 原始tutorial_optKnock.m方案结果
fprintf('\n4. 原始tutorial_optKnock.m方案结果:\n');

% 显示原始示例1的结果
fprintf('\n   原始示例1 (敲除2个反应提高琥珀酸):\n');
if isfield(resultsOriginal, 'ex1_solutions') && ~isempty(resultsOriginal.ex1_solutions)
    for i = 1:length(resultsOriginal.ex1_solutions)
        if isfield(resultsOriginal.ex1_solutions(i), 'knockoutReactions') && ~isempty(resultsOriginal.ex1_solutions(i).knockoutReactions)
            fprintf('     解%d: 敲除', i);
            for j = 1:length(resultsOriginal.ex1_solutions(i).knockoutReactions)
                if j == 1
                    fprintf('%s', resultsOriginal.ex1_solutions(i).knockoutReactions{j});
                elseif j == length(resultsOriginal.ex1_solutions(i).knockoutReactions)
                    fprintf(' 和 %s', resultsOriginal.ex1_solutions(i).knockoutReactions{j});
                else
                    fprintf(', %s', resultsOriginal.ex1_solutions(i).knockoutReactions{j});
                end
            end
            fprintf(', 产量: %.2f (提升 %.1f%%)\n', ...
                    resultsOriginal.ex1_solutions(i).succinateProduction, ...
                    resultsOriginal.ex1_solutions(i).improvement);
        end
    end
else
    fprintf('     未找到有效解\n');
end

% 显示原始示例2的结果
fprintf('\n   原始示例2 (敲除3个反应提高琥珀酸):\n');
if isfield(resultsOriginal, 'ex2_solutions') && ~isempty(resultsOriginal.ex2_solutions)
    for i = 1:length(resultsOriginal.ex2_solutions)
        if isfield(resultsOriginal.ex2_solutions(i), 'knockoutReactions') && ~isempty(resultsOriginal.ex2_solutions(i).knockoutReactions)
            fprintf('     解%d: 敲除', i);
            for j = 1:length(resultsOriginal.ex2_solutions(i).knockoutReactions)
                if j == 1
                    fprintf('%s', resultsOriginal.ex2_solutions(i).knockoutReactions{j});
                elseif j == length(resultsOriginal.ex2_solutions(i).knockoutReactions)
                    fprintf(' 和 %s', resultsOriginal.ex2_solutions(i).knockoutReactions{j});
                else
                    fprintf(', %s', resultsOriginal.ex2_solutions(i).knockoutReactions{j});
                end
            end
            fprintf(', 产量: %.2f (提升 %.1f%%)\n', ...
                    resultsOriginal.ex2_solutions(i).succinateProduction, ...
                    resultsOriginal.ex2_solutions(i).improvement);
        end
    end
else
    fprintf('     未找到有效解\n');
end

% 显示原始示例3的结果
fprintf('\n   原始示例3 (敲除3个反应提高乳酸盐):\n');
if isfield(resultsOriginal, 'ex3_solutions') && ~isempty(resultsOriginal.ex3_solutions)
    for i = 1:length(resultsOriginal.ex3_solutions)
        if isfield(resultsOriginal.ex3_solutions(i), 'knockoutReactions') && ~isempty(resultsOriginal.ex3_solutions(i).knockoutReactions)
            fprintf('     解%d: 敲除', i);
            for j = 1:length(resultsOriginal.ex3_solutions(i).knockoutReactions)
                if j == 1
                    fprintf('%s', resultsOriginal.ex3_solutions(i).knockoutReactions{j});
                elseif j == length(resultsOriginal.ex3_solutions(i).knockoutReactions)
                    fprintf(' 和 %s', resultsOriginal.ex3_solutions(i).knockoutReactions{j});
                else
                    fprintf(', %s', resultsOriginal.ex3_solutions(i).knockoutReactions{j});
                end
            end
            % 为乳酸盐结果准备提升字符串
            improvement_val = resultsOriginal.ex3_solutions(i).improvement;
            if isinf(improvement_val)
                improvement_str_summary = '从无到有';
            elseif improvement_val == 0
                improvement_str_summary = '无变化';
            else
                improvement_str_summary = sprintf('%.1f%%', improvement_val);
            end
            fprintf(', 产量: %.2f (提升 %s)\n', ...
                    resultsOriginal.ex3_solutions(i).lactateProduction, ...
                    improvement_str_summary);
        end
    end
else
    fprintf('     未找到有效解\n');
end

% 5. 综合最佳方案推荐
fprintf('\n5. 综合最佳方案推荐:\n');
bestImprovement = 0;
bestStrategy = '';
bestSolution = struct();
bestSource = '';

% 检查所有方案中的最佳结果

% 检查方案一（不同葡萄糖摄取量）
for i = 1:length(resultsGlucose)
    if resultsGlucose(i).improvement > bestImprovement
        bestImprovement = resultsGlucose(i).improvement;
        bestStrategy = sprintf('葡萄糖摄取量 %d mmol/grDW*hr', resultsGlucose(i).glucoseUptake);
        bestSolution.knockoutReactions = resultsGlucose(i).knockoutReactions;
        bestSolution.succinateProduction = resultsGlucose(i).optimizedSuccinate;
        bestSolution.growthRate = resultsGlucose(i).optimizedGrowth;
        bestSource = '方案一';
    end
end

% 检查方案二（不同分泌路径）
for i = 1:length(resultsSecretion)
    if resultsSecretion(i).improvement > bestImprovement
        bestImprovement = resultsSecretion(i).improvement;
        bestStrategy = sprintf('分泌配置: %s', resultsSecretion(i).configName);
        bestSolution.knockoutReactions = resultsSecretion(i).knockoutReactions;
        bestSolution.succinateProduction = resultsSecretion(i).optimizedSuccinate;
        bestSolution.growthRate = resultsSecretion(i).optimizedGrowth;
        bestSource = '方案二';
    end
end

% 检查方案三（不同反应集合）
for i = 1:length(resultsReactionSets)
    if resultsReactionSets(i).improvement > bestImprovement
        bestImprovement = resultsReactionSets(i).improvement;
        bestStrategy = sprintf('反应集合: %s', resultsReactionSets(i).setName);
        bestSolution.knockoutReactions = resultsReactionSets(i).knockoutReactions;
        bestSolution.succinateProduction = resultsReactionSets(i).optimizedSuccinate;
        bestSolution.growthRate = resultsReactionSets(i).optimizedGrowth;
        bestSource = '方案三';
    end
end

% 检查方案四（原始tutorial_optKnock.m方案）
if isfield(resultsOriginal, 'ex1_solutions')
    for i = 1:length(resultsOriginal.ex1_solutions)
        if isfield(resultsOriginal.ex1_solutions(i), 'improvement') && ...
           resultsOriginal.ex1_solutions(i).improvement > bestImprovement
            bestImprovement = resultsOriginal.ex1_solutions(i).improvement;
            bestStrategy = '原始示例1: 敲除2个反应';
            bestSolution.knockoutReactions = resultsOriginal.ex1_solutions(i).knockoutReactions;
            bestSolution.succinateProduction = resultsOriginal.ex1_solutions(i).succinateProduction;
            bestSolution.growthRate = resultsOriginal.ex1_solutions(i).growthRate;
            bestSource = '方案四';
        end
    end
end

if isfield(resultsOriginal, 'ex2_solutions')
    for i = 1:length(resultsOriginal.ex2_solutions)
        if isfield(resultsOriginal.ex2_solutions(i), 'improvement') && ...
           resultsOriginal.ex2_solutions(i).improvement > bestImprovement
            bestImprovement = resultsOriginal.ex2_solutions(i).improvement;
            bestStrategy = '原始示例2: 敲除3个反应';
            bestSolution.knockoutReactions = resultsOriginal.ex2_solutions(i).knockoutReactions;
            bestSolution.succinateProduction = resultsOriginal.ex2_solutions(i).succinateProduction;
            bestSolution.growthRate = resultsOriginal.ex2_solutions(i).growthRate;
            bestSource = '方案四';
        end
    end
end

% 检查方案五（综合分析）
for i = 1:length(resultsComprehensive)
    for j = 1:length(resultsComprehensive(i).solutions)
        if resultsComprehensive(i).solutions(j).improvement > bestImprovement
            bestImprovement = resultsComprehensive(i).solutions(j).improvement;
            bestStrategy = resultsComprehensive(i).strategyName;
            bestSolution = resultsComprehensive(i).solutions(j);
            bestSource = '方案五';
        end
    end
end

if ~isempty(fieldnames(bestSolution))
    fprintf('   推荐方案: %s\n', bestStrategy);
    fprintf('   敲除反应: ');
    for i = 1:length(bestSolution.knockoutReactions)
        if i == 1
            fprintf('%s', bestSolution.knockoutReactions{i});
        elseif i == length(bestSolution.knockoutReactions)
            fprintf(' 和 %s', bestSolution.knockoutReactions{i});
        else
            fprintf(', %s', bestSolution.knockoutReactions{i});
        end
    end
    fprintf('\n');
    fprintf('   预期琥珀酸产量: %.2f (相比野生型提升 %.1f%%)\n', ...
            bestSolution.succinateProduction, bestImprovement);
    fprintf('   预期生长速率: %.2f\n', bestSolution.growthRate);
    if isfield(bestSolution, 'couplingType')
        fprintf('   耦合类型: %s\n', bestSolution.couplingType);
    end
    fprintf('   方案来源: %s\n', bestSource);
else
    fprintf('   未找到明显的优化方案\n');
end

%% 时间估算
%%
% # 方案一 (葡萄糖摄取量比较) ~ 5-10分钟
% # 方案二 (分泌路径比较) ~ 10-15分钟
% # 方案三 (反应集合比较) ~ 10-20分钟
% # 方案四 (原始tutorial_optKnock.m方案重现) ~ 10-20分钟
% # 方案五 (综合分析) ~ 15-30分钟

%% 故障排除
% 1) 如果算法耗时很长，可能是搜索空间太大。可以通过减小输入变量"selectedRxnList"中的反应集合来减少搜索空间。
%
% 2) optKnock默认的删除数量是5个。如果算法返回的删除数量超过预期，可以使用输入变量"numDel"来更改删除数量。
%
% 3) optKnock可能找到对您无用的解。例如，您可能认为某个解太明显或违反了重要的生物约束。如果optKnock找到您不想要的解，使用输入变量"prevSolutions"来防止找到该解。
%
% 4) 本版本使用4个固定的反应集合，无需外部CSV文件。

%% 预期结果
% optKnock算法将找到在从模型中删除时会改善目标代谢产物（如琥珀酸）生产的反应集合。
% 在本教程中，一旦optKnock找到解，就会确定解的类型（产物是否与生物质形成耦合）。
% 一些集合将产生耦合解，即生产速率将随着生物质形成的增加而增加。
% 对于这类反应，将使用函数singleProductionEnvelope生成图表，并保存在文件夹tutorials/optKnock/optKnockResults中。
%
% 当使用OptKnock找到解时，应始终使用函数analyzeOptKnock验证最小和最大生产率。

%% 注意事项
% 1. 确保已正确安装COBRA Toolbox
% 2. 确保有合适的MILP求解器（如Gurobi）
% 3. 根据计算资源调整threshold值
% 4. 结果会保存在OptKnockResults文件夹中
% 5. 所有注释均为中文，便于理解

%% 恢复原始目录
cd(currectDirectory);

%% 完成
fprintf('\n程序执行完成！请查看上述结果和OptKnockResults文件夹中的图表。\n');