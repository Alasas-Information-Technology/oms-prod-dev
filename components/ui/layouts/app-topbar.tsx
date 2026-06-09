"use client";

import { AnimatedThemeToggler } from "../animated-theme-toggler";
import { GlobalSearch } from "../global-search";
import AccountDropdown from "./AccountDropdown";
import { AppSignature } from "./AppSignature";
import Notification from "./notification-dropdown";
import { useSidebar } from "../sidebar";
import { LayoutGroup, motion, AnimatePresence } from "motion/react";

export function AppTopbar() {
    const { state } = useSidebar();

    return (
        <header className="flex h-12 shrink-0 items-center gap-3 px-4 w-full sticky z-20 top-0 border-b !border-muted-foreground/20 bg-background transition-all duration-200 ease-linear">
            {state === "collapsed" && (
                <motion.div layoutId="app-signature-container">
                    <AppSignature />
                </motion.div>
            )}
            <div className="flex justify-center mx-auto">
                <GlobalSearch />
            </div>


            <Notification />
            <AnimatedThemeToggler variant="circle" duration={600} />
            <AccountDropdown />
        </header>
    )
}