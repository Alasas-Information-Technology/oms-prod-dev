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
  UserCheck,
  ShieldCheck,
  Building2,
  FileCheck,
} from "lucide-react";
import { cn } from "@/lib/utils";

/**
 * Fixed Vendor IA (Part 1 & VENDOR-PORTAL-UI.md)
 * Never permission-computed since vendor sessions have no internal roles.
 */
interface VendorNavItem {
  title: string;
  url: string;
  icon: React.ComponentType<{ className?: string; strokeWidth?: number }>;
  badge?: string;
}

const vendorNavItems: VendorNavItem[] = [
  {
    title: "Onboarding",
    url: "/vendor/onboarding",
    icon: UserCheck,
  },
  {
    title: "Compliance",
    url: "/vendor/compliance",
    icon: ShieldCheck,
  },
  {
    title: "Company Profile",
    url: "/vendor/profile",
    icon: Building2,
  },
];

export function VendorSidebar({ ...props }: React.ComponentProps<typeof Sidebar>) {
  const pathname = usePathname();
  const { state } = useSidebar();
  const isCollapsed = state === "collapsed";

  const isItemActive = (url: string) => {
    if (!pathname) return false;
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
          <SidebarGroup className="px-2 py-0">
            {!isCollapsed && (
              <SidebarGroupLabel className="text-[11px] font-semibold uppercase tracking-[0.05em] text-muted-foreground/70 px-3 mb-2 flex items-center gap-2">
                <span>Vendor Portal</span>
              </SidebarGroupLabel>
            )}

            <SidebarMenu className="gap-1">
              {vendorNavItems.map((item) => {
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
                      <Icon className={cn("size-4 shrink-0", active ? "text-teal-600 dark:text-teal-400" : "text-muted-foreground")} />
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
        </TooltipProvider>
      </SidebarContent>
    </Sidebar>
  );
}
