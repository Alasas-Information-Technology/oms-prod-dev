import * as React from "react";

import { cn } from "./utils";

/* ─── Padding scale ───────────────────────────────────────────────── */
const paddingMap = {
  sm: "p-4",
  md: "p-6",
  lg: "p-8",
} as const;

/* ─── Card ────────────────────────────────────────────────────────── */

interface CardProps extends React.ComponentProps<"div"> {
  /** Surface style. `solid` (default) for data-dense screens; `glass` for dashboards/overviews. */
  surface?: "solid" | "glass";
  /** Padding preset */
  padding?: "sm" | "md" | "lg";
}

function Card({
  className,
  surface = "solid",
  padding,
  ...props
}: CardProps) {
  return (
    <div
      data-slot="card"
      data-surface={surface}
      className={cn(
        // Base
        "flex flex-col gap-6 rounded-[var(--radius-lg)] transition-all duration-300 ease-out",
        // Solid surface
        surface === "solid" && "bg-card text-card-foreground border border-border shadow-sm hover:shadow-md hover:-translate-y-[1px]",
        // Glass surface
        surface === "glass" && [
          "text-card-foreground border",
          "bg-[var(--glass-bg-light)] border-[var(--glass-border-light)]",
          "backdrop-blur-[var(--glass-blur)] backdrop-saturate-[var(--glass-saturate)]",
          "[backdrop-filter:blur(var(--glass-blur))_saturate(var(--glass-saturate))]",
          "[-webkit-backdrop-filter:blur(var(--glass-blur))_saturate(var(--glass-saturate))]",
          // Dark mode glass
          "dark:bg-[var(--glass-bg-dark)] dark:border-[var(--glass-border-dark)]",
        ],
        // Padding
        padding && paddingMap[padding],
        className,
      )}
      {...props}
    />
  );
}

function CardHeader({ className, ...props }: React.ComponentProps<"div">) {
  return (
    <div
      data-slot="card-header"
      className={cn(
        "@container/card-header grid auto-rows-min grid-rows-[auto_auto] items-start gap-2 p-8 pb-4 has-data-[slot=card-action]:grid-cols-[1fr_auto] [.border-b]:pb-6",
        className,
      )}
      {...props}
    />
  );
}

function CardTitle({ className, ...props }: React.ComponentProps<"div">) {
  return (
    <h4
      data-slot="card-title"
      className={cn("leading-tight font-semibold text-2xl text-heading", className)}
      {...props}
    />
  );
}

function CardDescription({ className, ...props }: React.ComponentProps<"div">) {
  return (
    <p
      data-slot="card-description"
      className={cn("text-muted-foreground text-base", className)}
      {...props}
    />
  );
}

function CardAction({ className, ...props }: React.ComponentProps<"div">) {
  return (
    <div
      data-slot="card-action"
      className={cn(
        "col-start-2 row-span-2 row-start-1 self-start justify-self-end",
        className,
      )}
      {...props}
    />
  );
}

function CardContent({ className, ...props }: React.ComponentProps<"div">) {
  return (
    <div
      data-slot="card-content"
      className={cn("px-8 [&:last-child]:pb-8", className)}
      {...props}
    />
  );
}

function CardFooter({ className, ...props }: React.ComponentProps<"div">) {
  return (
    <div
      data-slot="card-footer"
      className={cn("flex items-center p-8 pt-0 [.border-t]:pt-8", className)}
      {...props}
    />
  );
}

export {
  Card,
  CardHeader,
  CardFooter,
  CardTitle,
  CardAction,
  CardDescription,
  CardContent,
};
export type { CardProps };
