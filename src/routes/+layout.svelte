<script lang="ts">
	import { onMount } from 'svelte';
	import '../app.css';
	import { initI18n } from '$lib/i18n';
	import { initTheme } from '$lib/theme';
	import { loadSettings } from '$lib/stores/settings';
	import { setLocale } from '$lib/i18n';
	import { setThemeMode } from '$lib/theme';

	let { children } = $props();

	onMount(async () => {
		try {
			const settings = await loadSettings();
			
			await setLocale(settings.locale);
			setThemeMode(settings.themeMode);
			
			initTheme();
		} catch (error) {
			console.error('Failed to initialize app:', error);
			await initI18n();
			initTheme();
		}
	});
</script>

{@render children()}
