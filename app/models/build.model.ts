export interface BuildItem {
  id: string;
  name: string;
  type: 'Attack' | 'Defense' | 'Magic' | 'Movement' | 'Jungle' | 'Roaming';
  stats: {
    [key: string]: number;
  };
  passive?: string;
  price: number;
}

export interface Build {
  id: string;
  name: string;
  heroId: string;
  items: BuildItem[];
  description: string;
  matchups: {
    goodAgainst: string[];
    badAgainst: string[];
  };
  playstyle: string;
}