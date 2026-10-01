import { InternalSidebar } from "@/components/ui/layouts/InternalSidebar";
import { InternalHeader } from "@/components/ui/layouts/InternalHeader";
import { AppBreadcrumb } from "@/components/ui/layouts/app-breadcrumb";
import { PageBarProvider } from "@/components/ui/layouts/page-bar-context";
import { SidebarProvider } from "@/components/ui/sidebar";
import { AppSurfaceInset } from "@/components/ui/layouts/AppSurfaceInset";
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
          {/* Shell container: h-screen, scroll-locked */}
          <div className="h-screen flex flex-col overflow-hidden w-full print:h-auto print:overflow-visible">

            {/* Sidebar + Content Column */}
            <div className="flex flex-1 min-h-0 overflow-hidden w-full print:overflow-visible">
              <InternalSidebar />

              <AppSurfaceInset>
                {/* Global bar inside inset */}
                <InternalHeader />

                {/* Page bar: 56px sticky directly beneath global bar (Part 4) */}
                <AppBreadcrumb />

                {/* Content: THE ONLY scroll container (Part 7 & 8) */}
                <div
                  id="main-content"
                  tabIndex={-1}
                  className="flex-1 min-h-0 w-full overflow-y-auto overflow-x-hidden focus:outline-none print:overflow-visible bg-page-bg"
                >
                  {children}
                </div>
              </AppSurfaceInset>
            </div>
          </div>
        </LayoutGroup>
      </PageBarProvider>
    </SidebarProvider>
  );
}
