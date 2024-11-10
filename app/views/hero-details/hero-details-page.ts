import { NavigatedData, Page } from '@nativescript/core';
import { HeroDetailsViewModel } from './hero-details-view-model';

export function onNavigatingTo(args: NavigatedData) {
  const page = <Page>args.object;
  const heroId = args.context.heroId;
  page.bindingContext = new HeroDetailsViewModel(heroId);
}