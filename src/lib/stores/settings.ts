import { writable } from 'svelte/store';
import { Store } from '@tauri-apps/plugin-store';
import type { Locale } from '$lib/i18n';
import type { ThemeMode } from '$lib/theme';

export interface AppSettings {
  locale: Locale;
  themeMode: ThemeMode;
  version: string;
}

const DEFAULT_SETTINGS: AppSettings = {
  locale: 'ja',
  themeMode: 'system',
  version: '1.0.0'
};

let store: Store | null = null;

const initStore = async (): Promise<Store> => {
  if (!store) {
    store = await Store.load('settings.dat');
  }
  return store;
};

export const settings = writable<AppSettings>(DEFAULT_SETTINGS);

export const loadSettings = async (): Promise<AppSettings> => {
  try {
    const storeInstance = await initStore();
    
    const savedLocale = await storeInstance.get<Locale>('locale');
    const savedThemeMode = await storeInstance.get<ThemeMode>('themeMode');
    const savedVersion = await storeInstance.get<string>('version');
    
    const loadedSettings: AppSettings = {
      locale: savedLocale || DEFAULT_SETTINGS.locale,
      themeMode: savedThemeMode || DEFAULT_SETTINGS.themeMode,
      version: savedVersion || DEFAULT_SETTINGS.version
    };
    
    settings.set(loadedSettings);
    return loadedSettings;
  } catch (error) {
    console.warn('Failed to load settings:', error);
    settings.set(DEFAULT_SETTINGS);
    return DEFAULT_SETTINGS;
  }
};

export const saveSettings = async (newSettings: Partial<AppSettings>): Promise<void> => {
  try {
    const storeInstance = await initStore();
    const currentSettings = await loadSettings();
    const updatedSettings = { ...currentSettings, ...newSettings };
    
    await storeInstance.set('locale', updatedSettings.locale);
    await storeInstance.set('themeMode', updatedSettings.themeMode);
    await storeInstance.set('version', updatedSettings.version);
    await storeInstance.save();
    
    settings.set(updatedSettings);
  } catch (error) {
    console.error('Failed to save settings:', error);
    throw error;
  }
};

export const updateLocale = async (locale: Locale): Promise<void> => {
  await saveSettings({ locale });
};

export const updateThemeMode = async (themeMode: ThemeMode): Promise<void> => {
  await saveSettings({ themeMode });
};

export const resetSettings = async (): Promise<void> => {
  try {
    const storeInstance = await initStore();
    await storeInstance.clear();
    await storeInstance.save();
    settings.set(DEFAULT_SETTINGS);
  } catch (error) {
    console.error('Failed to reset settings:', error);
    throw error;
  }
};