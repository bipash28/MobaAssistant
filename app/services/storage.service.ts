import { knownFolders } from '@nativescript/core';
import { Hero } from '../models/hero.model';

export class StorageService {
  private static readonly HEROES_FILE = 'heroes.json';
  private static readonly documentsFolder = knownFolders.documents();

  async saveHeroes(heroes: Hero[]): Promise<void> {
    const heroesFile = this.documentsFolder.getFile(StorageService.HEROES_FILE);
    await heroesFile.writeText(JSON.stringify(heroes));
  }

  async loadHeroes(): Promise<Hero[]> {
    try {
      const heroesFile = this.documentsFolder.getFile(StorageService.HEROES_FILE);
      const content = await heroesFile.readText();
      return JSON.parse(content);
    } catch {
      return [];
    }
  }
}