import { AppSidebar } from "@/components/ui/layouts/app-sidebar";
import { AppTopbar } from "@/components/ui/layouts/app-topbar";
import { AppBreadcrumb } from "@/components/ui/layouts/app-breadcrumb";
import { PageBarProvider } from "@/components/ui/layouts/page-bar-context";
import {
  SidebarInset,
  SidebarProvider,
} from "@/components/ui/sidebar";
import { LayoutGroup } from "motion/react";

export default function Layout({ children }: { children: React.ReactNode }) {
  return (
    <SidebarProvider
      style={
        {
          "--sidebar-width": "240px",
          "--sidebar-width-icon": "56px",
        } as React.CSSProperties
      }
    >
      <PageBarProvider>
        <LayoutGroup id="main-layout">
          {/* Global bar: 52px fixed, z-30 (Part 3) */}
          <AppTopbar />

          {/* Shell container: h-screen, scroll-locked, offset for fixed global bar (Part 8) */}
          <div className="h-screen pt-12 md:pt-[52px] flex flex-col overflow-hidden w-full">
            {/* Sidebar + Content Column */}
            <div className="flex flex-1 overflow-hidden w-full">
              <AppSidebar />
              <SidebarInset className="flex flex-1 flex-col overflow-hidden min-w-0 bg-background">
                {/* Page bar: 56px sticky directly beneath global bar (Part 4) */}
                <AppBreadcrumb />

                {/* Content: THE ONLY scroll container (Part 7 & 8) */}
                <main
                  id="main-content"
                  tabIndex={-1}
                  className="flex-1 h-[calc(100vh-108px)] overflow-auto focus:outline-none"
                >
                  {children}
                </main>
              </SidebarInset>
            </div>
          </div>
        </LayoutGroup>
      </PageBarProvider>
    </SidebarProvider>
  );
}
