<script lang="ts">
  import { onMount } from 'svelte';
  import { t } from '$lib/i18n';
  import { requireAuth, authLoading } from '$lib/stores/auth';
  import { currentUser, currentSession, logout } from '$lib/auth/bluesky';
  import Button from '$lib/components/ui/button/button.svelte';

  onMount(() => {
    requireAuth();
  });

  const handleLogout = async () => {
    await logout();
  };
</script>

<svelte:head>
  <title>Timeline - {$t('app.name')}</title>
</svelte:head>

<div class="timeline-page">
  {#if $authLoading}
    <div class="loading-container">
      <div class="loading-spinner"></div>
      <p>{$t('common.loading')}</p>
    </div>
  {:else if $currentUser}
    <header class="timeline-header">
      <div class="user-info">
        {#if $currentUser.avatar}
          <img 
            src={$currentUser.avatar} 
            alt={$currentUser.displayName || $currentUser.handle}
            class="avatar"
          />
        {/if}
        <div class="user-details">
          <h1 class="display-name">
            {$currentUser.displayName || $currentUser.handle}
          </h1>
          <p class="handle">@{$currentUser.handle}</p>
        </div>
      </div>
      <Button variant="outline" on:click={handleLogout}>
        ログアウト
      </Button>
    </header>

    <main class="timeline-main">
      <div class="timeline-content">
        <h2>Timeline</h2>
        <p>タイムライン機能は実装予定です。</p>
        
        {#if $currentSession}
          <div class="session-info">
            <h3>セッション情報</h3>
            <p><strong>Handle:</strong> {$currentSession.handle}</p>
            <p><strong>DID:</strong> {$currentSession.did}</p>
            <p><strong>Status:</strong> {$currentSession.active ? 'Active' : 'Inactive'}</p>
          </div>
        {/if}
      </div>
    </main>
  {/if}
</div>

<style>
  .timeline-page {
    min-height: 100vh;
    background: hsl(var(--background));
  }

  .loading-container {
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    min-height: 100vh;
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

  .timeline-header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    padding: 1rem 2rem;
    border-bottom: 1px solid hsl(var(--border));
    background: hsl(var(--card));
  }

  .user-info {
    display: flex;
    align-items: center;
    gap: 0.75rem;
  }

  .avatar {
    width: 3rem;
    height: 3rem;
    border-radius: 50%;
    object-fit: cover;
    border: 2px solid hsl(var(--border));
  }

  .user-details {
    display: flex;
    flex-direction: column;
  }

  .display-name {
    font-size: 1.125rem;
    font-weight: 600;
    color: hsl(var(--foreground));
    margin: 0;
  }

  .handle {
    font-size: 0.875rem;
    color: hsl(var(--muted-foreground));
    margin: 0;
  }

  .timeline-main {
    padding: 2rem;
  }

  .timeline-content {
    max-width: 600px;
    margin: 0 auto;
  }

  .timeline-content h2 {
    font-size: 1.5rem;
    font-weight: 700;
    color: hsl(var(--foreground));
    margin-bottom: 1rem;
  }

  .session-info {
    margin-top: 2rem;
    padding: 1rem;
    border: 1px solid hsl(var(--border));
    border-radius: 0.5rem;
    background: hsl(var(--card));
  }

  .session-info h3 {
    font-size: 1.125rem;
    font-weight: 600;
    color: hsl(var(--foreground));
    margin-bottom: 0.5rem;
  }

  .session-info p {
    font-size: 0.875rem;
    color: hsl(var(--muted-foreground));
    margin: 0.25rem 0;
  }

  @media (max-width: 640px) {
    .timeline-header {
      padding: 1rem;
      flex-direction: column;
      gap: 1rem;
      align-items: stretch;
    }

    .user-info {
      justify-content: center;
    }

    .timeline-main {
      padding: 1rem;
    }
  }
</style>