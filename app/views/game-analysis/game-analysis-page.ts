import { NavigatedData, Page } from '@nativescript/core';
import { GameAnalysisViewModel } from './game-analysis-view-model';

export function onNavigatingTo(args: NavigatedData) {
  const page = <Page>args.object;
  page.bindingContext = new GameAnalysisViewModel();
}