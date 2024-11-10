import { Observable } from '@nativescript/core';
import { TranslationService } from '../../services/translation.service';

interface ChatMessage {
  original: string;
  translation?: string;
  timestamp: Date;
}

export class ChatViewModel extends Observable {
  private translationService: TranslationService;
  private _messages: ChatMessage[] = [];
  private _messageText: string = '';
  private _isTranslationEnabled: boolean = true;

  constructor() {
    super();
    this.translationService = new TranslationService();
  }

  get messages(): ChatMessage[] {
    return this._messages;
  }

  get messageText(): string {
    return this._messageText;
  }

  set messageText(value: string) {
    if (this._messageText !== value) {
      this._messageText = value;
      this.notifyPropertyChange('messageText', value);
    }
  }

  get isTranslationEnabled(): boolean {
    return this._isTranslationEnabled;
  }

  toggleTranslation() {
    this._isTranslationEnabled = !this._isTranslationEnabled;
    this.notifyPropertyChange('isTranslationEnabled', this._isTranslationEnabled);
  }

  async sendMessage() {
    if (!this.messageText.trim()) return;

    const message: ChatMessage = {
      original: this.messageText,
      timestamp: new Date()
    };

    if (this._isTranslationEnabled) {
      const detectedLang = this.translationService.detectLanguage(this.messageText);
      if (detectedLang !== 'en') {
        message.translation = await this.translationService.translateText(
          this.messageText,
          detectedLang,
          'en'
        );
      }
    }

    this._messages.unshift(message);
    this.notifyPropertyChange('messages', this._messages);
    this.messageText = '';
  }
}