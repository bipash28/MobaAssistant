export interface Hero {
  id: string;
  name: string;
  role: string;
  stats: {
    damage: number;
    durability: number;
    difficulty: number;
  };
  skills: {
    name: string;
    description: string;
    cooldown: number;
  }[];
  counters: string[];
  recommendedBuilds: {
    name: string;
    items: string[];
  }[];
}