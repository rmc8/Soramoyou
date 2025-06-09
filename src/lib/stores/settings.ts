import { writable } from 'svelte/store';
import { Store } from '@tauri-apps/plugin-store';
import { browser } from '$app/environment';
import type { Locale } from '$lib/i18n';
import type { ThemeMode } from '$lib/theme';

export interface AppSettings {
  locale: Locale;
  themeMode: ThemeMode;
  version: string;
}

const getSystemLocale = (): Locale => {
  if (!browser) return 'en';
  
  const supportedLocales: Locale[] = ['ja', 'en', 'pt', 'de'];
  const browserLang = navigator.language.slice(0, 2) as Locale;
  
  // システム言語が対応している場合はそれを使用、未対応の場合は英語
  return supportedLocales.includes(browserLang) ? browserLang : 'en';
};

const getSystemTheme = (): ThemeMode => {
  // システム設定を初期値とする
  return 'system';
};

// システム設定ベースの初期値（初回起動時のみ使用）
const getInitialSettings = (): AppSettings => ({
  locale: getSystemLocale(),
  themeMode: getSystemTheme(),
  version: '1.0.0'
});

let store: Store | null = null;

const initStore = async (): Promise<Store> => {
  if (!store) {
    store = await Store.load('settings.dat');
  }
  return store;
};

// アプリ内でのデフォルト値（永続化されていない場合にのみ使用）
export const settings = writable<AppSettings>(getInitialSettings());

export const loadSettings = async (): Promise<AppSettings> => {
  try {
    const storeInstance = await initStore();
    
    const savedLocale = await storeInstance.get<Locale>('locale');
    const savedThemeMode = await storeInstance.get<ThemeMode>('themeMode');
    const savedVersion = await storeInstance.get<string>('version');
    
    // 設定が保存されているかチェック
    const isFirstLaunch = savedLocale === null && savedThemeMode === null;
    
    let loadedSettings: AppSettings;
    
    if (isFirstLaunch) {
      // 初回起動：システム設定を検出して使用
      console.log('First launch detected, using system settings');
      loadedSettings = getInitialSettings();
      // 初期設定を保存
      await saveSettingsInternal(loadedSettings);
    } else {
      // 2回目以降：保存された設定を使用（部分的に保存されている場合はシステム設定で補完）
      console.log('Loading saved settings');
      loadedSettings = {
        locale: savedLocale !== null ? savedLocale : getSystemLocale(),
        themeMode: savedThemeMode !== null ? savedThemeMode : getSystemTheme(),
        version: savedVersion || '1.0.0'
      };
    }
    
    settings.set(loadedSettings);
    console.log('Settings loaded:', loadedSettings);
    return loadedSettings;
  } catch (error) {
    console.warn('Failed to load settings:', error);
    // エラー時はシステム設定ベースの初期値を使用
    const initialSettings = getInitialSettings();
    settings.set(initialSettings);
    return initialSettings;
  }
};

// 内部使用の保存関数（循環参照を避ける）
const saveSettingsInternal = async (settingsToSave: AppSettings): Promise<void> => {
  console.log('saveSettingsInternal: Starting save with:', settingsToSave);
  const storeInstance = await initStore();
  await storeInstance.set('locale', settingsToSave.locale);
  await storeInstance.set('themeMode', settingsToSave.themeMode);
  await storeInstance.set('version', settingsToSave.version);
  await storeInstance.save();
  console.log('saveSettingsInternal: Tauri store save completed');
};

export const saveSettings = async (newSettings: Partial<AppSettings>): Promise<void> => {
  try {
    const storeInstance = await initStore();
    
    // 現在の設定を取得（ストアから直接）
    const currentLocale = await storeInstance.get<Locale>('locale');
    const currentThemeMode = await storeInstance.get<ThemeMode>('themeMode');
    const currentVersion = await storeInstance.get<string>('version');
    
    const currentSettings: AppSettings = {
      locale: currentLocale !== null ? currentLocale : getSystemLocale(),
      themeMode: currentThemeMode !== null ? currentThemeMode : getSystemTheme(),
      version: currentVersion || '1.0.0'
    };
    
    const updatedSettings = { ...currentSettings, ...newSettings };
    
    await saveSettingsInternal(updatedSettings);
    settings.set(updatedSettings);
    console.log('saveSettings: Settings saved and store updated:', updatedSettings);
  } catch (error) {
    console.error('Failed to save settings:', error);
    throw error;
  }
};

export const updateLocale = async (locale: Locale): Promise<void> => {
  await saveSettings({ locale });
};

export const updateThemeMode = async (themeMode: ThemeMode): Promise<void> => {
  console.log('updateThemeMode: Saving theme mode:', themeMode);
  await saveSettings({ themeMode });
  console.log('updateThemeMode: Theme mode saved successfully');
};

export const resetSettings = async (): Promise<void> => {
  try {
    const storeInstance = await initStore();
    await storeInstance.clear();
    await storeInstance.save();
    
    // リセット時は現在のシステム設定を取得
    const resetSettings = getInitialSettings();
    settings.set(resetSettings);
    await saveSettingsInternal(resetSettings);
  } catch (error) {
    console.error('Failed to reset settings:', error);
    throw error;
  }
};