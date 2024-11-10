export interface CoordinationCommand {
  type: 'teamfight' | 'objective' | 'rotation' | 'general';
  message: string;
  priority: 'low' | 'medium' | 'high';
  timestamp?: number;
}