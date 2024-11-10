import { Observable } from '@nativescript/core';
import { Hero } from '../models/hero.model';
import { DraftState, CounterSuggestion, BanSuggestion } from '../models/draft.model';
import { MetaAnalysisService } from './meta-analysis.service';

export class DraftAnalysisService extends Observable {
  private metaAnalysisService: MetaAnalysisService;
  private readonly RANK_WEIGHTS = {
    'Epic': { meta: 0.6, counter: 0.4 },
    'Legend': { meta: 0.5, counter: 0.5 },
    'Mythic': { meta: 0.4, counter: 0.6 }
  };

  constructor() {
    super();
    this.metaAnalysisService = new MetaAnalysisService();
  }

  async getCounterSuggestions(
    draftState: DraftState,
    rank: string
  ): Promise<CounterSuggestion[]> {
    const suggestions: CounterSuggestion[] = [];
    const meta = await this.metaAnalysisService.analyzeCurrentMeta();
    const weights = this.RANK_WEIGHTS[rank] || this.RANK_WEIGHTS['Epic'];

    // Analyze enemy composition
    const enemyComp = this.analyzeTeamComposition(draftState.enemyPicks);
    const ourComp = this.analyzeTeamComposition(draftState.ourPicks);

    // Get role needs
    const neededRoles = this.getNeededRoles(draftState.ourPicks);

    // Generate suggestions for each needed role
    for (const role of neededRoles) {
      const counters = this.findCounterPicks(
        draftState.enemyPicks,
        role,
        rank,
        meta.topPicks
      );

      for (const counter of counters) {
        suggestions.push({
          hero: counter.hero,
          role: role,
          confidence: counter.confidence,
          reasons: counter.reasons,
          emblems: this.suggestEmblems(counter.hero, draftState.enemyPicks),
          spells: this.suggestSpells(counter.hero, draftState.enemyPicks),
          builds: this.suggestBuilds(counter.hero, draftState.enemyPicks)
        });
      }
    }

    return this.prioritizeSuggestions(suggestions, rank);
  }

  async getBanSuggestions(
    rank: string,
    firstPick: boolean
  ): Promise<BanSuggestion[]> {
    const meta = await this.metaAnalysisService.analyzeCurrentMeta();
    const suggestions: BanSuggestion[] = [];

    // Get win rates and ban rates for current rank
    const rankStats = await this.getRankSpecificStats(rank);

    // Analyze must-ban heroes
    for (const hero of meta.topPicks) {
      const stats = rankStats.get(hero) || { winRate: 0, banRate: 0 };
      const isMustBan = this.isMustBanHero(hero, stats, rank);

      if (isMustBan) {
        suggestions.push({
          hero,
          priority: this.calculateBanPriority(stats, firstPick),
          reason: this.getBanReason(hero, stats, rank),
          winRate: stats.winRate,
          banRate: stats.banRate
        });
      }
    }

    return suggestions.sort((a, b) => b.priority - a.priority);
  }

  private analyzeTeamComposition(picks: Hero[]): any {
    const composition = {
      physical: 0,
      magical: 0,
      cc: 0,
      mobility: 0,
      roles: new Set<string>()
    };

    picks.forEach(hero => {
      composition.physical += hero.stats.physicalDamage || 0;
      composition.magical += hero.stats.magicalDamage || 0;
      composition.cc += hero.stats.crowdControl || 0;
      composition.mobility += hero.stats.mobility || 0;
      composition.roles.add(hero.role);
    });

    return composition;
  }

  private getNeededRoles(currentPicks: Hero[]): string[] {
    const essentialRoles = ['Tank', 'Jungler', 'Mid', 'Gold', 'Exp'];
    const takenRoles = new Set(currentPicks.map(hero => hero.role));
    return essentialRoles.filter(role => !takenRoles.has(role));
  }

  private findCounterPicks(
    enemyPicks: Hero[],
    neededRole: string,
    rank: string,
    metaPicks: string[]
  ): any[] {
    const counters = [];
    const weights = this.RANK_WEIGHTS[rank];

    // Get all heroes for the needed role
    const roleHeroes = this.getRoleHeroes(neededRole);

    for (const hero of roleHeroes) {
      const counterScore = this.calculateCounterScore(hero, enemyPicks);
      const metaScore = this.calculateMetaScore(hero, metaPicks);
      
      const totalScore = (
        counterScore * weights.counter +
        metaScore * weights.meta
      );

      if (totalScore > 0.7) { // Threshold for suggestion
        counters.push({
          hero: hero,
          confidence: totalScore,
          reasons: this.getCounterReasons(hero, enemyPicks)
        });
      }
    }

    return counters;
  }

  private suggestEmblems(hero: Hero, enemies: Hero[]): any[] {
    const suggestions = [];
    const role = hero.role.toLowerCase();

    switch (role) {
      case 'marksman':
        suggestions.push({
          name: 'Weakness Finder',
          reason: 'Increases critical chance and movement speed'
        });
        break;
      case 'assassin':
        suggestions.push({
          name: 'Killing Spree',
          reason: 'Sustain in teamfights after kills'
        });
        break;
      // Add more role-specific emblem suggestions
    }

    return suggestions;
  }

  private suggestSpells(hero: Hero, enemies: Hero[]): any[] {
    const suggestions = [];
    const hasHighCC = enemies.some(e => e.stats.crowdControl > 7);
    const hasHighMobility = enemies.some(e => e.stats.mobility > 7);

    if (hasHighCC) {
      suggestions.push({
        name: 'Purify',
        reason: 'Counter enemy CC abilities'
      });
    }

    if (hasHighMobility) {
      suggestions.push({
        name: 'Flicker',
        reason: 'Escape or chase mobile enemies'
      });
    }

    return suggestions;
  }

  private suggestBuilds(hero: Hero, enemies: Hero[]): any[] {
    const suggestions = [];
    const enemyDamageType = this.analyzeEnemyDamageType(enemies);

    // Core items based on role
    const coreItems = this.getHeroCoreItems(hero);

    // Situational items based on enemy composition
    const situationalItems = this.getSituationalItems(enemyDamageType);

    suggestions.push({
      name: 'Standard Counter Build',
      items: [...coreItems, ...situationalItems],
      reason: `Optimized against ${enemyDamageType} damage composition`
    });

    return suggestions;
  }

  private calculateCounterScore(hero: Hero, enemies: Hero[]): number {
    let score = 0;
    
    enemies.forEach(enemy => {
      // Check hero's advantages against enemy
      if (hero.counters.includes(enemy.id)) {
        score += 0.2;
      }
      
      // Check damage type advantage
      if (this.hasDamageAdvantage(hero, enemy)) {
        score += 0.15;
      }
      
      // Check range advantage
      if (this.hasRangeAdvantage(hero, enemy)) {
        score += 0.15;
      }
    });

    return Math.min(score, 1);
  }

  private calculateMetaScore(hero: Hero, metaPicks: string[]): number {
    return metaPicks.includes(hero.id) ? 1 : 0.5;
  }

  private getCounterReasons(hero: Hero, enemies: Hero[]): string[] {
    const reasons: string[] = [];

    enemies.forEach(enemy => {
      if (hero.counters.includes(enemy.id)) {
        reasons.push(`Strong against ${enemy.name}'s kit`);
      }
    });

    return reasons;
  }

  private async getRankSpecificStats(rank: string): Promise<Map<string, any>> {
    // In production, fetch from API
    // For now, using static data
    return new Map([
      ['Ling', { winRate: 0.54, banRate: 0.8 }],
      ['Mathilda', { winRate: 0.52, banRate: 0.6 }]
    ]);
  }

  private isMustBanHero(hero: string, stats: any, rank: string): boolean {
    const thresholds = {
      'Mythic': { winRate: 0.52, banRate: 0.4 },
      'Legend': { winRate: 0.51, banRate: 0.3 },
      'Epic': { winRate: 0.50, banRate: 0.2 }
    };

    const threshold = thresholds[rank] || thresholds['Epic'];
    return stats.winRate > threshold.winRate || stats.banRate > threshold.banRate;
  }

  private calculateBanPriority(stats: any, firstPick: boolean): number {
    let priority = stats.winRate * 0.6 + stats.banRate * 0.4;
    if (!firstPick) {
      priority *= 1.2; // Higher priority when not first pick
    }
    return priority;
  }

  private getBanReason(hero: string, stats: any, rank: string): string {
    const reasons = [];
    
    if (stats.winRate > 0.53) {
      reasons.push(`High win rate (${(stats.winRate * 100).toFixed(1)}%)`);
    }
    if (stats.banRate > 0.4) {
      reasons.push(`Frequently banned in ${rank}`);
    }

    return reasons.join(', ');
  }

  private hasDamageAdvantage(hero: Hero, enemy: Hero): boolean {
    // Implementation of damage type advantage check
    return true; // Simplified
  }

  private hasRangeAdvantage(hero: Hero, enemy: Hero): boolean {
    // Implementation of range advantage check
    return true; // Simplified
  }

  private analyzeEnemyDamageType(enemies: Hero[]): string {
    let physicalDamage = 0;
    let magicalDamage = 0;

    enemies.forEach(enemy => {
      physicalDamage += enemy.stats.physicalDamage || 0;
      magicalDamage += enemy.stats.magicalDamage || 0;
    });

    return physicalDamage > magicalDamage ? 'physical' : 'magical';
  }

  private getHeroCoreItems(hero: Hero): string[] {
    // Implementation to get core items based on hero role
    return ['Boots', 'Core Item 1', 'Core Item 2'];
  }

  private getSituationalItems(enemyDamageType: string): string[] {
    return enemyDamageType === 'physical'
      ? ['Antique Cuirass', 'Dominance Ice']
      : ['Athena\'s Shield', 'Radiant Armor'];
  }

  private prioritizeSuggestions(
    suggestions: CounterSuggestion[],
    rank: string
  ): CounterSuggestion[] {
    return suggestions.sort((a, b) => {
      // Prioritize based on rank-specific weights
      const rankWeight = this.RANK_WEIGHTS[rank] || this.RANK_WEIGHTS['Epic'];
      const aScore = a.confidence * rankWeight.counter;
      const bScore = b.confidence * rankWeight.counter;
      return bScore - aScore;
    });
  }
}