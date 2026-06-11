"use client";

import { Icon } from '@iconify/react';
import { cn } from "@/lib/utils";
import { ProfileTab } from "./profile.types";

interface ProfileTabsProps {
    activeTab: ProfileTab;
    onChange: (tab: ProfileTab) => void;
}

interface TabItem {
    value: ProfileTab;
    label: string;
    icon: React.ReactNode;
}

const PROFILE_TABS: TabItem[] = [
    {
        value: "profile",
        label: "Profile",
        icon: <Icon icon="mdi:account" className="w-4 h-4" />
    },
    {
        value: "sessions",
        label: "Sessions",
        icon: <Icon icon="mdi:monitor" className="w-4 h-4" />
    },
];

export function ProfileTabs({ activeTab, onChange }: ProfileTabsProps) {
    return (
        /* Full-width bottom border as the "track" */
        <div className="border-b border-border">
            <nav className="flex items-end gap-0" role="tablist">
                {PROFILE_TABS.map((tab) => {
                    const active = tab.value === activeTab;
                    return (
                        <button
                            key={tab.value}
                            role="tab"
                            aria-selected={active}
                            onClick={() => onChange(tab.value)}
                            className={cn(
                                // base
                                "relative inline-flex items-center gap-2 px-4 py-3 text-sm font-medium",
                                "transition-colors duration-150 select-none outline-none cursor-pointer",
                                "whitespace-nowrap",
                                // inactive
                                "text-muted-foreground hover:text-foreground",
                                // active text
                                active && "text-foreground",
                            )}
                        >
                            {tab.icon}
                            {tab.label}

                            {/* Active underline indicator */}
                            <span
                                className={cn(
                                    "absolute bottom-0 left-0 right-0 h-0.5 rounded-t-full",
                                    "transition-opacity duration-150",
                                    active ? "bg-foreground opacity-100" : "opacity-0"
                                )}
                            />
                        </button>
                    );
                })}
            </nav>
        </div>
    );
}