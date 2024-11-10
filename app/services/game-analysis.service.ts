import { Observable } from '@nativescript/core';
import { GameState } from '../models/game-state.model';
import { HeroService } from './hero.service';
import { BuildService } from './build.service';

export class GameAnalysisService extends Observable {
  private heroService: HeroService;
  private buildService: BuildService;
  private currentGameState: GameState | null = null;

  constructor() {
    super();
    this.heroService = new HeroService();
    this.buildService = new BuildService();
  }

  analyzeGameState(gameState: GameState): {
    recommendations: string[];
    threats: string[];
    objectives: string[];
  } {
    const recommendations: string[] = [];
    const threats: string[] = [];
    const objectives: string[] = [];

    // Analyze gold difference
    const goldDiff = gameState.allyTeam.totalGold - gameState.enemyTeam.totalGold;
    if (goldDiff < -2000) {
      recommendations.push('Farm more and avoid unnecessary fights');
    } else if (goldDiff > 2000) {
      recommendations.push('Press your advantage and secure objectives');
    }

    // Analyze enemy threats
    gameState.enemyTeam.players.forEach(player => {
      const hero = this.heroService.getHeroById(player.heroId);
      if (hero) {
        if (player.killCount > 3) {
          threats.push(`${hero.name} is fed (${player.killCount} kills)`);
        }
      }
    });

    // Analyze objectives
    if (gameState.gameTime > 420 && gameState.currentObjective === 'lord') {
      objectives.push('Lord is spawning soon, prepare vision');
    }

    return { recommendations, threats, objectives };
  }

  getCounterBuildSuggestions(
    heroId: string,
    enemyTeam: string[]
  ): { itemSuggestions: string[]; reasoning: string[] } {
    const itemSuggestions: string[] = [];
    const reasoning: string[] = [];

    // Analyze enemy team composition
    const hasPhysicalDamage = enemyTeam.some(id => {
      const hero = this.heroService.getHeroById(id);
      return hero?.role === 'Marksman' || hero?.role === 'Fighter';
    });

    const hasMagicDamage = enemyTeam.some(id => {
      const hero = this.heroService.getHeroById(id);
      return hero?.role === 'Mage';
    });

    if (hasPhysicalDamage) {
      itemSuggestions.push('Antique Cuirass');
      reasoning.push('Enemy has physical damage dealers');
    }

    if (hasMagicDamage) {
      itemSuggestions.push('Athena\'s Shield');
      reasoning.push('Enemy has magic damage dealers');
    }

    return { itemSuggestions, reasoning };
  }

  updateGameState(newState: GameState): void {
    this.currentGameState = newState;
    this.notifyPropertyChange('gameState', newState);
  }

  getCurrentGameState(): GameState | null {
    return this.currentGameState;
  }
}