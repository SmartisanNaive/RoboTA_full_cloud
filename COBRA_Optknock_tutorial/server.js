const express = require('express');
const path = require('path');
const fs = require('fs');

const app = express();
const PORT = process.env.PORT || 3000;

// 静态文件服务
app.use(express.static(path.join(__dirname, 'public')));
app.use(express.json());

// 主页路由
app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, 'public', 'index.html'));
});

// API路由 - 获取OptKnock结果数据
app.get('/api/optknock-data', (req, res) => {
    try {
        const jsonData = fs.readFileSync(path.join(__dirname, 'optKnock_results.json'), 'utf8');
        const data = JSON.parse(jsonData);
        res.json(data);
    } catch (error) {
        console.error('Error reading OptKnock data:', error);
        res.status(500).json({ error: 'Failed to load OptKnock data' });
    }
});

// API路由 - 获取特定场景数据 (通过ID)
app.get('/api/scenario/:id', (req, res) => {
    try {
        const jsonData = fs.readFileSync(path.join(__dirname, 'optKnock_results.json'), 'utf8');
        const data = JSON.parse(jsonData);
        const scenarioId = `scenario_${req.params.id}`;
        
        if (data[scenarioId]) {
            res.json(data[scenarioId]);
        } else {
            res.status(404).json({ error: 'Scenario not found' });
        }
    } catch (error) {
        console.error('Error reading scenario data:', error);
        res.status(500).json({ error: 'Failed to load scenario data' });
    }
});

// API路由 - 根据查询参数获取场景数据
app.get('/api/scenario', (req, res) => {
    try {
        const { geneset, glucose, target, knockout } = req.query;
        
        if (!geneset || !glucose || !target || !knockout) {
            return res.status(400).json({ 
                error: 'Missing required parameters: geneset, glucose, target, knockout' 
            });
        }
        
        const jsonData = fs.readFileSync(path.join(__dirname, 'optKnock_results.json'), 'utf8');
        const data = JSON.parse(jsonData);
        
        // 查找匹配的场景
        let matchedScenario = null;
        for (const [key, scenario] of Object.entries(data)) {
            if (scenario.gene_set === geneset && 
                parseFloat(scenario.glucose_concentration) === parseFloat(glucose) &&
                scenario.target_product === target &&
                parseInt(scenario.knockout_size) === parseInt(knockout)) {
                matchedScenario = scenario;
                break;
            }
        }
        
        if (matchedScenario) {
            res.json({ success: true, scenario: matchedScenario });
        } else {
            // 如果没找到匹配的场景，返回一个模拟结果
            const mockScenario = {
                gene_set: geneset,
                glucose_concentration: parseFloat(glucose),
                target_product: target,
                knockout_size: parseInt(knockout),
                knockout_genes: generateMockKnockoutGenes(geneset, parseInt(knockout)),
                wildtype_production: Math.random() * 2,
                mutant_production: Math.random() * 8 + 2,
                improvement: Math.random() * 300 + 50,
                growth_change: (Math.random() - 0.5) * 0.2,
                growth_coupled: Math.random() > 0.3
            };
            res.json({ success: true, scenario: mockScenario });
        }
    } catch (error) {
        console.error('Error reading scenario data:', error);
        res.status(500).json({ error: 'Failed to load scenario data' });
    }
});

// 辅助函数：生成模拟敲除基因
function generateMockKnockoutGenes(geneset, knockoutSize) {
    const genesBySet = {
        glycolysis: ['pgi', 'pfkA', 'fbaA', 'tpiA', 'gapA', 'pgk', 'gpmA', 'eno', 'pykF'],
        pentose_phosphate: ['zwf', 'pgl', 'gnd', 'rpiA', 'rpe', 'tktA', 'talA', 'tktB'],
        tca_cycle: ['gltA', 'acnA', 'acnB', 'icd', 'sucA', 'sucC', 'sdhA', 'fumA', 'mdh'],
        mixed_central: ['pgi', 'pfkA', 'gapA', 'pykF', 'gltA', 'acnA', 'sucC', 'fumA'],
        fermentation: ['ldhA', 'pflB', 'adhE', 'pta', 'ackA', 'frdA']
    };
    
    const availableGenes = genesBySet[geneset] || ['gene1', 'gene2', 'gene3'];
    const selectedGenes = [];
    
    for (let i = 0; i < knockoutSize && i < availableGenes.length; i++) {
        const randomIndex = Math.floor(Math.random() * availableGenes.length);
        const gene = availableGenes[randomIndex];
        if (!selectedGenes.includes(gene)) {
            selectedGenes.push(gene);
        }
    }
    
    return selectedGenes.join(', ');
}

// API路由 - 获取基因集信息
app.get('/api/gene-sets', (req, res) => {
    const geneSets = {
        glycolysis: {
            name: "糖酵解途径",
            description: "葡萄糖分解为丙酮酸的代谢途径，是细胞能量产生的主要路径",
            reactions: ['GLCabcpp', 'GLCptspp', 'HEX1', 'PGI', 'PFK', 'FBA', 'TPI', 'GAPD', 'PGK', 'PGM', 'ENO', 'PYK', 'LDH_D', 'PFL', 'ALCD2x', 'PTAr', 'ACKr']
        },
        pentose_phosphate: {
            name: "磷酸戊糖途径",
            description: "产生NADPH和核糖-5-磷酸的代谢途径，为细胞提供还原力和核酸合成原料",
            reactions: ['G6PDH2r', 'PGL', 'GND', 'RPI', 'RPE', 'TKT1', 'TALA', 'TKT2', 'ZWFOXD', 'PGDH', 'RBKS', 'PRPPS']
        },
        tca_cycle: {
            name: "TCA循环",
            description: "柠檬酸循环，完全氧化丙酮酸产生ATP、NADH和FADH2的中心代谢途径",
            reactions: ['FUM', 'FRD2', 'SUCOAS', 'AKGDH', 'ACONTa', 'ACONTb', 'ICDHyr', 'CS', 'MDH', 'MDH2', 'MDH3', 'SUCD1i', 'SUCD4']
        },
        mixed_central: {
            name: "混合中心代谢",
            description: "结合糖酵解、磷酸戊糖途径和TCA循环的关键反应，代表细胞的核心代谢网络",
            reactions: ['GLCabcpp', 'PGI', 'PFK', 'G6PDH2r', 'CS', 'ACONTa', 'SUCOAS', 'FUM', 'MDH', 'PYK', 'ENO', 'GAPD', 'TKT1', 'TALA']
        },
        fermentation: {
            name: "发酵途径",
            description: "在缺氧条件下产生各种发酵产物的代谢途径，包括乳酸、乙醇、醋酸等",
            reactions: ['LDH_D', 'PFL', 'ALCD2x', 'PTAr', 'ACKr', 'ACALD', 'ADHEr', 'FRD2', 'FRD3', 'ASPT', 'ASPK']
        }
    };
    res.json(geneSets);
});

app.listen(PORT, () => {
    console.log(`OptKnock Simulator server running on http://localhost:${PORT}`);
});
