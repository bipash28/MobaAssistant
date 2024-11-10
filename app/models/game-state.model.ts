export interface PlayerState {
  heroId: string;
  level: number;
  gold: number;
  items: string[];
  killCount: number;
  deathCount: number;
  assistCount: number;
}

export interface TeamState {
  players: PlayerState[];
  totalGold: number;
  towers: number;
  objectives: string[];
}

export interface GameState {
  allyTeam: TeamState;
  enemyTeam: TeamState;
  gameTime: number;
  currentObjective: string;
}