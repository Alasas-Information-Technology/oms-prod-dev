import * as React from "react";
import { Slot } from "@radix-ui/react-slot";
import { cva, type VariantProps } from "class-variance-authority";
import { X } from "lucide-react";

import { cn } from "./utils";

const badgeVariants = cva(
  "inline-flex items-center justify-center rounded-full border px-3 py-1 text-xs font-semibold w-fit whitespace-nowrap shrink-0 [&>svg]:size-3 gap-1.5 [&>svg]:pointer-events-none focus-visible:border-ring focus-visible:ring-ring/20 focus-visible:ring-[4px] aria-invalid:ring-destructive/20 dark:aria-invalid:ring-destructive/40 aria-invalid:border-destructive transition-[color,box-shadow,background-color] duration-300 ease-out overflow-hidden",
  {
    variants: {
      // v3 spec: tone-based variants
      tone: {
        neutral:
          "border-transparent bg-muted text-muted-foreground [a&]:hover:bg-muted/80",
        accent:
          "border-transparent bg-primary/10 text-primary [a&]:hover:bg-primary/20 dark:bg-primary/20 dark:text-primary-foreground",
        success:
          "border-transparent bg-emerald-500/10 text-emerald-700 dark:text-emerald-400 [a&]:hover:bg-emerald-500/20",
        warning:
          "border-transparent bg-amber-500/10 text-amber-700 dark:text-amber-400 [a&]:hover:bg-amber-500/20",
        danger:
          "border-transparent bg-destructive/10 text-destructive [a&]:hover:bg-destructive/20 dark:bg-destructive/20 dark:text-destructive-foreground",
        bronze:
          "border-transparent bg-orange-800/10 text-orange-800 dark:text-orange-300 [a&]:hover:bg-orange-800/20",
      },
      // Backward compat: old variant prop
      variant: {
        default:
          "border-transparent bg-primary/10 text-primary [a&]:hover:bg-primary/20 dark:bg-primary/20 dark:text-primary-foreground",
        secondary:
          "border-transparent bg-secondary text-secondary-foreground [a&]:hover:bg-secondary/80",
        destructive:
          "border-transparent bg-destructive/10 text-destructive [a&]:hover:bg-destructive/20 dark:bg-destructive/20 dark:text-destructive-foreground",
        outline:
          "text-foreground border-border [a&]:hover:bg-accent [a&]:hover:text-accent-foreground",
      },
    },
    defaultVariants: {
      tone: "neutral",
    },
  },
);

interface BadgeProps
  extends React.ComponentProps<"span">,
    VariantProps<typeof badgeVariants> {
  asChild?: boolean;
  /** Show a dismiss/remove button */
  removable?: boolean;
  /** Callback when the remove button is clicked */
  onRemove?: () => void;
}

function Badge({
  className,
  tone,
  variant,
  asChild = false,
  removable = false,
  onRemove,
  children,
  ...props
}: BadgeProps) {
  const Comp = asChild ? Slot : "span";

  return (
    <Comp
      data-slot="badge"
      className={cn(
        badgeVariants({ tone: variant ? undefined : tone, variant }),
        className,
      )}
      {...props}
    >
      {children}
      {removable && (
        <button
          type="button"
          onClick={(e) => {
            e.stopPropagation();
            onRemove?.();
          }}
          className="ml-0.5 -mr-1 size-4 rounded-full inline-flex items-center justify-center opacity-60 hover:opacity-100 transition-opacity"
          aria-label="Remove"
        >
          <X className="size-2.5" />
        </button>
      )}
    </Comp>
  );
}

export { Badge, badgeVariants };
export type { BadgeProps };
