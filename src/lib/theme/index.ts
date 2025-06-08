import { writable, derived } from 'svelte/store';
import { browser } from '$app/environment';

export type ThemeMode = 'light' | 'dark' | 'system';
export type ResolvedTheme = 'light' | 'dark';

export interface ThemeConfig {
  mode: ThemeMode;
  customThemes?: Record<string, any>;
}

export const themeMode = writable<ThemeMode>('system');
export const systemPrefersDark = writable<boolean>(false);

export const resolvedTheme = derived(
  [themeMode, systemPrefersDark],
  ([mode, prefersDark]) => {
    if (mode === 'system') {
      return prefersDark ? 'dark' : 'light';
    }
    return mode as ResolvedTheme;
  }
);

const getSystemPreference = (): boolean => {
  if (!browser) return false;
  return window.matchMedia('(prefers-color-scheme: dark)').matches;
};

const updateSystemPreference = () => {
  if (!browser) return;
  systemPrefersDark.set(getSystemPreference());
};

export const setThemeMode = (mode: ThemeMode) => {
  themeMode.set(mode);
  if (browser) {
    localStorage.setItem('themeMode', mode);
    applyTheme();
  }
};

export const applyTheme = () => {
  if (!browser) return;
  
  const resolved = getResolvedTheme();
  const root = document.documentElement;
  
  root.classList.remove('light', 'dark');
  root.classList.add(resolved);
  
  root.setAttribute('data-theme', resolved);
};

const getResolvedTheme = (): ResolvedTheme => {
  const mode = getThemeMode();
  if (mode === 'system') {
    return getSystemPreference() ? 'dark' : 'light';
  }
  return mode as ResolvedTheme;
};

const getThemeMode = (): ThemeMode => {
  if (!browser) return 'system';
  const saved = localStorage.getItem('themeMode') as ThemeMode;
  return saved && ['light', 'dark', 'system'].includes(saved) ? saved : 'system';
};

export const initTheme = () => {
  if (!browser) return;
  
  updateSystemPreference();
  
  const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)');
  mediaQuery.addEventListener('change', updateSystemPreference);
  
  const savedMode = getThemeMode();
  themeMode.set(savedMode);
  
  applyTheme();
  
  return () => {
    mediaQuery.removeEventListener('change', updateSystemPreference);
  };
};

resolvedTheme.subscribe((theme) => {
  if (browser) {
    applyTheme();
  }
});

export const availableThemes: Record<ThemeMode, string> = {
  light: 'theme.light',
  dark: 'theme.dark',
  system: 'theme.system'
};