"use client";

import { AnimatedThemeToggler } from "../animated-theme-toggler";
import { GlobalSearch } from "../global-search";
import AccountDropdown from "./AccountDropdown";
import { AppLogo } from "./AppLogo";
import Notification from "./notification-dropdown";
import { useSidebar } from "../sidebar";
import { Menu } from "lucide-react";
import { Button } from "@/components/ui/button";

export function AppTopbar() {
    const { toggleSidebar } = useSidebar();

    return (
        <header className="h-12 md:h-[52px] shrink-0 fixed top-0 left-0 right-0 z-30 flex items-center px-4 bg-secondary/80 backdrop-blur-md border-b border-border/50">
            {/* Left section: Sidebar toggle + Logo */}
            <div className="flex items-center gap-0">
                {/* Sidebar toggle: 32px hit area */}
                <Button
                    variant="ghost"
                    size="icon"
                    className="h-8 w-8 p-0"
                    onClick={toggleSidebar}
                    aria-label="Toggle sidebar"
                >
                    <Menu className="h-[18px] w-[18px]" />
                </Button>

                {/* Logo: always visible */}
                <div className="ml-2">
                    <AppLogo />
                </div>
            </div>

            {/* Center section: Search (420px max, centered) */}
            <div className="flex-1 flex justify-center px-4">
                <div className="w-full max-w-[420px]">
                    <GlobalSearch />
                </div>
            </div>

            {/* Right section: Utilities + Avatar */}
            <div className="flex items-center gap-1">
                {/* Notification: 32px hit area, 18px glyph */}
                <Notification />

                {/* Theme toggle: 32px hit area, 18px glyph */}
                <AnimatedThemeToggler variant="circle" duration={600} />

                {/* Avatar: 28px */}
                <AccountDropdown />
            </div>
        </header>
    )
}