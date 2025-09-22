import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { Navigation } from './components/Navigation';
import { Home } from './pages/Home';
import { PlatformHome } from './pages/PlatformHome';

// Module 1 pages
import { Learn11 } from './pages/experiments/experiment-1-1/Learn';
import { Setup11 } from './pages/experiments/experiment-1-1/Setup';
import { Simulate11 } from './pages/experiments/experiment-1-1/Simulate';
import { Experiment11 } from './pages/experiments/experiment-1-1/Experiment';
import { Analyze11 } from './pages/experiments/experiment-1-1/Analyze';

import { Learn12 } from './pages/experiments/experiment-1-2/Learn';
import { Setup12 } from './pages/experiments/experiment-1-2/Setup';
import { Simulate12 } from './pages/experiments/experiment-1-2/Simulate';
import { Experiment12 } from './pages/experiments/experiment-1-2/Experiment';
import { Analyze12 } from './pages/experiments/experiment-1-2/Analyze';

import { Learn13 } from './pages/experiments/experiment-1-3/Learn';
import { Setup13 } from './pages/experiments/experiment-1-3/Setup';
import { Simulate13 } from './pages/experiments/experiment-1-3/Simulate';
import { Experiment13 } from './pages/experiments/experiment-1-3/Experiment';
import { Analyze13 } from './pages/experiments/experiment-1-3/Analyze';

// Module 2 pages
import { Module2Home } from './pages/modules/module-2/Module2Home';
import { Module2Expression } from './pages/modules/module-2/Module2Expression';
import { Module2Purification } from './pages/modules/module-2/Module2Purification';

// Module 3 pages
import { Module3Home } from './pages/modules/module-3/Module3Home';

function App() {
  return (
    <Router>
      <div className="min-h-screen bg-gradient-to-br from-primary-50 via-white to-secondary-50">
        <Navigation />
        <main className="container mx-auto px-4 py-8">
          <Routes>
            {/* Platform Homepage */}
            <Route path="/" element={<PlatformHome />} />
            
            {/* Module 1 (Legacy route for compatibility) */}
            <Route path="/module/1" element={<Home />} />
            
            {/* Module 1 Experiment routes */}
            <Route path="/experiment-1-1/learn" element={<Learn11 />} />
            <Route path="/experiment-1-1/setup" element={<Setup11 />} />
            <Route path="/experiment-1-1/simulate" element={<Simulate11 />} />
            <Route path="/experiment-1-1/experiment" element={<Experiment11 />} />
            <Route path="/experiment-1-1/analyze" element={<Analyze11 />} />
            
            <Route path="/experiment-1-2/learn" element={<Learn12 />} />
            <Route path="/experiment-1-2/setup" element={<Setup12 />} />
            <Route path="/experiment-1-2/simulate" element={<Simulate12 />} />
            <Route path="/experiment-1-2/experiment" element={<Experiment12 />} />
            <Route path="/experiment-1-2/analyze" element={<Analyze12 />} />
            
            <Route path="/experiment-1-3/learn" element={<Learn13 />} />
            <Route path="/experiment-1-3/setup" element={<Setup13 />} />
            <Route path="/experiment-1-3/simulate" element={<Simulate13 />} />
            <Route path="/experiment-1-3/experiment" element={<Experiment13 />} />
            <Route path="/experiment-1-3/analyze" element={<Analyze13 />} />
            
            {/* Module 2 routes */}
            <Route path="/module/2" element={<Module2Home />} />
            <Route path="/module/2/expression" element={<Module2Expression />} />
            <Route path="/module/2/purification" element={<Module2Purification />} />
            
            {/* Module 3 routes */}
            <Route path="/module/3" element={<Module3Home />} />
          </Routes>
        </main>
      </div>
    </Router>
  );
}

export default App;