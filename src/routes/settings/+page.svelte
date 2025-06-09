<script lang="ts">
	import { goto } from '$app/navigation';
	import { ArrowLeft, Check, ChevronRight, Languages, Palette, Sun, Moon, Monitor } from 'lucide-svelte';
	import { t, availableLocales, setLocale, locale, type Locale } from '$lib/i18n';
	import { themeMode, setThemeMode, type ThemeMode } from '$lib/theme';
	import { updateLocale, updateThemeMode } from '$lib/stores/settings';

	const themeOptions = $derived([
		{ value: 'light' as ThemeMode, icon: Sun, label: $t('theme.light') },
		{ value: 'dark' as ThemeMode, icon: Moon, label: $t('theme.dark') },
		{ value: 'system' as ThemeMode, icon: Monitor, label: $t('theme.system') }
	]);

	function goBack() {
		goto('/timeline');
	}

	async function handleThemeChange(selectedTheme: ThemeMode) {
		await setThemeMode(selectedTheme);
		await updateThemeMode(selectedTheme);
	}

	async function handleLanguageChange(selectedLocale: Locale) {
		await setLocale(selectedLocale);
		await updateLocale(selectedLocale);
	}
</script>

<svelte:head>
	<title>{$t('settings.title')} - {$t('app.name')}</title>
</svelte:head>

<div class="min-h-screen bg-background">
	<!-- ヘッダー -->
	<header class="sticky top-0 z-40 bg-background/95 backdrop-blur-sm border-b" style="padding-top: var(--safe-area-inset-top, 0px);">
		<div class="flex items-center px-4 py-3">
			<button
				type="button"
				class="flex items-center justify-center w-10 h-10 rounded-full hover:bg-muted transition-colors mr-3"
				onclick={goBack}
			>
				<ArrowLeft class="w-5 h-5" />
			</button>
			<h1 class="text-xl font-bold text-foreground">{$t('settings.title')}</h1>
		</div>
	</header>

	<!-- メインコンテンツ -->
	<main class="pb-8" style="padding-bottom: max(2rem, var(--safe-area-inset-bottom, 0px))">
		<div class="max-w-2xl mx-auto px-4 py-6 space-y-6">
			
			<!-- 外観設定 -->
			<section class="space-y-4">
				<h2 class="text-lg font-semibold text-foreground flex items-center">
					<Palette class="w-5 h-5 mr-2" />
					{$t('settings.appearance')}
				</h2>
				
				<!-- テーマ設定 -->
				<div class="bg-card rounded-xl border">
					<div class="p-4 border-b">
						<h3 class="font-medium text-card-foreground">{$t('settings.theme')}</h3>
					</div>
					<div class="p-4 space-y-2">
						{#each themeOptions as option}
							{@const isSelected = $themeMode === option.value}
							<button
								type="button"
								class="flex items-center justify-between w-full p-3 rounded-lg transition-colors {isSelected ? 'bg-primary text-primary-foreground' : 'hover:bg-muted'}"
								onclick={() => handleThemeChange(option.value)}
							>
								<div class="flex items-center space-x-3">
									<svelte:component this={option.icon} class="w-5 h-5" />
									<span class="font-medium">{option.label}</span>
								</div>
								{#if isSelected}
									<Check class="w-5 h-5" />
								{/if}
							</button>
						{/each}
					</div>
				</div>
			</section>

			<!-- 言語設定 -->
			<section class="space-y-4">
				<h2 class="text-lg font-semibold text-foreground flex items-center">
					<Languages class="w-5 h-5 mr-2" />
					{$t('settings.language')}
				</h2>
				
				<div class="bg-card rounded-xl border">
					<div class="p-4 border-b">
						<h3 class="font-medium text-card-foreground">{$t('settings.language')}</h3>
					</div>
					<div class="p-4 space-y-2">
						{#each Object.entries(availableLocales) as [localeKey, localeName]}
							{@const localeValue = localeKey as Locale}
							{@const isSelected = $locale === localeValue}
							<button
								type="button"
								class="flex items-center justify-between w-full p-3 rounded-lg transition-colors {isSelected ? 'bg-primary text-primary-foreground' : 'hover:bg-muted'}"
								onclick={() => handleLanguageChange(localeValue)}
							>
								<div class="flex items-center space-x-3">
									<div class="w-8 h-8 rounded-lg bg-muted flex items-center justify-center">
										<span class="text-sm font-bold">{localeValue === 'ja' ? 'あ' : localeValue === 'en' ? 'A' : localeValue === 'pt' ? 'Ã' : 'Ä'}</span>
									</div>
									<span class="font-medium">{localeName}</span>
								</div>
								{#if isSelected}
									<Check class="w-5 h-5" />
								{:else}
									<ChevronRight class="w-5 h-5 text-muted-foreground" />
								{/if}
							</button>
						{/each}
					</div>
				</div>
			</section>

		</div>
	</main>
</div>