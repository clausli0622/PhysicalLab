import React, { useRef, useEffect } from 'react';
import { SimulationConfig, SimulationStats } from '../types';

interface PendulumCanvasProps {
  config: SimulationConfig;
  onStatsUpdate: (stats: SimulationStats) => void;
}

const PendulumCanvas: React.FC<PendulumCanvasProps> = ({ config, onStatsUpdate }) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const requestRef = useRef<number>(0);
  
  // Physics State (kept in refs to avoid re-renders during loop)
  const physicsState = useRef({
    angle: (config.initialAngle * Math.PI) / 180,
    velocity: 0,
    acceleration: 0,
    time: 0,
    lastZeroCrossingTime: 0,
    period: 0,
    maxVel: 0,
    peakDetected: false,
    history: [] as { time: number, angle: number }[] // Buffer for graph data
  });

  // Previous config ref to detect resets
  const prevConfigRef = useRef(config);

  useEffect(() => {
    // Reset simulation if key parameters change significantly (except pause)
    if (
        prevConfigRef.current.length !== config.length ||
        prevConfigRef.current.initialAngle !== config.initialAngle ||
        prevConfigRef.current.gravity !== config.gravity ||
        prevConfigRef.current.mass !== config.mass
    ) {
        physicsState.current = {
            angle: (config.initialAngle * Math.PI) / 180,
            velocity: 0,
            acceleration: 0,
            time: 0,
            lastZeroCrossingTime: 0,
            period: 0,
            maxVel: 0,
            peakDetected: false,
            history: []
        };
    }
    prevConfigRef.current = config;
  }, [config]);

  const animate = () => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const width = canvas.width;
    const height = canvas.height;
    
    // --- LAYOUT ---
    const graphHeight = height * 0.30; // Bottom 30% for graph
    const simHeight = height - graphHeight;

    // Config aliases
    const { length, gravity, mass, damping, paused } = config;
    // Scale: 1 meter = X pixels, constrained by simulation height
    const scale = Math.min(width, simHeight) / 2.5; 
    const originX = width / 2;
    const originY = simHeight / 3; // Pivot in upper third of sim area

    // --- PHYSICS UPDATE ---
    if (!paused) {
      // Time step
      const dt = 1 / 60; // Assume 60fps for stability
      
      const numLength = Math.max(0.1, length); // prevent divide by zero
      const forceGravity = -(gravity / numLength) * Math.sin(physicsState.current.angle);
      const forceDamping = -damping * physicsState.current.velocity;
      
      physicsState.current.acceleration = forceGravity + forceDamping;
      physicsState.current.velocity += physicsState.current.acceleration * dt;
      physicsState.current.angle += physicsState.current.velocity * dt;
      physicsState.current.time += dt;

      // Stats Calculation
      const currentSpeed = Math.abs(physicsState.current.velocity * length); 
      if (currentSpeed > physicsState.current.maxVel) {
          physicsState.current.maxVel = currentSpeed;
      }

      // Graph Data Recording
      physicsState.current.history.push({
          time: physicsState.current.time,
          angle: physicsState.current.angle
      });

      // Prune history (Keep last 5 seconds)
      const timeWindow = 5.0;
      while (physicsState.current.history.length > 0 && 
             physicsState.current.history[0].time < physicsState.current.time - timeWindow) {
          physicsState.current.history.shift();
      }
    }

    // --- RENDER ---
    ctx.clearRect(0, 0, width, height);

    // 1. PENDULUM RENDERING
    // Draw Pivot
    ctx.fillStyle = '#94a3b8'; // slate-400
    ctx.beginPath();
    ctx.arc(originX, originY, 5, 0, Math.PI * 2);
    ctx.fill();
    
    // Draw Ceiling/Support
    ctx.strokeStyle = '#52525b'; // zinc-600
    ctx.lineWidth = 4;
    ctx.beginPath();
    ctx.moveTo(originX - 50, originY);
    ctx.lineTo(originX + 50, originY);
    ctx.stroke();

    // Calculate Bob Position
    const bobX = originX + length * scale * Math.sin(physicsState.current.angle);
    const bobY = originY + length * scale * Math.cos(physicsState.current.angle);

    // Draw String
    ctx.strokeStyle = '#e4e4e7'; // zinc-200
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.moveTo(originX, originY);
    ctx.lineTo(bobX, bobY);
    ctx.stroke();

    // Draw Bob
    ctx.fillStyle = '#06b6d4'; // cyan-500
    const bobRadius = 15 + Math.cbrt(mass) * 5; 
    ctx.beginPath();
    ctx.arc(bobX, bobY, bobRadius, 0, Math.PI * 2);
    ctx.fill();
    ctx.strokeStyle = '#0891b2';
    ctx.lineWidth = 2;
    ctx.stroke();


    // 2. WAVEFORM GRAPH RENDERING
    const gTop = height - graphHeight + 10;
    const gBottom = height - 10;
    const gLeft = 50;
    const gRight = width - 20;
    const gCenterY = (gTop + gBottom) / 2;
    const gHeight = gBottom - gTop;

    // Background
    ctx.fillStyle = 'rgba(0, 0, 0, 0.2)';
    ctx.fillRect(gLeft, gTop, gRight - gLeft, gHeight);
    ctx.strokeStyle = '#3f3f46'; // zinc-700
    ctx.lineWidth = 1;
    ctx.strokeRect(gLeft, gTop, gRight - gLeft, gHeight);

    // Zero Line
    ctx.beginPath();
    ctx.strokeStyle = '#52525b'; // zinc-600
    ctx.setLineDash([4, 4]);
    ctx.moveTo(gLeft, gCenterY);
    ctx.lineTo(gRight, gCenterY);
    ctx.stroke();
    ctx.setLineDash([]);

    // Labels
    ctx.fillStyle = '#94a3b8'; // slate-400
    ctx.font = '10px monospace';
    ctx.textAlign = 'right';
    ctx.fillText('Angle', gLeft - 8, gTop + 10);
    ctx.fillText('0', gLeft - 8, gCenterY + 3);
    ctx.fillText('Time', gRight, gBottom + 10);

    // Plot Line
    if (physicsState.current.history.length > 1) {
        ctx.beginPath();
        ctx.strokeStyle = '#22d3ee'; // cyan-400
        ctx.lineWidth = 2;

        const timeWindow = 5.0;
        const now = physicsState.current.time;
        // Scale Y: Max amplitude roughly PI/2 (90 deg) fits 90% of half-height
        const maxAmp = Math.PI / 2; 

        for (let i = 0; i < physicsState.current.history.length; i++) {
            const pt = physicsState.current.history[i];
            
            // X mapping: Right edge is 'now', Left edge is 'now - 5s'
            const dt = now - pt.time; // 0 to 5
            const x = gRight - (dt / timeWindow) * (gRight - gLeft);
            
            // Y mapping: Center is 0
            const y = gCenterY - (pt.angle / maxAmp) * (gHeight * 0.45);

            if (i === 0) ctx.moveTo(x, y);
            else ctx.lineTo(x, y);
        }
        ctx.stroke();

        // Leading Dot
        if (physicsState.current.history.length > 0) {
            const pt = physicsState.current.history[physicsState.current.history.length - 1];
            const y = gCenterY - (pt.angle / maxAmp) * (gHeight * 0.45);
            ctx.fillStyle = '#fff';
            ctx.beginPath();
            ctx.arc(gRight, y, 3, 0, Math.PI * 2);
            ctx.fill();
        }
    }

    // --- STATS UPDATE ---
    const h = length * (1 - Math.cos(physicsState.current.angle)); // Height above lowest point
    const pe = mass * gravity * h;
    const linearVelocity = physicsState.current.velocity * length;
    const ke = 0.5 * mass * linearVelocity * linearVelocity;
    const theoreticalPeriod = 2 * Math.PI * Math.sqrt(length / gravity);

    if (!paused && requestRef.current && physicsState.current.time % 0.1 < 0.02) {
       onStatsUpdate({
         period: theoreticalPeriod, 
         maxVelocity: physicsState.current.maxVel,
         kineticEnergy: ke,
         potentialEnergy: pe,
         totalEnergy: ke + pe
       });
    }

    requestRef.current = requestAnimationFrame(animate);
  };

  useEffect(() => {
    // Handle resize
    const handleResize = () => {
        if (canvasRef.current) {
            canvasRef.current.width = canvasRef.current.parentElement?.clientWidth || 800;
            canvasRef.current.height = canvasRef.current.parentElement?.clientHeight || 600;
        }
    };
    window.addEventListener('resize', handleResize);
    handleResize();

    requestRef.current = requestAnimationFrame(animate);
    return () => {
      window.removeEventListener('resize', handleResize);
      if (requestRef.current) cancelAnimationFrame(requestRef.current);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [config]);

  return (
    <div className="w-full h-full bg-zinc-900 rounded-xl shadow-inner overflow-hidden relative">
      <canvas 
        ref={canvasRef} 
        className="block w-full h-full"
      />
      <div className="absolute top-4 left-4 text-xs text-zinc-500 pointer-events-none">
        Simulation + Waveform Analysis
      </div>
    </div>
  );
};

export default PendulumCanvas;