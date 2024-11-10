import { Observable } from '@nativescript/core';
import { DraftAnalysisService } from '../../services/draft-analysis.service';
import { DraftState, CounterSuggestion, BanSuggestion } from '../../models/draft.model';

export class DraftViewModel extends Observable {
  private draftAnalysisService: DraftAnalysisService;
  private _currentRank: string = 'Epic';
  private _currentPhase: number = 1;
  private _draftState: DraftState;
  private _banSuggestions: BanSuggestion[] = [];
  private _counterSuggestions: CounterSuggestion[] = [];
  private _selectedHero: string = '';
  private _selectedHeroBuilds: any[] = [];

  constructor() {
    super();
    this.draftAnalysisService = new DraftAnalysisService();
    this.initializeDraftState();
    this.updateSuggestions();
  }

  private initializeDraftState() {
    this._draftState = {
      ourPicks: [],
      enemyPicks: [],
      ourBans: [],
      enemyBans: [],
      pickPhase: 1,
      isFirstPick: true
    };
  }

  async updateSuggestions() {
    if (this.showBanPhase) {
      this._banSuggestions = await this.draftAnalysisService.getBanSuggestions(
        this._currentRank,
        this._draftState.isFirstPick
      );
      this.notifyPropertyChange('banSuggestions', this._banSuggestions);
    }

    if (this.showPickPhase) {
      this._counterSuggestions = await this.draftAnalysisService.getCounterSuggestions(
        this._draftState,
        this._currentRank
      );
      this.notifyPropertyChange('counterSuggestions', this._counterSuggestions);
    }
  }

  get currentRank(): string {
    return this._currentRank;
  }

  get currentPhase(): number {
    return this._currentPhase;
  }

  get phaseDescription(): string {
    if (this.showBanPhase) {
      return 'Select hero to ban';
    }
    return 'Choose your hero';
  }

  get showBanPhase(): boolean {
    return this._currentPhase <= 2;
  }

  get showPickPhase(): boolean {
    return this._currentPhase > 2;
  }

  get banSuggestions(): BanSuggestion[] {
    return this._banSuggestions;
  }

  get counterSuggestions(): CounterSuggestion[] {
    return this._counterSuggestions;
  }

  get selectedHero(): string {
    return this._selectedHero;
  }

  get selectedHeroBuilds(): any[] {
    return this._selectedHeroBuilds;
  }

  toggleRank() {
    const ranks = ['Epic', 'Legend', 'Mythic'];
    const currentIndex = ranks.indexOf(this._currentRank);
    this._currentRank = ranks[(currentIndex + 1) % ranks.length];
    this.notifyPropertyChange('currentRank', this._currentRank);
    this.updateSuggestions();
  }

  async confirmPick() {
    if (this.showBanPhase) {
      this._draftState.ourBans.push(this._selectedHero);
    } else {
      this._draftState.ourPicks.push(this._selectedHero);
    }

    this._currentPhase++;
    this._selectedHero = '';
    
    this.notifyPropertyChange('currentPhase', this._currentPhase);
    this.notifyPropertyChange('selectedHero', this._selectedHero);
    
    await this.updateSuggestions();
  }

  onHeroSelected(hero: string) {
    this._selectedHero = hero;
    this.notifyPropertyChange('selectedHero', hero);

    if (this.showPickPhase) {
      const suggestion = this._counterSuggestions.find(s => s.hero === hero);
      if (suggestion) {
        this._selectedHeroBuilds = suggestion.builds;
        this.notifyPropertyChange('selectedHeroBuilds', suggestion.builds);
      }
    }
  }
}