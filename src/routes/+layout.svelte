<script lang="ts">
	import { onMount } from 'svelte';
	import { page } from '$app/stores';
	import '../app.css';
	import { initI18n } from '$lib/i18n';
	import { initTheme } from '$lib/theme';
	import { loadSettings } from '$lib/stores/settings';
	import { setLocale } from '$lib/i18n';
	import { setThemeMode } from '$lib/theme';
	import { isAuthenticated } from '$lib/stores/auth';
	import DebugPanel from '$lib/components/DebugPanel.svelte';
	import Header from '$lib/components/Header.svelte';
	import Drawer from '$lib/components/Drawer.svelte';
	import BottomNavigation from '$lib/components/BottomNavigation.svelte';

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
			console.log('App startup: Loading settings...');
			// 設定を読み込み（初回起動時はシステム設定を検出・保存、2回目以降は保存された設定を使用）
			const settings = await loadSettings();
			
			console.log('App startup: Loaded settings:', settings);
			
			// 読み込まれた設定に基づいて初期化処理を実行
			await Promise.all([
				initI18n(settings.locale),
				initTheme(settings.themeMode)
			]);
			
			console.log('App startup: Initialized successfully with locale:', settings.locale, 'theme:', settings.themeMode);
		} catch (error) {
			console.error('App startup: Failed to initialize app:', error);
			// エラー時のフォールバック処理
			await Promise.all([
				initI18n('en'), // 英語にフォールバック
				initTheme('system') // システムテーマにフォールバック
			]);
		}
	});
</script>

<svelte:head>
	<meta name="viewport" content="width=device-width, initial-scale=1.0, maximum-scale=1.0, minimum-scale=1.0, user-scalable=no, viewport-fit=cover">
</svelte:head>

<!-- ヘッダー -->
<Header onDrawerToggle={toggleDrawer} />

<!-- ドロワー -->
<Drawer {isDrawerOpen} onclose={closeDrawer} />

<!-- メインコンテンツ -->
<div class="min-h-screen flex flex-col">
	<!-- ヘッダー分のスペース（システムバー + ヘッダーコンテンツ） -->
	<div class="flex-shrink-0" style="height: calc(var(--safe-area-inset-top, 0px) + 4rem);"></div>
	
	<!-- ページコンテンツ -->
	<main class="flex-1 relative">
		{@render children()}
	</main>
	
	<!-- ボトムナビゲーション分のスペース -->
	<div class="flex-shrink-0" style="height: calc(var(--safe-area-inset-bottom, 0px) + {$isAuthenticated && !['/login', '/settings'].includes($page.url.pathname) ? '4rem' : '0px'});"></div>
</div>

<!-- ボトムナビゲーション（認証済みかつメインページでのみ表示） -->
{#if $isAuthenticated && !['/login', '/settings'].includes($page.url.pathname)}
	<BottomNavigation />
{/if}

<DebugPanel />