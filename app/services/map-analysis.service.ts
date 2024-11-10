import { Observable } from '@nativescript/core';
import { GameState } from '../models/game-state.model';
import { MapPosition, PredictedPosition } from '../models/map.model';

export class MapAnalysisService extends Observable {
  private readonly JUNGLE_RESPAWN_TIMES = {
    buff: 120, // 2 minutes
    crab: 120,
    lithowanderer: 180, // 3 minutes
    lord: 180
  };

  private gameState: GameState | null = null;
  private lastKnownPositions: Map<string, MapPosition> = new Map();

  predictEnemyPositions(currentTime: number): PredictedPosition[] {
    if (!this.gameState) return [];

    return this.gameState.enemyTeam.players.map(player => {
      const lastPosition = this.lastKnownPositions.get(player.heroId);
      if (!lastPosition) return null;

      // Use movement patterns and game state to predict position
      return this.calculatePredictedPosition(player.heroId, lastPosition, currentTime);
    }).filter(Boolean) as PredictedPosition[];
  }

  getJungleTimers(): { [key: string]: number } {
    const timers: { [key: string]: number } = {};
    
    // Calculate remaining time for each jungle monster
    Object.entries(this.JUNGLE_RESPAWN_TIMES).forEach(([monster, respawnTime]) => {
      const lastKillTime = this.getLastMonsterKillTime(monster);
      if (lastKillTime) {
        const currentTime = Date.now() / 1000;
        const remainingTime = Math.max(0, respawnTime - (currentTime - lastKillTime));
        timers[monster] = remainingTime;
      }
    });

    return timers;
  }

  getSuggestedRotation(): string[] {
    if (!this.gameState) return [];

    const suggestions: string[] = [];
    const currentTime = this.gameState.gameTime;

    // Early game rotations
    if (currentTime < 120) { // First 2 minutes
      suggestions.push('Secure buff and lithowanderer');
      suggestions.push('Contest river crab at 1:00');
    }
    // Mid game
    else if (currentTime < 480) { // 2-8 minutes
      if (this.shouldInvadeEnemyJungle()) {
        suggestions.push('Invade enemy jungle - weak early game jungler');
      }
      suggestions.push('Rotate to turtle spawn at 5:00');
    }
    // Late game
    else {
      suggestions.push('Group for Lord after winning team fight');
      suggestions.push('Split push when enemy is occupied');
    }

    return suggestions;
  }

  getVisionRecommendations(): string[] {
    const recommendations: string[] = [];
    
    if (!this.gameState) return recommendations;

    // Check dark areas
    const unwardedAreas = this.getUnwardedAreas();
    unwardedAreas.forEach(area => {
      recommendations.push(`Ward ${area} - high traffic area`);
    });

    // Objective control
    if (this.gameState.gameTime >= 300) { // 5 minutes
      recommendations.push('Maintain turtle pit vision');
    }
    if (this.gameState.gameTime >= 480) { // 8 minutes
      recommendations.push('Deep ward enemy jungle entrances');
    }

    return recommendations;
  }

  private calculatePredictedPosition(
    heroId: string,
    lastPosition: MapPosition,
    currentTime: number
  ): PredictedPosition {
    // Complex position prediction algorithm using:
    // - Hero movement speed
    // - Common rotation patterns
    // - Game phase
    // - Objective status
    // This is a simplified version
    return {
      heroId,
      x: lastPosition.x + (currentTime - lastPosition.timestamp) * 0.1,
      y: lastPosition.y + (currentTime - lastPosition.timestamp) * 0.1,
      confidence: 0.8
    };
  }

  private getLastMonsterKillTime(monster: string): number | null {
    // Implementation to track monster kill times
    return null;
  }

  private shouldInvadeEnemyJungle(): boolean {
    if (!this.gameState) return false;
    
    // Check enemy jungler strength
    const enemyJungler = this.gameState.enemyTeam.players.find(p => p.role === 'Jungler');
    if (!enemyJungler) return false;

    // Check team strength and level advantages
    const teamLevelAdvantage = this.calculateTeamLevelAdvantage();
    
    return teamLevelAdvantage > 1;
  }

  private calculateTeamLevelAdvantage(): number {
    if (!this.gameState) return 0;

    const allyAvgLevel = this.gameState.allyTeam.players.reduce(
      (sum, player) => sum + player.level, 0
    ) / this.gameState.allyTeam.players.length;

    const enemyAvgLevel = this.gameState.enemyTeam.players.reduce(
      (sum, player) => sum + player.level, 0
    ) / this.gameState.enemyTeam.players.length;

    return allyAvgLevel - enemyAvgLevel;
  }

  private getUnwardedAreas(): string[] {
    // Implementation to identify areas lacking vision
    return ['river bush', 'enemy red buff', 'lord pit'];
  }

  updateGameState(newState: GameState): void {
    this.gameState = newState;
    this.notifyPropertyChange('gameState', newState);
  }
}