"use client";

import { TabsButton, TabItem } from "@/components/oms/TabsButton";
import { ProfileTab } from "./profile.types";

interface ProfileTabsProps {
    activeTab: ProfileTab;
    onChange: (tab: ProfileTab) => void;
}

const PROFILE_TABS: TabItem<ProfileTab>[] = [
    { value: "profile", label: "Profile" },
    { value: "sessions", label: "Sessions" },
];

export function ProfileTabs({ activeTab, onChange }: ProfileTabsProps) {
    return (
        <TabsButton
            tabs={PROFILE_TABS}
            value={activeTab}
            onValueChange={onChange}
        />
    );
}