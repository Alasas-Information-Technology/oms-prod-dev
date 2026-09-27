import * as React from "react";
import { VendorHeader } from "@/components/ui/layouts/VendorHeader";
import { VendorSidebar } from "@/components/ui/layouts/VendorSidebar";
import {
  SidebarInset,
  SidebarProvider,
} from "@/components/ui/sidebar";

export default function VendorPortalLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <SidebarProvider
      style={
        {
          "--sidebar-width": "240px",
          "--sidebar-width-icon": "56px",
        } as React.CSSProperties
      }
    >
      <div className="min-h-screen bg-background text-foreground flex flex-col w-full">
        {/* Global Vendor Bar: 52px fixed, z-30, with persistent teal accent stripe */}
        <VendorHeader />

        {/* Shell container: scroll-locked offset for fixed global bar */}
        <div className="h-screen pt-12 md:pt-13 flex flex-col overflow-hidden w-full print:h-auto print:pt-0 print:overflow-visible">
          {/* Sidebar + Main Content Column */}
          <div className="flex flex-1 min-h-0 overflow-hidden w-full print:overflow-visible">
            <VendorSidebar />

            <SidebarInset className="flex flex-1 min-h-0 flex-col overflow-hidden min-w-0 bg-background print:overflow-visible">
              <main
                id="vendor-main-content"
                tabIndex={-1}
                className="flex-1 min-h-0 w-full overflow-y-auto overflow-x-hidden focus:outline-none print:overflow-visible bg-background"
              >
                {children}
              </main>
            </SidebarInset>
          </div>
        </div>
      </div>
    </SidebarProvider>
  );
}
