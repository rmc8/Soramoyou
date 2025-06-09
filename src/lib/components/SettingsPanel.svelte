<script lang="ts">
  import { onMount } from 'svelte';
  import { t, locale, setLocale, availableLocales, type Locale } from '$lib/i18n';
  import { themeMode, setThemeMode, availableThemes, type ThemeMode } from '$lib/theme';
  import { updateLocale, updateThemeMode } from '$lib/stores/settings';
  import Button from '$lib/components/ui/button/button.svelte';

  let currentLocale: Locale = 'ja';
  let currentThemeMode: ThemeMode = 'system';

  onMount(() => {
    const unsubscribeLocale = locale.subscribe(value => {
      currentLocale = value;
    });

    const unsubscribeTheme = themeMode.subscribe(value => {
      currentThemeMode = value;
    });

    return () => {
      unsubscribeLocale();
      unsubscribeTheme();
    };
  });

  const handleLocaleChange = async (newLocale: Locale) => {
    try {
      await setLocale(newLocale);
      await updateLocale(newLocale);
    } catch (error) {
      console.error('Failed to update locale:', error);
    }
  };

  const handleThemeChange = async (newTheme: ThemeMode) => {
    try {
      console.log('SettingsPanel: Changing theme to:', newTheme);
      await setThemeMode(newTheme);
      console.log('SettingsPanel: setThemeMode completed');
      await updateThemeMode(newTheme);
      console.log('SettingsPanel: updateThemeMode completed');
    } catch (error) {
      console.error('Failed to update theme:', error);
    }
  };
</script>

<div class="settings-panel space-y-6 p-6">
  <div class="settings-section">
    <h2 class="text-xl font-semibold mb-4">{$t('settings.title')}</h2>
    
    <!-- Language Settings -->
    <div class="setting-group space-y-3">
      <h3 class="text-lg font-medium">{$t('settings.language')}</h3>
      <div class="grid grid-cols-2 gap-2">
        {#each Object.entries(availableLocales) as [localeCode, localeName]}
          <Button
            variant={currentLocale === localeCode ? "default" : "outline"}
            size="sm"
            class="justify-start"
            on:click={() => handleLocaleChange(localeCode as Locale)}
          >
            {localeName}
          </Button>
        {/each}
      </div>
    </div>

    <!-- Theme Settings -->
    <div class="setting-group space-y-3">
      <h3 class="text-lg font-medium">{$t('settings.theme')}</h3>
      <div class="grid grid-cols-1 gap-2">
        {#each Object.entries(availableThemes) as [themeKey, themeTranslationKey]}
          <Button
            variant={currentThemeMode === themeKey ? "default" : "outline"}
            size="sm"
            class="justify-start"
            on:click={() => handleThemeChange(themeKey as ThemeMode)}
          >
            {$t(themeTranslationKey)}
          </Button>
        {/each}
      </div>
    </div>
  </div>
</div>

<style>
  .settings-panel {
    max-width: 600px;
    margin: 0 auto;
  }

  .setting-group {
    padding: 1rem;
    border: 1px solid hsl(var(--border));
    border-radius: 0.5rem;
    background: hsl(var(--card));
  }

  .setting-group h3 {
    color: hsl(var(--foreground));
  }
</style>