<script lang="ts">
  import { cn } from "$lib/utils.js";
  import type { HTMLSelectAttributes } from "svelte/elements";

  type $$Props = HTMLSelectAttributes & {
    class?: string;
    value?: string;
  };

  let className: $$Props["class"] = undefined;
  export let value: $$Props["value"] = "";
  export { className as class };
</script>

<select
  class={cn(
    "flex h-10 w-full items-center justify-between rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50",
    className
  )}
  bind:value
  {...$$restProps}
>
  <slot />
</select>