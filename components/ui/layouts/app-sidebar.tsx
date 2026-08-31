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
  SidebarMenuSub,
  SidebarMenuSubButton,
  SidebarMenuSubItem,
  useSidebar,
} from "@/components/ui/sidebar";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import {
  Building2,
  CheckSquare,
  FileText,
  LayoutDashboard,
  Network,
  Settings,
  ShoppingCart,
  Store,
  UserPlus,
  Users,
  Wallet,
  BarChart3,
  ChevronRight,
} from "lucide-react";
import { cn } from "@/lib/utils";

interface NavSubItem {
  title: string;
  url: string;
}

interface NavItem {
  title: string;
  url?: string;
  icon: React.ComponentType<{ className?: string; strokeWidth?: number }>;
  items?: NavSubItem[];
}

interface NavGroup {
  groupLabel: string;
  items: NavItem[];
}

const navGroups: NavGroup[] = [
  {
    groupLabel: "Main",
    items: [
      {
        title: "Dashboard",
        url: "/app",
        icon: LayoutDashboard,
      },
      {
        title: "OMS Requests",
        icon: FileText,
        items: [
          { title: "All Requests", url: "/app/requests" },
          { title: "My Requests", url: "/app/requests/mine" },
        ],
      },
    ],
  },
  {
    groupLabel: "Operations",
    items: [
      {
        title: "Procurement",
        url: "/app/procurement",
        icon: ShoppingCart,
      },
      {
        title: "Vendors",
        url: "/app/vendors",
        icon: Store,
      },
      {
        title: "Candidates",
        url: "/app/candidates",
        icon: Users,
      },
      {
        title: "Onboarding",
        url: "/app/onboarding",
        icon: UserPlus,
      },
      {
        title: "Budget Management",
        icon: Wallet,
        items: [
          { title: "Control Center", url: "/app/budget" },
          { title: "Department Budgets", url: "/app/budget/dept-budget" },
          { title: "Vendor Allocations", url: "/app/budget/vendor-allocations" },
        ],
      },
    ],
  },
  {
    groupLabel: "Governance & Administration",
    items: [
      {
        title: "Organization",
        icon: Network,
        items: [
          { title: "Organization Master", url: "/app/administration/master-data/organization" },
          { title: "Business Units", url: "/app/administration/master-data/business-units" },
          { title: "Departments", url: "/app/administration/master-data/departments" },
          { title: "Sections", url: "/app/administration/master-data/sections" },
          { title: "Breadcrumb Demo", url: "/app/administration/master-data/breadcrumb-demo" },
        ],
      },
      {
        title: "Administration",
        icon: Settings,
        items: [
          { title: "Security Dashboard", url: "/app/administration/security-dashboard" },
          { title: "Security Settings", url: "/app/administration/security/settings" },
          { title: "Users", url: "/app/administration/users" },
          { title: "Roles & Permissions", url: "/app/administration/roles" },
          { title: "System Settings", url: "/app/administration/settings" },
        ],
      },
      {
        title: "Reports",
        url: "/app/reports",
        icon: BarChart3,
      },
    ],
  },
];

export function AppSidebar({ ...props }: React.ComponentProps<typeof Sidebar>) {
  const pathname = usePathname();
  const { state } = useSidebar();
  const isCollapsed = state === "collapsed";

  // Compute strictly ONE active leaf URL across the entire application hierarchy (Part 6)
  const activeUrl = React.useMemo(() => {
    if (!pathname) return "/app";
    if (pathname === "/" || pathname === "/app") return "/app";

    // Collect all candidate leaf navigable URLs
    const leafUrls: string[] = [];
    navGroups.forEach((group) => {
      group.items.forEach((item) => {
        if (item.items && item.items.length > 0) {
          item.items.forEach((sub) => leafUrls.push(sub.url));
        } else if (item.url) {
          leafUrls.push(item.url);
        }
      });
    });

    // 1. Exact match first
    const exact = leafUrls.find((u) => u === pathname);
    if (exact) return exact;

    // 2. Most specific (longest) prefix match for dynamic detail pages
    const prefixMatches = leafUrls
      .filter((u) => u !== "/app" && pathname.startsWith(u))
      .sort((a, b) => b.length - a.length);

    return prefixMatches[0] || pathname;
  }, [pathname]);

  // Track expanded groups: only the group containing the active route expands by default (Part 6)
  const [openItems, setOpenItems] = React.useState<Record<string, boolean>>({});

  React.useEffect(() => {
    // Determine which single parent item contains the active leaf URL
    const nextOpen: Record<string, boolean> = {};
    navGroups.forEach((group) => {
      group.items.forEach((item) => {
        if (item.items && item.items.some((sub) => sub.url === activeUrl)) {
          nextOpen[item.title] = true;
        }
      });
    });
    setOpenItems(nextOpen);
  }, [activeUrl]);

  const toggleItem = (title: string) => {
    setOpenItems((prev) => ({ ...prev, [title]: !prev[title] }));
  };

  return (
    <Sidebar
      collapsible="icon"
      className="border-r border-border/50 bg-sidebar select-none w-[240px] data-[state=collapsed]:w-[56px] print:hidden"
      {...props}
    >
      <SidebarContent className="pt-2 pb-6 px-0 overflow-y-auto">
        <TooltipProvider delayDuration={400}>
          {navGroups.map((group, gIdx) => {
            // Check if any leaf in this group is active (for 2px accent bar on group label)
            const isGroupActive = group.items.some(
              (item) =>
                (item.url && item.url === activeUrl) ||
                (item.items && item.items.some((sub) => sub.url === activeUrl))
            );

            return (
              <SidebarGroup key={group.groupLabel || gIdx} className="px-2 py-0">
                {/* Group label: 11px uppercase, 0.05em tracking, --text-muted, 24px top margin (Part 6) */}
                {!isCollapsed && (
                  <SidebarGroupLabel
                    className={cn(
                      "text-[11px] font-semibold uppercase tracking-[0.05em] text-muted-foreground/70 px-3 mb-1.5 flex items-center gap-2 relative",
                      gIdx === 0 ? "mt-2" : "mt-6",
                      isGroupActive && "text-foreground font-bold"
                    )}
                  >
                    {/* 2px accent bar on the left edge of the group label (NOT same as child) */}
                    {isGroupActive && (
                      <span
                        aria-hidden="true"
                        className="w-[2px] h-3.5 rounded-full bg-primary -ml-2 shrink-0"
                      />
                    )}
                    <span>{group.groupLabel}</span>
                  </SidebarGroupLabel>
                )}

                <SidebarMenu className="gap-0.5">
                  {group.items.map((item) => {
                    const hasSubItems = Boolean(item.items && item.items.length > 0);
                    const isOpen = Boolean(openItems[item.title]);
                    const isDirectActive = !hasSubItems && item.url === activeUrl;
                    const isParentOfActive = Boolean(
                      item.items && item.items.some((sub) => sub.url === activeUrl)
                    );

                    const Icon = item.icon;
                    // First URL for icon rail link if parent
                    const targetUrl = item.url || item.items?.[0]?.url || "#";

                    if (isCollapsed) {
                      // Collapsed 56px Icon Rail Mode with 400ms Tooltip
                      return (
                        <SidebarMenuItem key={item.title}>
                          <Tooltip>
                            <TooltipTrigger asChild>
                              <SidebarMenuButton
                                asChild
                                isActive={isDirectActive || isParentOfActive}
                                className={cn(
                                  "h-9 w-9 mx-auto p-0 flex items-center justify-center rounded-lg transition-colors cursor-pointer",
                                  isDirectActive || isParentOfActive
                                    ? "bg-primary/10 text-primary font-medium"
                                    : "text-muted-foreground hover:text-foreground hover:bg-muted/60"
                                )}
                              >
                                <Link href={targetUrl}>
                                  <Icon className="h-4 w-4 shrink-0" strokeWidth={1.5} />
                                  <span className="sr-only">{item.title}</span>
                                </Link>
                              </SidebarMenuButton>
                            </TooltipTrigger>
                            <TooltipContent side="right" className="text-xs font-medium bg-popover text-popover-foreground border border-border shadow-md">
                              {item.title}
                            </TooltipContent>
                          </Tooltip>
                        </SidebarMenuItem>
                      );
                    }

                    // Expanded 240px Sidebar Mode
                    return (
                      <SidebarMenuItem key={item.title}>
                        {hasSubItems ? (
                          <>
                            {/* Parent expandable button: height 36px, font 14px, icon 16px @ 1.5px stroke, 12px px, 10px gap */}
                            <SidebarMenuButton
                              type="button"
                              onClick={() => toggleItem(item.title)}
                              className={cn(
                                "h-9 w-full px-3 text-sm font-normal flex items-center justify-between rounded-lg transition-colors cursor-pointer",
                                isParentOfActive
                                  ? "text-foreground font-medium"
                                  : "text-muted-foreground hover:text-foreground hover:bg-muted/50"
                              )}
                            >
                              <div className="flex items-center gap-[10px] min-w-0">
                                <Icon className="h-4 w-4 shrink-0" strokeWidth={1.5} />
                                <span className="truncate">{item.title}</span>
                              </div>
                              <ChevronRight
                                className={cn(
                                  "h-3.5 w-3.5 text-muted-foreground/60 transition-transform duration-200 shrink-0",
                                  isOpen && "rotate-90 text-foreground"
                                )}
                              />
                            </SidebarMenuButton>

                            {/* Submenu: only expands for active route by default */}
                            {isOpen && (
                              <SidebarMenuSub className="ml-4 pl-3.5 my-0.5 border-l border-border/50 space-y-0.5">
                                {item.items!.map((subItem) => {
                                  const isSubActive = subItem.url === activeUrl;
                                  return (
                                    <SidebarMenuSubItem key={subItem.title}>
                                      <SidebarMenuSubButton
                                        asChild
                                        isActive={isSubActive}
                                        className={cn(
                                          "h-9 px-3 text-sm rounded-lg transition-colors cursor-pointer",
                                          isSubActive
                                            ? "bg-primary/10 text-primary font-medium"
                                            : "text-muted-foreground hover:text-foreground hover:bg-muted/40 font-normal"
                                        )}
                                      >
                                        <Link href={subItem.url} className="truncate block">
                                          {subItem.title}
                                        </Link>
                                      </SidebarMenuSubButton>
                                    </SidebarMenuSubItem>
                                  );
                                })}
                              </SidebarMenuSub>
                            )}
                          </>
                        ) : (
                          /* Direct leaf button: height 36px, font 14px, icon 16px @ 1.5px stroke, 12px px, 10px gap */
                          <SidebarMenuButton
                            asChild
                            isActive={isDirectActive}
                            className={cn(
                              "h-9 w-full px-3 text-sm rounded-lg transition-colors cursor-pointer",
                              isDirectActive
                                ? "bg-primary/10 text-primary font-medium"
                                : "text-muted-foreground hover:text-foreground hover:bg-muted/50 font-normal"
                            )}
                          >
                            <Link href={item.url || "#"} className="flex items-center gap-[10px]">
                              <Icon className="h-4 w-4 shrink-0" strokeWidth={1.5} />
                              <span className="truncate">{item.title}</span>
                            </Link>
                          </SidebarMenuButton>
                        )}
                      </SidebarMenuItem>
                    );
                  })}
                </SidebarMenu>
              </SidebarGroup>
            );
          })}
        </TooltipProvider>
      </SidebarContent>
    </Sidebar>
  );
}
