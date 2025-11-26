import React, { useState } from 'react';
import PendulumCanvas from './components/PendulumCanvas';
import ControlPanel from './components/ControlPanel';
import StatsPanel from './components/StatsPanel';
import AIInstructor from './components/AIInstructor';
import { SimulationConfig, SimulationStats } from './types';

const App: React.FC = () => {
  // Initial Simulation State
  const [config, setConfig] = useState<SimulationConfig>({
    gravity: 9.8,
    length: 2.0,
    mass: 1.0,
    initialAngle: 30,
    damping: 0.05,
    paused: false,
  });

  const [stats, setStats] = useState<SimulationStats>({
    period: 0,
    maxVelocity: 0,
    kineticEnergy: 0,
    potentialEnergy: 0,
    totalEnergy: 0,
  });

  return (
    <div className="flex flex-col h-screen bg-zinc-950 text-white font-sans selection:bg-cyan-500/30">
      {/* Navbar */}
      <header className="flex-none h-16 border-b border-zinc-800 flex items-center px-6 bg-zinc-950/80 backdrop-blur z-10">
        <div className="flex items-center gap-3">
            <div className="w-8 h-8 bg-gradient-to-br from-cyan-500 to-blue-600 rounded-lg flex items-center justify-center shadow-lg shadow-cyan-500/20">
                <span className="text-lg font-bold">P</span>
            </div>
            <h1 className="text-xl font-bold tracking-tight text-zinc-100">
                PhysicsLab<span className="text-cyan-500">.ai</span>
            </h1>
        </div>
        <div className="ml-auto text-sm text-zinc-500 flex gap-4">
            <span>Experiment: <span className="text-zinc-300 font-medium">Simple Pendulum</span></span>
        </div>
      </header>

      {/* Main Layout */}
      <main className="flex-1 overflow-hidden p-4 grid grid-cols-1 lg:grid-cols-12 gap-4">
        
        {/* Left Sidebar: Controls & Stats */}
        <div className="lg:col-span-3 flex flex-col gap-4 overflow-hidden h-full">
            <div className="flex-none max-h-[60%] overflow-hidden">
                <ControlPanel config={config} setConfig={setConfig} />
            </div>
            <div className="flex-1 overflow-hidden">
                <StatsPanel stats={stats} config={config} />
            </div>
        </div>

        {/* Center: Canvas */}
        <div className="lg:col-span-6 h-full flex flex-col">
            <PendulumCanvas config={config} onStatsUpdate={setStats} />
        </div>

        {/* Right Sidebar: AI Assistant */}
        <div className="lg:col-span-3 h-full overflow-hidden">
            <AIInstructor config={config} stats={stats} />
        </div>

      </main>
    </div>
  );
};

export default App;