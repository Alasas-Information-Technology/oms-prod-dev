"use client";

import * as React from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  Sidebar,
  SidebarContent,
  SidebarGroup,
  SidebarGroupLabel,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  useSidebar,
} from "@/components/ui/sidebar";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import {
  LayoutDashboard,
  Briefcase,
  UserPlus,
  Users,
  UserCheck,
  FileText,
  Coins,
  ShieldCheck,
  Building2,
  HelpCircle,
} from "lucide-react";
import { cn } from "@/lib/utils";

/**
 * Fixed Vendor IA (docs/VENDOR-PORTAL-UI.md Part 1 & TASK 2)
 *
 * Distinct navigation and branding strictly scoped to the external vendor:
 * - Requirements (Open requirements)
 * - Candidates (Submit candidate, Submission history)
 * - Onboarding (Onboarding cases)
 * - Contracts & Rates (Contracts, Rate cards)
 * - Compliance & Profile (Compliance documents, Company profile, Support)
 */
interface VendorNavItem {
  title: string;
  url: string;
  icon: React.ComponentType<{ className?: string; strokeWidth?: number }>;
  badge?: string;
}

interface VendorNavGroup {
  groupLabel?: string;
  items: VendorNavItem[];
}

const vendorNavGroups: VendorNavGroup[] = [
  {
    items: [
      {
        title: "Dashboard",
        url: "/vendor",
        icon: LayoutDashboard,
      },
    ],
  },
  {
    groupLabel: "Requirements",
    items: [
      {
        title: "Open Requirements",
        url: "/vendor/requisitions",
        icon: Briefcase,
      },
    ],
  },
  {
    groupLabel: "Candidates",
    items: [
      {
        title: "Submit Candidate",
        url: "/vendor/submissions",
        icon: UserPlus,
      },
      {
        title: "Submission History",
        url: "/vendor/submissions/history",
        icon: Users,
      },
    ],
  },
  {
    groupLabel: "Onboarding",
    items: [
      {
        title: "Onboarding Cases",
        url: "/vendor/onboarding",
        icon: UserCheck,
      },
    ],
  },
  {
    groupLabel: "Contracts & Rates",
    items: [
      {
        title: "Contracts",
        url: "/vendor/contracts",
        icon: FileText,
      },
      {
        title: "Rate Cards",
        url: "/vendor/rates",
        icon: Coins,
      },
    ],
  },
  {
    groupLabel: "Compliance & Account",
    items: [
      {
        title: "Documents",
        url: "/vendor/documents",
        icon: ShieldCheck,
      },
      {
        title: "Company Profile",
        url: "/vendor/profile",
        icon: Building2,
      },
      {
        title: "Support",
        url: "/vendor/support",
        icon: HelpCircle,
      },
    ],
  },
];

export function VendorSidebar({ ...props }: React.ComponentProps<typeof Sidebar>) {
  const pathname = usePathname();
  const { state } = useSidebar();
  const isCollapsed = state === "collapsed";

  const isItemActive = (url: string) => {
    if (!pathname) return false;
    if (url === "/vendor") return pathname === "/vendor";
    if (pathname === url) return true;
    return pathname.startsWith(url + "/");
  };

  return (
    <Sidebar
      collapsible="icon"
      className="border-r border-border/50 bg-sidebar select-none w-[240px] data-[state=collapsed]:w-[56px] print:hidden"
      {...props}
    >
      <SidebarContent className="pt-3 pb-6 px-0 overflow-y-auto">
        <TooltipProvider delayDuration={400}>
          {vendorNavGroups.map((group, groupIdx) => (
            <SidebarGroup key={group.groupLabel || `group-${groupIdx}`} className="px-2 py-1">
              {!isCollapsed && group.groupLabel && (
                <SidebarGroupLabel className="text-[10px] font-semibold uppercase tracking-[0.06em] text-muted-foreground/70 px-3 mb-1 mt-1 flex items-center gap-2">
                  <span>{group.groupLabel}</span>
                </SidebarGroupLabel>
              )}

              <SidebarMenu className="gap-1">
                {group.items.map((item) => {
                  const Icon = item.icon;
                  const active = isItemActive(item.url);

                  const buttonNode = (
                    <SidebarMenuButton
                      asChild
                      isActive={active}
                      tooltip={isCollapsed ? item.title : undefined}
                      className={cn(
                        "h-9 px-3 rounded-md text-sm font-medium transition-colors flex items-center gap-2.5",
                        active
                          ? "bg-teal-500/15 text-teal-600 dark:text-teal-300 font-semibold hover:bg-teal-500/20"
                          : "text-muted-foreground hover:text-foreground hover:bg-white/5"
                      )}
                    >
                      <Link href={item.url} className="flex items-center gap-2.5 w-full">
                        <Icon
                          className={cn(
                            "size-4 shrink-0",
                            active
                              ? "text-teal-600 dark:text-teal-400"
                              : "text-muted-foreground"
                          )}
                        />
                        {!isCollapsed && <span className="truncate">{item.title}</span>}
                      </Link>
                    </SidebarMenuButton>
                  );

                  return (
                    <SidebarMenuItem key={item.url}>
                      {isCollapsed ? (
                        <Tooltip>
                          <TooltipTrigger asChild>{buttonNode}</TooltipTrigger>
                          <TooltipContent side="right" align="center" className="text-xs">
                            {item.title}
                          </TooltipContent>
                        </Tooltip>
                      ) : (
                        buttonNode
                      )}
                    </SidebarMenuItem>
                  );
                })}
              </SidebarMenu>
            </SidebarGroup>
          ))}
        </TooltipProvider>
      </SidebarContent>
    </Sidebar>
  );
}
