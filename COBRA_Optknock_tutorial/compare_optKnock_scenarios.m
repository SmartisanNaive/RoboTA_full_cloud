%% Comprehensive OptKnock Scenarios Comparison
%% Author: AI Assistant for Frontend Module Development
%% Purpose: Generate comprehensive output data for frontend OptKnock simulation module
%% This script tests multiple dimensions: gene sets, glucose concentrations, target products, knockout sizes

%% Initialize COBRA Toolbox
global TUTORIAL_INIT_CB;
if ~isempty(TUTORIAL_INIT_CB) && TUTORIAL_INIT_CB==1
    initCobraToolbox(false)
end

changeCobraSolver('gurobi','all');
fullPath = which('compare_optKnock_scenarios');
folder = fileparts(fullPath);
currectDirectory = pwd;
cd(folder);

%% Load E. coli model
modelFileName = 'iJO1366.mat';
modelDirectory = getDistributedModelFolder(modelFileName);
modelFileName= [modelDirectory filesep modelFileName];
model = readCbModel(modelFileName);

biomass = 'BIOMASS_Ec_iJO1366_core_53p95M';

%% Define test scenarios
fprintf('=== COMPREHENSIVE OPTKNOCK SCENARIOS COMPARISON ===\n\n');

% Define different gene sets for testing
geneSets = struct();

% Gene Set 1: Glycolysis pathway (original from tutorial)
geneSets.glycolysis = {'GLCabcpp'; 'GLCptspp'; 'HEX1'; 'PGI'; 'PFK'; 'FBA'; 'TPI'; 'GAPD'; ...
                      'PGK'; 'PGM'; 'ENO'; 'PYK'; 'LDH_D'; 'PFL'; 'ALCD2x'; 'PTAr'; 'ACKr'};

% Gene Set 2: Pentose phosphate pathway
geneSets.pentose_phosphate = {'G6PDH2r'; 'PGL'; 'GND'; 'RPI'; 'RPE'; 'TKT1'; 'TALA'; 'TKT2'; ...
                             'ZWFOXD'; 'PGDH'; 'RBKS'; 'PRPPS'};

% Gene Set 3: TCA cycle
geneSets.tca_cycle = {'FUM'; 'FRD2'; 'SUCOAS'; 'AKGDH'; 'ACONTa'; 'ACONTb'; 'ICDHyr'; 'CS'; ...
                     'MDH'; 'MDH2'; 'MDH3'; 'SUCD1i'; 'SUCD4'};

% Gene Set 4: Mixed central metabolism
geneSets.mixed_central = {'GLCabcpp'; 'PGI'; 'PFK'; 'G6PDH2r'; 'CS'; 'ACONTa'; 'SUCOAS'; ...
                         'FUM'; 'MDH'; 'PYK'; 'ENO'; 'GAPD'; 'TKT1'; 'TALA'};

% Gene Set 5: Fermentation pathways
geneSets.fermentation = {'LDH_D'; 'PFL'; 'ALCD2x'; 'PTAr'; 'ACKr'; 'ACALD'; 'ADHEr'; ...
                        'FRD2'; 'FRD3'; 'ASPT'; 'ASPK'};

% Define glucose concentrations (mmol/gDW*hr)
glucoseConcentrations = [5, 10, 15, 20, 25];

% Define target products
targetProducts = struct();
targetProducts.succinate = 'EX_succ_e';
targetProducts.lactate = 'EX_lac__D_e';
targetProducts.acetate = 'EX_ac_e';
targetProducts.ethanol = 'EX_etoh_e';
targetProducts.formate = 'EX_for_e';

% Define knockout sizes to test
knockoutSizes = [1, 2, 3];

% Initialize results storage
results = struct();
scenarioCounter = 1;

%% Run comprehensive scenarios
geneSetNames = fieldnames(geneSets);
targetProductNames = fieldnames(targetProducts);

for geneSetIdx = 1:length(geneSetNames)
    geneSetName = geneSetNames{geneSetIdx};
    selectedRxnList = geneSets.(geneSetName);
    
    fprintf('\n=== TESTING GENE SET: %s ===\n', upper(geneSetName));
    fprintf('Reactions in set: %s\n', strjoin(selectedRxnList, ', '));
    
    for glucoseIdx = 1:length(glucoseConcentrations)
        glucoseConc = glucoseConcentrations(glucoseIdx);
        
        fprintf('\n--- Glucose Concentration: %.1f mmol/gDW*hr ---\n', glucoseConc);
        
        % Setup model with current glucose concentration
        modelTest = model;
        modelTest = changeRxnBounds(modelTest, 'EX_glc__D_e', -glucoseConc, 'b');
        
        % Set standard constraints
        Exchange={'EX_o2_e';'EX_pi_e';'EX_so4_e'; 'EX_nh4_e'};
        Bounds=[0;-1000;-1000;-1000];
        modelTest = changeRxnBounds(modelTest, Exchange, Bounds, 'l');
        
        Exchange={'EX_ac_e';'EX_co2_e';'EX_etoh_e';'EX_for_e';'EX_lac__D_e';'EX_succ_e'};
        Bounds=[1000;1000;1000;1000;1000;1000];
        modelTest = changeRxnBounds(modelTest, Exchange, Bounds, 'u');
        
        % Constrain phosphotransferase system
        modelTest = changeRxnBounds(modelTest, 'GLCabcpp', -1000, 'l');
        modelTest = changeRxnBounds(modelTest, 'GLCptspp', -1000, 'l');
        modelTest = changeRxnBounds(modelTest, 'GLCabcpp', 1000, 'u');
        modelTest = changeRxnBounds(modelTest, 'GLCptspp', 1000, 'u');
        modelTest = changeRxnBounds(modelTest, 'GLCt2pp', 0, 'b');
        
        % Calculate wild-type performance
        fbaWT = optimizeCbModel(modelTest);
        if fbaWT.stat ~= 1
            fprintf('Warning: Wild-type optimization failed for glucose %.1f\n', glucoseConc);
            continue;
        end
        
        % Store wild-type results
        wtResults = struct();
        wtResults.growth = fbaWT.f;
        wtResults.succinate = fbaWT.x(strcmp(modelTest.rxns, 'EX_succ_e'));
        wtResults.lactate = fbaWT.x(strcmp(modelTest.rxns, 'EX_lac__D_e'));
        wtResults.acetate = fbaWT.x(strcmp(modelTest.rxns, 'EX_ac_e'));
        wtResults.ethanol = fbaWT.x(strcmp(modelTest.rxns, 'EX_etoh_e'));
        wtResults.formate = fbaWT.x(strcmp(modelTest.rxns, 'EX_for_e'));
        
        fprintf('Wild-type performance:\n');
        fprintf('  Growth: %.3f, Succinate: %.3f, Lactate: %.3f, Acetate: %.3f, Ethanol: %.3f, Formate: %.3f\n', ...
                wtResults.growth, wtResults.succinate, wtResults.lactate, ...
                wtResults.acetate, wtResults.ethanol, wtResults.formate);
        
        for targetIdx = 1:length(targetProductNames)
            targetName = targetProductNames{targetIdx};
            targetRxn = targetProducts.(targetName);
            
            fprintf('\n  Target Product: %s (%s)\n', upper(targetName), targetRxn);
            
            for knockoutIdx = 1:length(knockoutSizes)
                numDel = knockoutSizes(knockoutIdx);
                
                fprintf('    Knockout Size: %d\n', numDel);
                
                % Set optKnock options
                options = struct('targetRxn', targetRxn, 'numDel', numDel);
                constrOpt = struct('rxnList', {{biomass}}, 'values', 0.3*fbaWT.f, 'sense', 'G');
                
                try
                    % Run OptKnock
                    optKnockSol = OptKnock(modelTest, selectedRxnList, options, constrOpt);
                    
                    if ~isempty(optKnockSol.rxnList)
                        % Store results
                        scenario = struct();
                        scenario.id = scenarioCounter;
                        scenario.geneSet = geneSetName;
                        scenario.glucoseConc = glucoseConc;
                        scenario.targetProduct = targetName;
                        scenario.knockoutSize = numDel;
                        scenario.knockoutReactions = optKnockSol.rxnList;
                        
                        % Performance metrics
                        scenario.wildType = wtResults;
                        scenario.mutant = struct();
                        scenario.mutant.growth = optKnockSol.fluxes(strcmp(modelTest.rxns, biomass));
                        scenario.mutant.succinate = optKnockSol.fluxes(strcmp(modelTest.rxns, 'EX_succ_e'));
                        scenario.mutant.lactate = optKnockSol.fluxes(strcmp(modelTest.rxns, 'EX_lac__D_e'));
                        scenario.mutant.acetate = optKnockSol.fluxes(strcmp(modelTest.rxns, 'EX_ac_e'));
                        scenario.mutant.ethanol = optKnockSol.fluxes(strcmp(modelTest.rxns, 'EX_etoh_e'));
                        scenario.mutant.formate = optKnockSol.fluxes(strcmp(modelTest.rxns, 'EX_for_e'));
                        
                        % Calculate improvements
                        scenario.improvement = struct();
                        scenario.improvement.succinate = scenario.mutant.succinate - scenario.wildType.succinate;
                        scenario.improvement.lactate = scenario.mutant.lactate - scenario.wildType.lactate;
                        scenario.improvement.acetate = scenario.mutant.acetate - scenario.wildType.acetate;
                        scenario.improvement.ethanol = scenario.mutant.ethanol - scenario.wildType.ethanol;
                        scenario.improvement.formate = scenario.mutant.formate - scenario.wildType.formate;
                        scenario.improvement.growth = scenario.mutant.growth - scenario.wildType.growth;
                        
                        % Coupling analysis
                        try
                            [couplingType, maxGrowth, maxProd, minProd] = analyzeOptKnock(modelTest, optKnockSol.rxnList, targetRxn);
                            scenario.coupling = struct();
                            scenario.coupling.type = couplingType;
                            scenario.coupling.maxGrowth = maxGrowth;
                            scenario.coupling.maxProduction = maxProd;
                            scenario.coupling.minProduction = minProd;
                        catch
                            scenario.coupling = struct();
                            scenario.coupling.type = 'analysis_failed';
                        end
                        
                        results.(sprintf('scenario_%d', scenarioCounter)) = scenario;
                        
                        fprintf('      SUCCESS: Found knockout set: %s\n', strjoin(optKnockSol.rxnList, ', '));
                        fprintf('      Target production: WT=%.3f, Mutant=%.3f, Improvement=%.3f\n', ...
                                scenario.wildType.(targetName), scenario.mutant.(targetName), ...
                                scenario.improvement.(targetName));
                        fprintf('      Growth: WT=%.3f, Mutant=%.3f, Change=%.3f\n', ...
                                scenario.wildType.growth, scenario.mutant.growth, scenario.improvement.growth);
                        
                        scenarioCounter = scenarioCounter + 1;
                    else
                        fprintf('      No solution found\n');
                    end
                    
                catch ME
                    fprintf('      ERROR: %s\n', ME.message);
                end
            end
        end
    end
end

%% Generate comprehensive summary
fprintf('\n\n=== COMPREHENSIVE RESULTS SUMMARY ===\n');
fprintf('Total scenarios tested: %d\n', scenarioCounter - 1);

scenarioNames = fieldnames(results);
if ~isempty(scenarioNames)
    fprintf('\nSuccessful scenarios:\n');
    fprintf('%-8s %-20s %-8s %-12s %-8s %-25s %-12s %-12s %-12s\n', ...
            'ID', 'Gene Set', 'Glucose', 'Target', 'KO Size', 'Knockout Reactions', ...
            'Target Prod', 'Growth', 'Coupling');
    fprintf('%s\n', repmat('-', 140, 1));
    
    for i = 1:length(scenarioNames)
        scenario = results.(scenarioNames{i});
        fprintf('%-8d %-20s %-8.1f %-12s %-8d %-25s %-12.3f %-12.3f %-12s\n', ...
                scenario.id, scenario.geneSet, scenario.glucoseConc, ...
                scenario.targetProduct, scenario.knockoutSize, ...
                strjoin(scenario.knockoutReactions, ','), ...
                scenario.mutant.(scenario.targetProduct), ...
                scenario.mutant.growth, ...
                scenario.coupling.type);
    end
    
    %% Analysis by dimensions
    fprintf('\n=== ANALYSIS BY GENE SETS ===\n');
    for geneSetIdx = 1:length(geneSetNames)
        geneSetName = geneSetNames{geneSetIdx};
        count = 0;
        for i = 1:length(scenarioNames)
            if strcmp(results.(scenarioNames{i}).geneSet, geneSetName)
                count = count + 1;
            end
        end
        fprintf('%s: %d successful scenarios\n', geneSetName, count);
    end
    
    fprintf('\n=== ANALYSIS BY TARGET PRODUCTS ===\n');
    for targetIdx = 1:length(targetProductNames)
        targetName = targetProductNames{targetIdx};
        count = 0;
        avgImprovement = 0;
        for i = 1:length(scenarioNames)
            if strcmp(results.(scenarioNames{i}).targetProduct, targetName)
                count = count + 1;
                avgImprovement = avgImprovement + results.(scenarioNames{i}).improvement.(targetName);
            end
        end
        if count > 0
            avgImprovement = avgImprovement / count;
        end
        fprintf('%s: %d scenarios, avg improvement: %.3f\n', targetName, count, avgImprovement);
    end
    
    fprintf('\n=== ANALYSIS BY GLUCOSE CONCENTRATIONS ===\n');
    for glucoseIdx = 1:length(glucoseConcentrations)
        glucoseConc = glucoseConcentrations(glucoseIdx);
        count = 0;
        for i = 1:length(scenarioNames)
            if results.(scenarioNames{i}).glucoseConc == glucoseConc
                count = count + 1;
            end
        end
        fprintf('%.1f mmol/gDW*hr: %d successful scenarios\n', glucoseConc, count);
    end
    
    %% Save results to file
    save('optKnock_comprehensive_results.mat', 'results');
    fprintf('\nResults saved to: optKnock_comprehensive_results.mat\n');
    
    %% Export to JSON for frontend use
    jsonStr = jsonencode(results);
    fid = fopen('optKnock_results.json', 'w');
    if fid ~= -1
        fprintf(fid, '%s', jsonStr);
        fclose(fid);
        fprintf('Results exported to JSON: optKnock_results.json\n');
    end
else
    fprintf('No successful scenarios found.\n');
end

cd(currectDirectory);
fprintf('\n=== ANALYSIS COMPLETE ===\n');