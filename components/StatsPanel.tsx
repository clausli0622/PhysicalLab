import React from 'react';
import { SimulationStats, SimulationConfig } from '../types';
import { AreaChart, Area, XAxis, YAxis, Tooltip, ResponsiveContainer } from 'recharts';

interface StatsPanelProps {
  stats: SimulationStats;
  config: SimulationConfig;
}

// Helper for energy bar
const EnergyBar = ({ label, value, max, color }: { label: string, value: number, max: number, color: string }) => {
    const width = Math.min(100, Math.max(0, (value / max) * 100));
    return (
        <div className="mb-2">
            <div className="flex justify-between text-xs mb-1">
                <span className="text-zinc-400">{label}</span>
                <span className="font-mono text-zinc-200">{value.toFixed(2)} J</span>
            </div>
            <div className="h-1.5 w-full bg-zinc-800 rounded-full overflow-hidden">
                <div 
                    className={`h-full ${color} transition-all duration-75 ease-out`} 
                    style={{ width: `${width}%` }} 
                />
            </div>
        </div>
    );
};

const StatsPanel: React.FC<StatsPanelProps> = ({ stats, config }) => {
  // Approximate max energy for bar scaling based on initial potential energy at 90 degrees max
  const maxPossibleEnergy = config.mass * config.gravity * config.length + 1; 

  return (
    <div className="bg-zinc-900/50 backdrop-blur-sm border border-zinc-800 p-6 rounded-xl h-full flex flex-col">
      <h2 className="text-xl font-bold text-cyan-400 mb-4">Real-time Data</h2>
      
      <div className="grid grid-cols-2 gap-4 mb-6">
        <div className="bg-zinc-800/50 p-3 rounded-lg">
            <div className="text-xs text-zinc-500 uppercase tracking-wider">Period (T)</div>
            <div className="text-2xl font-mono text-white">
                {stats.period.toFixed(2)} <span className="text-sm text-zinc-500">s</span>
            </div>
        </div>
        <div className="bg-zinc-800/50 p-3 rounded-lg">
            <div className="text-xs text-zinc-500 uppercase tracking-wider">Max Velocity</div>
            <div className="text-2xl font-mono text-white">
                {stats.maxVelocity.toFixed(2)} <span className="text-sm text-zinc-500">m/s</span>
            </div>
        </div>
      </div>

      <div className="space-y-4 mb-6">
        <h3 className="text-sm font-semibold text-zinc-300">Energy Conservation</h3>
        <EnergyBar 
            label="Kinetic (KE)" 
            value={stats.kineticEnergy} 
            max={maxPossibleEnergy} 
            color="bg-amber-500" 
        />
        <EnergyBar 
            label="Potential (PE)" 
            value={stats.potentialEnergy} 
            max={maxPossibleEnergy} 
            color="bg-blue-500" 
        />
        <EnergyBar 
            label="Total (ME)" 
            value={stats.totalEnergy} 
            max={maxPossibleEnergy} 
            color="bg-green-500" 
        />
      </div>

      <div className="bg-blue-900/20 border border-blue-800/50 p-4 rounded-lg mt-auto">
        <h3 className="text-sm font-bold text-blue-300 mb-1">Experiment Task</h3>
        <p className="text-xs text-blue-200">
          Adjust the String Length (L) and observe the change in Period (T). 
          Does mass affect the period? Use the AI Assistant to verify your findings.
        </p>
      </div>
    </div>
  );
};

export default StatsPanel;