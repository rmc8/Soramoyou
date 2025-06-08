<script lang="ts">
  import { createEventDispatcher } from 'svelte';
  import { t } from '$lib/i18n';
  import { loginWithCredentials, sessionError, type LoginCredentials } from '$lib/auth/bluesky';
  import Button from '$lib/components/ui/button/button.svelte';
  import Input from '$lib/components/ui/input/input.svelte';
  import Label from '$lib/components/ui/label/label.svelte';
  import Select from '$lib/components/ui/select/select.svelte';
  import Alert from '$lib/components/ui/alert/alert.svelte';
  import { Card, CardHeader, CardContent } from '$lib/components/ui/card';
  import Loader from '$lib/components/ui/loader.svelte';
  import EyeIcon from '$lib/components/ui/icons.svelte';
  import EyeOffIcon from '$lib/components/ui/eye-off-icon.svelte';
  
  const dispatch = createEventDispatcher<{
    loginSuccess: void;
  }>();

  let isLoading = $state(false);
  let server = $state('https://bsky.social');
  let handle = $state('');
  let appPassword = $state('');
  let showPassword = $state(false);
  let localError = $state<string | null>(null);

  const predefinedServers = [
    { value: 'https://bsky.social', label: 'Bluesky Social (bsky.social)' },
    { value: 'https://staging.bsky.dev', label: 'Bluesky Staging (staging.bsky.dev)' }
  ];

  const validateForm = (): boolean => {
    localError = null;
    
    if (!server.trim()) {
      localError = $t('login.error.serverRequired');
      return false;
    }
    
    if (!handle.trim()) {
      localError = $t('login.error.handleRequired');
      return false;
    }
    
    if (!appPassword.trim()) {
      localError = $t('login.error.passwordRequired');
      return false;
    }
    
    // Validate server URL format
    try {
      new URL(server);
    } catch {
      localError = $t('login.error.invalidServer');
      return false;
    }
    
    return true;
  };

  const handleLogin = async () => {
    console.log('🎯 Login button clicked');
    
    if (!validateForm()) {
      console.log('❌ Form validation failed');
      return;
    }

    console.log('🚀 Starting login process...');
    isLoading = true;
    localError = null;

    try {
      const credentials: LoginCredentials = {
        server: server.trim(),
        handle: handle.trim(),
        appPassword: appPassword.trim()
      };

      console.log('📝 Login credentials prepared:', {
        server: credentials.server,
        handle: credentials.handle,
        passwordLength: credentials.appPassword.length
      });

      const success = await loginWithCredentials(credentials);
      
      if (success) {
        console.log('🎉 Login successful, dispatching success event');
        dispatch('loginSuccess');
      } else {
        console.log('❌ Login failed');
        localError = $sessionError || $t('login.error.unknown');
      }
    } catch (error: any) {
      console.error('💥 Login error in component:', error);
      localError = error.message || $t('login.error.unknown');
    } finally {
      isLoading = false;
      console.log('🏁 Login process completed');
    }
  };

  const handleKeyDown = (event: KeyboardEvent) => {
    if (event.key === 'Enter' && !isLoading) {
      handleLogin();
    }
  };

  const togglePasswordVisibility = () => {
    showPassword = !showPassword;
  };

  // Clear local error when session error changes
  $effect(() => {
    if ($sessionError) {
      localError = $sessionError;
    }
  });
</script>

<div class="w-full max-w-md mx-auto">
  <Card class="shadow-lg">
    <CardHeader class="text-center space-y-2">
      <h1 class="text-2xl font-bold text-foreground">{$t('login.title')}</h1>
      <p class="text-sm text-muted-foreground">{$t('login.subtitle')}</p>
    </CardHeader>

    <CardContent class="space-y-6">
      <form class="space-y-4" onsubmit={handleLogin}>
        <!-- Server Selection -->
        <div class="space-y-2">
          <Label for="server">{$t('login.server')}</Label>
          <Select
            id="server"
            bind:value={server}
            disabled={isLoading}
            onkeydown={handleKeyDown}
          >
            {#each predefinedServers as serverOption}
              <option value={serverOption.value}>
                {serverOption.label}
              </option>
            {/each}
          </Select>
          <Input
            type="url"
            bind:value={server}
            disabled={isLoading}
            placeholder={$t('login.serverPlaceholder')}
            class="mt-2 font-mono text-xs"
            onkeydown={handleKeyDown}
          />
        </div>

        <!-- Handle Input -->
        <div class="space-y-2">
          <Label for="handle">{$t('login.handle')}</Label>
          <Input
            id="handle"
            type="text"
            bind:value={handle}
            disabled={isLoading}
            placeholder={$t('login.handlePlaceholder')}
            autocomplete="username"
            onkeydown={handleKeyDown}
          />
        </div>

        <!-- App Password Input -->
        <div class="space-y-2">
          <Label for="appPassword">{$t('login.appPassword')}</Label>
          <div class="relative">
            <Input
              id="appPassword"
              type={showPassword ? 'text' : 'password'}
              bind:value={appPassword}
              disabled={isLoading}
              placeholder={$t('login.appPasswordPlaceholder')}
              autocomplete="current-password"
              class="pr-10"
              onkeydown={handleKeyDown}
            />
            <button
              type="button"
              class="absolute inset-y-0 right-0 flex items-center px-3 text-muted-foreground hover:text-foreground transition-colors"
              onclick={togglePasswordVisibility}
              disabled={isLoading}
              aria-label={showPassword ? $t('login.hidePassword') : $t('login.showPassword')}
            >
              {#if showPassword}
                <EyeOffIcon size={16} />
              {:else}
                <EyeIcon size={16} />
              {/if}
            </button>
          </div>
          <p class="text-xs text-muted-foreground">{$t('login.appPasswordHelp')}</p>
        </div>

        <!-- Error Display -->
        {#if localError}
          <Alert variant="destructive">
            <div class="flex items-center space-x-2">
              <svg class="h-4 w-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                <circle cx="12" cy="12" r="10"/>
                <line x1="15" y1="9" x2="9" y2="15"/>
                <line x1="9" y1="9" x2="15" y2="15"/>
              </svg>
              <span class="text-sm">{localError}</span>
            </div>
          </Alert>
        {/if}

        <!-- Submit Button -->
        <Button
          type="submit"
          disabled={isLoading}
          class="w-full"
          size="lg"
        >
          {#if isLoading}
            <Loader size="sm" class="mr-2" />
            {$t('login.signingIn')}
          {:else}
            {$t('login.signIn')}
          {/if}
        </Button>
      </form>

      <!-- Footer -->
      <div class="text-center space-y-2 pt-4 border-t">
        <p class="text-xs text-muted-foreground">{$t('login.info')}</p>
        <a
          href="https://bsky.app/settings/app-passwords"
          target="_blank"
          rel="noopener noreferrer"
          class="text-sm text-primary hover:underline transition-all"
        >
          {$t('login.createAppPassword')} →
        </a>
      </div>
    </CardContent>
  </Card>
</div>

