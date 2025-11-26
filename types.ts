export interface SimulationConfig {
  gravity: number; // m/s^2
  length: number; // meters
  mass: number; // kg
  initialAngle: number; // degrees
  damping: number; // air resistance coefficient
  paused: boolean;
}

export interface SimulationStats {
  period: number; // seconds
  maxVelocity: number; // m/s
  kineticEnergy: number; // Joules
  potentialEnergy: number; // Joules
  totalEnergy: number; // Joules
}

export enum ExperimentType {
  PENDULUM = 'PENDULUM',
  // Future expansion: SPRING, FREE_FALL, etc.
}

export interface AIAnalysisResult {
  text: string;
  isAnalyzing: boolean;
}