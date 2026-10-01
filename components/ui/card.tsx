import * as React from "react";

import { cn } from "./utils";

/* ─── Padding scale ───────────────────────────────────────────────── */
const paddingMap = {
  sm: "p-4",
  md: "p-5",
  lg: "p-6",
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
        // Base — clean corporate: tight radius, subtle border, minimal shadow
        "flex flex-col gap-4 p-5 rounded-lg border border-border/60 transition-all duration-200 ease-out",
        // Light-mode shadow: subtle corporate
        "shadow-sm",
        // Dark mode: no shadow, elevated surface contrast only
        "dark:shadow-none dark:border-border",
        // Solid surface
        surface === "solid" && "bg-card text-card-foreground dark:bg-[var(--card)]",
        // Glass surface
        surface === "glass" && [
          "text-card-foreground",
          "bg-[var(--glass-bg-light)]",
          "border border-[var(--glass-border-light)] dark:border-[var(--glass-border-dark)]",
          "backdrop-blur-[var(--glass-blur)] backdrop-saturate-[var(--glass-saturate)]",
          "[backdrop-filter:blur(var(--glass-blur))_saturate(var(--glass-saturate))]",
          "[-webkit-backdrop-filter:blur(var(--glass-blur))_saturate(var(--glass-saturate))]",
          // Dark mode glass — elevated surface contrast
          "dark:bg-[var(--glass-bg-dark)]",
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
        "@container/card-header grid auto-rows-min grid-rows-[auto_auto] items-start gap-2 has-data-[slot=card-action]:grid-cols-[1fr_auto]",
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
      className={cn("leading-tight font-semibold text-lg text-heading", className)}
      {...props}
    />
  );
}

function CardDescription({ className, ...props }: React.ComponentProps<"div">) {
  return (
    <p
      data-slot="card-description"
      className={cn("text-muted-foreground text-sm", className)}
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
      className={cn("", className)}
      {...props}
    />
  );
}

function CardFooter({ className, ...props }: React.ComponentProps<"div">) {
  return (
    <div
      className={cn("flex items-center", className)}
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
