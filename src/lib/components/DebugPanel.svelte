<script lang="ts">
  import { onMount } from 'svelte';
  import { logger } from '$lib/utils/logger.js';
  import { Card } from '$lib/components/ui/card/index.js';
  import { Button } from '$lib/components/ui/button/index.js';
  import { Alert } from '$lib/components/ui/alert/index.js';
  import { dev } from '$app/environment';
  
  let isVisible = $state(false);
  let logs = $state<string[]>([]);
  let lastError = $state<string>('');
  let lastErrorTime = $state<string>('');
  
  function togglePanel() {
    isVisible = !isVisible;
    if (isVisible) {
      refreshLogs();
    }
  }
  
  function refreshLogs() {
    logs = logger.getLogs();
    
    // localStorage からエラー情報を取得
    try {
      const storedError = localStorage.getItem('lastError');
      const storedErrorTime = localStorage.getItem('lastErrorTime');
      
      if (storedError) {
        lastError = storedError;
        lastErrorTime = storedErrorTime || '';
      }
    } catch (e) {
      console.log('Failed to read from localStorage:', e);
    }
  }
  
  function clearLogs() {
    logger.clearLogs();
    localStorage.removeItem('lastError');
    localStorage.removeItem('lastErrorTime');
    refreshLogs();
  }
  
  onMount(() => {
    refreshLogs();
  });
</script>

<!-- デバッグボタン（開発環境でのみ表示） -->
{#if dev}
<button 
  class="fixed bottom-4 right-4 z-50 bg-red-500 text-white p-3 rounded-full shadow-lg"
  onclick={togglePanel}
>
  🐛
</button>
{/if}

<!-- デバッグパネル（開発環境でのみ表示） -->
{#if dev && isVisible}
  <div 
    class="fixed inset-0 z-40 bg-black bg-opacity-50" 
    role="dialog" 
    aria-modal="true"
    onclick={togglePanel}
    onkeydown={(e) => e.key === 'Escape' && togglePanel()}
    tabindex="-1"
  >
    <div 
      class="fixed bottom-0 left-0 right-0 bg-white dark:bg-gray-900 border-t border-gray-200 dark:border-gray-700 max-h-96 overflow-hidden" 
      onclick={(e) => e.stopPropagation()}
      onkeydown={(e) => e.stopPropagation()}
    >
      <Card class="m-0 rounded-none border-0 bg-transparent">
        <div class="p-4">
          <div class="flex justify-between items-center mb-4">
            <h3 class="text-lg font-semibold text-gray-900 dark:text-gray-100">デバッグパネル</h3>
            <div class="flex gap-2">
              <Button size="sm" variant="outline" onclick={refreshLogs}>
                更新
              </Button>
              <Button size="sm" variant="outline" onclick={clearLogs}>
                クリア
              </Button>
              <Button size="sm" variant="outline" onclick={togglePanel}>
                ✕
              </Button>
            </div>
          </div>
          
          <!-- 最新エラー表示 -->
          {#if lastError}
            <Alert class="mb-4 bg-red-50 dark:bg-red-950 border-red-200 dark:border-red-800">
              <div class="text-sm">
                <div class="font-semibold text-red-800 dark:text-red-200">最新エラー:</div>
                <div class="text-xs text-red-600 dark:text-red-400 mb-2">{lastErrorTime}</div>
                <pre class="whitespace-pre-wrap text-xs text-red-700 dark:text-red-300">{lastError}</pre>
              </div>
            </Alert>
          {/if}
          
          <!-- ログ一覧 -->
          <div class="max-h-64 overflow-y-auto bg-gray-50 dark:bg-gray-800 rounded-md p-3">
            <div class="text-sm font-semibold mb-2 text-gray-900 dark:text-gray-100">ログ履歴:</div>
            {#if logs.length === 0}
              <div class="text-gray-500 dark:text-gray-400 text-sm">ログがありません</div>
            {:else}
              {#each logs as log}
                <div class="text-xs border-b border-gray-200 dark:border-gray-600 py-1 font-mono text-gray-800 dark:text-gray-200">
                  {log}
                </div>
              {/each}
            {/if}
          </div>
        </div>
      </Card>
    </div>
  </div>
{/if}