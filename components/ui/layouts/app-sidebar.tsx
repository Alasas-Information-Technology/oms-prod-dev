"use client"

import {
  Sidebar,
  SidebarContent,
  SidebarGroup,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarMenuSub,
  SidebarMenuSubButton,
  SidebarMenuSubItem,
  useSidebar,
} from "@/components/ui/sidebar"
import { Icon as Iconify } from "@iconify/react"
import {
  BarChart3,
  CheckSquare,
  FileText,
  Settings,
  ShoppingCart,
  Store,
  UserPlus,
  Users,
  Wallet
} from "lucide-react"
import { motion } from "motion/react"
import { usePathname } from "next/navigation"
import * as React from "react"
import { AppSignature } from "./AppSignature"
// This is sample data.
const data = {
  navMain: [
    {
      title: "Dashboard",
      url: "/app",
      icon: "material-symbols:dashboard",
    },
    {
      title: "OMS Requests",
      url: "/app/requests",
      icon: FileText,
      items: [
        { title: "All Requests", url: "/app/requests" },
        { title: "My Requests", url: "/app/requests/mine" },
      ]
    },
    {
      title: "Approvals",
      url: "/app/approvals",
      icon: CheckSquare,
    },
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
      url: "/app/budget",
      icon: Wallet,
      items: [
        { title: "Dashboard", url: "/app/budget/dashboard" },
        { title: "Department Budgets", url: "/app/budget/dept-budget" },
        { title: "Vendor Allocations", url: "/app/budget/vendor-allocations" },
      ]
    },
    {
      title: "Reports",
      url: "/app/reports",
      icon: BarChart3,
    },
    {
      title: "Administration",
      url: "/app/administration",
      icon: Settings,
      items: [
        { title: "Users", url: "/app/administration/users" },
        { title: "Roles & Permissions", url: "/app/administration/roles" },
        { title: "System Settings", url: "/app/administration/settings" },
      ]
    }
  ],
}

export function AppSidebar({ ...props }: React.ComponentProps<typeof Sidebar>) {
  const pathname = usePathname();
  const { state } = useSidebar()
  return (
    <Sidebar className="border-muted-foreground/20!" {...props}>

      {/* SIDEBAR HEADER */}
      <SidebarHeader className="border-b border-sidebar-border h-12 flex flex-row items-center">
        {state === "expanded" && (
          <motion.div layoutId="app-signature-container" className="w-full">
            <AppSignature />
          </motion.div>
        )}
      </SidebarHeader>

      {/* SIDEBAR CONTENT */}
      <SidebarContent className="pt-4">
        <SidebarGroup>
          <SidebarMenu className="gap-1.5">
            {data.navMain.map((item) => (
              <SidebarMenuItem key={item.title}>

                <SidebarMenuButton asChild isActive={pathname === item.url || (pathname?.startsWith(item.url) && item.url !== "/app")} tooltip={item.title}>
                  <a href={item.url} className="font-medium flex items-center gap-3 px-3 py-2">
                    {typeof item.icon === "string" ? <Iconify icon={item.icon} className="size-5.5! text-primary" /> : <item.icon className="size-5" />}
                    <span>{item.title}</span>
                  </a>
                </SidebarMenuButton>

                {item.items?.length ? (
                  <SidebarMenuSub className="ml-5 border-l border-sidebar-border/50 px-1.5 py-1">
                    {item.items.map((subItem) => (
                      <SidebarMenuSubItem key={subItem.title}>
                        <SidebarMenuSubButton asChild isActive={pathname === subItem.url}>
                          <a href={subItem.url} className="text-muted-foreground hover:text-foreground">{subItem.title}</a>
                        </SidebarMenuSubButton>
                      </SidebarMenuSubItem>
                    ))}
                  </SidebarMenuSub>
                ) : null}
              </SidebarMenuItem>
            ))}
          </SidebarMenu>
        </SidebarGroup>
      </SidebarContent>
    </Sidebar>
  )
}
