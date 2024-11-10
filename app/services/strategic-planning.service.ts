import { Observable } from '@nativescript/core';
import { GameState } from '../models/game-state.model';
import { Hero } from '../models/hero.model';
import { StrategicPlan } from '../models/strategy.model';

export class StrategicPlanningService extends Observable {
  private gameState: GameState | null = null;
  private readonly EARLY_GAME_THRESHOLD = 300; // 5 minutes
  private readonly MID_GAME_THRESHOLD = 600; // 10 minutes

  generateStrategicPlan(): StrategicPlan {
    if (!this.gameState) {
      throw new Error('Game state not initialized');
    }

    return {
      laneAssignments: this.optimizeLaneAssignments(),
      splitPushTiming: this.calculateSplitPushOpportunities(),
      objectivePriority: this.determineObjectivePriority(),
      teamCompositionAdvice: this.analyzeTeamComposition()
    };
  }

  private optimizeLaneAssignments(): Map<string, string> {
    const assignments = new Map<string, string>();
    
    if (!this.gameState) return assignments;

    const { allyTeam } = this.gameState;
    
    // Sort players by role priority
    const players = [...allyTeam.players].sort((a, b) => 
      this.getRolePriority(a.role) - this.getRolePriority(b.role)
    );

    // Assign lanes based on role and hero synergy
    players.forEach(player => {
      const optimalLane = this.determineOptimalLane(player, assignments);
      assignments.set(player.heroId, optimalLane);
    });

    return assignments;
  }

  private calculateSplitPushOpportunities(): string[] {
    const opportunities: string[] = [];
    
    if (!this.gameState) return opportunities;

    // Check each lane's state
    ['top', 'mid', 'bottom'].forEach(lane => {
      if (this.isSplitPushFavorable(lane)) {
        opportunities.push(
          `Split push ${lane} - Enemy team occupied with ${this.gameState?.currentObjective}`
        );
      }
    });

    return opportunities;
  }

  private determineObjectivePriority(): string[] {
    const priorities: string[] = [];
    
    if (!this.gameState) return priorities;

    const gameTime = this.gameState.gameTime;
    const { allyTeam, enemyTeam } = this.gameState;

    // Early game priorities
    if (gameTime < this.EARLY_GAME_THRESHOLD) {
      priorities.push('Secure buff and lithowanderer');
      priorities.push('Contest turtle at 2:00');
    }
    // Mid game priorities
    else if (gameTime < this.MID_GAME_THRESHOLD) {
      if (this.hasAdvantage()) {
        priorities.push('Invade enemy jungle');
        priorities.push('Take outer turrets');
      } else {
        priorities.push('Defend towers');
        priorities.push('Farm safely');
      }
    }
    // Late game priorities
    else {
      priorities.push('Secure Lord');
      priorities.push('End game with Lord push');
    }

    return priorities;
  }

  private analyzeTeamComposition(): string[] {
    const analysis: string[] = [];
    
    if (!this.gameState) return analysis;

    const { allyTeam, enemyTeam } = this.gameState;

    // Analyze team fight potential
    const teamfightStrength = this.calculateTeamfightStrength(allyTeam.players);
    analysis.push(`Team fight potential: ${teamfightStrength}`);

    // Analyze damage distribution
    const damageDistribution = this.analyzeDamageDistribution(allyTeam.players);
    analysis.push(`Damage distribution: ${damageDistribution}`);

    // Analyze win conditions
    const winConditions = this.determineWinConditions();
    analysis.push(...winConditions);

    return analysis;
  }

  private getRolePriority(role: string): number {
    const priorities: { [key: string]: number } = {
      'Jungler': 1,
      'Mid': 2,
      'Gold': 3,
      'Roam': 4,
      'Exp': 5
    };
    return priorities[role] || 99;
  }

  private determineOptimalLane(
    player: any,
    existingAssignments: Map<string, string>
  ): string {
    // Complex lane assignment logic based on:
    // - Hero role
    // - Team composition
    // - Enemy lineup
    // - Player performance
    return 'mid'; // Simplified
  }

  private isSplitPushFavorable(lane: string): boolean {
    if (!this.gameState) return false;

    // Check if:
    // 1. Enemy team is occupied
    // 2. Lane is pushed
    // 3. Splitpusher can escape if needed
    return true; // Simplified
  }

  private hasAdvantage(): boolean {
    if (!this.gameState) return false;

    const { allyTeam, enemyTeam } = this.gameState;
    
    // Calculate advantage based on:
    // - Gold difference
    // - Level difference
    // - Objectives taken
    return allyTeam.totalGold > enemyTeam.totalGold;
  }

  private calculateTeamfightStrength(players: any[]): string {
    // Calculate team fight strength based on:
    // - CC abilities
    // - AoE damage
    // - Tank/Support presence
    return 'Strong late game';
  }

  private analyzeDamageDistribution(players: any[]): string {
    // Analyze damage distribution:
    // - Physical/Magical ratio
    // - Burst/Sustained damage
    return 'Balanced physical and magical damage';
  }

  private determineWinConditions(): string[] {
    if (!this.gameState) return [];

    const conditions: string[] = [];
    
    // Analyze win conditions based on:
    // - Team composition
    // - Power spikes
    // - Enemy weaknesses
    conditions.push('Focus on early game dominance');
    conditions.push('Secure objectives after winning team fights');
    
    return conditions;
  }

  updateGameState(newState: GameState): void {
    this.gameState = newState;
    this.notifyPropertyChange('gameState', newState);
  }
}