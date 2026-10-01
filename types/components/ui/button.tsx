import * as React from "react";
import { Slot } from "@radix-ui/react-slot";
import { cva, type VariantProps } from "class-variance-authority";

import { cn } from "./utils";

const buttonVariants = cva(
  "inline-flex items-center justify-center gap-2 whitespace-nowrap rounded-full text-sm font-semibold transition-all duration-300 ease-out disabled:pointer-events-none disabled:opacity-50 [&_svg]:pointer-events-none [&_svg:not([class*='size-'])]:size-5 shrink-0 [&_svg]:shrink-0 outline-none focus-visible:border-ring focus-visible:ring-ring/50 focus-visible:ring-[3px] aria-invalid:ring-destructive/20 dark:aria-invalid:ring-destructive/40 aria-invalid:border-destructive active:scale-[0.98]",
  {
    variants: {
      variant: {
        // v3 spec: primary = bedrock indigo fill, white text
        primary: "bg-primary text-primary-foreground hover:bg-primary/90 hover:shadow-md",
        // Backward compat alias
        default: "bg-primary text-primary-foreground hover:bg-primary/90 hover:shadow-md",
        // v3 spec: secondary = 1px border, transparent fill
        secondary:
          "border border-input bg-background text-foreground hover:bg-accent hover:text-accent-foreground dark:bg-input/30 dark:border-input dark:hover:bg-input/50",
        // Backward compat alias — outline maps to secondary
        outline:
          "border border-input bg-background text-foreground hover:bg-accent hover:text-accent-foreground dark:bg-input/30 dark:border-input dark:hover:bg-input/50",
        // v3 spec: ghost = no border, no fill, text only
        ghost:
          "hover:bg-accent hover:text-accent-foreground dark:hover:bg-accent/50",
        // Kept: semantic variant for destructive actions
        destructive:
          "bg-destructive text-white hover:bg-destructive/90 focus-visible:ring-destructive/20 dark:focus-visible:ring-destructive/40 dark:bg-destructive/60 hover:shadow-md",
        // Kept: utility variant for inline text links
        link: "text-primary underline-offset-4 hover:underline",
      },
      size: {
        default: "h-12 px-6 py-2 has-[>svg]:px-5",
        sm: "h-10 rounded-full gap-1.5 px-4 has-[>svg]:px-3",
        lg: "h-14 rounded-full px-8 text-base has-[>svg]:px-6",
        icon: "size-12 rounded-full",
      },
    },
    defaultVariants: {
      variant: "primary",
      size: "default",
    },
  },
);

interface ButtonProps
  extends React.ComponentProps<"button">,
    VariantProps<typeof buttonVariants> {
  asChild?: boolean;
  /** Renders as a circular icon button (same component, square aspect, radius-full = circle) */
  iconOnly?: boolean;
}

function Button({
  className,
  variant,
  size,
  asChild = false,
  iconOnly = false,
  ...props
}: ButtonProps) {
  const Comp = asChild ? Slot : "button";
  const effectiveSize = iconOnly ? "icon" : size;

  return (
    <Comp
      data-slot="button"
      className={cn(buttonVariants({ variant, size: effectiveSize, className }))}
      {...props}
    />
  );
}

export { Button, buttonVariants };
export type { ButtonProps };
