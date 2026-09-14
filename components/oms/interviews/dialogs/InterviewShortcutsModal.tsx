"use client";

import * as React from "react";
import {
  Keyboard,
  Sparkles,
  Calendar,
  Layers,
  RotateCcw,
  X,
  Info,
} from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";

export interface InterviewShortcutsModalProps {
  isOpen: boolean;
  onClose: () => void;
}

interface ShortcutItem {
  keys: string[];
  label: string;
  description: string;
}

interface ShortcutCategory {
  title: string;
  icon: React.ComponentType<{ className?: string }>;
  shortcuts: ShortcutItem[];
}

const SHORTCUT_CATEGORIES: ShortcutCategory[] = [
  {
    title: "Suggestions (Suggested times tab)",
    icon: Sparkles,
    shortcuts: [
      {
        keys: ["1", "–", "9"],
        label: "Add suggestion",
        description: "Add the corresponding ranked suggestion directly to the active candidate",
      },
      {
        keys: ["↑", "↓"],
        label: "Navigate suggestions",
        description: "Move keyboard focus through the suggestion list",
      },
      {
        keys: ["X"],
        label: "Dismiss suggestion",
        description: "Dismiss the focused suggestion (undoable with ⌘Z)",
      },
    ],
  },
  {
    title: "Planning & Tray",
    icon: Layers,
    shortcuts: [
      {
        keys: ["Tab"],
        label: "Switch candidate",
        description: "Cycle through candidates in the tray to change active plan recipient",
      },
      {
        keys: ["⌘", "Z"],
        label: "Undo plan change",
        description: "Revert the last change (add, remove, reassign, dismiss) across a 20-step history",
      },
    ],
  },
  {
    title: "Views & Navigation",
    icon: Calendar,
    shortcuts: [
      {
        keys: ["C"],
        label: "Toggle view",
        description: "Switch between Suggested times and Calendar (persisted per user)",
      },
      {
        keys: ["?"],
        label: "Keyboard shortcuts",
        description: "Open this shortcut reference overlay",
      },
      {
        keys: ["Esc"],
        label: "Close / Dismiss",
        description: "Close active dialog or cancel current selection",
      },
    ],
  },
];

export function InterviewShortcutsModal({
  isOpen,
  onClose,
}: InterviewShortcutsModalProps) {
  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="max-w-lg p-0 overflow-hidden sm:rounded-2xl border-border bg-card shadow-lg">
        {/* Header */}
        <DialogHeader className="p-6 pb-4 border-b border-border bg-muted/20">
          <div className="flex items-center gap-3">
            <div className="size-10 rounded-xl bg-primary/10 text-primary flex items-center justify-center border border-primary/20">
              <Keyboard className="size-5" />
            </div>
            <div>
              <DialogTitle className="text-base font-bold text-foreground tracking-tight">
                Keyboard Shortcuts
              </DialogTitle>
              <DialogDescription className="text-xs text-muted-foreground mt-0.5">
                Speed through interview planning with single-key actions.
              </DialogDescription>
            </div>
          </div>
        </DialogHeader>

        {/* Categories List */}
        <div className="p-6 space-y-5 max-h-[60vh] overflow-y-auto">
          {SHORTCUT_CATEGORIES.map((category) => {
            const Icon = category.icon;
            return (
              <div key={category.title} className="space-y-2.5">
                <div className="flex items-center gap-2 text-xs font-semibold text-foreground">
                  <Icon className="size-3.5 text-primary" />
                  <span>{category.title}</span>
                </div>

                <div className="rounded-xl border border-border bg-background divide-y divide-border/60 overflow-hidden">
                  {category.shortcuts.map((shortcut, idx) => (
                    <div
                      key={idx}
                      className="p-3 flex items-center justify-between gap-4 text-xs hover:bg-muted/20 transition-colors"
                    >
                      <div className="min-w-0">
                        <span className="font-semibold text-foreground block">
                          {shortcut.label}
                        </span>
                        <span className="text-[11px] text-muted-foreground block mt-0.5">
                          {shortcut.description}
                        </span>
                      </div>

                      <div className="flex items-center gap-1 shrink-0">
                        {shortcut.keys.map((k, kIdx) => (
                          <kbd
                            key={kIdx}
                            className="min-w-5 h-6 px-1.5 flex items-center justify-center rounded-md bg-muted border border-border/80 text-[11px] font-semibold text-foreground shadow-2xs"
                          >
                            {k}
                          </kbd>
                        ))}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            );
          })}

          {/* Invariant Footer Note */}
          <div className="p-3 rounded-xl bg-muted/40 border border-border/60 flex items-start gap-2.5 text-[11px] text-muted-foreground">
            <Info className="size-4 shrink-0 text-muted-foreground/80 mt-0.5" />
            <span>
              All shortcuts are inert while typing in search boxes or forms, and when a dialog or dropdown is open.
            </span>
          </div>
        </div>

        {/* Footer */}
        <DialogFooter className="p-4 border-t border-border bg-muted/10 flex items-center justify-end">
          <Button
            variant="outline"
            size="sm"
            onClick={onClose}
            className="text-xs font-semibold px-4 cursor-pointer"
          >
            Done
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
