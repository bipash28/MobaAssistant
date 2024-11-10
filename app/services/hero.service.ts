import { Observable } from '@nativescript/core';
import { Hero } from '../models/hero.model';
import { StorageService } from './storage.service';
import { CacheService } from './cache.service';

export class HeroService extends Observable {
  private heroes: Hero[] = [];
  private storageService: StorageService;
  private cacheService: CacheService;

  constructor() {
    super();
    this.storageService = new StorageService();
    this.cacheService = new CacheService();
    this.initializeHeroes();
  }

  private async initializeHeroes() {
    // Try cache first
    const cachedHeroes = await this.cacheService.getCachedData('heroes');
    if (cachedHeroes) {
      this.heroes = cachedHeroes;
      return;
    }

    // Load from storage if cache miss
    const storedHeroes = await this.storageService.loadHeroes();
    this.heroes = storedHeroes.length > 0 ? storedHeroes : this.getDefaultHeroes();
    
    // Cache the heroes
    await this.cacheService.cacheData('heroes', this.heroes);
    await this.storageService.saveHeroes(this.heroes);
  }

  // ... rest of the code remains the same
}