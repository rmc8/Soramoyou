<script lang="ts">
	import { Menu, MessageSquare, User } from 'lucide-svelte';
	import { currentUser } from '$lib/auth/bluesky';
	import { isAuthenticated } from '$lib/stores/auth';
	import { t } from '$lib/i18n';

	interface Props {
		onDrawerToggle?: () => void;
	}

	let { onDrawerToggle }: Props = $props();

	function openDrawer() {
		onDrawerToggle?.();
	}

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

<header class="fixed left-0 right-0 top-0 z-50 bg-background/95 backdrop-blur-sm border-b" style="padding-top: var(--safe-area-inset-top, 0px);">
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