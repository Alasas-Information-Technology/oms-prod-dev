"use client";

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
import { useAuth } from "@/context/AuthContext";
import {
  getFilteredNavGroups,
  InternalNavGroup,
  NavUserContext,
} from "@/lib/navigation/internal-nav";
import { cn } from "@/lib/utils";
import {
  getActivePersonaId,
  PERSONA_AUTH_MAP
} from "@/src/lib/demo-data/persona-auth";
import { ChevronRight } from "lucide-react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import * as React from "react";
import { AppLogo } from "./AppLogo";

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
      className="border-r border-sidebar-border bg-sidebar select-none w-[240px] data-[state=collapsed]:w-[56px] print:hidden"
      {...props}
    >
      <SidebarContent className="pb-6 px-0 overflow-y-auto">

        {/* Application Header */}
        <div
          className={cn(
            "h-14 md:h-15 shrink-0 w-full z-30 flex items-center print:hidden border-b transition-all",
            isCollapsed ? "justify-center px-0" : "justify-between px-4"
          )}
        >
          <Link href="/app" className="flex items-center justify-center">
            <AppLogo className={isCollapsed ? "h-6 w-auto" : undefined} />
          </Link>
        </div>

        <TooltipProvider delayDuration={400}>
          {navGroups.map((group, gIdx) => {
            // Check if any leaf in this group is active (for 2px accent bar on group label)
            const isGroupActive = group.items.some(
              (item) =>
                (item.url && item.url === activeUrl) ||
                (item.items && item.items.some((sub) => sub.url === activeUrl))
            );

            return (
              <SidebarGroup
                key={group.id || group.groupLabel || gIdx}
                className={cn("py-0 transition-all", isCollapsed ? "px-0 items-center" : "px-2.5")}
              >
                {/* Group label: 11px uppercase, 0.05em tracking, --text-muted, 24px top margin (Part 6) */}
                {!isCollapsed && (
                  <SidebarGroupLabel
                    className={cn(
                      "text-[11px] font-semibold uppercase tracking-[0.06em] text-sidebar-foreground/60 px-3 mb-2 flex items-center gap-2 relative",
                      gIdx === 0 ? "mt-2" : "mt-5",
                      isGroupActive && "text-sidebar-foreground font-bold"
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

                <SidebarMenu className={cn("gap-1.5", isCollapsed && "items-center")}>
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
                        <SidebarMenuItem
                          key={item.id || item.title}
                          className={cn(isCollapsed && "flex justify-center w-full")}
                        >
                          {isCollapsed ? (
                            // Collapsed state tooltip
                            <Tooltip>
                              <TooltipTrigger asChild>
                                <SidebarMenuButton
                                  isActive={isItemActive}
                                  className={cn(
                                    "size-10! p-0! justify-center! mx-auto rounded-sm text-sm font-medium transition-all",
                                    isItemActive
                                      ? "bg-[url('/images/sidebar-light.svg')] dark:bg-[url('/images/sidebar-dark.svg')] bg-cover bg-center text-white shadow-sm font-semibold data-[active=true]:bg-[url('/images/sidebar-light.svg')] dark:data-[active=true]:bg-[url('/images/sidebar-dark.svg')] data-[active=true]:bg-cover data-[active=true]:bg-center data-[active=true]:text-white hover:bg-[url('/images/sidebar-light.svg')] dark:hover:bg-[url('/images/sidebar-dark.svg')] hover:text-white"
                                      : "text-sidebar-foreground/70 hover:text-sidebar-foreground hover:bg-sidebar-accent/60"
                                  )}
                                  onClick={() => toggleItem(item.title)}
                                >
                                  <Icon className="h-5! w-5! shrink-0 mx-auto" />
                                  <span className="sr-only">{item.title}</span>
                                </SidebarMenuButton>
                              </TooltipTrigger>
                              <TooltipContent side="right" align="center" className="text-xs">
                                <p className="font-semibold">{item.title}</p>
                                <div className="mt-1 flex flex-col gap-1 border-t border-sidebar-border pt-1 text-[11px] text-sidebar-foreground/70">
                                  {item.items!.map((sub) => (
                                    <span
                                      key={sub.url}
                                      className={cn(sub.url === activeUrl && "font-bold text-sidebar-foreground")}
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
                                    "h-10.5 px-3.5 rounded-sm text-[14px] font-medium transition-all w-full justify-between cursor-pointer",
                                    isItemActive
                                      ? "bg-[url('/images/sidebar-light.svg')] dark:bg-[url('/images/sidebar-dark.svg')] bg-cover bg-center text-white shadow-sm font-semibold data-[active=true]:bg-[url('/images/sidebar-light.svg')] dark:data-[active=true]:bg-[url('/images/sidebar-dark.svg')] data-[active=true]:bg-cover data-[active=true]:bg-center data-[active=true]:text-white hover:bg-[url('/images/sidebar-light.svg')] dark:hover:bg-[url('/images/sidebar-dark.svg')] hover:text-white [&>svg]:text-white"
                                      : "text-sidebar-foreground/70 hover:text-sidebar-foreground hover:bg-sidebar-accent/60"
                                  )}
                                  onClick={() => toggleItem(item.title)}
                                >
                                  <div className="flex items-center gap-3 min-w-0">
                                    <Icon className="h-5! w-5! shrink-0" />
                                    <span className="truncate">{item.title}</span>
                                  </div>
                                  <ChevronRight
                                    className={cn(
                                      "h-4 w-4 text-sidebar-foreground/50 transition-transform duration-200 shrink-0",
                                      isItemActive && "text-white/90",
                                      isOpen && "rotate-90"
                                    )}
                                  />
                                </SidebarMenuButton>

                              {isOpen && (
                                <SidebarMenuSub className="ml-4 pl-3.5 border-l border-sidebar-border/70 my-1 space-y-1">
                                  {item.items!.map((sub) => {
                                    const isSubActive = sub.url === activeUrl;
                                    return (
                                      <SidebarMenuSubItem key={sub.url}>
                                        <SidebarMenuSubButton
                                          asChild
                                          isActive={isSubActive}
                                          className={cn(
                                            "h-9 px-3 rounded-md text-[13.5px] font-medium transition-colors",
                                            isSubActive
                                              ? "bg-sidebar-accent text-sidebar-accent-foreground font-semibold shadow-xs"
                                              : "text-sidebar-foreground/70 hover:text-sidebar-foreground hover:bg-sidebar-accent/60"
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
                          "h-10.5 rounded-sm text-[14px] font-medium transition-all",
                          isCollapsed
                            ? "size-10! p-0! justify-center! mx-auto"
                            : "px-3.5 w-full",
                          isDirectActive
                            ? "bg-[url('/images/sidebar-light.svg')] dark:bg-[url('/images/sidebar-dark.svg')] bg-cover bg-center text-white shadow-sm font-semibold data-[active=true]:bg-[url('/images/sidebar-light.svg')] dark:data-[active=true]:bg-[url('/images/sidebar-dark.svg')] data-[active=true]:bg-cover data-[active=true]:bg-center data-[active=true]:text-white hover:bg-[url('/images/sidebar-light.svg')] dark:hover:bg-[url('/images/sidebar-dark.svg')] hover:text-white [&>svg]:text-white"
                            : "text-sidebar-foreground/70 hover:text-sidebar-foreground hover:bg-sidebar-accent/60"
                        )}
                      >
                        <Link
                          href={item.url || "#"}
                          className={cn(
                            "flex items-center",
                            isCollapsed
                              ? "justify-center w-full h-full p-0 gap-0"
                              : "gap-3 w-full"
                          )}
                        >
                          <Icon className={cn("h-5! w-5! shrink-0", isCollapsed && "mx-auto")} />
                          {!isCollapsed && <span className="truncate">{item.title}</span>}
                        </Link>
                      </SidebarMenuButton>
                    );

                    return (
                      <SidebarMenuItem
                        key={item.id || item.title}
                        className={cn(isCollapsed && "flex justify-center w-full")}
                      >
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
