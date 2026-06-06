"use client";
import {
  PROFILE_ITEMS,
  NotificationItem,
} from "./notification-dropdown";

import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet";

type NotificationSheetProps = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
};

export default function NotificationSheet({
  open,
  onOpenChange,
}: NotificationSheetProps) {
  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent side="right">
        <SheetHeader>
          <SheetTitle>All Notifications</SheetTitle>
        </SheetHeader>
        <div className="p-4">
            {PROFILE_ITEMS.map((item) => (
                <NotificationItem
                    key={item.title}
                    {...item}
                />
            ))}
        </div>
        
      </SheetContent>
    </Sheet>
  );
}