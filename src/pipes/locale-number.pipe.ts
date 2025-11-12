import { Pipe, PipeTransform, inject } from '@angular/core';
import { TranslationService } from '../services/translation.service';

@Pipe({
  name: 'localeNumber',
  pure: false,
})
export class LocaleNumberPipe implements PipeTransform {
  private translationService = inject(TranslationService);

  transform(value: number | null | undefined, decimals: number = 2): string {
    if (value === null || value === undefined || isNaN(value)) return '';
    
    const lang = this.translationService.currentLang();
    
    const localeMap: Record<string, string> = {
      'en': 'en-US',
      'sk': 'sk-SK',
      'de': 'de-DE',
    };
    
    const locale = localeMap[lang] || 'en-US';
    
    return new Intl.NumberFormat(locale, {
      minimumFractionDigits: decimals,
      maximumFractionDigits: decimals,
    }).format(value);
  }
}
