import React from 'react';
import { SimulationConfig } from '../types';

interface ControlPanelProps {
  config: SimulationConfig;
  setConfig: React.Dispatch<React.SetStateAction<SimulationConfig>>;
}

const ControlPanel: React.FC<ControlPanelProps> = ({ config, setConfig }) => {
  
  const handleChange = (key: keyof SimulationConfig, value: number) => {
    setConfig(prev => ({ ...prev, [key]: value }));
  };

  const togglePause = () => {
    setConfig(prev => ({ ...prev, paused: !prev.paused }));
  };

  const reset = () => {
    setConfig(prev => ({ ...prev, initialAngle: 30, paused: true })); 
    // Small timeout to allow render then unpause could be added, but simple state reset is enough usually
    setTimeout(() => {
        setConfig(prev => ({ ...prev, paused: false }));
    }, 100);
  };

  return (
    <div className="bg-zinc-900/50 backdrop-blur-sm border border-zinc-800 p-6 rounded-xl flex flex-col gap-6 h-full overflow-y-auto">
      <div className="flex items-center justify-between mb-2">
        <h2 className="text-xl font-bold text-cyan-400">Controls</h2>
        <div className="flex gap-2">
             <button 
                onClick={togglePause}
                className={`px-3 py-1 rounded-lg text-sm font-semibold transition-colors ${config.paused ? 'bg-green-600 hover:bg-green-500 text-white' : 'bg-amber-600 hover:bg-amber-500 text-white'}`}
            >
                {config.paused ? '▶ Start' : '❚❚ Pause'}
            </button>
            <button 
                onClick={reset}
                className="px-3 py-1 rounded-lg text-sm font-semibold bg-zinc-700 hover:bg-zinc-600 text-zinc-200 transition-colors"
            >
                ↻ Reset
            </button>
        </div>
      </div>

      {/* Gravity */}
      <div className="space-y-2">
        <div className="flex justify-between text-sm">
          <label className="text-zinc-400">Gravity (g)</label>
          <span className="font-mono text-zinc-200">{config.gravity} m/s²</span>
        </div>
        <input 
          type="range" 
          min="1.6" max="25" step="0.1"
          value={config.gravity}
          onChange={(e) => handleChange('gravity', parseFloat(e.target.value))}
          className="w-full accent-cyan-500 h-2 bg-zinc-700 rounded-lg appearance-none cursor-pointer"
        />
        <div className="flex justify-between text-xs text-zinc-600 px-1">
            <span>Moon (1.6)</span>
            <span>Earth (9.8)</span>
            <span>Jupiter (24.8)</span>
        </div>
      </div>

      {/* Length */}
      <div className="space-y-2">
        <div className="flex justify-between text-sm">
          <label className="text-zinc-400">String Length (L)</label>
          <span className="font-mono text-zinc-200">{config.length} m</span>
        </div>
        <input 
          type="range" 
          min="0.1" max="5.0" step="0.1"
          value={config.length}
          onChange={(e) => handleChange('length', parseFloat(e.target.value))}
          className="w-full accent-cyan-500 h-2 bg-zinc-700 rounded-lg appearance-none cursor-pointer"
        />
      </div>

      {/* Mass */}
      <div className="space-y-2">
        <div className="flex justify-between text-sm">
          <label className="text-zinc-400">Mass (m)</label>
          <span className="font-mono text-zinc-200">{config.mass} kg</span>
        </div>
        <input 
          type="range" 
          min="0.1" max="10.0" step="0.1"
          value={config.mass}
          onChange={(e) => handleChange('mass', parseFloat(e.target.value))}
          className="w-full accent-cyan-500 h-2 bg-zinc-700 rounded-lg appearance-none cursor-pointer"
        />
      </div>

       {/* Angle */}
       <div className="space-y-2">
        <div className="flex justify-between text-sm">
          <label className="text-zinc-400">Initial Angle (θ)</label>
          <span className="font-mono text-zinc-200">{config.initialAngle}°</span>
        </div>
        <input 
          type="range" 
          min="-90" max="90" step="1"
          value={config.initialAngle}
          onChange={(e) => handleChange('initialAngle', parseFloat(e.target.value))}
          className="w-full accent-cyan-500 h-2 bg-zinc-700 rounded-lg appearance-none cursor-pointer"
        />
      </div>

      {/* Damping */}
      <div className="space-y-2">
        <div className="flex justify-between text-sm">
          <label className="text-zinc-400">Air Resistance</label>
          <span className="font-mono text-zinc-200">{config.damping}</span>
        </div>
        <input 
          type="range" 
          min="0" max="1.0" step="0.01"
          value={config.damping}
          onChange={(e) => handleChange('damping', parseFloat(e.target.value))}
          className="w-full accent-cyan-500 h-2 bg-zinc-700 rounded-lg appearance-none cursor-pointer"
        />
      </div>
      
      <div className="mt-auto pt-4 border-t border-zinc-800">
        <p className="text-xs text-zinc-500 italic">
          Tip: Changing parameters mid-swing applies forces instantly. Reset to start from a clean state.
        </p>
      </div>
    </div>
  );
};

export default ControlPanel;