import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";

interface HrReviewShortcutOverlayProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

const shortcuts = [
  { key: "J / ↓", label: "Next request in queue" },
  { key: "K / ↑", label: "Previous request in queue" },
  { key: "A", label: "Approve as OMS" },
  { key: "S", label: "Send back" },
  { key: "R", label: "Reject" },
  { key: "Esc", label: "Close active dialog" },
  { key: "?", label: "Toggle this overlay" },
];

export function HrReviewShortcutOverlay({ open, onOpenChange }: HrReviewShortcutOverlayProps) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Keyboard Shortcuts</DialogTitle>
          <DialogDescription>
            Speed up your workflow using these shortcuts. Shortcuts are disabled while typing in text fields.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-2 py-4">
          {shortcuts.map((shortcut) => (
            <div key={shortcut.key} className="flex items-center justify-between py-2 border-b border-border last:border-0">
              <span className="text-[13px] font-normal text-foreground">{shortcut.label}</span>
              <kbd className="pointer-events-none inline-flex h-6 select-none items-center gap-1 rounded border bg-muted px-2 font-mono text-[11px] font-medium text-muted-foreground opacity-100">
                {shortcut.key}
              </kbd>
            </div>
          ))}
        </div>
      </DialogContent>
    </Dialog>
  );
}
