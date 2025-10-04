import { loginLocalization } from '../../feature/auth/localization/LoginLocalization';
import { LanguageManager } from './LanguageManager';

// Map of all modules
const modules = {
  login: loginLocalization,
  // movie: movieLocalization,
  // profile: profileLocalization
};

type LocalizationKey = string;

export class AppLocalizationModule {
  private moduleData: Record<string, { en: string; hi: string }>;

  constructor(moduleName: keyof typeof modules) {
    const data = modules[moduleName];
    if (!data) throw new Error(`Module '${moduleName}' localization not found`);
    this.moduleData = data;
  }

  /**
   * Get string for key constant
   */
  public get(key: LocalizationKey): string {
    const lang = LanguageManager.getLanguage();
    return this.moduleData[key]?.[lang] || '';
  }
}

/**
 * Factory function
 */
export function AppLocalization(moduleName: keyof typeof modules): AppLocalizationModule {
  return new AppLocalizationModule(moduleName);
}
