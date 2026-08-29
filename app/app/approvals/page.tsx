import { ApprovalsInbox } from "@/components/oms/approvals/ApprovalsInbox";
import { PageBarActions, PageBarBreadcrumbs } from "@/components/ui/layouts/page-bar-context";
import { Search } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

export default function ApprovalsPage() {
  return (
    <div className="flex flex-col h-full animate-in fade-in-50 duration-200">
      <PageBarBreadcrumbs
        crumbs={[{ label: "My Approvals", isCurrent: true }]}
      />
      
      <PageBarActions>
        <div className="flex items-center gap-2">
          {/* Global inbox search if needed in future */}
        </div>
      </PageBarActions>

      <div className="flex-1 min-h-0 pt-4">
        <ApprovalsInbox />
      </div>
    </div>
  );
}
