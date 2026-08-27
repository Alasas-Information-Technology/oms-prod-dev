"use client";

import * as React from "react";
import { usePathname } from "next/navigation";
import { usePageBar } from "./page-bar-context";
import { Breadcrumb, BreadcrumbItemData } from "@/components/shared/Breadcrumb";

const ROUTE_NAME_MAP: Record<string, string> = {
  app: "Home",
  administration: "Administration",
  "master-data": "Master data",
  organization: "Organization",
  "business-units": "Business units",
  departments: "Departments",
  sections: "Sections",
  "security-dashboard": "Security dashboard",
  security: "Security",
  settings: "Settings",
  budget: "Budget",
  dashboard: "Dashboard",
  "dept-budget": "Department budget",
  "vendor-allocations": "Vendor allocations",
  requests: "OMS Requests",
  mine: "My Requests",
  approvals: "Approvals",
  procurement: "Procurement",
  vendors: "Vendors",
  candidates: "Candidates",
  onboarding: "Onboarding",
  reports: "Reports",
  profile: "Profile",
  "breadcrumb-demo": "Breadcrumb demo",
  "org-primitives-demo": "Org primitives demo",
};

function formatSegmentLabel(segment: string): string {
  if (ROUTE_NAME_MAP[segment]) {
    return ROUTE_NAME_MAP[segment];
  }
  // Check if GUID
  if (/^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(segment)) {
    return "Details";
  }
  return segment
    .split("-")
    .map((word, idx) =>
      idx === 0
        ? word.charAt(0).toUpperCase() + word.slice(1)
        : word.toLowerCase()
    )
    .join(" ");
}

export function AppBreadcrumb() {
  const pathname = usePathname();
  const { actions, customCrumbs } = usePageBar();

  // Compute crumbs from route unless overridden by customCrumbs
  const items: BreadcrumbItemData[] = React.useMemo(() => {
    if (customCrumbs && customCrumbs.length > 0) {
      return customCrumbs.map((c, i) => ({
        ...c,
        isCurrent: c.isCurrent ?? i === customCrumbs.length - 1,
      }));
    }

    if (!pathname || pathname === "/" || pathname === "/app") {
      return [{ label: "Dashboard", isCurrent: true }];
    }

    const segments = pathname.split("/").filter(Boolean);
    // Drop leading 'app' segment as per spec (start at first real section)
    const effectiveSegments = segments[0] === "app" ? segments.slice(1) : segments;

    if (effectiveSegments.length === 0) {
      return [{ label: "Dashboard", isCurrent: true }];
    }

    return effectiveSegments.map((seg, idx) => {
      const isLast = idx === effectiveSegments.length - 1;
      const href = `/app/${effectiveSegments.slice(0, idx + 1).join("/")}`;
      return {
        label: formatSegmentLabel(seg),
        href: isLast ? undefined : href,
        isCurrent: isLast,
      };
    });
  }, [pathname, customCrumbs]);

  return (
    <nav
      aria-label="Page Bar"
      className="h-[56px] sticky top-0 z-10 flex items-center justify-between px-6 bg-background border-b border-border/50 shrink-0 select-none"
    >
      {/* Left: Breadcrumb as Page Title (Part 5) */}
      <div className="min-w-0 max-w-[65%]">
        <Breadcrumb items={items} />
      </div>

      {/* Right: Page Actions Group (Part 4: exactly 36px tall controls) */}
      <div id="page-bar-actions-slot" className="flex items-center shrink-0 ml-4">
        {actions}
      </div>
    </nav>
  );
}
