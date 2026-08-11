"use client";

import { useState, useEffect, useRef } from "react";
import { motion, AnimatePresence } from "motion/react";
import { useTheme } from "next-themes";
import { Moon, Sun, Check, MonitorSmartphone, X } from "lucide-react";
import { cn } from "@/components/ui/utils";

export function EnvironmentSwitcher() {
  const [mounted, setMounted] = useState(false);
  const [isOpen, setIsOpen] = useState(false);
  const { theme, setTheme } = useTheme();
  const containerRef = useRef<HTMLDivElement>(null);

  // Avoid hydration mismatch
  useEffect(() => {
    setMounted(true);
  }, []);

  // Close when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };
    if (isOpen) {
      document.addEventListener("mousedown", handleClickOutside);
    }
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [isOpen]);

  // Handle keyboard escape
  useEffect(() => {
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === "Escape" && isOpen) {
        setIsOpen(false);
      }
    };
    document.addEventListener("keydown", handleEscape);
    return () => document.removeEventListener("keydown", handleEscape);
  }, [isOpen]);

  if (!mounted) return null;

  const currentTheme = theme === "system" ? "light" : theme;

  return (
    <div
      ref={containerRef}
      className="fixed bottom-8 right-8 z-[100] flex items-end justify-end"
    >
      <AnimatePresence mode="wait">
        {!isOpen ? (
          <motion.button
            key="button"
            onClick={() => setIsOpen(true)}
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.9 }}
            transition={{ duration: 0.2, ease: "easeOut" as any }}
            className="w-[52px] h-[52px] rounded-full bg-card/80 backdrop-blur-xl border border-border/60 shadow-lg flex items-center justify-center text-muted-foreground hover:text-primary hover:border-primary/50 transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-primary group"
            aria-label="Select Digital Environment"
          >
            <div className="relative flex items-center justify-center w-6 h-6 transition-transform group-hover:scale-110">
              {currentTheme === "dark" ? <Moon className="w-5 h-5" /> : <Sun className="w-5 h-5" />}
            </div>
          </motion.button>
        ) : (
          <motion.div
            key="panel"
            initial={{ opacity: 0, y: 10, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 10, scale: 0.95 }}
            transition={{ duration: 0.2, ease: "easeOut" as any }}
            className="w-[320px] md:w-[380px] bg-card/90 backdrop-blur-2xl border border-border/80 shadow-2xl rounded-2xl overflow-hidden flex flex-col origin-bottom-right"
          >
            {/* Header */}
            <div className="px-6 py-4 border-b border-border/40 bg-secondary/30 flex justify-between items-center">
              <div>
                <h3 className="text-sm font-bold text-heading">Select Environment</h3>
                <p className="text-[10px] uppercase tracking-widest text-muted-foreground font-semibold mt-1">
                  Digital Workspace
                </p>
              </div>
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  setIsOpen(false);
                }}
                className="p-1.5 rounded-full hover:bg-black/5 dark:hover:bg-white/10 text-muted-foreground hover:text-heading transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-primary"
                aria-label="Close Environment Switcher"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Options */}
            <div className="p-3 flex flex-col gap-2">
              <ThemeOption
                icon={<Sun className="w-5 h-5 text-amber-500" />}
                title="Executive Light"
                description="Clean enterprise workspace for collaboration and governance."
                isActive={currentTheme === "light"}
                onClick={() => {
                  setTheme("light");
                  setTimeout(() => setIsOpen(false), 200);
                }}
              />
              <ThemeOption
                icon={<Moon className="w-5 h-5 text-primary" />}
                title="Midnight Enterprise"
                description="Digital command environment for technology and analytics."
                isActive={currentTheme === "dark"}
                onClick={() => {
                  setTheme("dark");
                  setTimeout(() => setIsOpen(false), 200);
                }}
              />
              {/* <ThemeOption
                icon={<MonitorSmartphone className="w-5 h-5 text-muted-foreground" />}
                title="System Default"
                description="Match your operating system's active display settings."
                isActive={theme === "system"}
                onClick={() => {
                  setTheme("system");
                  setTimeout(() => setIsOpen(false), 200);
                }}
              /> */}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

function ThemeOption({
  icon,
  title,
  description,
  isActive,
  onClick
}: {
  icon: React.ReactNode;
  title: string;
  description: string;
  isActive: boolean;
  onClick: (e: React.MouseEvent) => void;
}) {
  return (
    <button
      onClick={(e) => {
        e.stopPropagation();
        onClick(e);
      }}
      className={cn(
        "w-full text-left p-4 rounded-xl flex items-start gap-4 transition-all duration-300 relative group focus:outline-none focus-visible:ring-2 focus-visible:ring-primary",
        isActive
          ? "bg-primary/5 border border-primary/20 shadow-sm"
          : "bg-transparent border border-transparent hover:bg-secondary/40 hover:border-border/60 hover:shadow-sm"
      )}
      aria-pressed={isActive}
    >
      <div className={cn(
        "shrink-0 mt-0.5 w-8 h-8 rounded-full flex items-center justify-center transition-colors",
        isActive ? "bg-card shadow-sm border border-border/50" : "bg-transparent"
      )}>
        {icon}
      </div>

      <div className="flex-1 pr-6">
        <h4 className={cn("text-sm font-semibold mb-1 transition-colors", isActive ? "text-primary" : "text-heading group-hover:text-primary")}>
          {title}
        </h4>
        <p className="text-xs text-muted-foreground leading-relaxed">
          {description}
        </p>
      </div>

      {/* Active Indicator */}
      {isActive && (
        <div className="absolute top-4 right-4 w-5 h-5 bg-primary rounded-full flex items-center justify-center shadow-sm">
          <Check className="w-3 h-3 text-white" strokeWidth={3} />
        </div>
      )}
    </button>
  );
}
