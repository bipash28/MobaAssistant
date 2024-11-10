export interface ResourceMetrics {
  goldEfficiency: number;
  experienceEfficiency: number;
  itemTimings: Map<string, number>;
  powerSpikes: string[];
}