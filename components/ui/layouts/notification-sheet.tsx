"use client";
import { NotificationPanel } from "@/components/oms/NotificationPanel";
import {
  Sheet,
  SheetContent,
} from "@/components/ui/sheet";

type NotificationSheetProps = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
};


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

  {
  id: "4",
  title: "Employee Contract Expiring",
  description: "A contract is expiring in 7 days and needs renewal review.",
  type: "warning" as const,
  timestamp: "3 hours ago",
  read: false,
  actionLabel: "Review",
  module: "Employees",
},
{
  id: "5",
  title: "Payment Processed",
  description: "Monthly outsourcing payment has been processed successfully.",
  type: "success" as const,
  timestamp: "Yesterday",
  read: true,
  module: "Payroll",
},

]

export default function NotificationSheet({
  open,
  onOpenChange,
}: NotificationSheetProps) {
  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent side="right" className="p-0 sm:max-w-md">
        <NotificationPanel
          notifications={notifications}
          hideViewAll
        />
        
      </SheetContent>
    </Sheet>
  );
}