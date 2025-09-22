import React, { useState, useCallback, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Calculator, TrendingUp, MessageSquare, Atom, Play, Pause, RotateCcw, Save, Trash2 } from 'lucide-react';
import { ProgressIndicator } from '../../../components/shared/ProgressIndicator';
import { ContentLayout } from '../../../components/shared/ContentLayout';
import { SliderControl } from '../../../components/shared/FormControls';
import { InteractiveChart } from '../../../components/shared/InteractiveChart';

export const Module3Home: React.FC = () => {
  const [currentStep, setCurrentStep] = useState(0);
  const steps = ['learn', 'setup & simulate', 'analyze & explore'];
  
  // Enhanced ODE Model Parameters with validation
  const [kTx, setKTx] = useState(0.5);      // Transcription rate
  const [kTl, setKTl] = useState(0.3);      // Translation rate
  const [dMRNA, setDMRNA] = useState(0.1);  // mRNA degradation
  const [dProtein, setDProtein] = useState(0.05); // Protein degradation
  const [dnaConc, setDnaConc] = useState(1.0);    // DNA concentration
  
  const [heldCurves, setHeldCurves] = useState<any[]>([]);
  const [activeTab, setActiveTab] = useState('interpretation');
  const [isSimulating, setIsSimulating] = useState(false);
  const [simulationSpeed, setSimulationSpeed] = useState(1);

  // Enhanced ODE solver with Runge-Kutta 4th order method
  const solveODE = useCallback((params: any) => {
    const { kTx, kTl, dMRNA, dProtein, dnaConc } = params;
    const timePoints = Array.from({ length: 201 }, (_, i) => i * 0.1); // 0 to 20 hours, higher resolution
    const mRNAData = [];
    const proteinData = [];
    
    let mRNA = 0;
    let protein = 0;
    const dt = 0.1;
    
    for (const t of timePoints) {
      // Runge-Kutta 4th order method for better accuracy
      const k1_mRNA = kTx * dnaConc - dMRNA * mRNA;
      const k1_protein = kTl * mRNA - dProtein * protein;
      
      const k2_mRNA = kTx * dnaConc - dMRNA * (mRNA + dt * k1_mRNA / 2);
      const k2_protein = kTl * (mRNA + dt * k1_mRNA / 2) - dProtein * (protein + dt * k1_protein / 2);
      
      const k3_mRNA = kTx * dnaConc - dMRNA * (mRNA + dt * k2_mRNA / 2);
      const k3_protein = kTl * (mRNA + dt * k2_mRNA / 2) - dProtein * (protein + dt * k2_protein / 2);
      
      const k4_mRNA = kTx * dnaConc - dMRNA * (mRNA + dt * k3_mRNA);
      const k4_protein = kTl * (mRNA + dt * k3_mRNA) - dProtein * (protein + dt * k3_protein);
      
      mRNA += dt * (k1_mRNA + 2 * k2_mRNA + 2 * k3_mRNA + k4_mRNA) / 6;
      protein += dt * (k1_protein + 2 * k2_protein + 2 * k3_protein + k4_protein) / 6;
      
      // Ensure non-negative values
      mRNA = Math.max(0, mRNA);
      protein = Math.max(0, protein);
      
      mRNAData.push({ x: t, y: mRNA });
      proteinData.push({ x: t, y: protein });
    }
    
    return { mRNAData, proteinData };
  }, []);

  // Memoized calculation for performance
  const { mRNAData, proteinData } = useMemo(() => 
    solveODE({ kTx, kTl, dMRNA, dProtein, dnaConc }), 
    [kTx, kTl, dMRNA, dProtein, dnaConc, solveODE]
  );

  const holdCurrentCurve = useCallback(() => {
    const newCurve = {
      id: Date.now(),
      mRNA: [...mRNAData],
      protein: [...proteinData],
      params: { kTx, kTl, dMRNA, dProtein, dnaConc },
      color: `hsl(${Math.random() * 360}, 70%, 50%)`
    };
    setHeldCurves(prev => [...prev, newCurve]);
  }, [mRNAData, proteinData, kTx, kTl, dMRNA, dProtein, dnaConc]);

  const clearHeldCurves = useCallback(() => {
    setHeldCurves([]);
  }, []);

  const resetParameters = useCallback(() => {
    setKTx(0.5);
    setKTl(0.3);
    setDMRNA(0.1);
    setDProtein(0.05);
    setDnaConc(1.0);
  }, []);

  const renderStepContent = () => {
    switch (currentStep) {
      case 0: // Learn
        return (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
          >
            <ContentLayout
              title="📚 ODE Modeling Fundamentals"
              subtitle="Understanding mathematical models of biological systems"
            >
              <div className="space-y-8">
                {/* Mathematical Model Section */}
                <div className="bg-gradient-to-br from-blue-50 to-indigo-100 p-8 rounded-2xl border border-blue-200 shadow-lg">
                  <h3 className="font-bold text-blue-900 mb-6 text-xl flex items-center">
                    <div className="w-8 h-8 bg-blue-500 rounded-lg flex items-center justify-center mr-3">
                      <Calculator className="h-5 w-5 text-white" />
                    </div>
                    🧮 Mathematical Model
                  </h3>
                  <div className="space-y-6">
                    <div className="bg-white p-6 rounded-xl shadow-sm border border-blue-100">
                      <div className="text-center space-y-4">
                        <div className="text-2xl font-mono bg-gray-50 p-4 rounded-lg border">
                          <div className="mb-3">d[mRNA]/dt = k<sub>tx</sub> · [DNA] - d<sub>mRNA</sub> · [mRNA]</div>
                          <div>d[Protein]/dt = k<sub>tl</sub> · [mRNA] - d<sub>protein</sub> · [Protein]</div>
                        </div>
                        <p className="text-blue-800 leading-relaxed">
                          These coupled differential equations describe the flow from DNA → mRNA → Protein, 
                          including degradation processes that maintain cellular homeostasis.
                        </p>
                      </div>
                    </div>
                  </div>
                </div>
                
                {/* System Dynamics Grid */}
                <div className="grid md:grid-cols-2 gap-8">
                  <motion.div 
                    className="bg-gradient-to-br from-green-50 to-emerald-100 p-8 rounded-2xl border border-green-200 shadow-lg"
                    whileHover={{ scale: 1.02 }}
                    transition={{ duration: 0.3 }}
                  >
                    <h3 className="font-bold text-green-900 mb-6 text-lg flex items-center">
                      <TrendingUp className="h-6 w-6 mr-3" />
                      📈 System Dynamics
                    </h3>
                    <ul className="text-green-800 space-y-4">
                      <li className="flex items-start space-x-3">
                        <div className="w-2 h-2 bg-green-500 rounded-full mt-2"></div>
                        <div>
                          <strong>Transcription:</strong> DNA template guides mRNA synthesis
                        </div>
                      </li>
                      <li className="flex items-start space-x-3">
                        <div className="w-2 h-2 bg-green-500 rounded-full mt-2"></div>
                        <div>
                          <strong>Translation:</strong> mRNA directs protein assembly
                        </div>
                      </li>
                      <li className="flex items-start space-x-3">
                        <div className="w-2 h-2 bg-green-500 rounded-full mt-2"></div>
                        <div>
                          <strong>Degradation:</strong> Natural decay maintains balance
                        </div>
                      </li>
                      <li className="flex items-start space-x-3">
                        <div className="w-2 h-2 bg-green-500 rounded-full mt-2"></div>
                        <div>
                          <strong>Steady State:</strong> Production equals degradation
                        </div>
                      </li>
                    </ul>
                  </motion.div>
                  
                  <motion.div 
                    className="bg-gradient-to-br from-purple-50 to-violet-100 p-8 rounded-2xl border border-purple-200 shadow-lg"
                    whileHover={{ scale: 1.02 }}
                    transition={{ duration: 0.3 }}
                  >
                    <h3 className="font-bold text-purple-900 mb-6 text-lg flex items-center">
                      <Calculator className="h-6 w-6 mr-3" />
                      🎛️ Parameter Effects
                    </h3>
                    <ul className="text-purple-800 space-y-4">
                      <li className="flex items-start space-x-3">
                        <div className="w-2 h-2 bg-purple-500 rounded-full mt-2"></div>
                        <div>
                          <strong>k<sub>tx</sub>:</strong> Controls mRNA production rate
                        </div>
                      </li>
                      <li className="flex items-start space-x-3">
                        <div className="w-2 h-2 bg-purple-500 rounded-full mt-2"></div>
                        <div>
                          <strong>k<sub>tl</sub>:</strong> Controls protein synthesis rate
                        </div>
                      </li>
                      <li className="flex items-start space-x-3">
                        <div className="w-2 h-2 bg-purple-500 rounded-full mt-2"></div>
                        <div>
                          <strong>d<sub>mRNA</sub>:</strong> mRNA stability and lifetime
                        </div>
                      </li>
                      <li className="flex items-start space-x-3">
                        <div className="w-2 h-2 bg-purple-500 rounded-full mt-2"></div>
                        <div>
                          <strong>d<sub>protein</sub>:</strong> Protein stability and lifetime
                        </div>
                      </li>
                    </ul>
                  </motion.div>
                </div>

                {/* Biological Context */}
                <div className="bg-gradient-to-br from-amber-50 to-orange-100 p-8 rounded-2xl border border-amber-200 shadow-lg">
                  <h3 className="font-bold text-amber-900 mb-6 text-lg">🧬 Biological Context</h3>
                  <div className="grid md:grid-cols-3 gap-6">
                    <div className="bg-white p-4 rounded-lg shadow-sm">
                      <h4 className="font-semibold text-amber-800 mb-2">Gene Expression</h4>
                      <p className="text-sm text-amber-700">Central dogma: DNA → RNA → Protein</p>
                    </div>
                    <div className="bg-white p-4 rounded-lg shadow-sm">
                      <h4 className="font-semibold text-amber-800 mb-2">Regulation</h4>
                      <p className="text-sm text-amber-700">Cells control protein levels dynamically</p>
                    </div>
                    <div className="bg-white p-4 rounded-lg shadow-sm">
                      <h4 className="font-semibold text-amber-800 mb-2">Applications</h4>
                      <p className="text-sm text-amber-700">Drug design, synthetic biology</p>
                    </div>
                  </div>
                </div>
              </div>
            </ContentLayout>
          </motion.div>
        );

      case 1: // Setup & Simulate - Enhanced Layout
        return (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            className="space-y-8"
          >
            <div className="text-center mb-8">
              <h2 className="text-4xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent mb-4">
                🎛️ Interactive ODE Sandbox
              </h2>
              <p className="text-xl text-gray-600 max-w-4xl mx-auto">
                Explore how parameter changes affect system behavior in real-time with enhanced mathematical precision
              </p>
            </div>
            
            {/* Enhanced Parameter Controls - Top Section */}
            <motion.div 
              className="bg-gradient-to-br from-white to-blue-50 p-8 rounded-2xl shadow-xl border border-blue-200"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.1 }}
            >
              <div className="flex items-center justify-between mb-8">
                <h3 className="text-2xl font-bold text-gray-900 flex items-center">
                  <div className="w-8 h-8 bg-blue-500 rounded-lg flex items-center justify-center mr-3">
                    <Calculator className="h-5 w-5 text-white" />
                  </div>
                  🎚️ Parameter Controls
                </h3>
                
                <div className="flex space-x-3">
                  <motion.button
                    onClick={holdCurrentCurve}
                    className="flex items-center space-x-2 px-4 py-2 bg-yellow-500 text-white rounded-lg hover:bg-yellow-600 transition-all font-medium shadow-lg"
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                  >
                    <Save className="h-4 w-4" />
                    <span>Hold/Compare</span>
                  </motion.button>
                  
                  <motion.button
                    onClick={clearHeldCurves}
                    className="flex items-center space-x-2 px-4 py-2 bg-red-500 text-white rounded-lg hover:bg-red-600 transition-all font-medium shadow-lg"
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                  >
                    <Trash2 className="h-4 w-4" />
                    <span>Clear All</span>
                  </motion.button>
                  
                  <motion.button
                    onClick={resetParameters}
                    className="flex items-center space-x-2 px-4 py-2 bg-gray-500 text-white rounded-lg hover:bg-gray-600 transition-all font-medium shadow-lg"
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                  >
                    <RotateCcw className="h-4 w-4" />
                    <span>Reset</span>
                  </motion.button>
                </div>
              </div>

              {/* Mathematical Model Display */}
              <div className="mb-8 p-6 bg-white rounded-xl border border-gray-200 shadow-sm">
                <h4 className="font-semibold text-gray-900 mb-4 text-center">📐 Current Mathematical Model</h4>
                <div className="text-center space-y-3">
                  <div className="text-lg font-mono bg-gray-50 p-4 rounded-lg border inline-block">
                    <div className="mb-2">d[mRNA]/dt = {kTx} · [DNA] - {dMRNA} · [mRNA]</div>
                    <div>d[Protein]/dt = {kTl} · [mRNA] - {dProtein} · [Protein]</div>
                  </div>
                </div>
              </div>

              {/* Enhanced Parameter Grid */}
              <div className="grid lg:grid-cols-2 xl:grid-cols-3 gap-8">
                <div className="bg-blue-50 p-6 rounded-xl border border-blue-200">
                  <h4 className="font-bold text-blue-900 mb-6 text-lg">🧬 Transcription & Translation</h4>
                  <div className="space-y-6">
                    <SliderControl
                      label="Transcription Rate (k_tx)"
                      value={kTx}
                      min={0.1}
                      max={2.0}
                      step={0.05}
                      unit="/hr"
                      onChange={setKTx}
                      description="Speed of mRNA production from DNA template"
                    />
                    
                    <SliderControl
                      label="Translation Rate (k_tl)"
                      value={kTl}
                      min={0.1}
                      max={1.0}
                      step={0.025}
                      unit="/hr"
                      onChange={setKTl}
                      description="Speed of protein synthesis from mRNA"
                    />
                  </div>
                </div>
                
                <div className="bg-red-50 p-6 rounded-xl border border-red-200">
                  <h4 className="font-bold text-red-900 mb-6 text-lg">⚡ Degradation Rates</h4>
                  <div className="space-y-6">
                    <SliderControl
                      label="mRNA Degradation (d_mRNA)"
                      value={dMRNA}
                      min={0.01}
                      max={0.5}
                      step={0.005}
                      unit="/hr"
                      onChange={setDMRNA}
                      description="Rate of mRNA breakdown and turnover"
                    />
                    
                    <SliderControl
                      label="Protein Degradation (d_protein)"
                      value={dProtein}
                      min={0.01}
                      max={0.2}
                      step={0.005}
                      unit="/hr"
                      onChange={setDProtein}
                      description="Rate of protein degradation and recycling"
                    />
                  </div>
                </div>
                
                <div className="bg-green-50 p-6 rounded-xl border border-green-200">
                  <h4 className="font-bold text-green-900 mb-6 text-lg">🧪 Initial Conditions</h4>
                  <div className="space-y-6">
                    <SliderControl
                      label="DNA Concentration"
                      value={dnaConc}
                      min={0.1}
                      max={5.0}
                      step={0.1}
                      unit=" nM"
                      onChange={setDnaConc}
                      description="Initial DNA template concentration"
                    />
                    
                    <div className="bg-white p-4 rounded-lg">
                      <h5 className="font-semibold text-green-800 mb-2">📊 System Status</h5>
                      <div className="text-sm space-y-1">
                        <div>Steady-state mRNA: {(kTx * dnaConc / dMRNA).toFixed(2)} nM</div>
                        <div>Steady-state Protein: {(kTl * kTx * dnaConc / (dMRNA * dProtein)).toFixed(2)} nM</div>
                        <div>Held curves: {heldCurves.length}</div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </motion.div>

            {/* Enhanced Real-time Dynamics - Bottom Section */}
            <motion.div 
              className="bg-gradient-to-br from-white to-purple-50 p-8 rounded-2xl shadow-xl border border-purple-200"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.2 }}
            >
              <h3 className="text-2xl font-bold text-gray-900 mb-6 flex items-center">
                <div className="w-8 h-8 bg-purple-500 rounded-lg flex items-center justify-center mr-3">
                  <TrendingUp className="h-5 w-5 text-white" />
                </div>
                📊 Real-time System Dynamics
              </h3>
              
              <div className="bg-white p-6 rounded-xl shadow-lg border border-gray-200">
                <div className="h-96 relative">
                  <svg viewBox="0 0 800 400" className="w-full h-full">
                    {/* Enhanced Grid */}
                    <defs>
                      <pattern id="grid" width="40" height="40" patternUnits="userSpaceOnUse">
                        <path d="M 40 0 L 0 0 0 40" fill="none" stroke="#e5e7eb" strokeWidth="1"/>
                      </pattern>
                      <pattern id="minorGrid" width="8" height="8" patternUnits="userSpaceOnUse">
                        <path d="M 8 0 L 0 0 0 8" fill="none" stroke="#f3f4f6" strokeWidth="0.5"/>
                      </pattern>
                    </defs>
                    <rect width="800" height="400" fill="url(#minorGrid)" />
                    <rect width="800" height="400" fill="url(#grid)" />
                    
                    {/* Axes */}
                    <line x1="60" y1="350" x2="750" y2="350" stroke="#374151" strokeWidth="2"/>
                    <line x1="60" y1="350" x2="60" y2="50" stroke="#374151" strokeWidth="2"/>
                    
                    {/* Axis labels */}
                    <text x="400" y="390" textAnchor="middle" fontSize="14" fill="#6b7280" fontWeight="600">Time (hours)</text>
                    <text x="30" y="200" textAnchor="middle" fontSize="14" fill="#6b7280" fontWeight="600" transform="rotate(-90, 30, 200)">Concentration (nM)</text>
                    
                    {/* Time markers */}
                    {Array.from({ length: 6 }, (_, i) => (
                      <g key={i}>
                        <line x1={60 + i * 138} y1="350" x2={60 + i * 138} y2="355" stroke="#374151" strokeWidth="1"/>
                        <text x={60 + i * 138} y="370" textAnchor="middle" fontSize="12" fill="#6b7280">{i * 4}</text>
                      </g>
                    ))}
                    
                    {/* Concentration markers */}
                    {Array.from({ length: 6 }, (_, i) => (
                      <g key={i}>
                        <line x1="55" y1={350 - i * 50} x2="60" y2={350 - i * 50} stroke="#374151" strokeWidth="1"/>
                        <text x="50" y={355 - i * 50} textAnchor="end" fontSize="12" fill="#6b7280">{i * 2}</text>
                      </g>
                    ))}

                    {/* Held curves (faded) */}
                    {heldCurves.map((curve, index) => (
                      <g key={curve.id}>
                        <motion.path
                          d={`M ${curve.mRNA.map((d, i) => `${60 + d.x * 34.5},${350 - d.y * 25}`).join(' L ')}`}
                          fill="none"
                          stroke={curve.color || "#93c5fd"}
                          strokeWidth="2"
                          opacity="0.4"
                          strokeDasharray="5,5"
                          initial={{ pathLength: 0 }}
                          animate={{ pathLength: 1 }}
                          transition={{ duration: 1 }}
                        />
                        <motion.path
                          d={`M ${curve.protein.map((d, i) => `${60 + d.x * 34.5},${350 - d.y * 15}`).join(' L ')}`}
                          fill="none"
                          stroke={curve.color || "#c084fc"}
                          strokeWidth="2"
                          opacity="0.4"
                          strokeDasharray="5,5"
                          initial={{ pathLength: 0 }}
                          animate={{ pathLength: 1 }}
                          transition={{ duration: 1, delay: 0.2 }}
                        />
                      </g>
                    ))}
                    
                    {/* Current curves with enhanced styling */}
                    <motion.path
                      d={`M ${mRNAData.map((d, i) => `${60 + d.x * 34.5},${350 - d.y * 25}`).join(' L ')}`}
                      fill="none"
                      stroke="#3b82f6"
                      strokeWidth="4"
                      filter="drop-shadow(0 2px 4px rgba(59, 130, 246, 0.3))"
                      initial={{ pathLength: 0 }}
                      animate={{ pathLength: 1 }}
                      transition={{ duration: 1.5, ease: "easeInOut" }}
                    />
                    
                    <motion.path
                      d={`M ${proteinData.map((d, i) => `${60 + d.x * 34.5},${350 - d.y * 15}`).join(' L ')}`}
                      fill="none"
                      stroke="#8b5cf6"
                      strokeWidth="4"
                      filter="drop-shadow(0 2px 4px rgba(139, 92, 246, 0.3))"
                      initial={{ pathLength: 0 }}
                      animate={{ pathLength: 1 }}
                      transition={{ duration: 1.5, delay: 0.3, ease: "easeInOut" }}
                    />
                    
                    {/* Enhanced Legend */}
                    <g transform="translate(600, 80)">
                      <rect width="180" height="80" fill="white" stroke="#e5e7eb" rx="8" fillOpacity="0.95"/>
                      <text x="90" y="20" textAnchor="middle" fontSize="14" fill="#374151" fontWeight="600">Legend</text>
                      <line x1="15" y1="35" x2="35" y2="35" stroke="#3b82f6" strokeWidth="4"/>
                      <text x="45" y="39" fontSize="12" fill="#374151" fontWeight="500">mRNA</text>
                      <line x1="15" y1="55" x2="35" y2="55" stroke="#8b5cf6" strokeWidth="4"/>
                      <text x="45" y="59" fontSize="12" fill="#374151" fontWeight="500">Protein</text>
                      {heldCurves.length > 0 && (
                        <>
                          <line x1="100" y1="35" x2="120" y2="35" stroke="#9ca3af" strokeWidth="2" strokeDasharray="5,5"/>
                          <text x="130" y="39" fontSize="10" fill="#6b7280">Held</text>
                        </>
                      )}
                    </g>
                  </svg>
                </div>
              </div>

              {/* Enhanced Status Panel */}
              <div className="mt-6 grid md:grid-cols-3 gap-6">
                <div className="bg-gradient-to-r from-blue-50 to-blue-100 p-4 rounded-xl border border-blue-200">
                  <h4 className="font-bold text-blue-900 mb-2">📊 Current Parameters</h4>
                  <div className="grid grid-cols-2 gap-2 text-sm">
                    <div>k<sub>tx</sub>: {kTx}/hr</div>
                    <div>k<sub>tl</sub>: {kTl}/hr</div>
                    <div>d<sub>mRNA</sub>: {dMRNA}/hr</div>
                    <div>d<sub>protein</sub>: {dProtein}/hr</div>
                  </div>
                </div>
                
                <div className="bg-gradient-to-r from-green-50 to-green-100 p-4 rounded-xl border border-green-200">
                  <h4 className="font-bold text-green-900 mb-2">⚖️ Steady States</h4>
                  <div className="text-sm space-y-1">
                    <div>mRNA: {(kTx * dnaConc / dMRNA).toFixed(2)} nM</div>
                    <div>Protein: {(kTl * kTx * dnaConc / (dMRNA * dProtein)).toFixed(2)} nM</div>
                  </div>
                </div>
                
                <div className="bg-gradient-to-r from-purple-50 to-purple-100 p-4 rounded-xl border border-purple-200">
                  <h4 className="font-bold text-purple-900 mb-2">🔄 Comparison</h4>
                  <div className="text-sm">
                    <div>Held curves: {heldCurves.length}</div>
                    <div>Active simulation: Real-time</div>
                  </div>
                </div>
              </div>
            </motion.div>
          </motion.div>
        );

      case 2: // Analyze & Explore - Enhanced
        return (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            className="space-y-8"
          >
            <div className="text-center mb-8">
              <h2 className="text-4xl font-bold bg-gradient-to-r from-green-600 to-blue-600 bg-clip-text text-transparent mb-4">
                🔍 Analysis & Exploration
              </h2>
              <p className="text-xl text-gray-600 max-w-4xl mx-auto">
                Deep dive into model interpretation and protein structure exploration
              </p>
            </div>
            
            {/* Enhanced Tabs */}
            <div className="flex justify-center space-x-6 mb-8">
              <motion.button
                onClick={() => setActiveTab('interpretation')}
                className={`px-8 py-4 rounded-xl font-semibold transition-all shadow-lg ${
                  activeTab === 'interpretation'
                    ? 'bg-gradient-to-r from-accent-500 to-blue-500 text-white shadow-xl'
                    : 'bg-white text-gray-700 hover:bg-gray-50 border border-gray-200'
                }`}
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
              >
                📊 Model Interpretation
              </motion.button>
              
              <motion.button
                onClick={() => setActiveTab('chatmol')}
                className={`px-8 py-4 rounded-xl font-semibold transition-all shadow-lg ${
                  activeTab === 'chatmol'
                    ? 'bg-gradient-to-r from-accent-500 to-blue-500 text-white shadow-xl'
                    : 'bg-white text-gray-700 hover:bg-gray-50 border border-gray-200'
                }`}
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
              >
                🧬 ChatMol Exploration
              </motion.button>
            </div>

            <AnimatePresence mode="wait">
              {activeTab === 'interpretation' ? (
                <motion.div
                  key="interpretation"
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: 20 }}
                  transition={{ duration: 0.5 }}
                  className="space-y-8"
                >
                  <ContentLayout
                    title="📈 Advanced Model Interpretation"
                    subtitle="Understanding system behavior and parameter sensitivity"
                  >
                    <div className="grid lg:grid-cols-2 gap-8">
                      <div className="space-y-6">
                        <h4 className="text-xl font-bold text-gray-900 flex items-center">
                          <TrendingUp className="h-6 w-6 mr-3" />
                          🎯 Key Insights
                        </h4>
                        <div className="space-y-4">
                          <motion.div 
                            className="bg-gradient-to-r from-blue-50 to-blue-100 p-6 rounded-xl border border-blue-200"
                            whileHover={{ scale: 1.02 }}
                          >
                            <h5 className="font-bold text-blue-900 mb-2">⏱️ Time Delay Dynamics</h5>
                            <p className="text-blue-800 text-sm leading-relaxed">
                              Protein production exhibits a characteristic lag behind mRNA due to translation kinetics, 
                              creating the classic "delay and amplification" pattern seen in biological systems.
                            </p>
                          </motion.div>
                          
                          <motion.div 
                            className="bg-gradient-to-r from-green-50 to-green-100 p-6 rounded-xl border border-green-200"
                            whileHover={{ scale: 1.02 }}
                          >
                            <h5 className="font-bold text-green-900 mb-2">⚖️ Steady State Analysis</h5>
                            <p className="text-green-800 text-sm leading-relaxed">
                              The system reaches equilibrium when production rates equal degradation rates, 
                              demonstrating the fundamental principle of cellular homeostasis.
                            </p>
                          </motion.div>
                          
                          <motion.div 
                            className="bg-gradient-to-r from-purple-50 to-purple-100 p-6 rounded-xl border border-purple-200"
                            whileHover={{ scale: 1.02 }}
                          >
                            <h5 className="font-bold text-purple-900 mb-2">📊 Parameter Sensitivity</h5>
                            <p className="text-purple-800 text-sm leading-relaxed">
                              Small changes in degradation rates produce disproportionately large effects on steady-state levels, 
                              highlighting the importance of post-transcriptional regulation.
                            </p>
                          </motion.div>
                        </div>
                      </div>
                      
                      <div className="space-y-6">
                        <h4 className="text-xl font-bold text-gray-900 flex items-center">
                          <Calculator className="h-6 w-6 mr-3" />
                          🧪 Experimental Connections
                        </h4>
                        <div className="space-y-4">
                          <motion.div 
                            className="bg-gradient-to-r from-yellow-50 to-yellow-100 p-6 rounded-xl border border-yellow-200"
                            whileHover={{ scale: 1.02 }}
                          >
                            <h5 className="font-bold text-yellow-900 mb-2">🔗 Module 2 Integration</h5>
                            <p className="text-yellow-800 text-sm leading-relaxed">
                              Cell-free expression data from Module 2 can validate model predictions and 
                              provide parameter estimates for real biological systems.
                            </p>
                          </motion.div>
                          
                          <motion.div 
                            className="bg-gradient-to-r from-red-50 to-red-100 p-6 rounded-xl border border-red-200"
                            whileHover={{ scale: 1.02 }}
                          >
                            <h5 className="font-bold text-red-900 mb-2">🎯 Optimization Strategies</h5>
                            <p className="text-red-800 text-sm leading-relaxed">
                              Use model predictions to optimize expression conditions, 
                              predict bottlenecks, and design more efficient biological systems.
                            </p>
                          </motion.div>
                          
                          <motion.div 
                            className="bg-gradient-to-r from-indigo-50 to-indigo-100 p-6 rounded-xl border border-indigo-200"
                            whileHover={{ scale: 1.02 }}
                          >
                            <h5 className="font-bold text-indigo-900 mb-2">🔬 Research Applications</h5>
                            <p className="text-indigo-800 text-sm leading-relaxed">
                              Mathematical modeling enables rational design of synthetic circuits, 
                              drug dosing regimens, and biotechnology processes.
                            </p>
                          </motion.div>
                        </div>
                      </div>
                    </div>
                  </ContentLayout>
                  
                  <InteractiveChart
                    title="Enhanced Parameter Sensitivity Analysis"
                    data={proteinData}
                    xLabel="Time (hours)"
                    yLabel="Protein Concentration (nM)"
                    color="#10b981"
                    height={500}
                  />
                </motion.div>
              ) : (
                <motion.div
                  key="chatmol"
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -20 }}
                  transition={{ duration: 0.5 }}
                  className="grid lg:grid-cols-2 gap-8"
                >
                  <ContentLayout
                    title="💬 ChatMol Interface"
                    subtitle="Interactive protein structure exploration with AI assistance"
                  >
                    <div className="space-y-6">
                      <div className="bg-gradient-to-br from-gray-50 to-blue-50 p-6 rounded-xl border-2 border-dashed border-gray-300">
                        <div className="flex items-center space-x-3 mb-4">
                          <MessageSquare className="h-6 w-6 text-blue-500" />
                          <span className="font-semibold text-gray-700 text-lg">AI Chat Interface</span>
                        </div>
                        <textarea
                          placeholder="Ask about protein structure, folding, function, or molecular interactions..."
                          className="w-full h-40 p-4 border border-gray-300 rounded-xl resize-none focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm"
                        />
                        <motion.button 
                          className="mt-4 w-full px-6 py-3 bg-gradient-to-r from-blue-500 to-purple-500 text-white rounded-xl hover:from-blue-600 hover:to-purple-600 transition-all font-semibold shadow-lg"
                          whileHover={{ scale: 1.02 }}
                          whileTap={{ scale: 0.98 }}
                        >
                          Send Query to AI
                        </motion.button>
                      </div>
                      
                      <div className="bg-gradient-to-br from-blue-50 to-indigo-100 p-6 rounded-xl border border-blue-200">
                        <h4 className="font-bold text-blue-900 mb-4 text-lg">💡 Example Queries</h4>
                        <div className="space-y-3">
                          {[
                            "Show me the 3D structure of Green Fluorescent Protein",
                            "How does protein folding affect enzymatic function?",
                            "Compare alpha helix vs beta sheet structural stability",
                            "What are the key binding sites in this protein?",
                            "Explain the relationship between sequence and structure"
                          ].map((query, index) => (
                            <motion.div
                              key={index}
                              className="bg-white p-3 rounded-lg shadow-sm border border-blue-100 cursor-pointer hover:bg-blue-50 transition-colors"
                              whileHover={{ scale: 1.02 }}
                              whileTap={{ scale: 0.98 }}
                            >
                              <p className="text-sm text-blue-800">• "{query}"</p>
                            </motion.div>
                          ))}
                        </div>
                      </div>
                    </div>
                  </ContentLayout>
                  
                  <ContentLayout
                    title="🧬 3D Structure Viewer"
                    subtitle="Interactive molecular visualization and analysis"
                  >
                    <div className="bg-gradient-to-br from-gray-100 to-gray-200 rounded-xl h-96 flex items-center justify-center border-2 border-dashed border-gray-300 relative overflow-hidden">
                      <div className="absolute inset-0 bg-gradient-to-br from-blue-500/10 to-purple-500/10"></div>
                      <div className="text-center z-10">
                        <motion.div
                          animate={{ rotate: 360 }}
                          transition={{ duration: 20, repeat: Infinity, ease: "linear" }}
                        >
                          <Atom className="h-20 w-20 text-gray-400 mx-auto mb-4" />
                        </motion.div>
                        <p className="text-gray-600 font-semibold text-lg">3D Protein Structure Viewer</p>
                        <p className="text-sm text-gray-500 mt-2">Interactive molecular visualization</p>
                        <div className="mt-4 flex justify-center space-x-2">
                          <div className="w-2 h-2 bg-blue-400 rounded-full animate-pulse"></div>
                          <div className="w-2 h-2 bg-purple-400 rounded-full animate-pulse" style={{ animationDelay: '0.2s' }}></div>
                          <div className="w-2 h-2 bg-green-400 rounded-full animate-pulse" style={{ animationDelay: '0.4s' }}></div>
                        </div>
                      </div>
                    </div>
                    
                    <div className="mt-6 bg-gradient-to-r from-green-50 to-emerald-100 p-4 rounded-xl border border-green-200">
                      <h5 className="font-bold text-green-900 mb-2">🚀 Coming Soon</h5>
                      <p className="text-sm text-green-800 leading-relaxed">
                        <strong>Advanced Features:</strong> Interactive 3D protein structure visualization 
                        with real-time manipulation, molecular dynamics simulation, binding site analysis, 
                        and AI-powered structural insights.
                      </p>
                    </div>
                  </ContentLayout>
                </motion.div>
              )}
            </AnimatePresence>
          </motion.div>
        );

      default:
        return null;
    }
  };

  return (
    <div className="max-w-7xl mx-auto">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
      >
        <div className="mb-8">
          <div className="flex items-center space-x-4 mb-6">
            <div className="w-12 h-12 bg-gradient-to-br from-accent-500 to-blue-500 rounded-2xl flex items-center justify-center shadow-lg">
              <Calculator className="h-7 w-7 text-white" />
            </div>
            <div>
              <h1 className="text-4xl font-bold bg-gradient-to-r from-accent-600 to-blue-600 bg-clip-text text-transparent">
                Module 3: Computational Modeling and System Verification
              </h1>
              <p className="text-lg text-gray-600 mt-2">
                Interactive mathematical modeling of biological systems with enhanced precision
              </p>
            </div>
          </div>
        </div>

        <ProgressIndicator steps={steps} currentStep={currentStep} />
        
        <div className="mt-8 flex justify-center space-x-6 mb-8">
          {steps.map((step, index) => (
            <motion.button
              key={step}
              onClick={() => setCurrentStep(index)}
              className={`px-6 py-3 rounded-xl font-semibold transition-all shadow-lg ${
                index === currentStep
                  ? 'bg-gradient-to-r from-accent-500 to-blue-500 text-white shadow-xl'
                  : 'bg-white text-gray-700 hover:bg-gray-50 border border-gray-200'
              }`}
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
            >
              {step.charAt(0).toUpperCase() + step.slice(1)}
            </motion.button>
          ))}
        </div>

        <div className="mt-8">
          {renderStepContent()}
        </div>
      </motion.div>
    </div>
  );
};