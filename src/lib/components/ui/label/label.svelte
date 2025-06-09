<script lang="ts">
  import { tv, type VariantProps } from "tailwind-variants";
  import type { HTMLLabelAttributes } from "svelte/elements";
  import { cn } from "$lib/utils.js";

  const labelVariants = tv({
    base: "text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
  });

  type $$Props = HTMLLabelAttributes & 
    VariantProps<typeof labelVariants> & {
      class?: string;
    };

  let className: $$Props["class"] = undefined;
  export { className as class };
</script>

<label
  class={cn(labelVariants(), className)}
  {...$$restProps}
>
  <slot />
</label>