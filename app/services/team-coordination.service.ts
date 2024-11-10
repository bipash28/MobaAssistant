import { Observable } from '@nativescript/core';
import { GameState } from '../models/game-state.model';
import { CoordinationCommand } from '../models/coordination.model';

export class TeamCoordinationService extends Observable {
  private gameState: GameState | null = null;
  private readonly QUICK_COMMANDS = new Map<string, string>([
    ['gather', 'Group up for objective'],
    ['retreat', 'Fall back - enemy missing'],
    ['push', 'Push towers while ahead'],
    ['defend', 'Defend base - enemy pushing']
  ]);

  generateCallouts(): CoordinationCommand[] {
    if (!this.gameState) return [];

    const commands: CoordinationCommand[] = [];
    const { allyTeam, currentObjective } = this.gameState;

    // Generate situation-specific callouts
    if (this.isTeamfightImminent()) {
      commands.push({
        type: 'teamfight',
        message: 'Prepare for team fight',
        priority: 'high'
      });
    }

    if (currentObjective) {
      commands.push({
        type: 'objective',
        message: `Setup for ${currentObjective}`,
        priority: 'medium'
      });
    }

    return commands;
  }

  getQuickCommand(situation: string): string {
    return this.QUICK_COMMANDS.get(situation) || 'Invalid command';
  }

  getRoleSpecificCallouts(role: string): string[] {
    const callouts: string[] = [];

    switch (role.toLowerCase()) {
      case 'tank':
        callouts.push('Initiate when team is ready');
        callouts.push('Protect carries in teamfight');
        break;
      case 'marksman':
        callouts.push('Focus highest priority target');
        callouts.push('Stay behind frontline');
        break;
      case 'assassin':
        callouts.push('Look for pick-off opportunities');
        callouts.push('Split push side lanes');
        break;
    }

    return callouts;
  }

  private isTeamfightImminent(): boolean {
    if (!this.gameState) return false;
    
    // Check for teamfight indicators:
    // - Multiple enemies grouped
    // - Objective spawning
    // - Key abilities available
    return true; // Simplified
  }

  updateGameState(newState: GameState): void {
    this.gameState = newState;
    this.notifyPropertyChange('gameState', newState);
  }
}