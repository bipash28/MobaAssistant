import { Observable, knownFolders } from '@nativescript/core';

export class CacheService extends Observable {
  private static readonly CACHE_FOLDER = 'cache';
  private static readonly MAX_CACHE_SIZE = 50 * 1024 * 1024; // 50MB
  private static readonly CACHE_EXPIRY = 24 * 60 * 60 * 1000; // 24 hours

  private cacheFolder = knownFolders.documents().getFolder(CacheService.CACHE_FOLDER);

  async cacheData(key: string, data: any): Promise<void> {
    const file = this.cacheFolder.getFile(`${key}.json`);
    await file.writeText(JSON.stringify({
      timestamp: Date.now(),
      data
    }));
    await this.cleanupCache();
  }

  async getCachedData(key: string): Promise<any | null> {
    try {
      const file = this.cacheFolder.getFile(`${key}.json`);
      const content = await file.readText();
      const cached = JSON.parse(content);

      if (Date.now() - cached.timestamp > CacheService.CACHE_EXPIRY) {
        await file.remove();
        return null;
      }

      return cached.data;
    } catch {
      return null;
    }
  }

  private async cleanupCache(): Promise<void> {
    const files = this.cacheFolder.getEntities();
    let totalSize = 0;

    for (const file of files) {
      totalSize += file.size;
    }

    if (totalSize > CacheService.MAX_CACHE_SIZE) {
      // Remove oldest files first
      const sortedFiles = files.sort((a, b) => a.lastModified - b.lastModified);
      for (const file of sortedFiles) {
        await file.remove();
        totalSize -= file.size;
        if (totalSize <= CacheService.MAX_CACHE_SIZE) break;
      }
    }
  }
}