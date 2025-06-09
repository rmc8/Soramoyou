<script lang="ts">
	import { Home, Settings, User, LogOut, X } from 'lucide-svelte';
	import { resolvedTheme } from '$lib/theme';
	import { t } from '$lib/i18n';
	import { currentUser } from '$lib/auth/bluesky';
	import { isAuthenticated } from '$lib/stores/auth';
	
	// テーマに基づく動的クラス
	const isDark = $derived($resolvedTheme === 'dark');
	
	// アニメーション制御
	let showContent = $state(false);
	
	$effect(() => {
		if (isDrawerOpen) {
			// ドロワーが開く時は少し遅延してコンテンツを表示
			setTimeout(() => {
				showContent = true;
			}, 150);
		} else {
			// ドロワーが閉じる時は即座にコンテンツを非表示
			showContent = false;
		}
	});

	interface Props {
		isDrawerOpen: boolean;
		onclose?: () => void;
	}

	let { isDrawerOpen = false, onclose }: Props = $props();

	function closeDrawer() {
		onclose?.();
	}

	function handleOverlayClick(event: MouseEvent) {
		if (event.target === event.currentTarget) {
			closeDrawer();
		}
	}

	// ユーザー情報取得関数
	function getAvatarUrl(user: any): string {
		if (user?.avatar) {
			return user.avatar;
		}
		return `https://via.placeholder.com/60x60/6366f1/ffffff?text=${user?.displayName?.charAt(0) || 'U'}`;
	}

	function getUserName(user: any): string {
		return user?.displayName || $t('user.defaultName');
	}

	function getUserHandle(user: any): string {
		return user?.handle ? `@${user.handle}` : '@username';
	}

	const menuItems = $derived([
		{ icon: Home, label: $t('nav.home'), href: '/' },
		{ icon: User, label: $t('nav.profile'), href: '/profile' },
		{ icon: Settings, label: $t('nav.settings'), href: '/settings' }
	]);

</script>

<style>
	@keyframes overlayFadeIn {
		from {
			opacity: 0;
			backdrop-filter: blur(0px);
		}
		to {
			opacity: 1;
			backdrop-filter: blur(4px);
		}
	}

	@keyframes drawerSlideIn {
		from {
			transform: translateX(-100%);
			opacity: 0;
		}
		to {
			transform: translateX(0);
			opacity: 1;
		}
	}

	@keyframes contentSlideIn {
		from {
			opacity: 0;
			transform: translateX(-20px);
		}
		to {
			opacity: 1;
			transform: translateX(0);
		}
	}

	.overlay-enter {
		animation: overlayFadeIn 0.3s cubic-bezier(0.4, 0, 0.2, 1) forwards;
	}

	.drawer-enter {
		animation: drawerSlideIn 0.3s cubic-bezier(0.4, 0, 0.2, 1) forwards;
	}

	.content-visible .content-item-1 {
		animation: contentSlideIn 0.4s ease-out 0.1s forwards;
		opacity: 0;
	}

	.content-visible .content-item-2 {
		animation: contentSlideIn 0.4s ease-out 0.2s forwards;
		opacity: 0;
	}

	.content-visible .content-item-3 {
		animation: contentSlideIn 0.4s ease-out 0.3s forwards;
		opacity: 0;
	}

	.content-visible .content-item-4 {
		animation: contentSlideIn 0.4s ease-out 0.4s forwards;
		opacity: 0;
	}
</style>

<!-- オーバーレイ -->
{#if isDrawerOpen}
	<div
		class="fixed inset-0 z-50 bg-black/50 overlay-enter"
		onclick={handleOverlayClick}
		role="button"
		tabindex="-1"
	>
		<!-- ドロワー本体 -->
		<div
			class="fixed left-0 top-0 h-full w-80 max-w-[85vw] shadow-2xl safe-area-top drawer-enter {isDark ? 'bg-gray-900' : 'bg-white'} {showContent ? 'content-visible' : ''}"
		>
			<!-- ヘッダー -->
			<div class="flex items-center justify-between p-6 pb-4 animate-slide-in">
				<h2 class="{isDark ? 'text-white' : 'text-gray-900'} text-xl font-bold">{$t('drawer.menu')}</h2>
				<button
					type="button"
					class="p-2 rounded-full transition-colors {isDark ? 'hover:bg-gray-800 text-gray-400 hover:text-white' : 'hover:bg-gray-100 text-gray-600 hover:text-gray-800'}"
					onclick={closeDrawer}
				>
					<X class="w-5 h-5" />
				</button>
			</div>

			<!-- ユーザー情報 -->
			<div class="px-6 pb-6 animate-slide-in-delay-1">
				{#if $isAuthenticated && $currentUser}
					<div class="rounded-xl p-4 flex items-center space-x-3 {isDark ? 'bg-gray-800' : 'bg-gray-50'}">
						<img
							src={getAvatarUrl($currentUser)}
							alt={getUserName($currentUser)}
							class="w-12 h-12 rounded-full"
							loading="lazy"
						/>
						<div class="flex-1 min-w-0">
							<h3 class="font-semibold truncate {isDark ? 'text-white' : 'text-gray-900'}">{getUserName($currentUser)}</h3>
							<p class="text-sm truncate {isDark ? 'text-gray-300' : 'text-gray-600'}">{getUserHandle($currentUser)}</p>
						</div>
					</div>
				{:else}
					<div class="rounded-xl p-4 flex items-center space-x-3 {isDark ? 'bg-gray-800' : 'bg-gray-50'}">
						<div class="w-12 h-12 rounded-full flex items-center justify-center {isDark ? 'bg-gray-700' : 'bg-gray-200'}">
							<User class="w-6 h-6 {isDark ? 'text-gray-400' : 'text-gray-500'}" />
						</div>
						<div>
							<h3 class="font-semibold {isDark ? 'text-white' : 'text-gray-900'}">{$t('auth.notLoggedIn')}</h3>
							<p class="text-sm {isDark ? 'text-gray-300' : 'text-gray-600'}">{$t('auth.pleaseLogin')}</p>
						</div>
					</div>
				{/if}
			</div>

			<!-- メニューアイテム -->
			<nav class="px-6 pb-6 animate-slide-in-delay-2">
				<div class="space-y-2">
					{#each menuItems as item}
						<a
							href={item.href}
							class="flex items-center space-x-3 px-4 py-3 rounded-xl transition-all duration-200 font-medium {isDark ? 'hover:bg-gray-800 text-gray-200 hover:text-orange-400' : 'hover:bg-gray-100 text-gray-800 hover:text-blue-600'}"
							onclick={closeDrawer}
						>
							<svelte:component this={item.icon} class="w-5 h-5" />
							<span>{item.label}</span>
						</a>
					{/each}
				</div>
			</nav>

			<!-- ログアウト -->
			<div class="px-6 pb-6 animate-slide-in-delay-3">
				<button
					type="button"
					class="flex items-center space-x-3 w-full px-4 py-3 rounded-xl transition-colors font-medium {isDark ? 'hover:bg-red-900/20 text-red-400 hover:text-red-300' : 'hover:bg-red-50 text-red-600 hover:text-red-700'}"
				>
					<LogOut class="w-5 h-5" />
					<span>{$t('auth.logout')}</span>
				</button>
			</div>
		</div>
	</div>
{/if}