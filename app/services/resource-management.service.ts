import { Observable } from '@nativescript/core';
import { GameState } from '../models/game-state.model';
import { ResourceMetrics } from '../models/resource.model';

export class ResourceManagementService extends Observable {
  private gameState: GameState | null = null;
  private readonly GOLD_EFFICIENCY_THRESHOLD = 600; // gold per minute
  private readonly XP_EFFICIENCY_THRESHOLD = 800; // xp per minute

  calculateResourceEfficiency(): ResourceMetrics {
    if (!this.gameState) throw new Error('Game state not initialized');

    return {
      goldEfficiency: this.calculateGoldEfficiency(),
      experienceEfficiency: this.calculateXPEfficiency(),
      itemTimings: this.getOptimalItemTimings(),
      powerSpikes: this.identifyPowerSpikes()
    };
  }

  private calculateGoldEfficiency(): number {
    if (!this.gameState) return 0;
    const { gameTime, allyTeam } = this.gameState;
    const totalGold = allyTeam.totalGold;
    return (totalGold / gameTime) * 60; // Gold per minute
  }

  private calculateXPEfficiency(): number {
    if (!this.gameState) return 0;
    const { allyTeam } = this.gameState;
    const avgLevel = allyTeam.players.reduce((sum, p) => sum + p.level, 0) / allyTeam.players.length;
    return avgLevel * 100; // Simplified XP calculation
  }

  private getOptimalItemTimings(): Map<string, number> {
    const timings = new Map<string, number>();
    
    // Core items timing goals
    timings.set('Boots', 120); // 2 minutes
    timings.set('First Core Item', 240); // 4 minutes
    timings.set('Second Core Item', 480); // 8 minutes
    
    return timings;
  }

  private identifyPowerSpikes(): string[] {
    const spikes: string[] = [];
    if (!this.gameState) return spikes;

    const { allyTeam } = this.gameState;
    allyTeam.players.forEach(player => {
      if (this.isApproachingPowerSpike(player)) {
        spikes.push(`${player.heroId} approaching level ${player.level + 1} power spike`);
      }
    });

    return spikes;
  }

  private isApproachingPowerSpike(player: any): boolean {
    const powerSpikeLevels = [4, 6, 8, 12]; // Common power spike levels
    return powerSpikeLevels.includes(player.level + 1);
  }

  updateGameState(newState: GameState): void {
    this.gameState = newState;
    this.notifyPropertyChange('gameState', newState);
  }
}