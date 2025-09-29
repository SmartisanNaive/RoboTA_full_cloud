// Global variables
let currentStep = 1;
let selectedGeneSet = null;
let simulationConfig = {
    glucoseConc: 10,
    targetProduct: 'succinate',
    knockoutSize: 2,
    minGrowth: 30,
    geneSet: null
}

const SCENARIO_ENDPOINT = '/cobra-optknock/data/default-scenario.json';

// Speed mode helpers
let speedMode = false;
let originalTimeouts = [];
let speedMultiplier = 10; // Speed multiplier

function toggleSpeedMode() {
    speedMode = !speedMode;
    const speedButton = document.getElementById('speed-button');
    const body = document.body;
    
    if (speedMode) {
        // Enable speed mode
        speedButton.classList.add('active');
        speedButton.innerHTML = '<i class="fas fa-pause"></i>';
        speedButton.title = 'Exit speed mode';
        body.classList.add('speed-mode');
        
        // Clear pending timeouts
        clearAllTimeouts();
        
        addTerminalOutput('🚀 Speed mode enabled - skipping animations and delays', 'info');
    } else {
        // Exit speed mode
        speedButton.classList.remove('active');
        speedButton.innerHTML = '<i class="fas fa-forward"></i>';
        speedButton.title = 'Speed mode';
        body.classList.remove('speed-mode');
        
        addTerminalOutput('⏸️ Speed mode disabled - normal animation restored', 'info');
    }
}

// Override setTimeout for speed mode
const originalSetTimeout = window.setTimeout;
window.setTimeout = function(callback, delay, ...args) {
    if (speedMode && delay > 0) {
        // Compress delays while speed mode is active
        delay = Math.max(1, delay / speedMultiplier);
    }
    
    const timeoutId = originalSetTimeout(callback, delay, ...args);
    originalTimeouts.push(timeoutId);
    return timeoutId;
};

// Clear all timeouts
function clearAllTimeouts() {
    originalTimeouts.forEach(id => clearTimeout(id));
    originalTimeouts = [];
}

// Override typewriterOutput for speed mode
const originalTypewriterOutput = typewriterOutput;
window.typewriterOutput = function(text, type = 'output', speed = 50) {
    if (speedMode) {
        // Skip typewriter animation while speed mode runs
        addTerminalOutput(text, type);
        return Promise.resolve();
    } else {
        return originalTypewriterOutput(text, type, speed);
    }
};

// Skip animations for the current step
function skipCurrentStep() {
    if (!speedMode) {
        toggleSpeedMode();
    }
    
    // Clear all timeouts
    clearAllTimeouts();
    
    // Apply behaviour based on the current step
    switch(currentStep) {
        case 2:
            // Skip model loading animation
            if (!simulationConfig.modelLoaded) {
                simulationConfig.modelLoaded = true;
                addTerminalOutput('Model loading complete (animation skipped)', 'success');
                showStepButtons(3);
            }
            break;
        case 3:
            // Skip parameter setup
            if (!document.getElementById('step-3-buttons').style.display || 
                document.getElementById('step-3-buttons').style.display === 'none') {
                setParameters();
            }
            break;
        case 4:
            // Skip gene set selection
            if (!selectedGeneSet) {
                // Automatically choose the first gene set card
                const firstCard = document.querySelector('.gene-set-card');
                if (firstCard) {
                    selectGeneSetCard(firstCard);
                    selectGeneSet();
                }
            }
            break;
        case 5:
            // Skip OptKnock execution animation
            if (!optKnockResults) {
                runOptKnock();
            }
            break;
    }
    
    addTerminalOutput('⚡ Skipped animations for the current step', 'info');
}

// Keyboard shortcuts
document.addEventListener('keydown', function(e) {
    // Ctrl + Shift + S toggles speed mode
    if (e.ctrlKey && e.shiftKey && e.key === 'S') {
        e.preventDefault();
        toggleSpeedMode();
    }
    
    // Ctrl + Shift + Enter skips the current step
    if (e.ctrlKey && e.shiftKey && e.key === 'Enter') {
        e.preventDefault();
        skipCurrentStep();
    }
});;
let optKnockResults = null;

// Gene set metadata
const geneSetInfo = {
    glycolysis: {
        name: 'Glycolysis pathway',
        description: 'Primary route converting glucose to pyruvate',
        reactions: ['PGI', 'PFK', 'FBA', 'TPI', 'GAPD', 'PGK', 'PGM', 'ENO', 'PYK']
    },
    pentose_phosphate: {
        name: 'Pentose phosphate pathway',
        description: 'Generates NADPH and ribose-5-phosphate',
        reactions: ['G6PDH2r', 'PGL', 'GND', 'RPI', 'RPE', 'TKT1', 'TALA', 'TKT2']
    },
    tca_cycle: {
        name: 'TCA cycle',
        description: 'Central pathway for complete oxidation of pyruvate',
        reactions: ['CS', 'ACONTa', 'ACONTb', 'ICDHyr', 'AKGDH', 'SUCOAS', 'SUCDi', 'FUM', 'MDH']
    },
    mixed_central: {
        name: 'Mixed central metabolism',
        description: 'Core network integrating multiple pathways',
        reactions: ['PFK', 'GAPD', 'PYK', 'CS', 'ICDHyr', 'G6PDH2r', 'RPE', 'TALA']
    },
    fermentation: {
        name: 'Fermentation routes',
        description: 'Produces reduced metabolites under anaerobic conditions',
        reactions: ['PDH', 'LDH_D', 'ALCD2x', 'PTAr', 'ACKr', 'FHL']
    }
};

// Product metadata
const productInfo = {
    succinate: { name: 'Succinate', unit: 'mmol/gDW·hr', color: '#3498db' },
    lactate: { name: 'Lactate', unit: 'mmol/gDW·hr', color: '#e74c3c' },
    acetate: { name: 'Acetate', unit: 'mmol/gDW·hr', color: '#f39c12' },
    ethanol: { name: 'Ethanol', unit: 'mmol/gDW·hr', color: '#9b59b6' },
    formate: { name: 'Formate', unit: 'mmol/gDW·hr', color: '#27ae60' }
};

// Initialising
document.addEventListener('DOMContentLoaded', function() {
    initializeSimulation();
    setupEventListeners();
});

function initializeSimulation() {
    updateStepNavigation();
    showStep(1);
}

function setupEventListeners() {
    // Gene set card events
    document.querySelectorAll('.gene-set-card').forEach(card => {
        card.addEventListener('click', function() {
            selectGeneSetCard(this);
        });
    });
    
    // Step navigation click events (direct jumps disabled)
    // document.querySelectorAll('.step').forEach(step => {
    //     step.addEventListener('click', function() {
    //         const targetStep = parseInt(this.dataset.step);
    //         navigateToStep(targetStep);
    //     });
    // });
}

// Update step navigation
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

// Display the requested step
function showStep(stepNumber) {
    document.querySelectorAll('.step-content').forEach(content => {
        content.style.display = 'none';
    });
    
    document.getElementById(`step-${stepNumber}`).style.display = 'block';
    currentStep = stepNumber;
    updateStepNavigation();
    
    // Keep the speed button visible throughout
    const speedButton = document.getElementById('speed-button');
    if (speedButton) {
        speedButton.classList.add('show');
    }

    // Configure the automation step buttons when on step 7
    const automationButtons = document.getElementById('step-7-buttons');
    if (automationButtons) {
        if (stepNumber === 7) {
            automationButtons.innerHTML = `
                <div class="button-group">
                    <button class="btn btn-secondary" onclick="prevStep(6)">
                        <i class="fas fa-arrow-left"></i> Back to analysis
                    </button>
                    <button class="btn btn-primary" onclick="resetSimulation()">
                        Restart module <i class="fas fa-redo"></i>
                    </button>
                </div>
            `;
            automationButtons.style.display = 'block';
            automationButtons.style.opacity = '1';
            automationButtons.style.transform = 'translateY(0)';
        } else {
            automationButtons.style.display = 'none';
        }
    }
}

// Handle previous step
function prevStep(stepNumber) {
    // Hide current step buttons with fade-out animation
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
    addTerminalOutput(`Return to step ${stepNumber}...`, 'info');
}

// Handle next step
function nextStep(stepNumber) {
    // Hide current step buttons with fade-out animation
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
    addTerminalOutput(`Entering step ${stepNumber}...`, 'info');
}

// Navigate to the requested step with validation
function navigateToStep(targetStep) {
    // Check if navigation to the target step is allowed
    if (!canNavigateToStep(targetStep)) {
        return;
    }
    
    // When moving forward, ensure prerequisites are met
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
    
    // Perform the step transition
    showStep(targetStep);
    // Direct jump prompt removed from terminal output
}

// Determine if navigation to the step is possible
function canNavigateToStep(targetStep) {
    if (targetStep < 1 || targetStep > 7) {
        return false;
    }
    
    // Always allow returning to previous steps
    if (targetStep <= currentStep) {
        return true;
    }
    
    // Confirm prerequisite steps are complete
    return isStepCompleted(targetStep - 1);
}

// Check whether the step is complete
function isStepCompleted(stepNumber) {
    switch (stepNumber) {
        case 1:
            return true; // Algorithm introduction is always marked complete
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
        case 7:
            return optKnockResults !== null;
        default:
            return false;
    }
}

// Show validation alert
function showStepValidationAlert(targetStep, missingSteps) {
    const stepNames = {
        1: 'Algorithm introduction',
        2: 'Model loading',
        3: 'Parameter setup',
        4: 'Gene set selection',
        5: 'OptKnock execution',
        6: 'Result analysis',
        7: 'Automated execution'
    };
    
    const missingStepNames = missingSteps.map(step => stepNames[step]).join(', ');
    const targetStepName = stepNames[targetStep];
    
    const alertMessage = `Cannot navigate to "${targetStepName}".\nPlease complete the following steps: ${missingStepNames}`;
    
    // Build custom alert toast
    const alertDiv = document.createElement('div');
    alertDiv.className = 'step-validation-alert';
    alertDiv.innerHTML = `
        <div class="alert-content">
            <div class="alert-icon">
                <i class="fas fa-exclamation-triangle"></i>
            </div>
            <div class="alert-text">
                <h4>Step validation failed</h4>
                <p>${alertMessage}</p>
            </div>
            <button class="alert-close" onclick="closeStepAlert()">
                <i class="fas fa-times"></i>
            </button>
        </div>
    `;
    
    document.body.appendChild(alertDiv);
    
    // Auto-close after three seconds
    setTimeout(() => {
        closeStepAlert();
    }, 3000);
    
    // Append the alert to the terminal feed
    addTerminalOutput(`❌ ${alertMessage}`, 'error');
}

// Dismiss the validation alert
function closeStepAlert() {
    const alert = document.querySelector('.step-validation-alert');
    if (alert) {
        alert.remove();
    }
}

// Render controls for the active step
function showStepButtons(nextStepNumber) {
    // Display controls only within the current step container
    const stepButtonContainer = document.getElementById(`step-${currentStep}-buttons`);
    if (stepButtonContainer) {
        stepButtonContainer.innerHTML = `
            <div class="button-group">
                ${currentStep > 1 ? `<button class="btn btn-secondary" onclick="prevStep(${currentStep - 1})">
                    <i class="fas fa-arrow-left"></i> Previous
                </button>` : ''}
                <button class="btn btn-primary" onclick="nextStep(${nextStepNumber})">
                    Next <i class="fas fa-arrow-right"></i>
                </button>
            </div>
        `;
        
        // Add fade-in animation
        stepButtonContainer.style.opacity = '0';
        stepButtonContainer.style.display = 'block';
        
        // Use requestAnimationFrame to start animation after DOM updates
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

// Terminal output helper
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
        
        // Scroll to bottom
        terminal.scrollTop = terminal.scrollHeight;
    };
    
    // Maintain ordering by appending synchronously when delay is zero
    if (delay && delay > 0) {
        setTimeout(appendLine, delay);
    } else {
        appendLine();
    }
}

// Typewriter animation for terminal output
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

// Load the metabolic model
async function loadModel() {
    addTerminalOutput('>> Initialising COBRA Toolbox...', 'info');
    await typewriterOutput('initCobraToolbox', 'success', 100);
    
    // Display COBRA Toolbox ASCII art and details once
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
    
    addTerminalOutput('>> Switching solver to Gurobi...', 'info');
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
    addTerminalOutput('  ✓ Gurobi solver configured successfully', 'success');
    
    addTerminalOutput('>> Loading iJO1366 metabolic model...', 'info');
    await typewriterOutput("model = readCbModel('iJO1366.mat');", 'success', 80);
    addTerminalOutput('Each model.subSystems{x} is a character array, and this format is retained.', 'info');
    addTerminalOutput('', 'output');
    await typewriterOutput('model =', 'success', 60);
    addTerminalOutput('', 'output');
    addTerminalOutput('  Struct contains the following fields:', 'info');
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
    
    addTerminalOutput('✓ Model loaded successfully!', 'success');
    addTerminalOutput(`   - Gene count: 1366`, 'info');
    addTerminalOutput(`   - Reaction count: 2583`, 'info');
    addTerminalOutput(`   - Metabolite count: 1805`, 'info');
    addTerminalOutput(`   - Cellular compartments: 8 (cytosol, periplasm, outer membrane, etc.)`, 'info');
    addTerminalOutput(`   - Exchange reactions: 95`, 'info');
    addTerminalOutput(`   - Transport reactions: 178`, 'info');
    
    // Model validation
    addTerminalOutput('>> Executing model validation...', 'info');
    await typewriterOutput("solution = optimizeCbModel(model);", 'success', 80);
    addTerminalOutput('   ✓ Model feasibility verified', 'success');
    addTerminalOutput(`   - Maximum growth rate: 0.982 h⁻¹`, 'info');
    addTerminalOutput(`   - Glucose uptake: 10.0 mmol/gDW·hr`, 'info');
    addTerminalOutput(`   - ATP maintenance requirement: 8.39 mmol/gDW·hr`, 'info');
    
    // Flag the model as loaded
    simulationConfig.modelLoaded = true;
    
    // Show next-step button
    setTimeout(() => {
        addTerminalOutput('', 'output');
        addTerminalOutput('Model loading complete. Use the button below to continue.', 'info');
        showStepButtons(3);
    }, 1500);
}

// Configure parameters
function setParameters() {
    simulationConfig.glucoseConc = document.getElementById('glucose-conc').value;
    simulationConfig.targetProduct = document.getElementById('target-product').value;
    simulationConfig.knockoutSize = document.getElementById('knockout-size').value;
    simulationConfig.minGrowth = document.getElementById('min-growth').value;
    
    addTerminalOutput('>> Configuring experiment parameters...', 'info');
    addTerminalOutput(`   - Glucose concentration: ${simulationConfig.glucoseConc} mmol/gDW·hr`, 'success');
    addTerminalOutput(`   - Target product: ${productInfo[simulationConfig.targetProduct].name}`, 'success');
    addTerminalOutput(`   - Gene knockouts: ${simulationConfig.knockoutSize}`, 'success');
    addTerminalOutput(`   - Minimum growth rate: ${simulationConfig.minGrowth}%`, 'success');
    
    // Simulate glucose uptake configuration
    setTimeout(async () => {
        addTerminalOutput('', 'output');
        addTerminalOutput('>> Setting culture conditions...', 'info');
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
        
        addTerminalOutput('>> Configuring target product reaction...', 'info');
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
        
        addTerminalOutput('>> Applying growth constraint...', 'info');
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
        
        addTerminalOutput('✓ Parameter setup complete!', 'success');
        addTerminalOutput('   - Model boundary conditions updated', 'info');
        addTerminalOutput('   - OptKnock constraints configured', 'info');
        
        // Flag that parameters are configured
        simulationConfig.parametersSet = true;
        
        // Show next-step button
        setTimeout(() => {
            addTerminalOutput('', 'output');
            addTerminalOutput('Parameter setup complete. Use the button below to continue.', 'info');
            showStepButtons(4);
        }, 500);
    }, 1500);
}

// Update growth-rate display
function updateGrowthValue(value) {
    document.getElementById('growth-value').textContent = value + '%';
}

// Gene set card selection
function selectGeneSetCard(card) {
    // Remove selection from other cards
    document.querySelectorAll('.gene-set-card').forEach(c => {
        c.classList.remove('selected');
    });
    
    // Mark the current card as selected
    card.classList.add('selected');
    selectedGeneSet = card.dataset.geneset;
    
    // Enable the action button
    document.getElementById('select-geneset-btn').disabled = false;
    
    addTerminalOutput(`>> Selected gene set: ${geneSetInfo[selectedGeneSet].name}`, 'info');
    addTerminalOutput(`   ${geneSetInfo[selectedGeneSet].description}`, 'info');
}

// Confirm gene set selection
async function selectGeneSet() {
    if (!selectedGeneSet) return;
    
    simulationConfig.geneSet = selectedGeneSet;
    const geneSet = geneSetInfo[selectedGeneSet];
    
    addTerminalOutput('>> Analysing selected metabolic pathway...', 'info');
    addTerminalOutput(`   - Pathway name: ${geneSet.name}`, 'info');
    addTerminalOutput(`   - Pathway description: ${geneSet.description}`, 'info');
    addTerminalOutput(`   - Candidate reactions: ${geneSet.reactions.length}`, 'info');
    addTerminalOutput('', 'output');
    
    addTerminalOutput('>> Loading metabolic pathway database...', 'info');
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
    
    addTerminalOutput('>> Defining candidate knockout set...', 'info');
    await typewriterOutput(`candidateRxns = {`, 'success', 80);
    
    // Output each code line sequentially for a stable visual order
    for (let index = 0; index < geneSet.reactions.length; index++) {
        const reaction = geneSet.reactions[index];
        await typewriterOutput(`    '${reaction}'${index < geneSet.reactions.length - 1 ? ',' : ''}`, 'success', 50);
    }
    
    await typewriterOutput(`};`, 'success', 80);
    addTerminalOutput('', 'output');
    
    addTerminalOutput('>> Validating reaction availability...', 'info');
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
    
    addTerminalOutput('>> Calculating combinatorial search space...', 'info');
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
    
    addTerminalOutput(`✓ Gene set validated`, 'success');
    addTerminalOutput(`   - Valid candidate reactions: ${geneSet.reactions.length}`, 'info');
    addTerminalOutput(`   - Estimated combinations: ${combinations.toLocaleString()}`, 'info');
    addTerminalOutput(`   - Search space complexity: ${combinations > 10000 ? 'high' : combinations > 1000 ? 'medium' : 'low'}`, 'info');
    
    // Update the configuration summary for step five
    updateExecutionConfig();
    
    // Show next-step button
    setTimeout(() => {
        addTerminalOutput('', 'output');
        addTerminalOutput('Gene set selection complete. Use the button below to continue.', 'info');
        showStepButtons(5);
    }, 500);
}

// Update execution summary
function updateExecutionConfig() {
    document.getElementById('selected-geneset-name').textContent = geneSetInfo[simulationConfig.geneSet].name;
    document.getElementById('selected-glucose').textContent = simulationConfig.glucoseConc;
    document.getElementById('selected-target').textContent = productInfo[simulationConfig.targetProduct].name;
    document.getElementById('selected-knockout').textContent = simulationConfig.knockoutSize;
}

// Execute the OptKnock routine
async function runOptKnock() {
    addTerminalOutput('>> Initialising OptKnock bilevel framework...', 'info');
    
    // Immediately expose the speed button
    const speedButton = document.getElementById('speed-button');
    if (speedButton) {
        speedButton.classList.add('show');
    }
    
    await typewriterOutput('optKnockOptions = struct();', 'success', 60);
    await typewriterOutput('optKnockOptions.targetRxn = model.rxns(targetRxnIdx);', 'success', 60);
    await typewriterOutput('optKnockOptions.numDelRxns = ' + simulationConfig.knockoutSize + ';', 'success', 60);
    
    addTerminalOutput('   - Loading COBRA Toolbox OptKnock module...', 'info');
    await typewriterOutput('addpath(genpath(\'cobratoolbox/src/analysis/optKnock\'));', 'success', 60);
    
    addTerminalOutput('   - Configuring solver parameters...', 'info');
    await typewriterOutput('changeCobraSolver(\'gurobi\', \'MILP\');', 'success', 60);
    await typewriterOutput('optKnockOptions.solverParams.timeLimit = 3600;', 'success', 60);
    
    addTerminalOutput('>> Constructing bilevel optimisation problem...', 'info');
    addTerminalOutput(`   - Outer objective: maximise ${productInfo[simulationConfig.targetProduct].name} production`, 'info');
    addTerminalOutput(`   - Inner constraint: maintain growth ≥ ${simulationConfig.minGrowth}% of wild type`, 'info');
    addTerminalOutput(`   - Knockout count: ${simulationConfig.knockoutSize} reactions`, 'info');
    
    await typewriterOutput('% Apply growth constraint to optimisation problem', 'success', 60);
    await typewriterOutput('minGrowthRate = ' + (simulationConfig.minGrowth / 100).toFixed(2) + ' * wildTypeGrowth;', 'success', 60);
    await typewriterOutput('optKnockOptions.minGrowthRate = minGrowthRate;', 'success', 60);
    
    // Display the progress bar
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
    
    // Simulate the OptKnock execution timeline
    const steps = [
        { 
            text: '>> Configuring bilevel optimisation...', 
            detail: '   - Defining decision and binary variables...', 
            code: ['% Define binary knockout variables', 'y = binvar(length(candidateRxns), 1);', '% Configure knockout constraints', 'sum(y) == numDelRxns;'],
            progress: 10 
        },
        { 
            text: '>> Defining objective function and constraints...', 
            detail: '   - Building linear programming matrices...', 
            code: [
                '% Outer objective function',
                'obj_outer = model.c;',
                'obj_outer(targetRxnIdx) = 1;',
                '% Inner constraint matrix',
                'A_inner = model.S;',
                '% Stoichiometric constraints:',
                'S * v = 0  (steady-state assumption)',
                '% Irreversibility constraints:',
                'v_j ≥ 0, ∀j ∈ irreversible_rxns',
                '% Growth rate constraints:',
                'v_biomass ≥ μ_min'
            ],
            progress: 25 
        },
        { 
            text: '>> Enumerating gene knockout combinations...', 
            detail: `   - Search space: C(${geneSetInfo[simulationConfig.geneSet].reactions.length}, ${simulationConfig.knockoutSize}) ≈ ${Math.floor(Math.pow(geneSetInfo[simulationConfig.geneSet].reactions.length, parseInt(simulationConfig.knockoutSize)) / 10)} combinations`, 
            code: ['% Generate knockout combinations', 'knockoutCombinations = nchoosek(candidateRxns, numDelRxns);', 'fprintf(\'Total combinations: %d\\n\', size(knockoutCombinations, 1));'],
            progress: 40 
        },
        { 
            text: '>> Solving inner FBA problem...', 
            detail: '   - Calculating growth for each knockout combination...', 
            code: [
                'for i = 1:size(knockoutCombinations, 1)',
                '    tempModel = model;',
                '    tempModel.lb(knockoutCombinations(i, :)) = 0;',
                '    tempModel.ub(knockoutCombinations(i, :)) = 0;',
                '    sol = optimizeCbModel(tempModel);',
                '% FBA linear programming problem:',
                'max c^T * v',
                's.t. S * v = 0',
                '     lb ≤ v ≤ ub',
                '% Post-knockout constraints:',
                'v_knockout = 0',
                '% Optimality conditions (KKT):',
                '∇L = c - S^T*λ - μ_lb + μ_ub = 0',
                'end'
            ],
            progress: 60 
        },
        { 
            text: '>> Solving outer optimisation problem...', 
            detail: '   - Applying MILP solver...', 
            code: [
                '% Outer MILP optimization problem:',
                'max f(x,y) = c^T * v_target',
                's.t. y ∈ {0,1}^n, Σy_i = k',
                '% Inner LP problem:',
                'max g(x,y) = c_biomass^T * v',
                's.t. S*v = 0, lb ≤ v ≤ ub',
                '% Big-M knockout constraints:',
                'v_i ≤ M * (1 - y_i), ∀i',
                'v_i ≥ -M * (1 - y_i), ∀i',
                '% Mass balance constraints:',
                'Σ S_ij * v_j = 0, ∀i',
                '% Flux boundary constraints:',
                'lb_j ≤ v_j ≤ ub_j, ∀j',
                '% Binary variable constraints:',
                'y_i ∈ {0,1}, ∀i ∈ candidate_set'
            ],
            progress: 80 
        },
        { 
            text: '>> Analysing optimal solution...', 
            detail: '   - Validating feasibility and optimality...', 
            code: ['% Validate optimal solution', 'if optKnockSol.stat == 1', '    knockoutRxns = optKnockSol.rxnList;', '    targetProduction = optKnockSol.f;', '    fprintf(\'Target production: %.4f\\n\', targetProduction);', 'end'],
            progress: 95 
        }
    ];
    
    for (let i = 0; i < steps.length; i++) {
        await new Promise(resolve => setTimeout(resolve, 1500));
        addTerminalOutput(steps[i].text, 'info');
        if (steps[i].detail) {
            addTerminalOutput(steps[i].detail, 'info');
        }
        
        // Render the code snippet
        if (steps[i].code) {
            for (let j = 0; j < steps[i].code.length; j++) {
                await new Promise(resolve => setTimeout(resolve, 300));
                await typewriterOutput(steps[i].code[j], 'success', 50);
            }
        }
        
        document.getElementById('progress-fill').style.width = steps[i].progress + '%';
    }
    
    // Complete the progress bar
    document.getElementById('progress-fill').style.width = '100%';
    addTerminalOutput('✓ OptKnock execution complete', 'success');
    
    // Retrieve optimisation results
    try {
        const response = await fetch(SCENARIO_ENDPOINT, { cache: 'no-store' });

        if (!response.ok) {
            throw new Error(`HTTP ${response.status}`);
        }

        const data = await response.json();

        if (data && data.success && data.scenario) {
            optKnockResults = data.scenario;
            addTerminalOutput('>> Fetching optimization results from server...', 'info');
            displayOptKnockResults();
        } else {
            addTerminalOutput('>> Generating simulated optimisation results...', 'info');
            generateMockResults();
        }
    } catch (error) {
        console.error('Failed to retrieve data:', error);
        addTerminalOutput('>> Server unavailable, switching to local simulation data...', 'info');
        generateMockResults();
    }
    
    // Show next-step button
    setTimeout(() => {
        addTerminalOutput('', 'output');
        addTerminalOutput('OptKnock run complete. Use the button below to review the analysis.', 'info');
        showStepButtons(7);
    }, 1000);
}

// Present OptKnock results
async function displayOptKnockResults() {
    if (!optKnockResults) return;
    
    const results = optKnockResults;
    
    // Calculate production improvement relative to wild type
    const computedImprovement = (typeof results.wildtype_production === 'number' && typeof results.mutant_production === 'number' && results.wildtype_production > 0)
        ? ((results.mutant_production - results.wildtype_production) / results.wildtype_production) * 100
        : null;
    addTerminalOutput('', 'output');
    addTerminalOutput('  > Parsing optimization solution ... Done.', 'success');
    addTerminalOutput('  > Extracting knockout strategies ... Done.', 'success');
    addTerminalOutput('  > Computing flux distributions ... Done.', 'success');
    addTerminalOutput('  > Validating solution feasibility ... Done.', 'success');
    addTerminalOutput('', 'output');
    
    addTerminalOutput('>> Validating solution feasibility...', 'info');
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
    
    addTerminalOutput('>> Calculating metabolic flux distribution...', 'info');
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
    
    addTerminalOutput('>> Analysing growth-coupling behaviour...', 'info');
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
    
    addTerminalOutput('>> OptKnock result analysis:', 'success');
    addTerminalOutput(`   Optimal knockout strategy: ${results.knockout_genes || 'N/A'}`, 'info');
    addTerminalOutput(`   - Knockout reactions: ${simulationConfig.knockoutSize}`, 'info');
    addTerminalOutput(`   - Knockout type: ${results.knockout_type || 'gene knockout'}`, 'info');
    addTerminalOutput('', 'output');
    
    addTerminalOutput('>> Production analysis:', 'info');
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
    
    addTerminalOutput('>> Growth characteristics:', 'info');
    await typewriterOutput(`growthAnalysis = analyzeGrowthCharacteristics(fluxAnalysis);`, 'success', 60);
    addTerminalOutput('', 'output');
    addTerminalOutput('  Growth characteristics summary:', 'info');
    addTerminalOutput(`    Wild-type growth rate: ${results.wildtype_growth?.toFixed(4) || 'N/A'} h⁻¹`, 'info');
    addTerminalOutput(`    Mutant growth rate: ${results.mutant_growth?.toFixed(4) || 'N/A'} h⁻¹`, 'info');
    addTerminalOutput(`    Growth rate change: ${results.growth_change?.toFixed(4) || 'N/A'} h⁻¹`, 'info');
    addTerminalOutput(`    Growth coupling: ${results.growth_coupled ? 'strongly coupled' : 'weakly coupled'}`, results.growth_coupled ? 'success' : 'warning');
    addTerminalOutput('', 'output');
    
    addTerminalOutput('>> Metabolic efficiency evaluation:', 'info');
    await typewriterOutput(`efficiencyMetrics = computeMetabolicEfficiency(fluxAnalysis);`, 'success', 60);
    addTerminalOutput('', 'output');
    addTerminalOutput('  Metabolic efficiency metrics:', 'info');
    addTerminalOutput(`    Carbon utilization: ${results.carbon_efficiency?.toFixed(2) || 'N/A'}%`, 'info');
    addTerminalOutput(`    ATP generation efficiency: ${results.atp_efficiency?.toFixed(2) || 'N/A'}%`, 'info');
    addTerminalOutput(`    NADH/NADPH balance: ${results.redox_balance || 'balance'}`, 'info');
    addTerminalOutput(`    Theoretical yield: ${(Math.random() * 0.3 + 0.7).toFixed(3)} mol/mol glucose`, 'info');
    addTerminalOutput('', 'output');
    
    // Build the on-page results summary
    const summaryHTML = `
        <h3><i class="fas fa-chart-bar"></i> OptKnock summary</h3>
        <div class="result-item">
            <h4>Optimal knockout strategy</h4>
            <div class="result-value">${results.knockout_genes || 'No feasible knockout found'}</div>
        </div>
        <div class="result-item">
            <h4>${productInfo[simulationConfig.targetProduct].name} production uplift</h4>
            <div class="result-value ${computedImprovement !== null && computedImprovement > 0 ? '' : 'negative'}">
                ${computedImprovement !== null ? computedImprovement.toFixed(2) + '%' : 'N/A'}
            </div>
        </div>
        <div class="result-item">
            <h4>Wild type vs engineered yield</h4>
            <div class="result-value">
                ${results.wildtype_production?.toFixed(4) || 'N/A'} → ${results.mutant_production?.toFixed(4) || 'N/A'} ${productInfo[simulationConfig.targetProduct].unit}
            </div>
        </div>
        <div class="result-item">
            <h4>Growth coupling classification</h4>
            <div class="result-value ${results.growth_coupled ? '' : 'negative'}">
                ${results.growth_coupled ? 'Growth coupled' : 'Not growth coupled'}
            </div>
        </div>
        <div class="result-item">
            <h4>Growth rate impact</h4>
            <div class="result-value">
                ${results.growth_change?.toFixed(4) || 'N/A'} h⁻¹
            </div>
        </div>
    `;
    
    document.getElementById('results-summary').innerHTML = summaryHTML;
    
    // Create result-analysis charts
    addTerminalOutput('', 'output');
    addTerminalOutput('>> Generating result analysis charts...', 'info');
    await typewriterOutput(`chartsConfig = generateResultsCharts(optKnockResults);`, 'success', 60);
    addTerminalOutput('  > Creating knockout comparison chart ... Done.', 'success');
    addTerminalOutput('  > Generating production trend analysis ... Done.', 'success');
    addTerminalOutput('  > Building metabolic network visualization ... Done.', 'success');
    addTerminalOutput('', 'output');
    
    // Generate charts
    createResultsCharts(results);
}

// Generate simulated results when real data is unavailable
function generateMockResults() {
    addTerminalOutput('>> Generating simulated optimization results...', 'info');
    addTerminalOutput('   - Building scenario model from historical data...', 'info');
    addTerminalOutput('   - Applying stochastic perturbations to emulate variation...', 'info');
    addTerminalOutput('   - Ensuring biological plausibility...', 'info');
    
    const geneSet = geneSetInfo[simulationConfig.geneSet];
    const availableReactions = geneSet.reactions;
    
    // Randomly choose knockout reactions
    const knockoutReactions = [];
    const shuffled = [...availableReactions].sort(() => 0.5 - Math.random());
    for (let i = 0; i < parseInt(simulationConfig.knockoutSize); i++) {
        knockoutReactions.push(shuffled[i]);
    }
    
    const mockResults = {
        knockout_genes: knockoutReactions.join(', '),
        knockout_type: 'Reaction knockout',
        wildtype_production: Math.random() * 2 + 0.5,
        mutant_production: 0, // Initialise to 0; calculated later
        wildtype_growth: 0.8 + Math.random() * 0.4,
        mutant_growth: 0.6 + Math.random() * 0.3,
        improvement: 0, // Initialise to 0; calculated later
        growth_change: (Math.random() - 0.5) * 0.2,
        growth_coupled: Math.random() > 0.3,
        carbon_efficiency: 75 + Math.random() * 20,
        atp_efficiency: 80 + Math.random() * 15,
        redox_balance: Math.random() > 0.7 ? 'balanced' : 'slight imbalance'
    };
    
    // Calculate derived metrics with adjusted logic
    // Production increase should stay within a realistic 50%-500% range
    const improvementPercent = Math.random() * 450 + 50; // 50%-500%
    mockResults.improvement = improvementPercent;
    mockResults.mutant_production = mockResults.wildtype_production * (1 + improvementPercent / 100);
    mockResults.growth_change = mockResults.mutant_growth - mockResults.wildtype_growth;
    
    addTerminalOutput('✓ Simulation results generated', 'success');
    addTerminalOutput(`   - Knockout strategy: ${mockResults.knockout_genes}`, 'info');
    addTerminalOutput(`   - Expected production uplift: ${mockResults.improvement.toFixed(1)}%`, 'info');
    
    optKnockResults = mockResults;
    displayOptKnockResults();
}

// Reset the simulation
function resetSimulation() {
    currentStep = 1;
    selectedGeneSet = null;
    optKnockResults = null;
    
    // Clear terminal output
    document.getElementById('terminal').innerHTML = `
        <div class="terminal-line">
            <span class="prompt">optknock@simulator:~$</span>
            <span class="cursor">█</span>
        </div>
    `;
    
    // Reset gene set selection
    document.querySelectorAll('.gene-set-card').forEach(card => {
        card.classList.remove('selected');
    });
    document.getElementById('select-geneset-btn').disabled = true;
    
    // Reset results panel
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

    // Show the first step
    showStep(1);
    
    addTerminalOutput('>> Simulator reset. Ready for a new OptKnock analysis...', 'info');
}

// Utility: number formatting
function formatNumber(num, decimals = 4) {
    if (num === null || num === undefined) return 'N/A';
    return parseFloat(num).toFixed(decimals);
}

// Utility: random colour selection
function getRandomColor() {
    const colors = ['#3498db', '#e74c3c', '#f39c12', '#9b59b6', '#27ae60', '#e67e22', '#34495e'];
    return colors[Math.floor(Math.random() * colors.length)];
}

// Chart data definitions
const pathwayChartData = {
    glycolysis: {
        title: 'Glycolysis pathway – growth and production forecast',
        type: 'line',
        data: {
            labels: ['0h', '2h', '4h', '6h', '8h', '10h', '12h', '14h', '16h', '18h', '20h'],
            datasets: [{
                label: 'Cell density (OD600)',
                data: [0.1, 0.15, 0.25, 0.42, 0.68, 1.1, 1.75, 2.8, 4.2, 5.8, 7.2],
                borderColor: '#3498db',
                backgroundColor: 'rgba(52, 152, 219, 0.1)',
                tension: 0.4,
                yAxisID: 'y'
            }, {
                label: 'Succinate production (mmol/gDW)',
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
                title: { display: true, text: 'Glycolysis optimization trend' },
                legend: { position: 'top' }
            },
            scales: {
                y: {
                    type: 'linear',
                    display: true,
                    position: 'left',
                    title: { display: true, text: 'Cell density (OD600)' }
                },
                y1: {
                    type: 'linear',
                    display: true,
                    position: 'right',
                    title: { display: true, text: 'Succinate production (mmol/gDW)' },
                    grid: { drawOnChartArea: false }
                }
            }
        }
    },
    pentose_phosphate: {
        title: 'Pentose phosphate pathway – flux analysis',
        type: 'radar',
        data: {
            labels: ['G6PDH2r', 'PGL', 'GND', 'RPI', 'RPE', 'TKT1', 'TALA', 'TKT2'],
            datasets: [{
                label: 'Wild-type flux',
                data: [8.2, 7.8, 6.5, 5.2, 4.8, 6.1, 5.9, 4.3],
                borderColor: '#3498db',
                backgroundColor: 'rgba(52, 152, 219, 0.2)',
                pointBackgroundColor: '#3498db'
            }, {
                label: 'Post-knockout flux',
                data: [12.1, 11.5, 9.8, 7.8, 7.2, 9.1, 8.8, 6.4],
                borderColor: '#e74c3c',
                backgroundColor: 'rgba(231, 76, 60, 0.2)',
                pointBackgroundColor: '#e74c3c'
            }]
        },
        options: {
            responsive: true,
            plugins: { title: { display: true, text: 'Flux redistribution overview' } },
            scales: { r: { beginAtZero: true, max: 15, ticks: { stepSize: 3 } } }
        }
    },
    tca_cycle: {
        title: 'TCA cycle – energy efficiency',
        type: 'doughnut',
        data: {
            labels: ['ATP production', 'NADH production', 'FADH2 production', 'Intermediates', 'Other'],
            datasets: [{
                data: [35, 28, 15, 18, 4],
                backgroundColor: ['#3498db', '#e74c3c', '#f39c12', '#9b59b6', '#27ae60'],
                borderWidth: 2,
                borderColor: '#ffffff'
            }]
        },
        options: {
            responsive: true,
            plugins: { title: { display: true, text: 'Energy distribution (%)' }, legend: { position: 'bottom' } }
        }
    },
    mixed_central: {
        title: 'Mixed central metabolism – flux balance analysis',
        type: 'bar',
        data: {
            labels: ['PFK', 'GAPD', 'PYK', 'CS', 'ICDHyr', 'G6PDH2r', 'RPE', 'TALA'],
            datasets: [{
                label: 'Upregulated flux (mmol/gDW·hr)',
                data: [15.2, 18.7, 12.3, 8.9, 11.4, 6.8, 4.2, 5.1],
                backgroundColor: '#27ae60',
                borderColor: '#229954',
                borderWidth: 1
            }, {
                label: 'Downregulated flux (mmol/gDW·hr)',
                data: [-3.2, -2.1, -4.8, -6.3, -1.9, -8.7, -5.4, -3.6],
                backgroundColor: '#e74c3c',
                borderColor: '#c0392b',
                borderWidth: 1
            }]
        },
        options: {
            responsive: true,
            plugins: { title: { display: true, text: 'Flux changes across hybrid pathways' } },
            scales: { y: { beginAtZero: true, title: { display: true, text: 'Flux change (mmol/gDW·hr)' } } }
        }
    },
    fermentation: {
        title: 'Fermentation pathway – product distribution',
        type: 'polarArea',
        data: {
            labels: ['Ethanol', 'Lactate', 'Acetate', 'Formate', 'Succinate', 'Other'],
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
                borderColor: ['#3498db', '#e74c3c', '#f39c12', '#9b59b6', '#27ae60', '#95a5a6'],
                borderWidth: 2
            }]
        },
        options: {
            responsive: true,
            plugins: { title: { display: true, text: 'Fermentation product distribution (%)' }, legend: { position: 'right' } },
            scales: { r: { beginAtZero: true } }
        }
    }
};

// Chart preview functionality
let currentChart = null;

function showChartPreview(geneSetType) {
    const modal = document.getElementById('chart-preview-modal');
    const title = document.getElementById('chart-modal-title');
    const canvas = document.getElementById('preview-chart');
    
    if (!pathwayChartData[geneSetType]) return;
    
    const chartData = pathwayChartData[geneSetType];
    title.textContent = chartData.title;
    
    // Destroy existing charts
    if (currentChart) {
        currentChart.destroy();
    }
    
    // Create new chart
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

// Result analysis chart configuration
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
            labels: ['Wild type', 'Single knockout', 'Double knockout', 'Triple knockout'],
            datasets: [{
                label: 'Growth rate (hr⁻¹)',
                data: [0.65, 0.52, 0.38, 0.25],
                backgroundColor: 'rgba(52, 152, 219, 0.7)',
                borderColor: '#3498db',
                borderWidth: 2,
                yAxisID: 'y'
            }, {
                label: 'Succinate production (mmol/gDW·hr)',
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
                    text: 'Knockout strategy comparison',
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
                        text: 'Growth rate (hr⁻¹)'
                    }
                },
                y1: {
                    type: 'linear',
                    display: true,
                    position: 'right',
                    beginAtZero: true,
                    title: {
                        display: true,
                        text: 'Production (mmol/gDW·hr)'
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
                label: 'Wild type',
                data: [0, 1.2, 2.8, 4.1, 5.2, 5.8, 6.1],
                borderColor: '#95a5a6',
                backgroundColor: 'rgba(149, 165, 166, 0.1)',
                tension: 0.4
            }, {
                label: 'Optimised strain',
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
                        text: 'Cumulative production (mmol/gDW)'
                    }
                },
                x: {
                    title: {
                        display: true,
                        text: 'Culture time'
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
            labels: ['Glycolysis', 'Pentose phosphate', 'TCA cycle', 'Electron transport', 'Amino acid synthesis', 'Fatty acid synthesis'],
            datasets: [{
                label: 'Wild-type activity',
                data: [85, 72, 90, 88, 65, 58],
                borderColor: '#3498db',
                backgroundColor: 'rgba(52, 152, 219, 0.2)',
                pointBackgroundColor: '#3498db'
            }, {
                label: 'Post-knockout activity',
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
                        text: 'Relative activity (%)'
                    }
                }
            }
        }
    });
}

// Hover effects for gene set cards
document.addEventListener('DOMContentLoaded', function() {
    const geneSetCards = document.querySelectorAll('.gene-set-card');
    
    geneSetCards.forEach(card => {
        let hoverTimeout;
        
        card.addEventListener('mouseenter', function() {
            const geneSetType = this.dataset.geneset;
            hoverTimeout = originalSetTimeout(() => {
                showChartPreview(geneSetType);
            }, 800); // Delay appearance by 800ms using native timers to avoid speed-mode overrides
        });
        
        card.addEventListener('mouseleave', function() {
            if (hoverTimeout) {
                clearTimeout(hoverTimeout);
            }
        });
    });
    
    // Close modal when background is clicked
    document.getElementById('chart-preview-modal').addEventListener('click', function(e) {
        if (e.target === this) {
            closeChartPreview();
        }
    });
});
