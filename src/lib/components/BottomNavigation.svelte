<script lang="ts">
	import { Home, Hash, Search, Bell } from 'lucide-svelte';
	import { page } from '$app/stores';
	import { t } from '$lib/i18n';
	import { browser } from '$app/environment';

	// スクロール状態管理（ヘッダーと同期）
	let isNavigationVisible = $state(true);
	let lastScrollY = $state(0);
	let scrollTimeout = $state<NodeJS.Timeout | null>(null);

	// ナビゲーションアイテムの定義
	const navigationItems = $derived([
		{
			id: 'home',
			href: '/timeline',
			icon: Home,
			label: $t('nav.home')
		},
		{
			id: 'feed',
			href: '/feed',
			icon: Hash,
			label: $t('nav.feed')
		},
		{
			id: 'search',
			href: '/search',
			icon: Search,
			label: $t('nav.search')
		},
		{
			id: 'notifications',
			href: '/notifications',
			icon: Bell,
			label: $t('nav.notifications')
		}
	]);

	// 現在のパスに基づいてアクティブ状態を判定
	function isActive(href: string): boolean {
		return $page.url.pathname === href || 
			   ($page.url.pathname === '/' && href === '/timeline');
	}

	// スクロール検知とナビゲーション表示制御（ヘッダーと同じロジック）
	function handleScroll() {
		if (!browser) return;

		const currentScrollY = window.scrollY;
		const scrollThreshold = 100;

		// スクロール方向を判定
		if (currentScrollY <= 0) {
			// 一番上の場合は常に表示
			isNavigationVisible = true;
		} else if (currentScrollY < lastScrollY) {
			// 上にスクロール（戻る方向）
			isNavigationVisible = true;
		} else if (currentScrollY > lastScrollY && currentScrollY > scrollThreshold) {
			// 下にスクロール（進む方向）かつ閾値を超えた場合
			isNavigationVisible = false;
		}

		lastScrollY = currentScrollY;

		// デバウンス処理：スクロール停止時に表示
		if (scrollTimeout) {
			clearTimeout(scrollTimeout);
		}
		scrollTimeout = setTimeout(() => {
			if (currentScrollY > 0) {
				isNavigationVisible = true;
			}
		}, 1000);
	}

	// スクロールイベントの設定と解除
	$effect(() => {
		if (browser) {
			window.addEventListener('scroll', handleScroll, { passive: true });
			return () => {
				window.removeEventListener('scroll', handleScroll);
				if (scrollTimeout) {
					clearTimeout(scrollTimeout);
				}
			};
		}
	});
</script>

<nav 
	class="fixed bottom-0 left-0 right-0 z-50 bg-background/95 backdrop-blur-sm border-t transition-transform duration-300 ease-in-out {isNavigationVisible ? 'translate-y-0' : 'translate-y-full'}"
	style="padding-bottom: var(--safe-area-inset-bottom, 0px);"
>
	<div class="flex items-center justify-around px-2 py-2">
		{#each navigationItems as item (item.id)}
			{@const active = isActive(item.href)}
			<a
				href={item.href}
				class="flex flex-col items-center justify-center px-3 py-2 rounded-xl transition-all duration-200 min-w-0 flex-1 {active 
					? 'bg-primary/10 text-primary' 
					: 'text-muted-foreground hover:text-foreground hover:bg-muted/50'}"
				aria-label={item.label}
			>
				<svelte:component 
					this={item.icon} 
					class="w-5 h-5 mb-1 {active ? 'text-primary' : ''}" 
				/>
				<span class="text-xs font-medium truncate max-w-full">
					{item.label}
				</span>
			</a>
		{/each}
	</div>
</nav>