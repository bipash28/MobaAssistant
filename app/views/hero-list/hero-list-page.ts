import { NavigatedData, Page } from '@nativescript/core';
import { HeroListViewModel } from './hero-list-view-model';

export function onNavigatingTo(args: NavigatedData) {
  const page = <Page>args.object;
  page.bindingContext = new HeroListViewModel();
}