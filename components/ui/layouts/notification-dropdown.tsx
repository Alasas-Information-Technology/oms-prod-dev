"use client";

import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { useState } from "react";

import { NotificationPanel } from "@/components/shared/NotificationPanel";
import { Icon } from "@iconify/react";
import NotificationSheet from "./notification-sheet";

const notifications = [
  {
    id: "1",
    title: "Contract Approved",
    description: "OMS-2025-006 has been approved and is ready for signing.",
    type: "success" as const,
    timestamp: "2 minutes ago",
    read: false,
    actionLabel: "View Contract",
    module: "Contracts",
  },
  {
    id: "2",
    title: "Approval Action Required",
    description: "Procurement request requires your review.",
    type: "warning" as const,
    timestamp: "15 minutes ago",
    read: false,
    actionLabel: "Review Now",
    module: "Approvals",
  },
  {
    id: "3",
    title: "New Vendor Accredited",
    description: "Vendor has completed accreditation.",
    type: "info" as const,
    timestamp: "1 hour ago",
    read: true,
    module: "Vendors",
  },
];

export default function NotificationsDrawer() {
  const [sheetOpen, setSheetOpen] = useState(false);

  return (
    <>
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button
            type="button"
            variant="ghost"
            size="icon"
            className="h-8 w-8 p-0 text-white/40 hover:text-white rounded-lg cursor-pointer"
            aria-label="Notifications"
          >
            <Icon icon="line-md:bell-filled" className="h-4.5 w-4.5" />
          </Button>
        </DropdownMenuTrigger>

        <DropdownMenuContent
          align="end"
          className="w-105 p-0 rounded-xl overflow-hidden"
        >
          <NotificationPanel
            notifications={notifications}
            onViewAll={() => setSheetOpen(true)}
          />
        </DropdownMenuContent>
      </DropdownMenu>

      <NotificationSheet
        open={sheetOpen}
        onOpenChange={setSheetOpen}
      />
    </>
  );
}