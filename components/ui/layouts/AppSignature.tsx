import { LayoutGroup, motion, AnimatePresence } from "motion/react";
import Image from "next/image";
import { SidebarTrigger, useSidebar } from "../sidebar";

export function AppSignature() {
    const { state } = useSidebar();

    return (
        <LayoutGroup id="app-signature">
            <motion.div
                layout
                initial={false}
                className="flex items-center h-12 w-full gap-3"
                transition={{
                    layout: {
                        duration: 0.25,
                        ease: [0.4, 0, 0.2, 1],
                    },
                }}
            >
                <AnimatePresence initial={false} mode="popLayout">
                    {state === "collapsed" && (
                        <motion.div
                            key="left-trigger"
                            layoutId="sidebar-trigger"
                            layout
                        >
                            <SidebarTrigger />
                        </motion.div>
                    )}
                </AnimatePresence>

                <motion.div
                    layout
                    layoutId="app-logo"
                    transition={{
                        layout: {
                            duration: 0.25,
                            ease: [0.4, 0, 0.2, 1],
                        },
                    }}
                    style={{
                        originX: "left",

                    }}
                >
                    <Image
                        src="/c-logo.png"
                        alt="logo"
                        width={80}
                        height={32}
                        priority
                    />
                </motion.div>

                <motion.div layout className="flex-1" />

                <AnimatePresence initial={false} mode="popLayout">
                    {state === "expanded" && (
                        <motion.div
                            key="right-trigger"
                            layoutId="sidebar-trigger"
                            layout
                        >
                            <SidebarTrigger />
                        </motion.div>
                    )}
                </AnimatePresence>
            </motion.div>
        </LayoutGroup>
    );
}