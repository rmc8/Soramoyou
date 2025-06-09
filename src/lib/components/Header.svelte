<script lang="ts">
	import { MessageSquare, User } from 'lucide-svelte';
	import { currentUser } from '$lib/auth/bluesky';
	import { isAuthenticated } from '$lib/stores/auth';
	import { t } from '$lib/i18n';
	import { browser } from '$app/environment';

	interface Props {
		onDrawerToggle?: () => void;
	}

	let { onDrawerToggle }: Props = $props();

	// スクロール状態管理
	let isHeaderVisible = $state(true);
	let lastScrollY = $state(0);
	let scrollTimeout = $state<NodeJS.Timeout | null>(null);

	function openDrawer() {
		onDrawerToggle?.();
	}

	// スクロール検知とヘッダー表示制御
	function handleScroll() {
		if (!browser) return;

		const currentScrollY = window.scrollY;
		const scrollThreshold = 100; // スクロール感度調整

		// スクロール方向を判定
		if (currentScrollY <= 0) {
			// 一番上の場合は常に表示
			isHeaderVisible = true;
		} else if (currentScrollY < lastScrollY) {
			// 上にスクロール（戻る方向）
			isHeaderVisible = true;
		} else if (currentScrollY > lastScrollY && currentScrollY > scrollThreshold) {
			// 下にスクロール（進む方向）かつ閾値を超えた場合
			isHeaderVisible = false;
		}

		lastScrollY = currentScrollY;

		// デバウンス処理：スクロール停止時に表示
		if (scrollTimeout) {
			clearTimeout(scrollTimeout);
		}
		scrollTimeout = setTimeout(() => {
			if (currentScrollY > 0) {
				isHeaderVisible = true;
			}
		}, 1000); // 1秒間スクロールが止まったら表示
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

	// ユーザーアバターのフォールバック関数
	function getAvatarUrl(user: any): string {
		if (user?.avatar) {
			return user.avatar;
		}
		// デフォルトアバター
		return `https://via.placeholder.com/40x40/6366f1/ffffff?text=${user?.displayName?.charAt(0) || 'U'}`;
	}

	function getUserName(user: any): string {
		return user?.displayName || user?.handle || $t('user.defaultName');
	}
</script>

<header 
	class="fixed left-0 right-0 z-50 bg-background/95 backdrop-blur-sm border-b transition-transform duration-300 ease-in-out {isHeaderVisible ? 'translate-y-0' : '-translate-y-full'}" 
	style="top: 0; padding-top: var(--safe-area-inset-top, 0px);"
>
	<div class="flex items-center justify-between px-4 py-3">
		<!-- 左側: ユーザーアバター -->
		<button
			type="button"
			class="flex items-center justify-center w-8 h-8 rounded-full overflow-hidden ring-1 ring-input hover:ring-ring transition-all duration-200 active:scale-95"
			onclick={openDrawer}
		>
			{#if $isAuthenticated && $currentUser}
				<img
					src={getAvatarUrl($currentUser)}
					alt={getUserName($currentUser)}
					class="w-full h-full object-cover"
					loading="lazy"
				/>
			{:else}
				<div class="w-full h-full bg-muted flex items-center justify-center">
					<User class="w-4 h-4 text-muted-foreground" />
				</div>
			{/if}
		</button>

		<!-- 中央: ロゴ -->
		<div class="flex items-center">
			<img
				src="/logo/SoramoyouLogoSmall.png"
				alt="Soramoyou"
				class="h-8 w-auto"
				loading="lazy"
			/>
		</div>

		<!-- 右側: DMアイコン -->
		<button
			type="button"
			class="flex items-center justify-center w-10 h-10 rounded-full bg-primary/10 hover:bg-primary/20 transition-colors duration-200 active:scale-95"
		>
			<MessageSquare class="w-5 h-5 text-primary" />
		</button>
	</div>
</header>