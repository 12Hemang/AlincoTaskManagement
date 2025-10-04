export class LanguageManager {
  private static language: 'en' | 'hi' = 'en';

  static getLanguage(): 'en' | 'hi' {
    return this.language;
  }

  static setLanguage(lang: 'en' | 'hi') {
    this.language = lang;
  }
}
