<script lang="ts">
	import { Home, Settings, User, LogOut, Moon, Sun, Monitor, X } from 'lucide-svelte';
	import { createEventDispatcher } from 'svelte';
	import { resolvedTheme } from '$lib/theme';
	import { setThemeMode } from '$lib/theme';
	import { t } from '$lib/i18n';
	import { currentSession } from '$lib/auth/bluesky';
	import { isAuthenticated } from '$lib/stores/auth';

	interface Props {
		isOpen: boolean;
	}

	let { isOpen = false }: Props = $props();

	const dispatch = createEventDispatcher();

	function closeDrawer() {
		dispatch('close');
	}

	function handleOverlayClick(event: MouseEvent) {
		if (event.target === event.currentTarget) {
			closeDrawer();
		}
	}

	// ユーザー情報取得関数
	function getAvatarUrl(session: any): string {
		if (session?.profile?.avatar) {
			return session.profile.avatar;
		}
		return `https://via.placeholder.com/60x60/6366f1/ffffff?text=${session?.profile?.displayName?.charAt(0) || 'U'}`;
	}

	function getUserName(session: any): string {
		return session?.profile?.displayName || 'ユーザー';
	}

	function getUserHandle(session: any): string {
		return session?.profile?.handle ? `@${session.profile.handle}` : '@username';
	}

	const menuItems = [
		{ icon: Home, label: 'ホーム', href: '/' },
		{ icon: User, label: 'プロフィール', href: '/profile' },
		{ icon: Settings, label: '設定', href: '/settings' }
	];

	const themeOptions = [
		{ value: 'light', icon: Sun, label: 'ライト' },
		{ value: 'dark', icon: Moon, label: 'ダーク' },
		{ value: 'system', icon: Monitor, label: 'システム' }
	];
</script>

<!-- オーバーレイ -->
{#if isOpen}
	<div
		class="fixed inset-0 z-50 bg-black/50 backdrop-blur-sm"
		onclick={handleOverlayClick}
		role="button"
		tabindex="-1"
	>
		<!-- ドロワー本体 -->
		<div
			class="fixed left-0 top-0 h-full w-80 max-w-[85vw] bg-background border-r transform transition-transform duration-300 ease-out safe-area-top"
			class:translate-x-0={isOpen}
			class:-translate-x-full={!isOpen}
		>
			<!-- ヘッダー -->
			<div class="flex items-center justify-between p-4 border-b">
				<h2 class="text-lg font-semibold">メニュー</h2>
				<button
					type="button"
					class="p-2 rounded-full hover:bg-muted transition-colors"
					onclick={closeDrawer}
				>
					<X class="w-5 h-5" />
				</button>
			</div>

			<!-- ユーザー情報 -->
			<div class="p-4 border-b">
				{#if $isAuthenticated && $currentSession}
					<div class="flex items-center space-x-3">
						<img
							src={getAvatarUrl($currentSession)}
							alt={getUserName($currentSession)}
							class="w-12 h-12 rounded-full ring-2 ring-primary/20"
							loading="lazy"
						/>
						<div>
							<h3 class="font-medium">{getUserName($currentSession)}</h3>
							<p class="text-sm text-muted-foreground">{getUserHandle($currentSession)}</p>
						</div>
					</div>
				{:else}
					<div class="flex items-center space-x-3">
						<div class="w-12 h-12 rounded-full bg-primary/20 flex items-center justify-center">
							<User class="w-6 h-6 text-primary" />
						</div>
						<div>
							<h3 class="font-medium">未ログイン</h3>
							<p class="text-sm text-muted-foreground">ログインしてください</p>
						</div>
					</div>
				{/if}
			</div>

			<!-- メニューアイテム -->
			<nav class="p-2">
				{#each menuItems as item}
					<a
						href={item.href}
						class="flex items-center space-x-3 px-3 py-3 rounded-lg hover:bg-muted transition-colors"
						onclick={closeDrawer}
					>
						<svelte:component this={item.icon} class="w-5 h-5" />
						<span>{item.label}</span>
					</a>
				{/each}
			</nav>

			<!-- テーマ切り替え -->
			<div class="p-4 border-t mt-auto">
				<h4 class="text-sm font-medium mb-3">テーマ</h4>
				<div class="space-y-1">
					{#each themeOptions as option}
						<button
							type="button"
							class="flex items-center space-x-3 w-full px-3 py-2 rounded-lg hover:bg-muted transition-colors {($resolvedTheme === option.value || (option.value === 'system' && !['light', 'dark'].includes($resolvedTheme))) ? 'bg-primary/10' : ''}"
							onclick={() => setThemeMode(option.value)}
						>
							<svelte:component this={option.icon} class="w-4 h-4" />
							<span class="text-sm">{option.label}</span>
						</button>
					{/each}
				</div>
			</div>

			<!-- ログアウト -->
			<div class="p-4 border-t">
				<button
					type="button"
					class="flex items-center space-x-3 w-full px-3 py-3 rounded-lg hover:bg-destructive/10 text-destructive transition-colors"
				>
					<LogOut class="w-5 h-5" />
					<span>ログアウト</span>
				</button>
			</div>
		</div>
	</div>
{/if}