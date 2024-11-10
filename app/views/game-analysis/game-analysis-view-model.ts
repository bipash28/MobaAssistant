import { Observable, Timer } from '@nativescript/core';
import { GameAnalysisService } from '../../services/game-analysis.service';
import { GameState } from '../../models/game-state.model';

export class GameAnalysisViewModel extends Observable {
  private gameAnalysisService: GameAnalysisService;
  private updateTimer: Timer;
  private _gameState: GameState | null = null;
  private _analysis: { recommendations: string[]; threats: string[]; objectives: string[] } = {
    recommendations: [],
    threats: [],
    objectives: []
  };
  private _counterBuild: { itemSuggestions: string[]; reasoning: string[] } = {
    itemSuggestions: [],
    reasoning: []
  };

  constructor() {
    super();
    this.gameAnalysisService = new GameAnalysisService();
    this.startAnalysis();
  }

  private startAnalysis() {
    // Update analysis every 5 seconds
    this.updateTimer = new Timer(5000, () => this.updateAnalysis());
  }

  private updateAnalysis() {
    const gameState = this.gameAnalysisService.getCurrentGameState();
    if (gameState) {
      this._gameState = gameState;
      this._analysis = this.gameAnalysisService.analyzeGameState(gameState);
      
      // Get counter build suggestions for the player's hero
      const playerHeroId = gameState.allyTeam.players[0].heroId;
      const enemyHeroIds = gameState.enemyTeam.players.map(p => p.heroId);
      this._counterBuild = this.gameAnalysisService.getCounterBuildSuggestions(
        playerHeroId,
        enemyHeroIds
      );

      this.notifyPropertyChange('gameState', gameState);
      this.notifyPropertyChange('analysis', this._analysis);
      this.notifyPropertyChange('counterBuild', this._counterBuild);
    }
  }

  get gameState(): GameState | null {
    return this._gameState;
  }

  get analysis() {
    return this._analysis;
  }

  get counterBuild() {
    return this._counterBuild;
  }

  get gameTime(): string {
    if (!this._gameState) return '00:00';
    const minutes = Math.floor(this._gameState.gameTime / 60);
    const seconds = this._gameState.gameTime % 60;
    return `${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;
  }
}