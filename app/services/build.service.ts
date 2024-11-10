import { Observable } from '@nativescript/core';
import { Build, BuildItem } from '../models/build.model';
import { StorageService } from './storage.service';

export class BuildService extends Observable {
  private builds: Build[] = [];
  private items: BuildItem[] = [];
  private storageService: StorageService;

  constructor() {
    super();
    this.storageService = new StorageService();
    this.initializeData();
  }

  private async initializeData() {
    await this.loadItems();
    await this.loadBuilds();
  }

  private async loadItems() {
    // In production, this would load from a local database or API
    this.items = [
      {
        id: '1',
        name: 'Blade of Despair',
        type: 'Attack',
        stats: {
          physicalAttack: 170,
          attackSpeed: 0
        },
        passive: 'Increases Physical Attack by 25% when attacking enemy heroes with HP below 50%',
        price: 3010
      }
      // Add more items...
    ];
  }

  private async loadBuilds() {
    // In production, this would load from storage or API
    this.builds = [
      {
        id: '1',
        name: 'Standard Marksman Build',
        heroId: '1', // Layla
        items: [this.items[0]], // Reference to Blade of Despair
        description: 'Standard build focusing on physical damage and attack speed',
        matchups: {
          goodAgainst: ['Tank', 'Support'],
          badAgainst: ['Assassin']
        },
        playstyle: 'Stay behind tanks and focus on dealing consistent damage'
      }
    ];
  }

  getRecommendedBuild(heroId: string, enemyTeam: string[]): Build | null {
    const heroBuilds = this.builds.filter(build => build.heroId === heroId);
    if (heroBuilds.length === 0) return null;

    // Simple recommendation logic - in production, this would be more sophisticated
    return heroBuilds[0];
  }

  getBuildsByHeroId(heroId: string): Build[] {
    return this.builds.filter(build => build.heroId === heroId);
  }

  getItemById(itemId: string): BuildItem | undefined {
    return this.items.find(item => item.id === itemId);
  }
}