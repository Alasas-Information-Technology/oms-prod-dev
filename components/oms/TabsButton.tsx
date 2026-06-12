"use client";

import * as TabsPrimitive from "@radix-ui/react-tabs";
import { cn } from "@/lib/utils";

// ─── Types ───────────────────────────────────────────────────────────────────

export interface TabItem<T extends string = string> {
    value: T;
    label: string;
    /** Optional badge count shown next to the label */
    badge?: number;
    /** Disable a specific tab */
    disabled?: boolean;
}

export interface TabsButtonProps<T extends string = string> {
    tabs: TabItem<T>[];
    value: T;
    onValueChange: (value: T) => void;
    className?: string;
}

// ─── Component ───────────────────────────────────────────────────────────────

export function TabsButton<T extends string = string>({
    tabs,
    value,
    onValueChange,
    className,
}: TabsButtonProps<T>) {
    return (
        <TabsPrimitive.Root
            value={value}
            onValueChange={(v) => onValueChange(v as T)}
        >
            <TabsPrimitive.List
                className={cn(
                    "inline-flex items-center gap-1 rounded-xl bg-muted p-1",
                    className
                )}
            >
                {tabs.map((tab) => (
                    <TabsPrimitive.Trigger
                        key={tab.value}
                        value={tab.value}
                        disabled={tab.disabled}
                        className={cn(
                            // base
                            "inline-flex items-center gap-2 rounded-lg px-5 py-2 text-sm font-medium",
                            "transition-all duration-150 select-none outline-none cursor-pointer",
                            // inactive
                            "text-muted-foreground hover:text-foreground",
                            // active — data-[state=active] driven by Radix
                            "data-[state=active]:bg-card data-[state=active]:text-foreground data-[state=active]:shadow-sm",
                            // disabled
                            "disabled:pointer-events-none disabled:opacity-40"
                        )}
                    >
                        {tab.label}
                        {tab.badge !== undefined && (
                            <span
                                className={cn(
                                    "inline-flex items-center justify-center min-w-[1.25rem] h-5 px-1.5",
                                    "rounded-full text-[10px] font-semibold",
                                    "bg-muted-foreground/15 text-muted-foreground",
                                    "data-[state=active]:bg-primary/15 data-[state=active]:text-primary"
                                )}
                            >
                                {tab.badge}
                            </span>
                        )}
                    </TabsPrimitive.Trigger>
                ))}
            </TabsPrimitive.List>
        </TabsPrimitive.Root>
    );
}