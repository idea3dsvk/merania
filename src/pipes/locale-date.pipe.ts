import { Pipe, PipeTransform, inject } from '@angular/core';
import { TranslationService } from '../services/translation.service';

@Pipe({
  name: 'localeDate',
  pure: false,
})
export class LocaleDatePipe implements PipeTransform {
  private translationService = inject(TranslationService);

  transform(value: string | Date, format: 'short' | 'medium' | 'long' = 'short'): string {
    if (!value) return '';
    
    const date = typeof value === 'string' ? new Date(value) : value;
    const lang = this.translationService.currentLang();
    
    const localeMap: Record<string, string> = {
      'en': 'en-US',
      'sk': 'sk-SK',
      'de': 'de-DE',
    };
    
    const locale = localeMap[lang] || 'en-US';
    
    const options: Intl.DateTimeFormatOptions = format === 'short'
      ? { year: 'numeric', month: '2-digit', day: '2-digit', hour: '2-digit', minute: '2-digit' }
      : format === 'medium'
      ? { year: 'numeric', month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' }
      : { year: 'numeric', month: 'long', day: 'numeric', hour: '2-digit', minute: '2-digit', second: '2-digit' };
    
    return new Intl.DateTimeFormat(locale, options).format(date);
  }
}
