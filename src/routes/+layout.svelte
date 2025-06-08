<script lang="ts">
	import { onMount } from 'svelte';
	import '../app.css';
	import { initI18n } from '$lib/i18n';
	import { initTheme } from '$lib/theme';
	import { loadSettings } from '$lib/stores/settings';
	import { setLocale } from '$lib/i18n';
	import { setThemeMode } from '$lib/theme';
	import DebugPanel from '$lib/components/DebugPanel.svelte';
	import Header from '$lib/components/Header.svelte';
	import Drawer from '$lib/components/Drawer.svelte';

	let { children } = $props();
	let isDrawerOpen = $state(false);

	function toggleDrawer() {
		isDrawerOpen = !isDrawerOpen;
	}

	function closeDrawer() {
		isDrawerOpen = false;
	}

	onMount(async () => {
		try {
			const settings = await loadSettings();
			
			await setLocale(settings.locale);
			setThemeMode(settings.themeMode);
			
			await initTheme();
		} catch (error) {
			console.error('Failed to initialize app:', error);
			await initI18n();
			await initTheme();
		}
	});
</script>

<!-- ヘッダー -->
<Header ondrawer-toggle={toggleDrawer} />

<!-- ドロワー -->
<Drawer {isDrawerOpen} onclose={closeDrawer} />

<!-- メインコンテンツ -->
<div class="safe-area-top min-h-screen">
	<!-- ヘッダーの高さ分のスペース -->
	<div class="h-16"></div>
	
	<!-- ページコンテンツ -->
	<main class="relative">
		{@render children()}
	</main>
</div>

<DebugPanel />
