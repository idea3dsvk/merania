import { Injectable, signal, computed } from '@angular/core';
import { translations, Language, Translation } from '../translations';

@Injectable({
  providedIn: 'root',
})
export class TranslationService {
  private _currentLang = signal<Language>('en');

  public readonly currentLang = this._currentLang.asReadonly();
  public readonly currentTranslations = computed<Translation>(() => translations[this._currentLang()]);

  constructor() {
    const browserLang = navigator.language.split('-')[0];
    if (browserLang === 'sk' || browserLang === 'de') {
      this.setLanguage(browserLang);
    }
  }

  setLanguage(lang: Language) {
    this._currentLang.set(lang);
  }

  translate(key: string): string {
    const lang = this._currentLang();
    const keys = key.split('.');
    
    let result: any = translations[lang];
    for (const k of keys) {
      result = result?.[k];
      if (result === undefined) {
        // Fallback to English if translation is missing in current language
        let fallbackResult: any = translations['en'];
        for (const k_en of keys) {
            fallbackResult = fallbackResult?.[k_en];
        }
        // Return key if not found in English either
        return fallbackResult || key;
      }
    }
    return typeof result === 'string' ? result : key;
  }
}
