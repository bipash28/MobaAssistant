import { Observable } from '@nativescript/core';
import { HeroService } from '../../services/hero.service';
import { Hero } from '../../models/hero.model';

export class HeroDetailsViewModel extends Observable {
  private heroService: HeroService;
  private _hero: Hero;

  constructor(heroId: string) {
    super();
    this.heroService = new HeroService();
    const hero = this.heroService.getHeroById(heroId);
    if (!hero) {
      throw new Error(`Hero with id ${heroId} not found`);
    }
    this._hero = hero;
  }

  get hero(): Hero {
    return this._hero;
  }
}