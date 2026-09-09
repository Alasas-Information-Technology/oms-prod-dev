import * as React from "react";
import { VendorTopbar } from "@/components/ui/layouts/VendorTopbar";

export default function VendorPortalLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="min-h-screen bg-background text-foreground flex flex-col">
      {/* Global Vendor Bar: 52px fixed, z-30 */}
      <VendorTopbar />

      {/* Shell container: scroll-locked offset for fixed global bar */}
      <div className="h-screen pt-12 md:pt-13 flex flex-col overflow-hidden w-full print:h-auto print:pt-0 print:overflow-visible">
        {/* Main Content: THE ONLY scroll container */}
        <main
          id="vendor-main-content"
          tabIndex={-1}
          className="flex-1 min-h-0 w-full overflow-y-auto overflow-x-hidden focus:outline-none print:overflow-visible bg-background"
        >
          {children}
        </main>
      </div>
    </div>
  );
}
