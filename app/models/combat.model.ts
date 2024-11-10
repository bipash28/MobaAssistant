export interface CombatPrediction {
  damagePerSecond: number;
  timeToKill: number;
  winProbability: number;
  tradingAdvice: string;
}

export interface SkillCombo {
  sequence: string[];
  damage: number;
  difficulty: string;
  timing: string;
}