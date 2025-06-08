import { writable, derived } from 'svelte/store';
import { browser } from '$app/environment';
import { invoke } from '@tauri-apps/api/core';
import { listen } from '@tauri-apps/api/event';

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

export const applyTheme = async () => {
  if (!browser) return;
  
  const resolved = getResolvedTheme();
  const root = document.documentElement;
  
  // Apply transition class before changing themes for smooth transition
  root.classList.add('theme-transitioning');
  
  // Small delay to ensure transition class is applied
  await new Promise(resolve => setTimeout(resolve, 16));
  
  root.classList.remove('light', 'dark');
  root.classList.add(resolved);
  
  root.setAttribute('data-theme', resolved);
  
  // Remove transition class after transition completes
  setTimeout(() => {
    root.classList.remove('theme-transitioning');
  }, 600);
  
  // Set system bar text color based on theme
  try {
    await invoke('set_theme', { 
      theme: resolved,
      titleBarColor: resolved === 'dark' ? '#1f2937' : '#ffffff',
      textColor: resolved === 'dark' ? '#ffffff' : '#000000'
    });
    
    // Android向けの追加処理
    if (typeof window !== 'undefined' && (window as any).Android) {
      (window as any).Android.updateTheme(JSON.stringify({
        isDark: resolved === 'dark',
        theme: resolved
      }));
    }
    
    console.log('Theme updated successfully:', resolved);
  } catch (error) {
    console.error('Failed to update system bar theme:', error);
  }
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

export const initTheme = async () => {
  if (!browser) return;
  
  updateSystemPreference();
  
  const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)');
  mediaQuery.addEventListener('change', updateSystemPreference);
  
  const savedMode = getThemeMode();
  themeMode.set(savedMode);
  
  await applyTheme();
  
  // Setup Android status bar listener
  try {
    await listen('status_bar_theme', (event) => {
      console.log('Status bar theme updated:', event.payload);
    });
  } catch (error) {
    console.warn('Failed to setup status bar listener:', error);
  }
  
  return () => {
    mediaQuery.removeEventListener('change', updateSystemPreference);
  };
};

resolvedTheme.subscribe(async () => {
  if (browser) {
    await applyTheme();
  }
});

export const availableThemes: Record<ThemeMode, string> = {
  light: 'theme.light',
  dark: 'theme.dark',
  system: 'theme.system'
};