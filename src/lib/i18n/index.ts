import { writable, derived, get } from 'svelte/store';
import { browser } from '$app/environment';

export type Locale = 'ja' | 'en' | 'pt' | 'de';

export const availableLocales: { [key in Locale]: string } = {
  ja: '日本語',
  en: 'English',
  pt: 'Português',
  de: 'Deutsch'
};

export const locale = writable<Locale>('ja');

export const translations = writable<Record<string, any>>({});

const loadTranslations = async (locale: Locale) => {
  try {
    const module = await import(`./locales/${locale}.json`);
    return module.default;
  } catch (error) {
    console.warn(`Failed to load translations for ${locale}`, error);
    const fallback = await import('./locales/ja.json');
    return fallback.default;
  }
};

export const t = derived(
  [locale, translations],
  ([currentLocale, currentTranslations]) => {
    return (key: string, params?: Record<string, string | number>): string => {
      const keys = key.split('.');
      let value = currentTranslations;
      
      for (const k of keys) {
        if (value && typeof value === 'object' && k in value) {
          value = value[k];
        } else {
          console.warn(`Translation key "${key}" not found for locale "${currentLocale}"`);
          return key;
        }
      }
      
      if (typeof value !== 'string') {
        console.warn(`Translation key "${key}" does not resolve to a string`);
        return key;
      }
      
      if (params) {
        return Object.entries(params).reduce((str: string, [param, val]) => {
          return str.replace(new RegExp(`\\{${param}\\}`, 'g'), String(val));
        }, value);
      }
      
      return value;
    };
  }
);

export const setLocale = async (newLocale: Locale) => {
  const newTranslations = await loadTranslations(newLocale);
  translations.set(newTranslations);
  locale.set(newLocale);
};

// この関数は settings.ts に移動済み
export const initI18n = async (initialLocale?: Locale) => {
  // 引数で指定された言語を使用（設定から読み込まれた言語）
  if (initialLocale) {
    await setLocale(initialLocale);
  } else {
    // フォールバック（通常は発生しない）
    console.warn('initI18n called without initialLocale, using English as fallback');
    await setLocale('en');
  }
};