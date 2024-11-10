export interface DraftState {
  ourPicks: string[];
  enemyPicks: string[];
  ourBans: string[];
  enemyBans: string[];
  pickPhase: number;
  isFirstPick: boolean;
}

export interface CounterSuggestion {
  hero: string;
  role: string;
  confidence: number;
  reasons: string[];
  emblems: {
    name: string;
    reason: string;
  }[];
  spells: {
    name: string;
    reason: string;
  }[];
  builds: {
    name: string;
    items: string[];
    reason: string;
  }[];
}

export interface BanSuggestion {
  hero: string;
  priority: number;
  reason: string;
  winRate: number;
  banRate: number;
}