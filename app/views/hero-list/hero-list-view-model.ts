import { Observable, Frame } from '@nativescript/core';
import { HeroService } from '../../services/hero.service';
import { Hero } from '../../models/hero.model';

export class HeroListViewModel extends Observable {
  private heroService: HeroService;
  private _heroes: Hero[] = [];

  constructor() {
    super();
    this.heroService = new HeroService();
    this._heroes = this.heroService.getHeroes();
  }

  get heroes(): Hero[] {
    return this._heroes;
  }

  onHeroTap(args: any) {
    const hero = this._heroes[args.index];
    Frame.topmost().navigate({
      moduleName: 'views/hero-details/hero-details-page',
      context: { heroId: hero.id }
    });
  }
}