<script lang="ts">
  import { onMount } from 'svelte';
  import { goto } from '$app/navigation';
  import { page } from '$app/stores';
  import { t } from '$lib/i18n';
  import { redirectIfAuthenticated, authInitialized, authLoading } from '$lib/stores/auth';
  import { sessionError } from '$lib/auth/bluesky';
  import LoginForm from '$lib/components/LoginForm.svelte';

  let mounted = $state(false);

  onMount(() => {
    mounted = true;
    
    // Redirect if already authenticated
    redirectIfAuthenticated();
  });

  const handleLoginSuccess = () => {
    goto('/', { replaceState: true });
  };

  // Check for session expired error in URL params
  $effect(() => {
    if (mounted && $page.url.searchParams.get('error') === 'session_expired') {
      sessionError.set('セッションの有効期限が切れました。再度ログインしてください。');
    }
  });
</script>

<svelte:head>
  <title>{$t('login.title')} - {$t('app.name')}</title>
</svelte:head>

<div class="login-page">
  {#if $authLoading}
    <div class="loading-container">
      <div class="loading-spinner"></div>
      <p>{$t('common.loading')}</p>
    </div>
  {:else}
    <main class="login-main">
      <div class="login-container">
        <LoginForm on:loginSuccess={handleLoginSuccess} />
      </div>
    </main>
  {/if}
</div>

<style>
  .login-page {
    min-height: 100vh;
    display: flex;
    align-items: center;
    justify-content: center;
    background: hsl(var(--background));
    padding: 1rem;
  }

  .loading-container {
    display: flex;
    flex-direction: column;
    align-items: center;
    gap: 1rem;
    color: hsl(var(--muted-foreground));
  }

  .loading-spinner {
    width: 2rem;
    height: 2rem;
    border: 2px solid hsl(var(--border));
    border-top: 2px solid hsl(var(--primary));
    border-radius: 50%;
    animation: spin 1s linear infinite;
  }

  @keyframes spin {
    to {
      transform: rotate(360deg);
    }
  }

  .login-main {
    width: 100%;
    max-width: 400px;
  }

  .login-container {
    width: 100%;
  }

  @media (max-width: 640px) {
    .login-page {
      padding: 0.5rem;
    }
  }
</style>