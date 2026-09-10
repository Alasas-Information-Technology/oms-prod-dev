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
import { ChevronRight } from "lucide-react";
import { cn } from "@/lib/utils";
import { useAuth } from "@/context/AuthContext";
import {
  getFilteredNavGroups,
  NavUserContext,
  InternalNavGroup,
} from "@/lib/navigation/internal-nav";
import {
  getActivePersona,
  getActivePersonaId,
  PERSONA_AUTH_MAP,
} from "@/src/lib/demo-data/persona-auth";

/**
 * Internal Portal Sidebar Component (Part 1, Part 2 & APP-SHELL-SPEC Part 6)
 *
 * Distinct from VendorSidebar:
 * - Gated on real RBAC permissions from internal-nav.ts
 * - Items the user lacks permissions for are ABSENT (never disabled)
 * - Approvals is NOT a standalone nav item (lives in Requests)
 * - Administration group renders ONLY for SYSTEM_ADMIN
 */
export function InternalSidebar({ ...props }: React.ComponentProps<typeof Sidebar>) {
  const pathname = usePathname();
  const { state } = useSidebar();
  const isCollapsed = state === "collapsed";
  const { user } = useAuth();

  // Build resolved user context combining active JWT session with demo persona fallback
  const userContext: NavUserContext = React.useMemo(() => {
    if (user && user.roles && user.roles.length > 0) {
      return {
        userId: user.userId,
        roles: user.roles,
        permissions: user.permissions || [],
        scopes: user.scopes || [],
        isSystemAdmin: user.roles.includes("SYSTEM_ADMIN") || user.roles.includes("ADMIN"),
      };
    }

    // Client-side demo fallback
    const personaId = getActivePersonaId();
    const config = PERSONA_AUTH_MAP[personaId];
    if (config) {
      return {
        userId: personaId,
        roles: config.roles,
        permissions: config.permissions,
        scopes: config.scopes,
        isSystemAdmin: config.roles.includes("SYSTEM_ADMIN") || config.roles.includes("ADMIN"),
      };
    }

    // Safe default for internal staff
    return {
      roles: ["DEPARTMENT_REQUESTOR", "REQUESTOR"],
      permissions: ["REQUISITION.VIEW", "REQUISITION.CREATE"],
      scopes: [],
      isSystemAdmin: false,
    };
  }, [user]);

  // Compute filtered nav groups based on RBAC rules (Part 2.1 & 2.2)
  const navGroups: InternalNavGroup[] = React.useMemo(() => {
    return getFilteredNavGroups(userContext);
  }, [userContext]);

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
  }, [pathname, navGroups]);

  // Track expanded groups: only the group containing the active route expands by default (Part 6)
  const [openItems, setOpenItems] = React.useState<Record<string, boolean>>({});

  React.useEffect(() => {
    const nextOpen: Record<string, boolean> = {};
    navGroups.forEach((group) => {
      group.items.forEach((item) => {
        if (item.items && item.items.some((sub) => sub.url === activeUrl)) {
          nextOpen[item.title] = true;
        }
      });
    });
    setOpenItems(nextOpen);
  }, [activeUrl, navGroups]);

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
              <SidebarGroup key={group.id || group.groupLabel || gIdx} className="px-2 py-0">
                {/* Group label: 11px uppercase, 0.05em tracking, --text-muted, 24px top margin (Part 6) */}
                {!isCollapsed && (
                  <SidebarGroupLabel
                    className={cn(
                      "text-[11px] font-semibold uppercase tracking-[0.05em] text-muted-foreground/70 px-3 mb-1.5 flex items-center gap-2 relative",
                      gIdx === 0 ? "mt-2" : "mt-6",
                      isGroupActive && "text-foreground font-bold"
                    )}
                  >
                    {/* 2px accent bar on the left edge of the group label */}
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
                    const Icon = item.icon;
                    const hasSubItems = Boolean(item.items && item.items.length > 0);
                    const isOpen = Boolean(openItems[item.title]);
                    const isDirectActive = item.url === activeUrl;
                    const hasActiveChild = Boolean(
                      item.items && item.items.some((sub) => sub.url === activeUrl)
                    );
                    const isItemActive = isDirectActive || hasActiveChild;

                    if (hasSubItems) {
                      return (
                        <SidebarMenuItem key={item.id || item.title}>
                          {isCollapsed ? (
                            // Collapsed state tooltip
                            <Tooltip>
                              <TooltipTrigger asChild>
                                <SidebarMenuButton
                                  isActive={isItemActive}
                                  className={cn(
                                    "h-9 px-3 rounded-md text-sm font-medium transition-colors",
                                    isItemActive
                                      ? "bg-accent text-accent-foreground font-medium"
                                      : "text-muted-foreground hover:text-foreground hover:bg-accent/50"
                                  )}
                                  onClick={() => toggleItem(item.title)}
                                >
                                  <Icon className="h-4 w-4 shrink-0" />
                                  <span className="sr-only">{item.title}</span>
                                </SidebarMenuButton>
                              </TooltipTrigger>
                              <TooltipContent side="right" align="center" className="text-xs">
                                <p className="font-semibold">{item.title}</p>
                                <div className="mt-1 flex flex-col gap-1 border-t border-border/50 pt-1 text-[11px] text-muted-foreground">
                                  {item.items!.map((sub) => (
                                    <span
                                      key={sub.url}
                                      className={cn(sub.url === activeUrl && "font-bold text-foreground")}
                                    >
                                      {sub.title}
                                    </span>
                                  ))}
                                </div>
                              </TooltipContent>
                            </Tooltip>
                          ) : (
                            // Expanded state collapsible menu
                            <>
                              <SidebarMenuButton
                                isActive={isItemActive}
                                className={cn(
                                  "h-9 px-3 rounded-md text-sm font-medium transition-colors w-full justify-between cursor-pointer",
                                  isItemActive
                                    ? "bg-accent/60 text-foreground font-medium"
                                    : "text-muted-foreground hover:text-foreground hover:bg-accent/40"
                                )}
                                onClick={() => toggleItem(item.title)}
                              >
                                <div className="flex items-center gap-2.5 min-w-0">
                                  <Icon className="h-4 w-4 shrink-0" />
                                  <span className="truncate">{item.title}</span>
                                </div>
                                <ChevronRight
                                  className={cn(
                                    "h-3.5 w-3.5 text-muted-foreground/70 transition-transform duration-200 shrink-0",
                                    isOpen && "rotate-90"
                                  )}
                                />
                              </SidebarMenuButton>

                              {isOpen && (
                                <SidebarMenuSub className="ml-4 pl-3 border-l border-border/50 my-0.5 space-y-0.5">
                                  {item.items!.map((sub) => {
                                    const isSubActive = sub.url === activeUrl;
                                    return (
                                      <SidebarMenuSubItem key={sub.url}>
                                        <SidebarMenuSubButton
                                          asChild
                                          isActive={isSubActive}
                                          className={cn(
                                            "h-8 px-2.5 rounded-md text-[13px] font-normal transition-colors",
                                            isSubActive
                                              ? "bg-accent text-accent-foreground font-medium"
                                              : "text-muted-foreground hover:text-foreground hover:bg-accent/40"
                                          )}
                                        >
                                          <Link href={sub.url} className="truncate">
                                            {sub.title}
                                          </Link>
                                        </SidebarMenuSubButton>
                                      </SidebarMenuSubItem>
                                    );
                                  })}
                                </SidebarMenuSub>
                              )}
                            </>
                          )}
                        </SidebarMenuItem>
                      );
                    }

                    // Direct single link
                    const buttonNode = (
                      <SidebarMenuButton
                        asChild
                        isActive={isDirectActive}
                        className={cn(
                          "h-9 px-3 rounded-md text-sm font-medium transition-colors",
                          isDirectActive
                            ? "bg-accent text-accent-foreground font-medium"
                            : "text-muted-foreground hover:text-foreground hover:bg-accent/50"
                        )}
                      >
                        <Link href={item.url || "#"} className="flex items-center gap-2.5 w-full">
                          <Icon className="h-4 w-4 shrink-0" />
                          {!isCollapsed && <span className="truncate">{item.title}</span>}
                        </Link>
                      </SidebarMenuButton>
                    );

                    return (
                      <SidebarMenuItem key={item.id || item.title}>
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
            );
          })}
        </TooltipProvider>
      </SidebarContent>
    </Sidebar>
  );
}

// Re-export as AppSidebar for backward compatibility
export { InternalSidebar as AppSidebar };
