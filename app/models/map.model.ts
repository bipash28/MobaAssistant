export interface MapPosition {
  x: number;
  y: number;
  timestamp: number;
}

export interface PredictedPosition extends MapPosition {
  heroId: string;
  confidence: number;
}