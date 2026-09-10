/**
 * RBAC-Filtered Internal Navigation Map
 *
 * Implements navigation specifications from PORTAL-SEPARATION-AND-USERS.md (Parts 2.1 & 2.2),
 * APP-SHELL-SPEC.md, and APPROVALS-IN-REQUESTS.md.
 *
 * Rules:
 * 1. Items the user lacks permissions for are ABSENT (never disabled).
 * 2. Approvals is NOT a standalone nav item; it lives in Requests (Needs My Action tab).
 * 3. The Administration group renders ONLY for SYSTEM_ADMIN.
 * 4. SYSTEM_ADMIN manages platform, not business flow (does not see Requests, Budget, Candidates).
 */

import React from "react";
import {
  LayoutDashboard,
  FileText,
  Wallet,
  Users,
  UserPlus,
  Store,
  BarChart3,
  Settings,
  ShieldCheck,
  Network,
  UserCheck,
  Lock,
} from "lucide-react";

export interface NavSubItem {
  title: string;
  url: string;
  requiredPermission?: string;
  requiredRole?: string;
}

export interface InternalNavItem {
  id: string;
  title: string;
  url?: string;
  icon: React.ComponentType<{ className?: string; strokeWidth?: number }>;
  requiredPermission?: string;
  requiredPermissions?: string[];
  requiredRoles?: string[];
  // Dynamic predicate for fine-grained scope & role gating
  isPermitted?: (context: NavUserContext) => boolean;
  items?: NavSubItem[];
}

export interface InternalNavGroup {
  id: string;
  groupLabel: string;
  requiredRole?: string;
  isPermitted?: (context: NavUserContext) => boolean;
  items: InternalNavItem[];
}

export interface NavUserContext {
  userId?: string;
  roles: string[];
  permissions: string[];
  scopes?: Array<{ scopeCode: string; departmentId?: string; vendorId?: string }>;
  isSystemAdmin?: boolean;
}

/**
 * Normalized helper to test permissions with wildcard support.
 */
export function userHasPermission(permissions: string[], perm: string): boolean {
  if (!permissions || !Array.isArray(permissions)) return false;
  return (
    permissions.includes(perm) ||
    permissions.includes("*") ||
    permissions.includes("ALL")
  );
}

/**
 * Normalized helper to test roles (case-insensitive, underscore-normalized).
 */
export function userHasRole(roles: string[], targetRole: string | string[]): boolean {
  if (!roles || !Array.isArray(roles)) return false;
  const targets = Array.isArray(targetRole) ? targetRole : [targetRole];
  const normalizedTargets = targets.map((r) => r.toUpperCase().replace(/[\s-]/g, "_"));
  return roles.some((r) =>
    normalizedTargets.includes(r.toUpperCase().replace(/[\s-]/g, "_"))
  );
}

/**
 * Checks if user is pure System Administrator
 */
export function isPureSystemAdmin(context: NavUserContext): boolean {
  const isSysAdmin =
    context.isSystemAdmin ||
    userHasRole(context.roles, ["SYSTEM_ADMIN", "ADMIN"]);
  // If user only has SYSTEM_ADMIN role without operational roles
  const operationalRoles = [
    "DEPARTMENT_REQUESTOR",
    "REQUESTOR",
    "LINE_MANAGER",
    "SECTION_HEAD",
    "HEAD_OF_DEPARTMENT",
    "HOD",
    "HR_SPECIALIST",
    "HR_REVIEWER",
    "HR_MANAGER",
    "HR",
    "FINANCE_MANAGER",
    "FINANCE",
    "BUDGET_CONTROLLER",
    "PROCUREMENT_OFFICER",
    "PROCUREMENT",
    "MAIN_INTERVIEWER",
    "INTERVIEWER",
  ];
  return isSysAdmin && !userHasRole(context.roles, operationalRoles);
}

/**
 * Master Internal Navigation Definition (Part 2.1)
 */
export const INTERNAL_NAV_GROUPS: InternalNavGroup[] = [
  {
    id: "group-main",
    groupLabel: "Main",
    items: [
      {
        id: "nav-dashboard",
        title: "Dashboard",
        url: "/app",
        icon: LayoutDashboard,
        // Dashboard is always visible to any authenticated internal user
        isPermitted: (ctx) => !ctx.isSystemAdmin || true,
      },
      {
        id: "nav-my-requests",
        title: "My Requests",
        url: "/app/requests/mine",
        icon: FileText,
        // REQUISITION.VIEW, own scope: Anyone who can raise a request
        // Part 2.2: Department Requestor, Line Manager, Section Head, Main Interviewer
        isPermitted: (ctx) => {
          if (isPureSystemAdmin(ctx)) return false;
          const hasPerm =
            userHasPermission(ctx.permissions, "REQUISITION.VIEW") ||
            userHasPermission(ctx.permissions, "REQUEST.VIEW") ||
            userHasPermission(ctx.permissions, "REQUEST.LIST_MINE");
          const hasEligibleRole = userHasRole(ctx.roles, [
            "DEPARTMENT_REQUESTOR",
            "REQUESTOR",
            "LINE_MANAGER",
            "SECTION_HEAD",
            "MAIN_INTERVIEWER",
            "PANEL_INTERVIEWER",
          ]);
          return hasPerm && hasEligibleRole;
        },
      },
      {
        id: "nav-all-requests",
        title: "All Requests",
        url: "/app/requests",
        icon: FileText,
        // REQUISITION.VIEW, broader scope: HOD, HR, Finance, Procurement, Line Manager, Section Head
        // Part 2.2: Line Manager, Section Head, HOD, HR Specialist, Finance Manager, Procurement Officer
        isPermitted: (ctx) => {
          if (isPureSystemAdmin(ctx)) return false;
          const hasPerm =
            userHasPermission(ctx.permissions, "REQUISITION.VIEW") ||
            userHasPermission(ctx.permissions, "REQUEST.VIEW");
          const hasEligibleRole = userHasRole(ctx.roles, [
            "HEAD_OF_DEPARTMENT",
            "HOD",
            "LINE_MANAGER",
            "SECTION_HEAD",
            "HR_SPECIALIST",
            "HR_REVIEWER",
            "HR_MANAGER",
            "HR",
            "FINANCE_MANAGER",
            "FINANCE",
            "BUDGET_CONTROLLER",
            "PROCUREMENT_OFFICER",
            "PROCUREMENT",
          ]);
          return hasPerm && hasEligibleRole;
        },
      },
      {
        id: "nav-hr-review",
        title: "HR Review",
        url: "/app/hr-review",
        icon: UserCheck,
        // HR review permission: HR Specialist only (Part 2.1 & 2.2)
        isPermitted: (ctx) => {
          if (isPureSystemAdmin(ctx)) return false;
          const hasPerm =
            userHasPermission(ctx.permissions, "HR_REVIEW.VIEW") ||
            userHasPermission(ctx.permissions, "HR.REVIEW");
          const hasEligibleRole = userHasRole(ctx.roles, [
            "HR_SPECIALIST",
            "HR_REVIEWER",
            "HR_MANAGER",
            "HR",
          ]);
          return hasPerm && hasEligibleRole;
        },
      },
    ],
  },
  {
    id: "group-operations",
    groupLabel: "Operations",
    items: [
      {
        id: "nav-budget",
        title: "Budget",
        icon: Wallet,
        url: "/app/budget",
        // BUDGET.VIEW: Finance, HOD (own department) (Part 2.1 & 2.2)
        isPermitted: (ctx) => {
          if (isPureSystemAdmin(ctx)) return false;
          const hasPerm = userHasPermission(ctx.permissions, "BUDGET.VIEW");
          const hasEligibleRole = userHasRole(ctx.roles, [
            "FINANCE_MANAGER",
            "FINANCE",
            "BUDGET_CONTROLLER",
            "HEAD_OF_DEPARTMENT",
            "HOD",
          ]);
          return hasPerm && hasEligibleRole;
        },
        items: [
          { title: "Control Center", url: "/app/budget" },
          { title: "Department Budgets", url: "/app/budget/dept-budget" },
        ],
      },
      {
        id: "nav-candidates",
        title: "Candidates",
        url: "/app/candidates",
        icon: Users,
        // CANDIDATE.VIEW: Main Interviewer, HR, Procurement, HOD (Part 2.1 & 2.2)
        isPermitted: (ctx) => {
          if (isPureSystemAdmin(ctx)) return false;
          const hasPerm = userHasPermission(ctx.permissions, "CANDIDATE.VIEW");
          const hasEligibleRole = userHasRole(ctx.roles, [
            "MAIN_INTERVIEWER",
            "PANEL_INTERVIEWER",
            "INTERVIEWER",
            "HR_SPECIALIST",
            "HR_REVIEWER",
            "HR_MANAGER",
            "HR",
            "PROCUREMENT_OFFICER",
            "PROCUREMENT",
            "HEAD_OF_DEPARTMENT",
            "HOD",
          ]);
          return hasPerm && hasEligibleRole;
        },
      },
      {
        id: "nav-workforce",
        title: "Workforce",
        url: "/app/workforce",
        icon: UserPlus,
        // Workforce view permission: HR, Line Manager, HOD (Part 2.1 & 2.2)
        isPermitted: (ctx) => {
          if (isPureSystemAdmin(ctx)) return false;
          const hasPerm =
            userHasPermission(ctx.permissions, "WORKFORCE.VIEW") ||
            userHasPermission(ctx.permissions, "WORKFORCE.MANAGE") ||
            userHasPermission(ctx.permissions, "ONBOARDING.VIEW");
          const hasEligibleRole = userHasRole(ctx.roles, [
            "HR_SPECIALIST",
            "HR_REVIEWER",
            "HR_MANAGER",
            "HR",
            "LINE_MANAGER",
            "SECTION_HEAD",
            "HEAD_OF_DEPARTMENT",
            "HOD",
          ]);
          return hasPerm && hasEligibleRole;
        },
      },
      {
        id: "nav-vendors",
        title: "Vendors",
        url: "/app/vendors",
        icon: Store,
        // VENDOR.VIEW: Procurement Officer (Part 2.1 & 2.2)
        isPermitted: (ctx) => {
          if (isPureSystemAdmin(ctx)) return false;
          const hasPerm = userHasPermission(ctx.permissions, "VENDOR.VIEW");
          const hasEligibleRole = userHasRole(ctx.roles, [
            "PROCUREMENT_OFFICER",
            "PROCUREMENT",
            "VENDOR_MANAGER",
          ]);
          return hasPerm && hasEligibleRole;
        },
      },
      {
        id: "nav-reports",
        title: "Reports",
        url: "/app/reports",
        icon: BarChart3,
        // Reports view permission: HOD, HR Specialist, Finance Manager, Procurement Officer (Part 2.1 & 2.2)
        isPermitted: (ctx) => {
          if (isPureSystemAdmin(ctx)) return false;
          const hasPerm =
            userHasPermission(ctx.permissions, "REPORTS.VIEW") ||
            userHasPermission(ctx.permissions, "REPORT.VIEW");
          const hasEligibleRole = userHasRole(ctx.roles, [
            "HEAD_OF_DEPARTMENT",
            "HOD",
            "HR_SPECIALIST",
            "HR_REVIEWER",
            "HR_MANAGER",
            "HR",
            "FINANCE_MANAGER",
            "FINANCE",
            "BUDGET_CONTROLLER",
            "PROCUREMENT_OFFICER",
            "PROCUREMENT",
          ]);
          return hasPerm && hasEligibleRole;
        },
      },
    ],
  },
  {
    id: "group-administration",
    groupLabel: "Administration",
    // The Administration group renders ONLY for SYSTEM_ADMIN (Part 2.1)
    requiredRole: "SYSTEM_ADMIN",
    isPermitted: (ctx) => userHasRole(ctx.roles, ["SYSTEM_ADMIN", "ADMIN"]),
    items: [
      {
        id: "nav-admin-group",
        title: "Administration",
        icon: Settings,
        items: [
          {
            title: "Organization",
            url: "/app/administration/master-data/organization",
          },
          {
            title: "Users",
            url: "/app/administration/users",
          },
          {
            title: "Security Dashboard",
            url: "/app/administration/security-dashboard",
          },
          {
            title: "Security Settings",
            url: "/app/administration/security/settings",
          },
        ],
      },
    ],
  },
];

/**
 * Filters the internal navigation tree for the authenticated user.
 * Unmet items and empty groups are completely omitted (never disabled).
 */
export function getFilteredNavGroups(context: NavUserContext): InternalNavGroup[] {
  const result: InternalNavGroup[] = [];

  for (const group of INTERNAL_NAV_GROUPS) {
    // 1. Check group-level permissions
    if (group.requiredRole && !userHasRole(context.roles, group.requiredRole)) {
      continue;
    }
    if (group.isPermitted && !group.isPermitted(context)) {
      continue;
    }

    // 2. Filter items inside group
    const visibleItems: InternalNavItem[] = [];

    for (const item of group.items) {
      if (item.requiredRoles && !userHasRole(context.roles, item.requiredRoles)) {
        continue;
      }
      if (item.requiredPermission && !userHasPermission(context.permissions, item.requiredPermission)) {
        continue;
      }
      if (item.requiredPermissions && !item.requiredPermissions.every((p) => userHasPermission(context.permissions, p))) {
        continue;
      }
      if (item.isPermitted && !item.isPermitted(context)) {
        continue;
      }

      // Filter subitems if any
      if (item.items && item.items.length > 0) {
        const visibleSubItems = item.items.filter((sub) => {
          if (sub.requiredRole && !userHasRole(context.roles, sub.requiredRole)) return false;
          if (sub.requiredPermission && !userHasPermission(context.permissions, sub.requiredPermission)) return false;
          return true;
        });

        // If an item has a subitem list and all subitems were filtered, omit parent unless it has a direct url
        if (visibleSubItems.length === 0 && !item.url) {
          continue;
        }

        visibleItems.push({
          ...item,
          items: visibleSubItems,
        });
      } else {
        visibleItems.push(item);
      }
    }

    // 3. Only include groups that have at least one visible item
    if (visibleItems.length > 0) {
      result.push({
        ...group,
        items: visibleItems,
      });
    }
  }

  return result;
}
