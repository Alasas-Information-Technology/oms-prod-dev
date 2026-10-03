"use client";

import * as React from "react";
import { useRouter, useSearchParams, usePathname } from "next/navigation";
import { CalendarRange, CalendarClock, Tags, ShieldAlert, Inbox } from "lucide-react";
import { usePageBar } from "@/components/ui/layouts/page-bar-context";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { Skeleton } from "@/components/ui/skeleton";
import { GlassBackground } from "@/components/ui/GlassBackground";
import { useAuth } from "@/context/AuthContext";
import { getActivePersonaId, PERSONA_AUTH_MAP } from "@/src/lib/demo-data/persona-auth";
import { FiscalYearTab, BudgetPeriodTab, BudgetCategoriesTab } from "@/components/budget/master";

/**
 * Budget Master Data
 *
 * Tabbed configuration page for budget reference data.
 * Access: SUPER_ADMIN only (nav item is hidden for everyone else, and the page guards itself).
 *
 * To add a new tab, append an entry to MASTER_TABS and render its content
 * in the matching TabsContent (see renderTabContent).
 */

type MasterTabId = "fiscal-year" | "budget-period" | "budget-categories";

interface MasterTab {
  id: MasterTabId;
  label: string;
  description: string;
  icon: React.ComponentType<{ className?: string }>;
}

const MASTER_TABS: MasterTab[] = [
  {
    id: "fiscal-year",
    label: "Fiscal Year",
    description: "Define fiscal years and their start / end dates.",
    icon: CalendarRange,
  },
  {
    id: "budget-period",
    label: "Budget Period",
    description: "Manage budget periods within each fiscal year.",
    icon: CalendarClock,
  },
  {
    id: "budget-categories",
    label: "Budget Categories",
    description: "Maintain the categories used to classify budget lines.",
    icon: Tags,
  },
];

const DEFAULT_TAB: MasterTabId = MASTER_TABS[0].id;

/** Resolves whether the current user is a Super Admin (mirrors InternalSidebar logic). */
function useIsSuperAdmin(): boolean | null {
  const { user } = useAuth();
  const [isSuper, setIsSuper] = React.useState<boolean | null>(null);

  React.useEffect(() => {
    if (user && user.roles && user.roles.length > 0) {
      setIsSuper(
        user.username?.toLowerCase() === "admin" ||
          user.roles.includes("SUPER_ADMIN") ||
          user.roles.includes("SUPERADMIN") ||
          Boolean((user as any).isSuperAdmin)
      );
      return;
    }
    const personaId = getActivePersonaId();
    const config = PERSONA_AUTH_MAP[personaId];
    setIsSuper(
      personaId === "usr-superadmin" ||
        Boolean(config?.roles.includes("SUPER_ADMIN") || config?.roles.includes("SUPERADMIN"))
    );
  }, [user]);

  return isSuper;
}

function EmptyTabPlaceholder({ tab }: { tab: MasterTab }) {
  const Icon = tab.icon;
  return (
    <div className="rounded-xl border border-dashed border-border/70 bg-card/60 backdrop-blur-sm p-10 flex flex-col items-center justify-center text-center min-h-[320px] animate-in fade-in-50 duration-200">
      <div className="h-12 w-12 rounded-full bg-primary/10 text-primary flex items-center justify-center mb-4">
        <Icon className="h-6 w-6" />
      </div>
      <h2 className="text-base font-semibold text-foreground">{tab.label}</h2>
      <p className="text-sm text-muted-foreground mt-1 max-w-md">{tab.description}</p>
      <div className="mt-5 inline-flex items-center gap-2 text-xs text-muted-foreground">
        <Inbox className="h-3.5 w-3.5" />
        <span>No content configured yet.</span>
      </div>
    </div>
  );
}

function renderTabContent(tab: MasterTab) {
  switch (tab.id) {
    case "fiscal-year":
      return <FiscalYearTab />;
    case "budget-period":
      return <BudgetPeriodTab />;
    case "budget-categories":
      return <BudgetCategoriesTab />;
    default:
      return <EmptyTabPlaceholder tab={tab} />;
  }
}

function BudgetMasterContent() {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const { setCustomCrumbs } = usePageBar();
  const isSuper = useIsSuperAdmin();

  // Active tab persisted in ?tab= (shareable + back-button safe)
  const tabFromUrl = searchParams.get("tab") as MasterTabId | null;
  const activeTab: MasterTabId = MASTER_TABS.some((t) => t.id === tabFromUrl)
    ? (tabFromUrl as MasterTabId)
    : DEFAULT_TAB;

  const handleTabChange = React.useCallback(
    (value: string) => {
      const params = new URLSearchParams(searchParams.toString());
      if (value === DEFAULT_TAB) params.delete("tab");
      else params.set("tab", value);
      const qs = params.toString();
      router.replace(qs ? `${pathname}?${qs}` : pathname, { scroll: false });
    },
    [pathname, router, searchParams]
  );

  // Breadcrumb reflects the active tab: Administration / Budget / Master / <Tab>
  const activeTabLabel = MASTER_TABS.find((t) => t.id === activeTab)?.label ?? "";

  React.useEffect(() => {
    setCustomCrumbs([
      { label: "Administration", href: "/app/administration" },
      { label: "Budget", href: "/app/budget" },
      { label: "Master", href: "/app/budget/master" },
      { label: activeTabLabel, isCurrent: true },
    ]);
  }, [setCustomCrumbs, activeTabLabel]);

  // Clear custom crumbs only when leaving the page
  React.useEffect(() => () => setCustomCrumbs(null), [setCustomCrumbs]);

  if (isSuper === null) {
    return (
      <div className="p-6 space-y-4">
        <Skeleton className="h-10 w-96 rounded-md" />
        <Skeleton className="h-80 rounded-md" />
      </div>
    );
  }

  if (!isSuper) {
    return (
      <div className="flex flex-1 items-center justify-center p-6">
        <div className="rounded-xl border border-border/60 bg-card p-8 text-center max-w-md">
          <ShieldAlert className="h-8 w-8 text-destructive mx-auto mb-3" />
          <h1 className="text-base font-semibold">Access restricted</h1>
          <p className="text-sm text-muted-foreground mt-1">
            Budget Master is available to Super Administrators only.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-col flex-1 h-full w-full p-6 space-y-6 animate-in fade-in-50 duration-200">
      <GlassBackground />
      <Tabs value={activeTab} onValueChange={handleTabChange} className="gap-6">
        {/* Header row: title on the left, underline-style tabs on the right */}
        <div className="flex flex-col gap-3 border-b border-border sm:flex-row sm:items-end sm:justify-between">
          <h1 className="pb-2.5 text-lg font-semibold text-foreground">Budget Master</h1>

          <TabsList className="h-auto justify-start gap-8 rounded-none border-0 bg-transparent p-0 shadow-none">
            {MASTER_TABS.map((tab) => (
              <TabsTrigger
                key={tab.id}
                value={tab.id}
                id={`budget-master-tab-${tab.id}`}
                className="relative flex-none rounded-none border-0 bg-transparent px-1 pb-2.5 pt-1 text-sm font-medium text-muted-foreground shadow-none hover:bg-transparent hover:text-foreground data-[state=active]:border-0 data-[state=active]:bg-transparent data-[state=active]:font-medium data-[state=active]:text-foreground data-[state=active]:shadow-none after:absolute after:inset-x-0 after:-bottom-px after:h-[3px] after:rounded-full after:bg-primary after:opacity-0 after:transition-opacity data-[state=active]:after:opacity-100"
              >
                {tab.label}
              </TabsTrigger>
            ))}
          </TabsList>
        </div>

        {MASTER_TABS.map((tab) => (
          <TabsContent key={tab.id} value={tab.id}>
            {renderTabContent(tab)}
          </TabsContent>
        ))}
      </Tabs>
    </div>
  );
}

export default function BudgetMasterPage() {
  return (
    <React.Suspense
      fallback={
        <div className="p-6 space-y-4">
          <Skeleton className="h-10 w-96 rounded-md" />
          <Skeleton className="h-80 rounded-md" />
        </div>
      }
    >
      <BudgetMasterContent />
    </React.Suspense>
  );
}
