<script lang="ts">
  import { tv, type VariantProps } from "tailwind-variants";
  import { cn } from "$lib/utils.js";

  const alertVariants = tv({
    base: "relative w-full rounded-lg border p-4 [&>svg~*]:pl-7 [&>svg+div]:translate-y-[-3px] [&>svg]:absolute [&>svg]:left-4 [&>svg]:top-4 [&>svg]:text-foreground",
    variants: {
      variant: {
        default: "bg-background text-foreground",
        destructive:
          "border-destructive/50 text-destructive dark:border-destructive [&>svg]:text-destructive",
      },
    },
    defaultVariants: {
      variant: "default",
    },
  });

  type $$Props = {
    class?: string;
    variant?: VariantProps<typeof alertVariants>["variant"];
  };

  let className: $$Props["class"] = undefined;
  export let variant: $$Props["variant"] = "default";
  export { className as class };
</script>

<div
  class={cn(alertVariants({ variant }), className)}
  role="alert"
  {...$$restProps}
>
  <slot />
</div>