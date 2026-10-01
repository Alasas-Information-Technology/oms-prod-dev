"use client";

import * as React from "react";
import * as TabsPrimitive from "@radix-ui/react-tabs";
import { cn } from "@/components/ui/utils";

export interface TabItem<T extends string = string> {
  value: T;
  label: string;
  badge?: number;
  disabled?: boolean;
}

export interface TabsButtonProps<T extends string = string> {
  tabs: TabItem<T>[];
  value: T;
  onValueChange: (value: T) => void;
  className?: string;
  size?: "sm" | "default";
}

export function TabsButton<T extends string = string>({
  tabs,
  value,
  onValueChange,
  className,
  size = "default",
}: TabsButtonProps<T>) {
  return (
    <TabsPrimitive.Root
      value={value}
      onValueChange={(v) => onValueChange(v as T)}
    >
      <TabsPrimitive.List
        className={cn(
          "inline-flex items-center gap-1 rounded-lg bg-muted/70 p-1 border border-border/50 shadow-xs",
          className
        )}
      >
        {tabs.map((tab) => {
          const isActive = value === tab.value;
          return (
            <TabsPrimitive.Trigger
              key={tab.value}
              value={tab.value}
              disabled={tab.disabled}
              className={cn(
                "inline-flex items-center justify-center gap-2 rounded-md font-medium transition-all duration-200 select-none outline-none cursor-pointer",
                size === "sm" ? "px-3 py-1 text-xs h-7" : "px-4 py-1.5 text-xs sm:text-sm h-8",
                isActive
                  ? "bg-card text-foreground font-semibold shadow-xs border border-border/60"
                  : "text-muted-foreground hover:text-foreground hover:bg-background/50 border border-transparent",
                "disabled:pointer-events-none disabled:opacity-40"
              )}
            >
              <span>{tab.label}</span>
              {tab.badge !== undefined && (
                <span
                  className={cn(
                    "inline-flex items-center justify-center min-w-[1.25rem] h-4.5 px-1.5",
                    "rounded-full text-[10px] font-bold tabular-nums transition-colors",
                    isActive
                      ? "bg-primary/15 text-primary"
                      : "bg-muted-foreground/15 text-muted-foreground"
                  )}
                >
                  {tab.badge}
                </span>
              )}
            </TabsPrimitive.Trigger>
          );
        })}
      </TabsPrimitive.List>
    </TabsPrimitive.Root>
  );
}
