"use client"

import * as React from "react"
import { usePathname } from "next/navigation"
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
} from "@/components/ui/sidebar"
import { 
    Building2, 
    LayoutDashboard, 
    FileText, 
    CheckSquare, 
    ShoppingCart, 
    Store, 
    Users, 
    UserPlus, 
    Wallet, 
    BarChart3, 
    Settings 
} from "lucide-react"

// This is sample data.
const data = {
  navMain: [
    {
      title: "Dashboard",
      url: "/app",
      icon: LayoutDashboard,
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
  const pathname = usePathname()
  return (
    <Sidebar className="top-12 !border-muted-foreground/20" collapsible="icon" {...props}>

      {/* SIDEBAR HEADER */}
      <SidebarHeader className="border-b border-sidebar-border py-4 px-4">
        <SidebarMenu>
          <SidebarMenuItem>
            <SidebarMenuButton size="lg" asChild className="hover:bg-transparent">
              <a href="/app">
                <div className="flex aspect-square size-8 items-center justify-center rounded-lg bg-primary text-primary-foreground">
                  <Building2 className="size-4" />
                </div>
                <div className="flex flex-col gap-0.5 leading-none ml-2">
                  <span className="font-semibold text-base tracking-tight">DIEZ OMS</span>
                  <span className="text-xs text-muted-foreground">Enterprise Portal</span>
                </div>
              </a>
            </SidebarMenuButton>
          </SidebarMenuItem>
        </SidebarMenu>
      </SidebarHeader>

      {/* SIDEBAR CONTENT */}
      <SidebarContent className="pt-4">
        <SidebarGroup>
          <SidebarMenu className="gap-1.5">
            {data.navMain.map((item) => (
              <SidebarMenuItem key={item.title}>

                <SidebarMenuButton asChild isActive={pathname === item.url || (pathname?.startsWith(item.url) && item.url !== "/app")} tooltip={item.title}>
                  <a href={item.url} className="font-medium flex items-center gap-3 px-3 py-2">
                    <item.icon className="size-5" />
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
