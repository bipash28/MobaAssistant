import { NavigatedData, Page } from '@nativescript/core';
import { ChatViewModel } from './chat-view-model';

export function onNavigatingTo(args: NavigatedData) {
  const page = <Page>args.object;
  page.bindingContext = new ChatViewModel();
}