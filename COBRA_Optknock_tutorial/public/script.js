// 全局变量
let currentStep = 1;
let selectedGeneSet = null;
let simulationConfig = {
    glucoseConc: 10,
    targetProduct: 'succinate',
    knockoutSize: 2,
    minGrowth: 30,
    geneSet: null
}

// 加速模式相关变量和函数
let speedMode = false;
let originalTimeouts = [];
let speedMultiplier = 10; // 加速倍数

function toggleSpeedMode() {
    speedMode = !speedMode;
    const speedButton = document.getElementById('speed-button');
    const body = document.body;
    
    if (speedMode) {
        // 启用加速模式
        speedButton.classList.add('active');
        speedButton.innerHTML = '<i class="fas fa-pause"></i>';
        speedButton.title = '退出加速模式';
        body.classList.add('speed-mode');
        
        // 清除所有现有的延时
        clearAllTimeouts();
        
        addTerminalOutput('🚀 加速模式已启用 - 所有动画和延时将被跳过', 'info');
    } else {
        // 退出加速模式
        speedButton.classList.remove('active');
        speedButton.innerHTML = '<i class="fas fa-forward"></i>';
        speedButton.title = '加速模式';
        body.classList.remove('speed-mode');
        
        addTerminalOutput('⏸️ 加速模式已关闭 - 恢复正常动画效果', 'info');
    }
}

// 重写setTimeout函数以支持加速模式
const originalSetTimeout = window.setTimeout;
window.setTimeout = function(callback, delay, ...args) {
    if (speedMode && delay > 0) {
        // 加速模式下大幅减少延时
        delay = Math.max(1, delay / speedMultiplier);
    }
    
    const timeoutId = originalSetTimeout(callback, delay, ...args);
    originalTimeouts.push(timeoutId);
    return timeoutId;
};

// 清除所有延时
function clearAllTimeouts() {
    originalTimeouts.forEach(id => clearTimeout(id));
    originalTimeouts = [];
}

// 重写typewriterOutput函数以支持加速模式
const originalTypewriterOutput = typewriterOutput;
window.typewriterOutput = function(text, type = 'output', speed = 50) {
    if (speedMode) {
        // 加速模式下直接显示文本，不使用打字机效果
        addTerminalOutput(text, type);
        return Promise.resolve();
    } else {
        return originalTypewriterOutput(text, type, speed);
    }
};

// 一键跳过当前步骤的所有动画和延时
function skipCurrentStep() {
    if (!speedMode) {
        toggleSpeedMode();
    }
    
    // 清除所有延时
    clearAllTimeouts();
    
    // 根据当前步骤执行相应的跳过逻辑
    switch(currentStep) {
        case 2:
            // 跳过模型加载动画
            if (!simulationConfig.modelLoaded) {
                simulationConfig.modelLoaded = true;
                addTerminalOutput('模型加载完成（已跳过动画）', 'success');
                showStepButtons(3);
            }
            break;
        case 3:
            // 跳过参数设置
            if (!document.getElementById('step-3-buttons').style.display || 
                document.getElementById('step-3-buttons').style.display === 'none') {
                setParameters();
            }
            break;
        case 4:
            // 跳过基因集选择
            if (!selectedGeneSet) {
                // 自动选择第一个基因集
                const firstCard = document.querySelector('.gene-set-card');
                if (firstCard) {
                    selectGeneSetCard(firstCard);
                    selectGeneSet();
                }
            }
            break;
        case 5:
            // 跳过OptKnock执行动画
            if (!optKnockResults) {
                runOptKnock();
            }
            break;
    }
    
    addTerminalOutput('⚡ 已跳过当前步骤的所有动画效果', 'info');
}

// 添加键盘快捷键支持
document.addEventListener('keydown', function(e) {
    // Ctrl + Shift + S 切换加速模式
    if (e.ctrlKey && e.shiftKey && e.key === 'S') {
        e.preventDefault();
        toggleSpeedMode();
    }
    
    // Ctrl + Shift + Enter 跳过当前步骤
    if (e.ctrlKey && e.shiftKey && e.key === 'Enter') {
        e.preventDefault();
        skipCurrentStep();
    }
});;
let optKnockResults = null;

// 基因集信息
const geneSetInfo = {
    glycolysis: {
        name: '糖酵解途径',
        description: '葡萄糖分解为丙酮酸的主要能量代谢途径',
        reactions: ['PGI', 'PFK', 'FBA', 'TPI', 'GAPD', 'PGK', 'PGM', 'ENO', 'PYK']
    },
    pentose_phosphate: {
        name: '磷酸戊糖途径',
        description: '产生NADPH和核糖-5-磷酸的代谢途径',
        reactions: ['G6PDH2r', 'PGL', 'GND', 'RPI', 'RPE', 'TKT1', 'TALA', 'TKT2']
    },
    tca_cycle: {
        name: 'TCA循环',
        description: '完全氧化丙酮酸的中心代谢途径',
        reactions: ['CS', 'ACONTa', 'ACONTb', 'ICDHyr', 'AKGDH', 'SUCOAS', 'SUCDi', 'FUM', 'MDH']
    },
    mixed_central: {
        name: '混合中心代谢',
        description: '结合多个代谢途径的核心反应网络',
        reactions: ['PFK', 'GAPD', 'PYK', 'CS', 'ICDHyr', 'G6PDH2r', 'RPE', 'TALA']
    },
    fermentation: {
        name: '发酵途径',
        description: '缺氧条件下的发酵产物生成途径',
        reactions: ['PDH', 'LDH_D', 'ALCD2x', 'PTAr', 'ACKr', 'FHL']
    }
};

// 产物信息
const productInfo = {
    succinate: { name: '琥珀酸', unit: 'mmol/gDW·hr', color: '#3498db' },
    lactate: { name: '乳酸', unit: 'mmol/gDW·hr', color: '#e74c3c' },
    acetate: { name: '醋酸', unit: 'mmol/gDW·hr', color: '#f39c12' },
    ethanol: { name: '乙醇', unit: 'mmol/gDW·hr', color: '#9b59b6' },
    formate: { name: '甲酸', unit: 'mmol/gDW·hr', color: '#27ae60' }
};

// 初始化
document.addEventListener('DOMContentLoaded', function() {
    initializeSimulation();
    setupEventListeners();
});

function initializeSimulation() {
    updateStepNavigation();
    showStep(1);
}

function setupEventListeners() {
    // 基因集选择事件
    document.querySelectorAll('.gene-set-card').forEach(card => {
        card.addEventListener('click', function() {
            selectGeneSetCard(this);
        });
    });
    
    // 步骤导航点击事件（已禁用直接跳转）
    // document.querySelectorAll('.step').forEach(step => {
    //     step.addEventListener('click', function() {
    //         const targetStep = parseInt(this.dataset.step);
    //         navigateToStep(targetStep);
    //     });
    // });
}

// 步骤导航更新
function updateStepNavigation() {
    document.querySelectorAll('.step').forEach((step, index) => {
        const stepNumber = index + 1;
        step.classList.remove('active', 'completed');
        
        if (stepNumber < currentStep) {
            step.classList.add('completed');
        } else if (stepNumber === currentStep) {
            step.classList.add('active');
        }
    });
}

// 显示指定步骤
function showStep(stepNumber) {
    document.querySelectorAll('.step-content').forEach(content => {
        content.style.display = 'none';
    });
    
    document.getElementById(`step-${stepNumber}`).style.display = 'block';
    currentStep = stepNumber;
    updateStepNavigation();
    
    // 在所有步骤中都显示加速按钮
    const speedButton = document.getElementById('speed-button');
    if (speedButton) {
        speedButton.classList.add('show');
    }
}

// 上一步
function prevStep(stepNumber) {
    // 隐藏当前步骤的按钮（带淡出动画）
    const currentStepButtons = document.getElementById(`step-${currentStep}-buttons`);
    if (currentStepButtons && currentStepButtons.style.display !== 'none') {
        currentStepButtons.style.transition = 'opacity 0.2s ease-out, transform 0.2s ease-out';
        currentStepButtons.style.opacity = '0';
        currentStepButtons.style.transform = 'translateY(-10px)';
        
        setTimeout(() => {
            currentStepButtons.style.display = 'none';
            currentStepButtons.style.transform = 'translateY(0)';
        }, 200);
    }
    
    showStep(stepNumber);
    addTerminalOutput(`返回到步骤 ${stepNumber}...`, 'info');
}

// 下一步
function nextStep(stepNumber) {
    // 隐藏当前步骤的按钮（带淡出动画）
    const currentStepButtons = document.getElementById(`step-${currentStep}-buttons`);
    if (currentStepButtons && currentStepButtons.style.display !== 'none') {
        currentStepButtons.style.transition = 'opacity 0.2s ease-out, transform 0.2s ease-out';
        currentStepButtons.style.opacity = '0';
        currentStepButtons.style.transform = 'translateY(-10px)';
        
        setTimeout(() => {
            currentStepButtons.style.display = 'none';
            currentStepButtons.style.transform = 'translateY(0)';
        }, 200);
    }
    
    showStep(stepNumber);
    addTerminalOutput(`正在进入步骤 ${stepNumber}...`, 'info');
}

// 导航到指定步骤（带验证）
function navigateToStep(targetStep) {
    // 检查是否可以跳转到目标步骤
    if (!canNavigateToStep(targetStep)) {
        return;
    }
    
    // 如果是向前跳转，检查前置条件
    if (targetStep > currentStep) {
        const missingSteps = [];
        for (let i = currentStep; i < targetStep; i++) {
            if (!isStepCompleted(i)) {
                missingSteps.push(i);
            }
        }
        
        if (missingSteps.length > 0) {
            showStepValidationAlert(targetStep, missingSteps);
            return;
        }
    }
    
    // 执行步骤切换
    showStep(targetStep);
    // 已移除直接跳转的终端提示
}

// 检查是否可以导航到指定步骤
function canNavigateToStep(targetStep) {
    if (targetStep < 1 || targetStep > 6) {
        return false;
    }
    
    // 总是允许回到之前的步骤
    if (targetStep <= currentStep) {
        return true;
    }
    
    // 检查前置步骤是否完成
    return isStepCompleted(targetStep - 1);
}

// 检查步骤是否已完成
function isStepCompleted(stepNumber) {
    switch (stepNumber) {
        case 1:
            return true; // 算法介绍总是可以完成
        case 2:
            return simulationConfig.modelLoaded || false;
        case 3:
            return simulationConfig.parametersSet || false;
        case 4:
            return simulationConfig.geneSet !== null;
        case 5:
            return optKnockResults !== null;
        case 6:
            return optKnockResults !== null;
        default:
            return false;
    }
}

// 显示步骤验证提示
function showStepValidationAlert(targetStep, missingSteps) {
    const stepNames = {
        1: '算法介绍',
        2: '模型加载',
        3: '参数设置',
        4: '基因集选择',
        5: 'OptKnock执行',
        6: '结果分析'
    };
    
    const missingStepNames = missingSteps.map(step => stepNames[step]).join('、');
    const targetStepName = stepNames[targetStep];
    
    const alertMessage = `无法跳转到"${targetStepName}"步骤。\n请先完成以下步骤：${missingStepNames}`;
    
    // 创建自定义提示框
    const alertDiv = document.createElement('div');
    alertDiv.className = 'step-validation-alert';
    alertDiv.innerHTML = `
        <div class="alert-content">
            <div class="alert-icon">
                <i class="fas fa-exclamation-triangle"></i>
            </div>
            <div class="alert-text">
                <h4>步骤验证失败</h4>
                <p>${alertMessage}</p>
            </div>
            <button class="alert-close" onclick="closeStepAlert()">
                <i class="fas fa-times"></i>
            </button>
        </div>
    `;
    
    document.body.appendChild(alertDiv);
    
    // 3秒后自动关闭
    setTimeout(() => {
        closeStepAlert();
    }, 3000);
    
    // 添加到终端输出
    addTerminalOutput(`❌ ${alertMessage}`, 'error');
}

// 关闭步骤验证提示
function closeStepAlert() {
    const alert = document.querySelector('.step-validation-alert');
    if (alert) {
        alert.remove();
    }
}

// 显示步骤控制按钮
function showStepButtons(nextStepNumber) {
    // 只在对应步骤的按钮容器中显示按钮
    const stepButtonContainer = document.getElementById(`step-${currentStep}-buttons`);
    if (stepButtonContainer) {
        stepButtonContainer.innerHTML = `
            <div class="button-group">
                ${currentStep > 1 ? `<button class="btn btn-secondary" onclick="prevStep(${currentStep - 1})">
                    <i class="fas fa-arrow-left"></i> 上一步
                </button>` : ''}
                <button class="btn btn-primary" onclick="nextStep(${nextStepNumber})">
                    下一步 <i class="fas fa-arrow-right"></i>
                </button>
            </div>
        `;
        
        // 添加淡入动画
        stepButtonContainer.style.opacity = '0';
        stepButtonContainer.style.display = 'block';
        
        // 使用requestAnimationFrame确保DOM更新后再开始动画
        requestAnimationFrame(() => {
            stepButtonContainer.style.transition = 'opacity 0.3s ease-in-out, transform 0.3s ease-in-out';
            stepButtonContainer.style.transform = 'translateY(10px)';
            
            requestAnimationFrame(() => {
                stepButtonContainer.style.opacity = '1';
                stepButtonContainer.style.transform = 'translateY(0)';
            });
        });
    }
}

// 终端输出函数
function addTerminalOutput(text, type = 'output', delay = 0) {
    const appendLine = () => {
        const terminal = document.getElementById('terminal');
        const line = document.createElement('div');
        line.className = 'terminal-line';
        
        const output = document.createElement('span');
        output.className = `terminal-output ${type}`;
        output.textContent = text;
        
        line.appendChild(output);
        terminal.appendChild(line);
        
        // 滚动到底部
        terminal.scrollTop = terminal.scrollHeight;
    };
    
    // 避免与打字机输出顺序颠倒：当 delay 为 0 时同步追加
    if (delay && delay > 0) {
        setTimeout(appendLine, delay);
    } else {
        appendLine();
    }
}

// 打字机效果输出
function typewriterOutput(text, type = 'output', speed = 50) {
    return new Promise((resolve) => {
        const terminal = document.getElementById('terminal');
        const line = document.createElement('div');
        line.className = 'terminal-line';
        
        const output = document.createElement('span');
        output.className = `terminal-output ${type}`;
        
        line.appendChild(output);
        terminal.appendChild(line);
        
        let i = 0;
        const typeInterval = setInterval(() => {
            output.textContent += text.charAt(i);
            i++;
            
            if (i >= text.length) {
                clearInterval(typeInterval);
                resolve();
            }
            
            terminal.scrollTop = terminal.scrollHeight;
        }, speed);
    });
}

// 加载模型
async function loadModel() {
    addTerminalOutput('>> 初始化 COBRA Toolbox...', 'info');
    await typewriterOutput('initCobraToolbox', 'success', 100);
    
    // COBRA Toolbox ASCII 艺术字和详细输出 - 一次性输出
    addTerminalOutput('', 'output');
    addTerminalOutput('       _____   _____   _____    _____     _____     |', 'success');
    addTerminalOutput('      /  ___|  /  _  \\ |  _  \\ |  _  \\   / ___ \\    |   COnstraint-Based Reconstruction and Analysis', 'success');
    addTerminalOutput('      | |      | | | | | |_| | | |_| |  | |___| |   |   The COBRA Toolbox - 2025', 'success');
    addTerminalOutput('      | |      | | | | |  _  { |  _  /  |  ___  |   |', 'success');
    addTerminalOutput('      | |___   | |_| | | |_| | | | \\ \\  | |   | |   |   Documentation:', 'success');
    addTerminalOutput('      \\ \\_____| \\ \\_____/ |_____/ |_|  \\_\\ |_|   |_|   |   http://opencobra.github.io/cobratoolbox', 'success');
    addTerminalOutput('                                                   |', 'success');
    
    addTerminalOutput('', 'output');
    addTerminalOutput('  Done.', 'success');
    addTerminalOutput('  > Saving the MATLAB path ... Done.', 'info');
    addTerminalOutput('    - The MATLAB path was saved in the default location.', 'info');
    addTerminalOutput('', 'output');
    addTerminalOutput('  > Summary of available solvers and solver interfaces', 'info');
    addTerminalOutput('', 'output');
    addTerminalOutput(' \t \t Support           LP \t  MILP \t    QP \t  MIQP \t   NLP \t    EP \t   CLP', 'info');
    addTerminalOutput(' \t ------------------------------------------------------------------------------', 'info');
    addTerminalOutput(' \t dqqMinos     \t active        \t     0 \t     - \t     0 \t     - \t     - \t     - \t     -', 'info');
    addTerminalOutput(' \t glpk         \t active        \t     1 \t     1 \t     - \t     - \t     - \t     - \t     -', 'info');
    addTerminalOutput(' \t gurobi       \t active        \t     1 \t     1 \t     1 \t     1 \t     - \t     - \t     -', 'success');
    addTerminalOutput(' \t lp_solve     \t legacy        \t     1 \t     - \t     - \t     - \t     - \t     - \t     -', 'info');
    addTerminalOutput(' \t matlab       \t active        \t     1 \t     - \t     - \t     - \t     1 \t     - \t     -', 'info');
    addTerminalOutput(' \t mosek        \t active        \t     0 \t     - \t     0 \t     - \t     - \t     0 \t     0', 'info');
    addTerminalOutput(' \t pdco         \t active        \t     1 \t     - \t     1 \t     - \t     - \t     1 \t     -', 'info');
    addTerminalOutput(' \t qpng         \t passive       \t     - \t     - \t     1 \t     - \t     - \t     - \t     -', 'info');
    addTerminalOutput(' \t quadMinos    \t active        \t     0 \t     - \t     - \t     - \t     - \t     - \t     -', 'info');
    addTerminalOutput(' \t tomlab_snopt \t passive       \t     - \t     - \t     - \t     - \t     0 \t     - \t     -', 'info');
    addTerminalOutput(' \t ------------------------------------------------------------------------------', 'info');
    addTerminalOutput(' \t Total        \t -             \t     5 \t     2 \t     3 \t     1 \t     1 \t     1 \t     0', 'info');
    addTerminalOutput('', 'output');
    addTerminalOutput('  + Legend: - = not applicable, 0 = solver not compatible or not installed, 1 = solver installed.', 'info');
    addTerminalOutput('', 'output');
    
    addTerminalOutput('>> 设置求解器为 Gurobi...', 'info');
    await typewriterOutput("changeCobraSolver('gurobi', 'LP');", 'success', 80);
    addTerminalOutput('', 'output');
    addTerminalOutput('  > Checking if solver is installed ... Done.', 'success');
    addTerminalOutput('  > Checking if solver is working ... Done.', 'success');
    addTerminalOutput('  > Setting solver for LP problems ... Done.', 'success');
    addTerminalOutput('', 'output');
    addTerminalOutput('  Current solver for LP problems: gurobi', 'info');
    addTerminalOutput('  Current solver for MILP problems: gurobi', 'info');
    addTerminalOutput('  Current solver for QP problems: gurobi', 'info');
    addTerminalOutput('  Current solver for MIQP problems: gurobi', 'info');
    addTerminalOutput('', 'output');
    addTerminalOutput('  > Gurobi Academic License detected', 'success');
    addTerminalOutput('  > Solver parameters configured:', 'info');
    addTerminalOutput('    - Method: Dual Simplex', 'info');
    addTerminalOutput('    - Presolve: Automatic', 'info');
    addTerminalOutput('    - Threads: 8', 'info');
    addTerminalOutput('    - TimeLimit: 1000 seconds', 'info');
    addTerminalOutput('    - FeasibilityTol: 1e-06', 'info');
    addTerminalOutput('    - OptimalityTol: 1e-06', 'info');
    addTerminalOutput('  ✓ Gurobi 求解器配置成功', 'success');
    
    addTerminalOutput('>> 加载 iJO1366 代谢网络模型...', 'info');
    await typewriterOutput("model = readCbModel('iJO1366.mat');", 'success', 80);
    addTerminalOutput('Each model.subSystems{x} is a character array, and this format is retained.', 'info');
    addTerminalOutput('', 'output');
    await typewriterOutput('model =', 'success', 60);
    addTerminalOutput('', 'output');
    addTerminalOutput('  包含以下字段的 struct:', 'info');
    addTerminalOutput('', 'output');
    addTerminalOutput('              S: [1805×2583 double]', 'info');
    addTerminalOutput('           mets: {1805×1 cell}', 'info');
    addTerminalOutput('              b: [1805×1 double]', 'info');
    addTerminalOutput('         csense: [1805×1 char]', 'info');
    addTerminalOutput('           rxns: {2583×1 cell}', 'info');
    addTerminalOutput('             lb: [2583×1 double]', 'info');
    addTerminalOutput('             ub: [2583×1 double]', 'info');
    addTerminalOutput('              c: [2583×1 double]', 'info');
    addTerminalOutput('      osenseStr: \'max\'', 'info');
    addTerminalOutput('          genes: {1367×1 cell}', 'info');
    addTerminalOutput('          rules: {2583×1 cell}', 'info');
    addTerminalOutput('     metCharges: [1805×1 double]', 'info');
    addTerminalOutput('    metFormulas: {1805×1 cell}', 'info');
    addTerminalOutput('       metNames: {1805×1 cell}', 'info');
    addTerminalOutput('        grRules: {2583×1 cell}', 'info');
    addTerminalOutput('     rxnGeneMat: [2583×1367 double]', 'info');
    addTerminalOutput('       rxnNames: {2583×1 cell}', 'info');
    addTerminalOutput('     subSystems: {2583×1 cell}', 'info');
    addTerminalOutput('    description: \'iJO1366.mat\'', 'info');
    addTerminalOutput('        modelID: \'iJO1366\'', 'info');
    addTerminalOutput('', 'output');
    
    addTerminalOutput('✓ 模型加载成功！', 'success');
    addTerminalOutput(`   - 基因数量: 1366`, 'info');
    addTerminalOutput(`   - 反应数量: 2583`, 'info');
    addTerminalOutput(`   - 代谢物数量: 1805`, 'info');
    addTerminalOutput(`   - 细胞区室: 8 (细胞质、周质、外膜等)`, 'info');
    addTerminalOutput(`   - 交换反应: 95`, 'info');
    addTerminalOutput(`   - 传输反应: 178`, 'info');
    
    // 模型验证
    addTerminalOutput('>> 执行模型验证...', 'info');
    await typewriterOutput("solution = optimizeCbModel(model);", 'success', 80);
    addTerminalOutput('   ✓ 模型可行性验证通过', 'success');
    addTerminalOutput(`   - 最大生长速率: 0.982 h⁻¹`, 'info');
    addTerminalOutput(`   - 葡萄糖摄取速率: 10.0 mmol/gDW·hr`, 'info');
    addTerminalOutput(`   - ATP 维持需求: 8.39 mmol/gDW·hr`, 'info');
    
    // 标记模型已加载
    simulationConfig.modelLoaded = true;
    
    // 显示下一步按钮
    setTimeout(() => {
        addTerminalOutput('', 'output');
        addTerminalOutput('模型加载完成，点击下方按钮继续到下一步。', 'info');
        showStepButtons(3);
    }, 1500);
}

// 设置参数
function setParameters() {
    simulationConfig.glucoseConc = document.getElementById('glucose-conc').value;
    simulationConfig.targetProduct = document.getElementById('target-product').value;
    simulationConfig.knockoutSize = document.getElementById('knockout-size').value;
    simulationConfig.minGrowth = document.getElementById('min-growth').value;
    
    addTerminalOutput('>> 配置实验参数...', 'info');
    addTerminalOutput(`   - 葡萄糖浓度: ${simulationConfig.glucoseConc} mmol/gDW·hr`, 'success');
    addTerminalOutput(`   - 目标产物: ${productInfo[simulationConfig.targetProduct].name}`, 'success');
    addTerminalOutput(`   - 敲除基因数: ${simulationConfig.knockoutSize}`, 'success');
    addTerminalOutput(`   - 最小生长速率: ${simulationConfig.minGrowth}%`, 'success');
    
    // 模拟设置葡萄糖摄取速率
    setTimeout(async () => {
        addTerminalOutput('', 'output');
        addTerminalOutput('>> 设置培养基条件...', 'info');
        await typewriterOutput(`model = changeRxnBounds(model, 'EX_glc__D_e', -${simulationConfig.glucoseConc}, 'l');`, 'success', 60);
        addTerminalOutput('', 'output');
        addTerminalOutput('  > Checking reaction bounds ... Done.', 'success');
        addTerminalOutput('  > Updating stoichiometric matrix ... Done.', 'success');
        addTerminalOutput('  > Validating flux constraints ... Done.', 'success');
        addTerminalOutput('', 'output');
        addTerminalOutput('  Current exchange reaction bounds:', 'info');
        addTerminalOutput(`    EX_glc__D_e: [-${simulationConfig.glucoseConc}, 1000] mmol/gDW·hr`, 'info');
        addTerminalOutput('    EX_o2_e: [-15, 1000] mmol/gDW·hr', 'info');
        addTerminalOutput('    EX_pi_e: [-1000, 1000] mmol/gDW·hr', 'info');
        addTerminalOutput('    EX_h2o_e: [-1000, 1000] mmol/gDW·hr', 'info');
        addTerminalOutput('', 'output');
        
        addTerminalOutput('>> 配置目标产物反应...', 'info');
        const targetReactions = {
            'succinate': 'EX_succ_e',
            'lactate': 'EX_lac__D_e', 
            'acetate': 'EX_ac_e',
            'ethanol': 'EX_etoh_e',
            'formate': 'EX_for_e'
        };
        addTerminalOutput('', 'output');
        addTerminalOutput('  > Locating target reaction in model ... Done.', 'success');
        addTerminalOutput('  > Verifying reaction stoichiometry ... Done.', 'success');
        addTerminalOutput('  > Setting optimization objective ... Done.', 'success');
        addTerminalOutput('', 'output');
        await typewriterOutput(`targetRxn = '${targetReactions[simulationConfig.targetProduct]}';`, 'success', 60);
        addTerminalOutput('', 'output');
        addTerminalOutput('  Target reaction details:', 'info');
        addTerminalOutput(`    Reaction ID: ${targetReactions[simulationConfig.targetProduct]}`, 'info');
        addTerminalOutput(`    Product: ${productInfo[simulationConfig.targetProduct].name}`, 'info');
        addTerminalOutput('    Stoichiometry: 1 ${simulationConfig.targetProduct}_c --> 1 ${simulationConfig.targetProduct}_e', 'info');
        addTerminalOutput('    Current bounds: [0, 1000] mmol/gDW·hr', 'info');
        addTerminalOutput('', 'output');
        
        addTerminalOutput('>> 设置生长约束...', 'info');
        await typewriterOutput(`minGrowthRate = ${(simulationConfig.minGrowth / 100 * 0.982).toFixed(3)};`, 'success', 60);
        addTerminalOutput('', 'output');
        addTerminalOutput('  > Calculating growth constraints ... Done.', 'success');
        addTerminalOutput('  > Updating biomass objective function ... Done.', 'success');
        addTerminalOutput('  > Validating feasibility ... Done.', 'success');
        addTerminalOutput('', 'output');
        addTerminalOutput('  Growth constraint parameters:', 'info');
        addTerminalOutput(`    Wild-type growth rate: 0.982 h⁻¹`, 'info');
        addTerminalOutput(`    Minimum growth rate: ${(simulationConfig.minGrowth / 100 * 0.982).toFixed(3)} h⁻¹`, 'info');
        addTerminalOutput(`    Growth constraint: ${simulationConfig.minGrowth}% of wild-type`, 'info');
        addTerminalOutput('    Biomass reaction: BIOMASS_Ec_iJO1366_core_53p95M', 'info');
        addTerminalOutput('', 'output');
        
        addTerminalOutput('✓ 参数设置完成！', 'success');
        addTerminalOutput('   - 模型边界条件已更新', 'info');
        addTerminalOutput('   - OptKnock 约束已配置', 'info');
        
        // 标记参数已设置
        simulationConfig.parametersSet = true;
        
        // 显示下一步按钮
        setTimeout(() => {
            addTerminalOutput('', 'output');
            addTerminalOutput('参数设置完成，点击下方按钮继续到下一步。', 'info');
            showStepButtons(4);
        }, 500);
    }, 1500);
}

// 更新生长速率显示
function updateGrowthValue(value) {
    document.getElementById('growth-value').textContent = value + '%';
}

// 选择基因集卡片
function selectGeneSetCard(card) {
    // 移除其他卡片的选中状态
    document.querySelectorAll('.gene-set-card').forEach(c => {
        c.classList.remove('selected');
    });
    
    // 选中当前卡片
    card.classList.add('selected');
    selectedGeneSet = card.dataset.geneset;
    
    // 启用按钮
    document.getElementById('select-geneset-btn').disabled = false;
    
    addTerminalOutput(`>> 选择基因集: ${geneSetInfo[selectedGeneSet].name}`, 'info');
    addTerminalOutput(`   ${geneSetInfo[selectedGeneSet].description}`, 'info');
}

// 确认基因集选择
async function selectGeneSet() {
    if (!selectedGeneSet) return;
    
    simulationConfig.geneSet = selectedGeneSet;
    const geneSet = geneSetInfo[selectedGeneSet];
    
    addTerminalOutput('>> 分析选定的代谢途径...', 'info');
    addTerminalOutput(`   - 途径名称: ${geneSet.name}`, 'info');
    addTerminalOutput(`   - 途径描述: ${geneSet.description}`, 'info');
    addTerminalOutput(`   - 候选反应数量: ${geneSet.reactions.length}`, 'info');
    addTerminalOutput('', 'output');
    
    addTerminalOutput('>> 加载代谢途径数据库...', 'info');
    await typewriterOutput(`pathwayDB = loadPathwayDatabase('${selectedGeneSet}');`, 'success', 60);
    addTerminalOutput('', 'output');
    addTerminalOutput('  > Loading pathway annotations ... Done.', 'success');
    addTerminalOutput('  > Parsing gene-reaction associations ... Done.', 'success');
    addTerminalOutput('  > Validating pathway connectivity ... Done.', 'success');
    addTerminalOutput('', 'output');
    addTerminalOutput('  Pathway database summary:', 'info');
    addTerminalOutput(`    Database: ${geneSet.name}`, 'info');
    addTerminalOutput(`    Total reactions: ${geneSet.reactions.length}`, 'info');
    addTerminalOutput(`    Pathway type: ${selectedGeneSet.replace('_', ' ')}`, 'info');
    addTerminalOutput(`    Connectivity score: ${(Math.random() * 0.3 + 0.7).toFixed(3)}`, 'info');
    addTerminalOutput('', 'output');
    
    addTerminalOutput('>> 定义候选敲除反应集合...', 'info');
    await typewriterOutput(`candidateRxns = {`, 'success', 80);
    
    // 使用顺序的打字机效果输出每一行代码，确保视觉顺序稳定
    for (let index = 0; index < geneSet.reactions.length; index++) {
        const reaction = geneSet.reactions[index];
        await typewriterOutput(`    '${reaction}'${index < geneSet.reactions.length - 1 ? ',' : ''}`, 'success', 50);
    }
    
    await typewriterOutput(`};`, 'success', 80);
    addTerminalOutput('', 'output');
    
    addTerminalOutput('>> 验证反应可用性...', 'info');
    await typewriterOutput(`[rxnExists, geneAssoc] = checkReactionAvailability(model, candidateRxns);`, 'success', 60);
    addTerminalOutput('', 'output');
    addTerminalOutput('  > Checking reaction existence in model ... Done.', 'success');
    addTerminalOutput('  > Validating gene-reaction associations ... Done.', 'success');
    addTerminalOutput('  > Analyzing knockout feasibility ... Done.', 'success');
    addTerminalOutput('  > Computing pathway flux distributions ... Done.', 'success');
    addTerminalOutput('', 'output');
    addTerminalOutput('  Reaction validation results:', 'info');
    geneSet.reactions.slice(0, 5).forEach(reaction => {
        addTerminalOutput(`    ${reaction}: [EXISTS] GPR: ${Math.floor(Math.random() * 3) + 1} genes`, 'info');
    });
    if (geneSet.reactions.length > 5) {
        addTerminalOutput(`    ... and ${geneSet.reactions.length - 5} more reactions`, 'info');
    }
    addTerminalOutput('', 'output');
    
    addTerminalOutput('>> 计算组合搜索空间...', 'info');
    await typewriterOutput(`searchSpace = nchoosek(${geneSet.reactions.length}, ${simulationConfig.knockoutSize});`, 'success', 60);
    addTerminalOutput('', 'output');
    addTerminalOutput('  > Computing combinatorial complexity ... Done.', 'success');
    addTerminalOutput('  > Estimating computational requirements ... Done.', 'success');
    addTerminalOutput('  > Analyzing search strategy ... Done.', 'success');
    addTerminalOutput('', 'output');
    addTerminalOutput('  Search space analysis:', 'info');
    const combinations = Math.min(Math.pow(geneSet.reactions.length, parseInt(simulationConfig.knockoutSize)), 999999);
    addTerminalOutput(`    Total combinations: ${combinations.toLocaleString()}`, 'info');
    addTerminalOutput(`    Knockout size: ${simulationConfig.knockoutSize}`, 'info');
    addTerminalOutput(`    Search complexity: ${combinations > 10000 ? 'High' : combinations > 1000 ? 'Medium' : 'Low'}`, 'info');
    addTerminalOutput(`    Estimated runtime: ${combinations > 10000 ? '5-10 min' : combinations > 1000 ? '2-5 min' : '< 2 min'}`, 'info');
    addTerminalOutput('', 'output');
    
    addTerminalOutput(`✓ 基因集验证完成`, 'success');
    addTerminalOutput(`   - 有效候选反应: ${geneSet.reactions.length}`, 'info');
    addTerminalOutput(`   - 预计组合数量: ${combinations.toLocaleString()}`, 'info');
    addTerminalOutput(`   - 搜索空间复杂度: ${combinations > 10000 ? '高' : combinations > 1000 ? '中等' : '低'}`, 'info');
    
    // 更新步骤5的配置显示
    updateExecutionConfig();
    
    // 显示下一步按钮
    setTimeout(() => {
        addTerminalOutput('', 'output');
        addTerminalOutput('基因集选择完成，点击下方按钮继续到下一步。', 'info');
        showStepButtons(5);
    }, 500);
}

// 更新执行配置显示
function updateExecutionConfig() {
    document.getElementById('selected-geneset-name').textContent = geneSetInfo[simulationConfig.geneSet].name;
    document.getElementById('selected-glucose').textContent = simulationConfig.glucoseConc;
    document.getElementById('selected-target').textContent = productInfo[simulationConfig.targetProduct].name;
    document.getElementById('selected-knockout').textContent = simulationConfig.knockoutSize;
}

// 运行OptKnock算法
async function runOptKnock() {
    addTerminalOutput('>> 初始化 OptKnock 双层优化框架...', 'info');
    
    // 立即显示加速按钮
    const speedButton = document.getElementById('speed-button');
    if (speedButton) {
        speedButton.classList.add('show');
    }
    
    await typewriterOutput('optKnockOptions = struct();', 'success', 60);
    await typewriterOutput('optKnockOptions.targetRxn = model.rxns(targetRxnIdx);', 'success', 60);
    await typewriterOutput('optKnockOptions.numDelRxns = ' + simulationConfig.knockoutSize + ';', 'success', 60);
    
    addTerminalOutput('   - 加载 COBRA Toolbox OptKnock 模块...', 'info');
    await typewriterOutput('addpath(genpath(\'cobratoolbox/src/analysis/optKnock\'));', 'success', 60);
    
    addTerminalOutput('   - 配置求解器参数...', 'info');
    await typewriterOutput('changeCobraSolver(\'gurobi\', \'MILP\');', 'success', 60);
    await typewriterOutput('optKnockOptions.solverParams.timeLimit = 3600;', 'success', 60);
    
    addTerminalOutput('>> 构建双层优化问题...', 'info');
    addTerminalOutput(`   - 外层目标: 最大化 ${productInfo[simulationConfig.targetProduct].name} 产量`, 'info');
    addTerminalOutput(`   - 内层约束: 维持生长率 ≥ ${simulationConfig.minGrowth}% 野生型`, 'info');
    addTerminalOutput(`   - 敲除数量: ${simulationConfig.knockoutSize} 个反应`, 'info');
    
    await typewriterOutput('% 应用生长约束到优化问题', 'success', 60);
    await typewriterOutput('minGrowthRate = ' + (simulationConfig.minGrowth / 100).toFixed(2) + ' * wildTypeGrowth;', 'success', 60);
    await typewriterOutput('optKnockOptions.minGrowthRate = minGrowthRate;', 'success', 60);
    
    // 显示进度条
    const progressHTML = `
        <div class="progress-bar">
            <div class="progress-fill" id="progress-fill"></div>
        </div>
    `;
    
    const terminal = document.getElementById('terminal');
    const progressLine = document.createElement('div');
    progressLine.className = 'terminal-line';
    progressLine.innerHTML = progressHTML;
    terminal.appendChild(progressLine);
    
    // 模拟OptKnock执行过程
    const steps = [
        { 
            text: '>> 设置双层优化问题...', 
            detail: '   - 定义决策变量和二进制变量...', 
            code: ['% 定义二进制敲除变量', 'y = binvar(length(candidateRxns), 1);', '% 设置敲除约束', 'sum(y) == numDelRxns;'],
            progress: 10 
        },
        { 
            text: '>> 定义目标函数和约束条件...', 
            detail: '   - 构建线性规划矩阵...', 
            code: [
                '% 外层目标函数',
                'obj_outer = model.c;',
                'obj_outer(targetRxnIdx) = 1;',
                '% 内层约束矩阵',
                'A_inner = model.S;',
                '% 化学计量矩阵约束:',
                'S * v = 0  (稳态假设)',
                '% 不可逆性约束:',
                'v_j ≥ 0, ∀j ∈ irreversible_rxns',
                '% 生长率约束:',
                'v_biomass ≥ μ_min'
            ],
            progress: 25 
        },
        { 
            text: '>> 枚举基因敲除组合...', 
            detail: `   - 搜索空间: C(${geneSetInfo[simulationConfig.geneSet].reactions.length}, ${simulationConfig.knockoutSize}) = ${Math.floor(Math.pow(geneSetInfo[simulationConfig.geneSet].reactions.length, parseInt(simulationConfig.knockoutSize)) / 10)} 种组合`, 
            code: ['% 生成敲除组合', 'knockoutCombinations = nchoosek(candidateRxns, numDelRxns);', 'fprintf(\'总组合数: %d\\n\', size(knockoutCombinations, 1));'],
            progress: 40 
        },
        { 
            text: '>> 求解内层FBA问题...', 
            detail: '   - 计算每种敲除组合的生长率...', 
            code: [
                'for i = 1:size(knockoutCombinations, 1)',
                '    tempModel = model;',
                '    tempModel.lb(knockoutCombinations(i, :)) = 0;',
                '    tempModel.ub(knockoutCombinations(i, :)) = 0;',
                '    sol = optimizeCbModel(tempModel);',
                '% FBA线性规划问题:',
                'max c^T * v',
                's.t. S * v = 0',
                '     lb ≤ v ≤ ub',
                '% 敲除后的约束:',
                'v_knockout = 0',
                '% 最优性条件 (KKT):',
                '∇L = c - S^T*λ - μ_lb + μ_ub = 0',
                'end'
            ],
            progress: 60 
        },
        { 
            text: '>> 求解外层优化问题...', 
            detail: '   - 应用混合整数线性规划求解器...', 
            code: [
                '% 外层MILP优化问题:',
                'max f(x,y) = c^T * v_target',
                's.t. y ∈ {0,1}^n, Σy_i = k',
                '% 内层LP问题:',
                'max g(x,y) = c_biomass^T * v',
                's.t. S*v = 0, lb ≤ v ≤ ub',
                '% Big-M约束 (敲除约束):',
                'v_i ≤ M * (1 - y_i), ∀i',
                'v_i ≥ -M * (1 - y_i), ∀i',
                '% 质量平衡约束:',
                'Σ S_ij * v_j = 0, ∀i',
                '% 通量边界约束:',
                'lb_j ≤ v_j ≤ ub_j, ∀j',
                '% 二进制变量约束:',
                'y_i ∈ {0,1}, ∀i ∈ candidate_set'
            ],
            progress: 80 
        },
        { 
            text: '>> 分析最优解...', 
            detail: '   - 验证解的可行性和最优性...', 
            code: ['% 验证最优解', 'if optKnockSol.stat == 1', '    knockoutRxns = optKnockSol.rxnList;', '    targetProduction = optKnockSol.f;', '    fprintf(\'目标产物产量: %.4f\\n\', targetProduction);', 'end'],
            progress: 95 
        }
    ];
    
    for (let i = 0; i < steps.length; i++) {
        await new Promise(resolve => setTimeout(resolve, 1500));
        addTerminalOutput(steps[i].text, 'info');
        if (steps[i].detail) {
            addTerminalOutput(steps[i].detail, 'info');
        }
        
        // 显示代码
        if (steps[i].code) {
            for (let j = 0; j < steps[i].code.length; j++) {
                await new Promise(resolve => setTimeout(resolve, 300));
                await typewriterOutput(steps[i].code[j], 'success', 50);
            }
        }
        
        document.getElementById('progress-fill').style.width = steps[i].progress + '%';
    }
    
    // 完成进度条
    document.getElementById('progress-fill').style.width = '100%';
    addTerminalOutput('✓ OptKnock 算法执行完成', 'success');
    
    // 获取实际结果数据
    try {
        const response = await fetch(`/api/scenario?geneset=${simulationConfig.geneSet}&glucose=${simulationConfig.glucoseConc}&target=${simulationConfig.targetProduct}&knockout=${simulationConfig.knockoutSize}`);
        const data = await response.json();
        
        if (data.success && data.scenario) {
            optKnockResults = data.scenario;
            addTerminalOutput('>> 从服务器获取优化结果...', 'info');
            displayOptKnockResults();
        } else {
            // 使用模拟数据
            addTerminalOutput('>> 生成模拟优化结果...', 'info');
            generateMockResults();
        }
    } catch (error) {
        console.error('获取数据失败:', error);
        addTerminalOutput('>> 连接服务器失败，使用本地模拟数据...', 'info');
        generateMockResults();
    }
    
    // 显示下一步按钮
    setTimeout(() => {
        addTerminalOutput('', 'output');
        addTerminalOutput('OptKnock算法执行完成，点击下方按钮查看结果分析。', 'info');
        showStepButtons(6);
    }, 1000);
}

// 显示OptKnock结果
async function displayOptKnockResults() {
    if (!optKnockResults) return;
    
    const results = optKnockResults;
    
    // 计算一致的产量提升百分比（基于WT与突变株产量）
    const computedImprovement = (typeof results.wildtype_production === 'number' && typeof results.mutant_production === 'number' && results.wildtype_production > 0)
        ? ((results.mutant_production - results.wildtype_production) / results.wildtype_production) * 100
        : null;
    addTerminalOutput('', 'output');
    addTerminalOutput('  > Parsing optimization solution ... Done.', 'success');
    addTerminalOutput('  > Extracting knockout strategies ... Done.', 'success');
    addTerminalOutput('  > Computing flux distributions ... Done.', 'success');
    addTerminalOutput('  > Validating solution feasibility ... Done.', 'success');
    addTerminalOutput('', 'output');
    
    addTerminalOutput('>> 验证解的可行性...', 'info');
    await typewriterOutput(`[feasible, violations] = validateSolution(model, optSol);`, 'success', 60);
    addTerminalOutput('', 'output');
    addTerminalOutput('  > Checking mass balance constraints ... Done.', 'success');
    addTerminalOutput('  > Verifying flux bounds ... Done.', 'success');
    addTerminalOutput('  > Analyzing thermodynamic feasibility ... Done.', 'success');
    addTerminalOutput('  > Computing growth-coupling strength ... Done.', 'success');
    addTerminalOutput('', 'output');
    addTerminalOutput('  Solution validation results:', 'info');
    addTerminalOutput('    Mass balance: SATISFIED', 'success');
    addTerminalOutput('    Flux bounds: SATISFIED', 'success');
    addTerminalOutput('    Thermodynamics: FEASIBLE', 'success');
    addTerminalOutput(`    Constraint violations: ${Math.floor(Math.random() * 3)}`, 'info');
    addTerminalOutput('', 'output');
    
    addTerminalOutput('>> 计算代谢通量分布...', 'info');
    await typewriterOutput(`fluxAnalysis = computeFluxDistribution(model, optSol);`, 'success', 60);
    addTerminalOutput('', 'output');
    addTerminalOutput('  > Computing wild-type flux distribution ... Done.', 'success');
    addTerminalOutput('  > Computing mutant flux distribution ... Done.', 'success');
    addTerminalOutput('  > Analyzing flux changes ... Done.', 'success');
    addTerminalOutput('  > Computing pathway activities ... Done.', 'success');
    addTerminalOutput('', 'output');
    addTerminalOutput('  Flux distribution summary:', 'info');
    addTerminalOutput(`    Active reactions (wild-type): ${Math.floor(Math.random() * 200) + 800}`, 'info');
    addTerminalOutput(`    Active reactions (mutant): ${Math.floor(Math.random() * 150) + 750}`, 'info');
    addTerminalOutput(`    Significantly changed fluxes: ${Math.floor(Math.random() * 50) + 20}`, 'info');
    addTerminalOutput(`    Pathway rerouting events: ${Math.floor(Math.random() * 10) + 5}`, 'info');
    addTerminalOutput('', 'output');
    
    addTerminalOutput('>> 分析生长耦合效应...', 'info');
    await typewriterOutput(`couplingAnalysis = analyzeGrowthCoupling(fluxAnalysis);`, 'success', 60);
    addTerminalOutput('', 'output');
    addTerminalOutput('  > Computing coupling coefficients ... Done.', 'success');
    addTerminalOutput('  > Analyzing production envelope ... Done.', 'success');
    addTerminalOutput('  > Evaluating coupling strength ... Done.', 'success');
    addTerminalOutput('  > Computing robustness metrics ... Done.', 'success');
    addTerminalOutput('', 'output');
    addTerminalOutput('  Growth-coupling analysis:', 'info');
    addTerminalOutput(`    Coupling coefficient: ${(Math.random() * 0.8 + 0.2).toFixed(3)}`, 'info');
    addTerminalOutput(`    Coupling type: ${results.growth_coupled ? 'Strong' : 'Weak'}`, 'info');
    addTerminalOutput(`    Production envelope slope: ${(Math.random() * 2 + 1).toFixed(3)}`, 'info');
    addTerminalOutput(`    Robustness score: ${(Math.random() * 0.5 + 0.5).toFixed(3)}`, 'info');
    addTerminalOutput('', 'output');
    
    addTerminalOutput('>> OptKnock 结果分析:', 'success');
    addTerminalOutput(`   最优敲除策略: ${results.knockout_genes || 'N/A'}`, 'info');
    addTerminalOutput(`   - 敲除反应数量: ${simulationConfig.knockoutSize}`, 'info');
    addTerminalOutput(`   - 敲除类型: ${results.knockout_type || '基因敲除'}`, 'info');
    addTerminalOutput('', 'output');
    
    addTerminalOutput('>> 产量分析:', 'info');
    await typewriterOutput(`productionAnalysis = struct();`, 'success', 60);
    await typewriterOutput(`productionAnalysis.wildtype = ${results.wildtype_production?.toFixed(4) || '0.0000'};`, 'success', 60);
    await typewriterOutput(`productionAnalysis.mutant = ${results.mutant_production?.toFixed(4) || '0.0000'};`, 'success', 60);
    await typewriterOutput(`productionAnalysis.improvement = ${computedImprovement !== null ? computedImprovement.toFixed(2) : 'N/A'};`, 'success', 60);
    addTerminalOutput('', 'output');
    addTerminalOutput('  Production analysis summary:', 'info');
    addTerminalOutput(`    Wild-type production: ${results.wildtype_production?.toFixed(4) || 'N/A'} ${productInfo[simulationConfig.targetProduct].unit}`, 'info');
    addTerminalOutput(`    Mutant production: ${results.mutant_production?.toFixed(4) || 'N/A'} ${productInfo[simulationConfig.targetProduct].unit}`, 'info');
    addTerminalOutput(`    Production fold-change: ${results.mutant_production && results.wildtype_production ? (results.mutant_production / results.wildtype_production).toFixed(2) : 'N/A'}x`, 'info');
    addTerminalOutput(`    Relative improvement: ${computedImprovement !== null ? computedImprovement.toFixed(2) : 'N/A'}%`, computedImprovement !== null && computedImprovement > 0 ? 'success' : 'warning');
    addTerminalOutput('', 'output');
    
    addTerminalOutput('>> 生长特性分析:', 'info');
    await typewriterOutput(`growthAnalysis = analyzeGrowthCharacteristics(fluxAnalysis);`, 'success', 60);
    addTerminalOutput('', 'output');
    addTerminalOutput('  Growth characteristics summary:', 'info');
    addTerminalOutput(`    Wild-type growth rate: ${results.wildtype_growth?.toFixed(4) || 'N/A'} h⁻¹`, 'info');
    addTerminalOutput(`    Mutant growth rate: ${results.mutant_growth?.toFixed(4) || 'N/A'} h⁻¹`, 'info');
    addTerminalOutput(`    Growth rate change: ${results.growth_change?.toFixed(4) || 'N/A'} h⁻¹`, 'info');
    addTerminalOutput(`    Growth coupling: ${results.growth_coupled ? '强耦合' : '弱耦合'}`, results.growth_coupled ? 'success' : 'warning');
    addTerminalOutput('', 'output');
    
    addTerminalOutput('>> 代谢效率评估:', 'info');
    await typewriterOutput(`efficiencyMetrics = computeMetabolicEfficiency(fluxAnalysis);`, 'success', 60);
    addTerminalOutput('', 'output');
    addTerminalOutput('  Metabolic efficiency metrics:', 'info');
    addTerminalOutput(`    Carbon utilization: ${results.carbon_efficiency?.toFixed(2) || 'N/A'}%`, 'info');
    addTerminalOutput(`    ATP generation efficiency: ${results.atp_efficiency?.toFixed(2) || 'N/A'}%`, 'info');
    addTerminalOutput(`    NADH/NADPH balance: ${results.redox_balance || '平衡'}`, 'info');
    addTerminalOutput(`    Theoretical yield: ${(Math.random() * 0.3 + 0.7).toFixed(3)} mol/mol glucose`, 'info');
    addTerminalOutput('', 'output');
    
    // 页面显示结果摘要
    const summaryHTML = `
        <h3><i class="fas fa-chart-bar"></i> OptKnock 执行结果</h3>
        <div class="result-item">
            <h4>最优敲除策略</h4>
            <div class="result-value">${results.knockout_genes || '未找到有效敲除'}</div>
        </div>
        <div class="result-item">
            <h4>${productInfo[simulationConfig.targetProduct].name}产量提升</h4>
            <div class="result-value ${computedImprovement !== null && computedImprovement > 0 ? '' : 'negative'}">
                ${computedImprovement !== null ? computedImprovement.toFixed(2) + '%' : 'N/A'}
            </div>
        </div>
        <div class="result-item">
            <h4>野生型 vs 突变株产量</h4>
            <div class="result-value">
                ${results.wildtype_production?.toFixed(4) || 'N/A'} → ${results.mutant_production?.toFixed(4) || 'N/A'} ${productInfo[simulationConfig.targetProduct].unit}
            </div>
        </div>
        <div class="result-item">
            <h4>生长耦合分析</h4>
            <div class="result-value ${results.growth_coupled ? '' : 'negative'}">
                ${results.growth_coupled ? '生长耦合' : '非生长耦合'}
            </div>
        </div>
        <div class="result-item">
            <h4>生长速率影响</h4>
            <div class="result-value">
                ${results.growth_change?.toFixed(4) || 'N/A'} h⁻¹
            </div>
        </div>
    `;
    
    document.getElementById('results-summary').innerHTML = summaryHTML;
    
    // 创建结果分析图表
    addTerminalOutput('', 'output');
    addTerminalOutput('>> 生成结果分析图表...', 'info');
    await typewriterOutput(`chartsConfig = generateResultsCharts(optKnockResults);`, 'success', 60);
    addTerminalOutput('  > Creating knockout comparison chart ... Done.', 'success');
    addTerminalOutput('  > Generating production trend analysis ... Done.', 'success');
    addTerminalOutput('  > Building metabolic network visualization ... Done.', 'success');
    addTerminalOutput('', 'output');
    
    // 创建并显示图表
    createResultsCharts(results);
}

// 生成模拟结果（当无法获取真实数据时）
function generateMockResults() {
    addTerminalOutput('>> 生成模拟优化结果...', 'info');
    addTerminalOutput('   - 基于历史数据构建结果模型...', 'info');
    addTerminalOutput('   - 应用随机扰动模拟实验变异...', 'info');
    addTerminalOutput('   - 确保结果的生物学合理性...', 'info');
    
    const geneSet = geneSetInfo[simulationConfig.geneSet];
    const availableReactions = geneSet.reactions;
    
    // 随机选择敲除反应
    const knockoutReactions = [];
    const shuffled = [...availableReactions].sort(() => 0.5 - Math.random());
    for (let i = 0; i < parseInt(simulationConfig.knockoutSize); i++) {
        knockoutReactions.push(shuffled[i]);
    }
    
    const mockResults = {
        knockout_genes: knockoutReactions.join(', '),
        knockout_type: '反应敲除',
        wildtype_production: Math.random() * 2 + 0.5,
        mutant_production: 0, // 先设为0，后面计算
        wildtype_growth: 0.8 + Math.random() * 0.4,
        mutant_growth: 0.6 + Math.random() * 0.3,
        improvement: 0, // 先设为0，后面计算
        growth_change: (Math.random() - 0.5) * 0.2,
        growth_coupled: Math.random() > 0.3,
        carbon_efficiency: 75 + Math.random() * 20,
        atp_efficiency: 80 + Math.random() * 15,
        redox_balance: Math.random() > 0.7 ? '平衡' : '轻微失衡'
    };
    
    // 计算相关指标 - 修正逻辑
    // 产量提升应该是合理的范围，比如50%-500%
    const improvementPercent = Math.random() * 450 + 50; // 50%-500%
    mockResults.improvement = improvementPercent;
    mockResults.mutant_production = mockResults.wildtype_production * (1 + improvementPercent / 100);
    mockResults.growth_change = mockResults.mutant_growth - mockResults.wildtype_growth;
    
    addTerminalOutput('✓ 模拟结果生成完成', 'success');
    addTerminalOutput(`   - 敲除策略: ${mockResults.knockout_genes}`, 'info');
    addTerminalOutput(`   - 预期产量提升: ${mockResults.improvement.toFixed(1)}%`, 'info');
    
    optKnockResults = mockResults;
    displayOptKnockResults();
}

// 重置模拟
function resetSimulation() {
    currentStep = 1;
    selectedGeneSet = null;
    optKnockResults = null;
    
    // 清空终端
    document.getElementById('terminal').innerHTML = `
        <div class="terminal-line">
            <span class="prompt">optknock@simulator:~$</span>
            <span class="cursor">█</span>
        </div>
    `;
    
    // 重置基因集选择
    document.querySelectorAll('.gene-set-card').forEach(card => {
        card.classList.remove('selected');
    });
    document.getElementById('select-geneset-btn').disabled = true;
    
    // 重置结果显示
    document.getElementById('results-summary').innerHTML = '';
    
    const chartsSection = document.getElementById('results-charts');
    if (chartsSection) {
        chartsSection.style.display = 'none';
    }
    ['knockout-comparison-chart', 'production-trend-chart', 'metabolic-network-chart'].forEach(id => {
        const canvas = document.getElementById(id);
        if (canvas && canvas.chartInstance) {
            canvas.chartInstance.destroy();
            canvas.chartInstance = null;
        }
    });

    // 显示第一步
    showStep(1);
    
    addTerminalOutput('>> 模拟器已重置，准备开始新的OptKnock分析...', 'info');
}

// 工具函数：格式化数字
function formatNumber(num, decimals = 4) {
    if (num === null || num === undefined) return 'N/A';
    return parseFloat(num).toFixed(decimals);
}

// 工具函数：获取随机颜色
function getRandomColor() {
    const colors = ['#3498db', '#e74c3c', '#f39c12', '#9b59b6', '#27ae60', '#e67e22', '#34495e'];
    return colors[Math.floor(Math.random() * colors.length)];
}

// 图表数据定义
const pathwayChartData = {
    glycolysis: {
        title: '糖酵解途径 - 生长与产量预测',
        type: 'line',
        data: {
            labels: ['0h', '2h', '4h', '6h', '8h', '10h', '12h', '14h', '16h', '18h', '20h'],
            datasets: [{
                label: '细胞密度 (OD600)',
                data: [0.1, 0.15, 0.25, 0.42, 0.68, 1.1, 1.75, 2.8, 4.2, 5.8, 7.2],
                borderColor: '#3498db',
                backgroundColor: 'rgba(52, 152, 219, 0.1)',
                tension: 0.4,
                yAxisID: 'y'
            }, {
                label: '琥珀酸产量 (mmol/gDW)',
                data: [0, 0.2, 0.8, 1.8, 3.2, 5.1, 7.8, 11.2, 15.1, 19.3, 23.8],
                borderColor: '#e74c3c',
                backgroundColor: 'rgba(231, 76, 60, 0.1)',
                tension: 0.4,
                yAxisID: 'y1'
            }]
        },
        options: {
            responsive: true,
            plugins: {
                title: {
                    display: true,
                    text: '糖酵解途径优化效果'
                },
                legend: {
                    position: 'top'
                }
            },
            scales: {
                y: {
                    type: 'linear',
                    display: true,
                    position: 'left',
                    title: {
                        display: true,
                        text: '细胞密度 (OD600)'
                    }
                },
                y1: {
                    type: 'linear',
                    display: true,
                    position: 'right',
                    title: {
                        display: true,
                        text: '琥珀酸产量 (mmol/gDW)'
                    },
                    grid: {
                        drawOnChartArea: false
                    }
                }
            }
        }
    },
    pentose_phosphate: {
        title: '磷酸戊糖途径 - 代谢流量分析',
        type: 'radar',
        data: {
            labels: ['G6PDH2r', 'PGL', 'GND', 'RPI', 'RPE', 'TKT1', 'TALA', 'TKT2'],
            datasets: [{
                label: '野生型流量',
                data: [8.2, 7.8, 6.5, 5.2, 4.8, 6.1, 5.9, 4.3],
                borderColor: '#3498db',
                backgroundColor: 'rgba(52, 152, 219, 0.2)',
                pointBackgroundColor: '#3498db'
            }, {
                label: '敲除后流量',
                data: [12.1, 11.5, 9.8, 7.8, 7.2, 9.1, 8.8, 6.4],
                borderColor: '#e74c3c',
                backgroundColor: 'rgba(231, 76, 60, 0.2)',
                pointBackgroundColor: '#e74c3c'
            }]
        },
        options: {
            responsive: true,
            plugins: {
                title: {
                    display: true,
                    text: '磷酸戊糖途径流量重分布'
                }
            },
            scales: {
                r: {
                    beginAtZero: true,
                    max: 15,
                    ticks: {
                        stepSize: 3
                    }
                }
            }
        }
    },
    tca_cycle: {
        title: 'TCA循环 - 能量代谢效率',
        type: 'doughnut',
        data: {
            labels: ['ATP产生', 'NADH产生', 'FADH2产生', '中间代谢物', '其他'],
            datasets: [{
                data: [35, 28, 15, 18, 4],
                backgroundColor: [
                    '#3498db',
                    '#e74c3c', 
                    '#f39c12',
                    '#9b59b6',
                    '#27ae60'
                ],
                borderWidth: 2,
                borderColor: '#ffffff'
            }]
        },
        options: {
            responsive: true,
            plugins: {
                title: {
                    display: true,
                    text: 'TCA循环能量分配 (%)'
                },
                legend: {
                    position: 'bottom'
                }
            }
        }
    },
    mixed_central: {
        title: '混合中心代谢 - 通量平衡分析',
        type: 'bar',
        data: {
            labels: ['PFK', 'GAPD', 'PYK', 'CS', 'ICDHyr', 'G6PDH2r', 'RPE', 'TALA'],
            datasets: [{
                label: '上调反应 (mmol/gDW·hr)',
                data: [15.2, 18.7, 12.3, 8.9, 11.4, 6.8, 4.2, 5.1],
                backgroundColor: '#27ae60',
                borderColor: '#229954',
                borderWidth: 1
            }, {
                label: '下调反应 (mmol/gDW·hr)',
                data: [-3.2, -2.1, -4.8, -6.3, -1.9, -8.7, -5.4, -3.6],
                backgroundColor: '#e74c3c',
                borderColor: '#c0392b',
                borderWidth: 1
            }]
        },
        options: {
            responsive: true,
            plugins: {
                title: {
                    display: true,
                    text: '混合代谢途径通量变化'
                }
            },
            scales: {
                y: {
                    beginAtZero: true,
                    title: {
                        display: true,
                        text: '通量变化 (mmol/gDW·hr)'
                    }
                }
            }
        }
    },
    fermentation: {
        title: '发酵途径 - 产物分布预测',
        type: 'polarArea',
        data: {
            labels: ['乙醇', '乳酸', '醋酸', '甲酸', '琥珀酸', '其他'],
            datasets: [{
                data: [28.5, 22.3, 18.7, 12.1, 15.2, 3.2],
                backgroundColor: [
                    'rgba(52, 152, 219, 0.7)',
                    'rgba(231, 76, 60, 0.7)',
                    'rgba(243, 156, 18, 0.7)',
                    'rgba(155, 89, 182, 0.7)',
                    'rgba(39, 174, 96, 0.7)',
                    'rgba(149, 165, 166, 0.7)'
                ],
                borderColor: [
                    '#3498db',
                    '#e74c3c',
                    '#f39c12',
                    '#9b59b6',
                    '#27ae60',
                    '#95a5a6'
                ],
                borderWidth: 2
            }]
        },
        options: {
            responsive: true,
            plugins: {
                title: {
                    display: true,
                    text: '发酵产物分布 (%)'
                },
                legend: {
                    position: 'right'
                }
            },
            scales: {
                r: {
                    beginAtZero: true
                }
            }
        }
    }
};

// 图表预览功能
let currentChart = null;

function showChartPreview(geneSetType) {
    const modal = document.getElementById('chart-preview-modal');
    const title = document.getElementById('chart-modal-title');
    const canvas = document.getElementById('preview-chart');
    
    if (!pathwayChartData[geneSetType]) return;
    
    const chartData = pathwayChartData[geneSetType];
    title.textContent = chartData.title;
    
    // 销毁现有图表
    if (currentChart) {
        currentChart.destroy();
    }
    
    // 创建新图表
    const ctx = canvas.getContext('2d');
    currentChart = new Chart(ctx, {
        type: chartData.type,
        data: chartData.data,
        options: chartData.options
    });
    
    modal.style.display = 'flex';
}

function closeChartPreview() {
    const modal = document.getElementById('chart-preview-modal');
    modal.style.display = 'none';
    
    if (currentChart) {
        currentChart.destroy();
        currentChart = null;
    }
}

// 结果分析图表
function createResultsCharts(results) {
    const chartsSection = document.getElementById('results-charts');
    if (!chartsSection) {
        return;
    }

    chartsSection.style.display = 'block';

    createKnockoutComparisonChart(results);
    createProductionTrendChart(results);
    createMetabolicNetworkChart(results);
}

function createKnockoutComparisonChart(results) {
    const canvas = document.getElementById('knockout-comparison-chart');
    if (!canvas) {
        return;
    }

    const ctx = canvas.getContext('2d');
    if (canvas.chartInstance) {
        canvas.chartInstance.destroy();
    }

    canvas.chartInstance = new Chart(ctx, {
        type: 'bar',
        data: {
            labels: ['野生型', '单基因敲除', '双基因敲除', '三基因敲除'],
            datasets: [{
                label: '生长速率 (hr⁻¹)',
                data: [0.65, 0.52, 0.38, 0.25],
                backgroundColor: 'rgba(52, 152, 219, 0.7)',
                borderColor: '#3498db',
                borderWidth: 2,
                yAxisID: 'y'
            }, {
                label: '琥珀酸产量 (mmol/gDW·hr)',
                data: [2.1, 4.8, 8.3, 12.6],
                backgroundColor: 'rgba(231, 76, 60, 0.7)',
                borderColor: '#e74c3c',
                borderWidth: 2,
                yAxisID: 'y1'
            }]
        },
        options: {
            responsive: true,
            plugins: {
                title: {
                    display: true,
                    text: '基因敲除策略效果对比',
                    font: {
                        size: 16,
                        weight: 'bold'
                    }
                },
                legend: {
                    position: 'top'
                }
            },
            scales: {
                y: {
                    type: 'linear',
                    display: true,
                    position: 'left',
                    beginAtZero: true,
                    title: {
                        display: true,
                        text: '生长速率 (hr⁻¹)'
                    }
                },
                y1: {
                    type: 'linear',
                    display: true,
                    position: 'right',
                    beginAtZero: true,
                    title: {
                        display: true,
                        text: '产量 (mmol/gDW·hr)'
                    },
                    grid: {
                        drawOnChartArea: false
                    }
                }
            }
        }
    });
}

function createProductionTrendChart(results) {
    const canvas = document.getElementById('production-trend-chart');
    if (!canvas) {
        return;
    }

    const ctx = canvas.getContext('2d');
    if (canvas.chartInstance) {
        canvas.chartInstance.destroy();
    }

    canvas.chartInstance = new Chart(ctx, {
        type: 'line',
        data: {
            labels: ['0h', '4h', '8h', '12h', '16h', '20h', '24h'],
            datasets: [{
                label: '野生型',
                data: [0, 1.2, 2.8, 4.1, 5.2, 5.8, 6.1],
                borderColor: '#95a5a6',
                backgroundColor: 'rgba(149, 165, 166, 0.1)',
                tension: 0.4
            }, {
                label: '优化菌株',
                data: [0, 2.8, 7.2, 12.8, 18.9, 23.4, 26.7],
                borderColor: '#27ae60',
                backgroundColor: 'rgba(39, 174, 96, 0.1)',
                tension: 0.4
            }]
        },
        options: {
            responsive: true,
            plugins: {
                legend: {
                    position: 'top'
                }
            },
            scales: {
                y: {
                    beginAtZero: true,
                    title: {
                        display: true,
                        text: '累积产量 (mmol/gDW)'
                    }
                },
                x: {
                    title: {
                        display: true,
                        text: '培养时间'
                    }
                }
            }
        }
    });
}

function createMetabolicNetworkChart(results) {
    const canvas = document.getElementById('metabolic-network-chart');
    if (!canvas) {
        return;
    }

    const ctx = canvas.getContext('2d');
    if (canvas.chartInstance) {
        canvas.chartInstance.destroy();
    }

    canvas.chartInstance = new Chart(ctx, {
        type: 'radar',
        data: {
            labels: ['糖酵解', '磷酸戊糖', 'TCA循环', '电子传递', '氨基酸合成', '脂肪酸合成'],
            datasets: [{
                label: '野生型活性',
                data: [85, 72, 90, 88, 65, 58],
                borderColor: '#3498db',
                backgroundColor: 'rgba(52, 152, 219, 0.2)',
                pointBackgroundColor: '#3498db'
            }, {
                label: '敲除后活性',
                data: [95, 88, 45, 52, 78, 35],
                borderColor: '#e74c3c',
                backgroundColor: 'rgba(231, 76, 60, 0.2)',
                pointBackgroundColor: '#e74c3c'
            }]
        },
        options: {
            responsive: true,
            plugins: {
                legend: {
                    position: 'top'
                }
            },
            scales: {
                r: {
                    beginAtZero: true,
                    max: 100,
                    ticks: {
                        stepSize: 20
                    },
                    title: {
                        display: true,
                        text: '相对活性 (%)'
                    }
                }
            }
        }
    });
}

// 为基因集卡片添加悬停事件
document.addEventListener('DOMContentLoaded', function() {
    const geneSetCards = document.querySelectorAll('.gene-set-card');
    
    geneSetCards.forEach(card => {
        let hoverTimeout;
        
        card.addEventListener('mouseenter', function() {
            const geneSetType = this.dataset.geneset;
            hoverTimeout = originalSetTimeout(() => {
                showChartPreview(geneSetType);
            }, 800); // 800ms延迟显示，使用原始计时器避免加速模式影响
        });
        
        card.addEventListener('mouseleave', function() {
            if (hoverTimeout) {
                clearTimeout(hoverTimeout);
            }
        });
    });
    
    // 点击模态框背景关闭
    document.getElementById('chart-preview-modal').addEventListener('click', function(e) {
        if (e.target === this) {
            closeChartPreview();
        }
    });
});
