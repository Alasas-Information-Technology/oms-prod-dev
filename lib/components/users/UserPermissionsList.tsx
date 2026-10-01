"use client";

import * as React from "react";
import {
  Key,
  Search,
  Plus,
  Printer,
  XCircle,
} from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import {
  EffectivePermissionsResponse,
  EffectivePermissionItem,
  RevokedPermissionItem,
} from "@/lib/types/authorization.types";
import {
  getPermissionPlainName,
  getPermissionArea,
  getRoleDisplayName,
} from "@/lib/constants/user-admin.constants";
import { usePermission } from "@/hooks/usePermission";
import { format } from "date-fns";
import { UserPanelCard, UserPanelRow } from "@/components/users/UserPanelCard";

interface UserPermissionsListProps {
  userId: string;
  effectiveData?: EffectivePermissionsResponse | any;
  isLoading?: boolean;
  onOpenOverrideDialog?: () => void;
}

function safeFormatDate(d?: string | Date | null): string {
  if (!d) return "";
  try {
    const parsed = new Date(d);
    return isNaN(parsed.getTime()) ? "" : format(parsed, "d MMM"); // Spec says "30 Sept"
  } catch {
    return "";
  }
}

export function UserPermissionsList({
  userId,
  effectiveData,
  isLoading = false,
  onOpenOverrideDialog,
}: UserPermissionsListProps) {
  const { can } = usePermission();
  const [searchTerm, setSearchTerm] = React.useState("");
  const [filterSource, setFilterSource] = React.useState<"ALL" | "ROLE" | "OVERRIDE" | "DELEGATION">("ALL");

  // Normalize raw permissions safely
  const rawPermissions = Array.isArray(effectiveData?.permissions)
    ? effectiveData.permissions
    : Array.isArray(effectiveData)
    ? effectiveData
    : Array.isArray(effectiveData?.data)
    ? effectiveData.data
    : [];

  const permissions: EffectivePermissionItem[] = React.useMemo(() => {
    return rawPermissions
      .map((p: any) => {
        if (!p) return null;
        if (typeof p === "string") {
          return { code: p, source: "ROLE" } as EffectivePermissionItem;
        }
        return {
          code: p.code || p.permissionCode || p.name || "",
          source: p.source || "ROLE",
          via: p.via,
          reason: p.reason,
          until: p.until || p.expiresAt,
        } as EffectivePermissionItem;
      })
      .filter((p: EffectivePermissionItem | null): p is EffectivePermissionItem => Boolean(p && p.code));
  }, [rawPermissions]);

  const rawRevoked = Array.isArray(effectiveData?.revoked)
    ? effectiveData.revoked
    : [];

  const revoked: RevokedPermissionItem[] = React.useMemo(() => {
    return rawRevoked
      .map((r: any) => {
        if (!r) return null;
        if (typeof r === "string") {
          return { code: r, source: "OVERRIDE_REVOKE" } as RevokedPermissionItem;
        }
        return {
          code: r.code || r.permissionCode || "",
          source: "OVERRIDE_REVOKE",
          reason: r.reason,
        } as RevokedPermissionItem;
      })
      .filter((r: RevokedPermissionItem | null): r is RevokedPermissionItem => Boolean(r && r.code));
  }, [rawRevoked]);

  // Group active permissions by functional Area (§Part 3.7: Requests, Budget, Candidates, Vendors, Administration, General)
  const groupedActivePermissions = React.useMemo(() => {
    const map = new Map<string, EffectivePermissionItem[]>();

    permissions.forEach((p) => {
      const area = getPermissionArea(p.code);
      if (!map.has(area)) {
        map.set(area, []);
      }
      map.get(area)!.push(p);
    });

    return map;
  }, [permissions]);

  // Filter items based on search and source
  const filteredActiveGroups = React.useMemo(() => {
    const result: Array<{ area: string; items: EffectivePermissionItem[] }> = [];
    const searchLower = searchTerm.toLowerCase();

    groupedActivePermissions.forEach((items, area) => {
      const filtered = items.filter((item) => {
        const plainName = getPermissionPlainName(item.code).toLowerCase();
        // Search matches against plain name or area. Permission code is removed from UI but still searchable just in case.
        const codeLower = item.code.toLowerCase();
        const areaLower = area.toLowerCase();

        const matchesSearch =
          !searchTerm ||
          plainName.includes(searchLower) ||
          codeLower.includes(searchLower) ||
          areaLower.includes(searchLower);

        if (!matchesSearch) return false;

        if (filterSource === "ALL") return true;
        if (filterSource === "ROLE") {
          return item.source === "ROLE" || item.source === "ROLE_INHERITED";
        }
        if (filterSource === "OVERRIDE") {
          return item.source === "OVERRIDE_GRANT";
        }
        if (filterSource === "DELEGATION") {
          return item.source === "DELEGATION";
        }
        return true;
      });

      if (filtered.length > 0) {
        result.push({ area, items: filtered });
      }
    });

    const areaOrder = ["Requests", "Budget", "Candidates", "Vendors", "Administration", "General"];
    return result.sort((a, b) => {
      const idxA = areaOrder.indexOf(a.area);
      const idxB = areaOrder.indexOf(b.area);
      if (idxA !== -1 && idxB !== -1) return idxA - idxB;
      return a.area.localeCompare(b.area);
    });
  }, [groupedActivePermissions, searchTerm, filterSource]);

  // Filter revoked / blocked permissions (§Part 3.7)
  const filteredRevoked = React.useMemo(() => {
    const searchLower = searchTerm.toLowerCase();
    return revoked.filter((r) => {
      const plainName = getPermissionPlainName(r.code).toLowerCase();
      const codeLower = r.code.toLowerCase();
      const reasonLower = (r.reason || "").toLowerCase();

      const matchesSearch =
        !searchTerm ||
        plainName.includes(searchLower) ||
        codeLower.includes(searchLower) ||
        reasonLower.includes(searchLower);

      if (!matchesSearch) return false;
      if (filterSource === "ROLE" || filterSource === "DELEGATION") return false;
      return true;
    });
  }, [revoked, searchTerm, filterSource]);

  // Format source attribution string (§Part 3.7)
  const formatSourceAttribution = (item: EffectivePermissionItem): string => {
    if (item.source === "ROLE_INHERITED") {
      return item.via
        ? `From ${getRoleDisplayName(item.via)}, which includes ${getPermissionPlainName(item.code)}`
        : "From inherited roles";
    }
    if (item.source === "OVERRIDE_GRANT") {
      const reason = item.reason ? ` — '${item.reason}'` : "";
      const dateStr = safeFormatDate(item.until);
      const expiry = dateStr ? `. Ends ${dateStr}` : "";
      const granter = item.via ? `Given directly by ${item.via}` : "Given directly";
      return `${granter}${reason}${expiry}`;
    }
    if (item.source === "DELEGATION") {
      const delegator = item.via ? ` for ${item.via}` : "";
      const dateStr = safeFormatDate(item.until);
      const until = dateStr ? ` until ${dateStr}` : "";
      return `While standing in${delegator}${until}`;
    }
    // Default ROLE source
    if (item.via) {
      return `From their ${getRoleDisplayName(item.via)} role`;
    }
    return "From their assigned roles";
  };

  const handlePrint = () => {
    if (typeof window !== "undefined") {
      window.print();
    }
  };

  return (
    <div className="space-y-6 animate-in fade-in-50">
      {/* Header & Controls */}
      <div className="flex flex-col gap-4 print:hidden">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h3 className="text-[17px] font-semibold font-display flex items-center gap-2 text-foreground tracking-tight">
              <Key className="size-5 text-primary" />
              Permissions
            </h3>
            <p className="text-[13px] text-muted-foreground mt-1 max-w-xl leading-relaxed">
              Live evaluation of all operational permissions with source attribution and security audit trails.
            </p>
          </div>
          <div className="flex items-center gap-2 shrink-0">
            <Button type="button" variant="outline" size="sm" onClick={handlePrint} className="h-9 text-xs">
              <Printer className="size-3.5 mr-2" />
              Print audit
            </Button>
            {can("USER.OVERRIDE.MANAGE") && onOpenOverrideDialog && (
              <Button type="button" onClick={onOpenOverrideDialog} size="sm" className="h-9 text-xs shadow-xs">
                <Plus className="size-3.5 mr-2" />
                Special access
              </Button>
            )}
          </div>
        </div>

        <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 size-4 text-muted-foreground" />
            <Input
              placeholder="Search capabilities (e.g. approve, budget)..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-9 h-9 text-[13px] bg-card border-border/60 shadow-xs"
            />
          </div>

          <div className="flex items-center gap-1 bg-muted/60 p-1 rounded-lg border border-border/50 text-[13px]">
            <button
              type="button"
              onClick={() => setFilterSource("ALL")}
              className={`px-3 py-1.5 rounded-md transition-all font-medium ${
                filterSource === "ALL"
                  ? "bg-card text-foreground shadow-xs"
                  : "text-muted-foreground hover:text-foreground"
              }`}
            >
              All ({permissions.length})
            </button>
            <button
              type="button"
              onClick={() => setFilterSource("ROLE")}
              className={`px-3 py-1.5 rounded-md transition-all font-medium ${
                filterSource === "ROLE"
                  ? "bg-card text-foreground shadow-xs"
                  : "text-muted-foreground hover:text-foreground"
              }`}
            >
              Roles
            </button>
            <button
              type="button"
              onClick={() => setFilterSource("OVERRIDE")}
              className={`px-3 py-1.5 rounded-md transition-all font-medium ${
                filterSource === "OVERRIDE"
                  ? "bg-card text-foreground shadow-xs"
                  : "text-muted-foreground hover:text-foreground"
              }`}
            >
              Special access ({revoked.length + permissions.filter((p) => p.source === "OVERRIDE_GRANT").length})
            </button>
            <button
              type="button"
              onClick={() => setFilterSource("DELEGATION")}
              className={`px-3 py-1.5 rounded-md transition-all font-medium ${
                filterSource === "DELEGATION"
                  ? "bg-card text-foreground shadow-xs"
                  : "text-muted-foreground hover:text-foreground"
              }`}
            >
              Standing in
            </button>
          </div>
        </div>
      </div>

      {/* Content */}
      {isLoading ? (
        <div className="py-12 text-center text-[13px] text-muted-foreground">
          Evaluating effective capabilities and attribution...
        </div>
      ) : filteredActiveGroups.length === 0 && filteredRevoked.length === 0 ? (
        <div className="py-12 text-center border border-dashed border-border/60 rounded-xl bg-muted/20">
          <Key className="size-8 text-muted-foreground/30 mx-auto mb-3" />
          <p className="text-[14px] font-medium text-foreground">No capabilities found</p>
          <p className="text-[13px] text-muted-foreground mt-1">
            Try adjusting your search query or filter source.
          </p>
        </div>
      ) : (
        <div className="space-y-6 print:space-y-4">
          {filteredActiveGroups.map(({ area, items }) => (
            <UserPanelCard key={area} title={area}>
              {items.map((item) => {
                const plainName = getPermissionPlainName(item.code);
                const sourceText = formatSourceAttribution(item);

                return (
                  <UserPanelRow key={item.code} className="flex-col items-start sm:flex-row sm:items-center gap-2 py-3">
                    <div className="w-full sm:w-[45%] pr-4 flex items-center gap-2">
                      <span className="font-medium text-foreground leading-snug break-words">
                        {plainName}
                      </span>
                    </div>
                    <div className="w-full sm:w-[55%] text-left sm:text-right">
                      <span className="text-muted-foreground text-[13px] leading-snug">
                        {sourceText}
                      </span>
                    </div>
                  </UserPanelRow>
                );
              })}
            </UserPanelCard>
          ))}

          {filteredRevoked.length > 0 && (
            <UserPanelCard
              title="Blocked Permissions"
              className="border-rose-200 bg-rose-50/30 dark:border-rose-900/40 dark:bg-rose-950/20"
            >
              {filteredRevoked.map((r) => {
                const plainName = getPermissionPlainName(r.code);
                return (
                  <UserPanelRow key={r.code} className="flex-col items-start sm:flex-row sm:items-center gap-2 py-3 border-rose-200/50 dark:border-rose-900/40">
                    <div className="w-full sm:w-[45%] pr-4 flex items-center gap-2">
                      <XCircle className="size-4 text-rose-500 shrink-0 hidden sm:block" />
                      <span className="font-medium text-foreground line-through opacity-75 leading-snug break-words">
                        {plainName}
                      </span>
                    </div>
                    <div className="w-full sm:w-[55%] text-left sm:text-right">
                      <span className="text-rose-700 dark:text-rose-400 text-[13px] italic leading-snug">
                        Blocked{r.reason ? `: ${r.reason}` : ""}
                      </span>
                    </div>
                  </UserPanelRow>
                );
              })}
            </UserPanelCard>
          )}
        </div>
      )}
    </div>
  );
}
