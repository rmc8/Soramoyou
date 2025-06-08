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
			// 並列で初期化処理を実行して起動時間を短縮
			const [settings] = await Promise.all([
				loadSettings(),
				initI18n() // i18nを先行して初期化
			]);
			
			// 設定値を適用
			await Promise.all([
				setLocale(settings.locale),
				initTheme().then(() => setThemeMode(settings.themeMode))
			]);
		} catch (error) {
			console.error('Failed to initialize app:', error);
			// フォールバック処理も並列化
			await Promise.all([
				initI18n(),
				initTheme()
			]);
		}
	});
</script>

<!-- ヘッダー -->
<Header onDrawerToggle={toggleDrawer} />

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