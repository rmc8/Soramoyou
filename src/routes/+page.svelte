<script lang="ts">
  import { invoke } from "@tauri-apps/api/core";
  import { t } from '$lib/i18n';
  import SettingsPanel from '$lib/components/SettingsPanel.svelte';
  import Button from '$lib/components/ui/button/button.svelte';

  let name = $state("");
  let greetMsg = $state("");
  let showSettings = $state(false);

  async function greet(event: Event) {
    event.preventDefault();
    greetMsg = await invoke("greet", { name });
  }
</script>

<main class="container">
  <div class="header">
    <h1>{$t('app.title')}</h1>
    <Button 
      variant="outline" 
      size="sm"
      on:click={() => showSettings = !showSettings}
    >
      {$t('settings.title')}
    </Button>
  </div>

  {#if showSettings}
    <div class="settings-container">
      <SettingsPanel />
    </div>
  {:else}
    <div class="main-content">
      <div class="row">
        <a href="https://vite.dev" target="_blank">
          <img src="/vite.svg" class="logo vite" alt="Vite Logo" />
        </a>
        <a href="https://tauri.app" target="_blank">
          <img src="/tauri.svg" class="logo tauri" alt="Tauri Logo" />
        </a>
        <a href="https://svelte.dev" target="_blank">
          <img src="/svelte.svg" class="logo svelte-kit" alt="SvelteKit Logo" />
        </a>
      </div>
      <p>Click on the Tauri, Vite, and SvelteKit logos to learn more.</p>

      <form class="row" onsubmit={greet}>
        <input id="greet-input" placeholder="Enter a name..." bind:value={name} />
        <button type="submit">{$t('common.ok')}</button>
      </form>
      <p>{greetMsg}</p>
    </div>
  {/if}
</main>

<style>
.container {
  min-height: 100vh;
  padding: 2rem;
  display: flex;
  flex-direction: column;
}

.header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 2rem;
}

.header h1 {
  margin: 0;
  font-size: 2rem;
  font-weight: bold;
}

.settings-container {
  flex: 1;
}

.main-content {
  flex: 1;
  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: center;
  text-align: center;
}

.logo {
  height: 6em;
  padding: 1.5em;
  will-change: filter;
  transition: 0.75s;
}

.logo.vite:hover {
  filter: drop-shadow(0 0 2em #747bff);
}

.logo.svelte-kit:hover {
  filter: drop-shadow(0 0 2em #ff3e00);
}

.logo.tauri:hover {
  filter: drop-shadow(0 0 2em #24c8db);
}

.row {
  display: flex;
  justify-content: center;
  gap: 1rem;
  margin: 1rem 0;
}

form.row {
  align-items: center;
}

a {
  font-weight: 500;
  color: hsl(var(--primary));
  text-decoration: inherit;
}

a:hover {
  color: hsl(var(--primary) / 0.8);
}

input,
button:not(.ui-button) {
  border-radius: 8px;
  border: 1px solid hsl(var(--border));
  padding: 0.6em 1.2em;
  font-size: 1em;
  font-weight: 500;
  font-family: inherit;
  color: hsl(var(--foreground));
  background-color: hsl(var(--background));
  transition: border-color 0.25s;
  box-shadow: 0 2px 2px rgba(0, 0, 0, 0.1);
}

button:not(.ui-button) {
  cursor: pointer;
  background-color: hsl(var(--primary));
  color: hsl(var(--primary-foreground));
  border-color: hsl(var(--primary));
}

button:not(.ui-button):hover {
  opacity: 0.9;
}

button:not(.ui-button):active {
  opacity: 0.8;
}

input:focus,
button:not(.ui-button):focus {
  outline: 2px solid hsl(var(--ring));
  outline-offset: 2px;
}

#greet-input {
  margin-right: 0.5rem;
}

p {
  color: hsl(var(--muted-foreground));
  margin: 1rem 0;
}
</style>
