export interface MetaAnalysis {
  topPicks: string[];
  banPriorities: string[];
  counterPicks: Map<string, string[]>;
  metaStrategies: string[];
}