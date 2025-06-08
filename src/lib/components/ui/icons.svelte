<script lang="ts">
  import { cn } from "$lib/utils.js";

  type $$Props = {
    class?: string;
    size?: number;
  };

  let className: $$Props["class"] = undefined;
  export let size: $$Props["size"] = 16;
  export { className as class };
</script>

<!-- Eye Icon (show password) -->
<svg
  class={cn("text-current", className)}
  width={size}
  height={size}
  viewBox="0 0 24 24"
  fill="none"
  stroke="currentColor"
  stroke-width="2"
  stroke-linecap="round"
  stroke-linejoin="round"
  {...$$restProps}
>
  <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z" />
  <circle cx="12" cy="12" r="3" />
</svg>