"use client";

import * as React from "react";
import {
  Key,
  Search,
  Plus,
  CheckCircle2,
  XCircle,
  Printer,
  Shield,
  Sparkles,
  Lock,
} from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
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
    return isNaN(parsed.getTime()) ? "" : format(parsed, "d MMM yyyy");
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
        : "Inherited through assigned role hierarchy";
    }
    if (item.source === "OVERRIDE_GRANT") {
      const reason = item.reason ? ` — '${item.reason}'` : "";
      const dateStr = safeFormatDate(item.until);
      const expiry = dateStr ? `. Ends ${dateStr}` : "";
      return `Special access granted${reason}${expiry}`;
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
    <Card className="border-border/60 shadow-xs print:border-none print:shadow-none">
      <CardHeader className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4">
        <div>
          <CardTitle className="text-lg font-semibold flex items-center gap-2">
            <Key className="size-5 text-primary" />
            Permissions
          </CardTitle>
          <CardDescription>
            Live evaluation of all operational permissions with source attribution and security audit trails.
          </CardDescription>
        </div>

        <div className="flex items-center gap-2 shrink-0 print:hidden">
          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={handlePrint}
            className="gap-1.5 text-xs h-9"
          >
            <Printer className="size-3.5" />
            Print audit
          </Button>

          {can("USER.OVERRIDE.MANAGE") && onOpenOverrideDialog && (
            <Button
              type="button"
              onClick={onOpenOverrideDialog}
              size="sm"
              className="gap-1.5 text-xs h-9 shadow-xs"
            >
              <Plus className="size-3.5" />
              Special access
            </Button>
          )}
        </div>
      </CardHeader>

      <CardContent className="space-y-5">
        {/* Search & Source Filter Toolbar */}
        <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3 print:hidden">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 size-4 text-muted-foreground" />
            <Input
              placeholder="Search capabilities or permission code (e.g. approve, budget, REQUISITION)..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-9 h-9 text-xs bg-background"
            />
          </div>

          {/* Source Filter Tabs */}
          <div className="flex items-center gap-1 bg-muted p-1 rounded-lg border text-xs">
            <button
              type="button"
              onClick={() => setFilterSource("ALL")}
              className={`px-2.5 py-1 rounded-md transition-all font-medium ${
                filterSource === "ALL"
                  ? "bg-background text-foreground shadow-xs"
                  : "text-muted-foreground hover:text-foreground"
              }`}
            >
              All ({permissions.length})
            </button>
            <button
              type="button"
              onClick={() => setFilterSource("ROLE")}
              className={`px-2.5 py-1 rounded-md transition-all font-medium ${
                filterSource === "ROLE"
                  ? "bg-background text-foreground shadow-xs"
                  : "text-muted-foreground hover:text-foreground"
              }`}
            >
              Roles
            </button>
            <button
              type="button"
              onClick={() => setFilterSource("OVERRIDE")}
              className={`px-2.5 py-1 rounded-md transition-all font-medium ${
                filterSource === "OVERRIDE"
                  ? "bg-background text-foreground shadow-xs"
                  : "text-muted-foreground hover:text-foreground"
              }`}
            >
              Special access ({revoked.length + permissions.filter((p) => p.source === "OVERRIDE_GRANT").length})
            </button>
            <button
              type="button"
              onClick={() => setFilterSource("DELEGATION")}
              className={`px-2.5 py-1 rounded-md transition-all font-medium ${
                filterSource === "DELEGATION"
                  ? "bg-background text-foreground shadow-xs"
                  : "text-muted-foreground hover:text-foreground"
              }`}
            >
              Standing in
            </button>
          </div>
        </div>

        {/* Content */}
        {isLoading ? (
          <div className="py-12 text-center text-xs text-muted-foreground">
            Evaluating effective capabilities and attribution...
          </div>
        ) : filteredActiveGroups.length === 0 && filteredRevoked.length === 0 ? (
          <div className="py-10 text-center border rounded-xl border-dashed bg-muted/20">
            <Key className="size-8 text-muted-foreground/50 mx-auto mb-2" />
            <p className="text-sm font-medium text-foreground">No capabilities found</p>
            <p className="text-xs text-muted-foreground mt-1">
              Try adjusting your search query or filter source.
            </p>
          </div>
        ) : (
          <div className="space-y-6">
            {/* Active Permissions by Area (§Part 3.7) */}
            {filteredActiveGroups.map(({ area, items }) => (
              <div key={area} className="border border-border/80 rounded-xl p-4 bg-card/60 space-y-3 shadow-2xs">
                <div className="flex items-center justify-between border-b pb-2">
                  <h4 className="font-semibold text-xs text-foreground uppercase tracking-wider flex items-center gap-2">
                    <span className="size-2 rounded-full bg-primary" />
                    {area}
                  </h4>
                  <span className="text-xs text-muted-foreground">
                    {items.length} {items.length === 1 ? "capability" : "capabilities"}
                  </span>
                </div>

                <div className="divide-y divide-border/40">
                  {items.map((item) => {
                    const plainName = getPermissionPlainName(item.code);
                    const sourceText = formatSourceAttribution(item);

                    return (
                      <div
                        key={item.code}
                        className="py-2.5 px-2 flex flex-col sm:flex-row sm:items-center justify-between gap-2 hover:bg-muted/30 rounded-lg transition-colors"
                      >
                        <div className="space-y-0.5 min-w-0">
                          <div className="flex items-center gap-2">
                            <CheckCircle2 className="size-3.5 text-emerald-600 dark:text-emerald-400 shrink-0" />
                            <span className="font-semibold text-xs text-foreground">
                              {plainName}
                            </span>
                            <span className="text-[11px] font-mono text-muted-foreground">
                              ({item.code})
                            </span>
                          </div>
                          <p className="text-[11px] text-muted-foreground pl-5.5">
                            {sourceText}
                          </p>
                        </div>

                        {/* Tag Badge */}
                        <div className="shrink-0 pl-5.5 sm:pl-0">
                          {item.source === "OVERRIDE_GRANT" ? (
                            <Badge
                              variant="outline"
                              className="text-[10px] bg-purple-500/10 text-purple-600 dark:text-purple-400 border-purple-500/20"
                            >
                              Special access
                            </Badge>
                          ) : item.source === "DELEGATION" ? (
                            <Badge
                              variant="outline"
                              className="text-[10px] bg-blue-500/10 text-blue-600 dark:text-blue-400 border-blue-500/20"
                            >
                              Standing in
                            </Badge>
                          ) : item.source === "ROLE_INHERITED" ? (
                            <Badge
                              variant="secondary"
                              className="text-[10px] text-muted-foreground font-normal"
                            >
                              Inherited
                            </Badge>
                          ) : (
                            <Badge
                              variant="secondary"
                              className="text-[10px] text-muted-foreground font-normal"
                            >
                              Role
                            </Badge>
                          )}
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            ))}

            {/* Blocked / Revoked Permissions Section (§Part 3.7) */}
            {filteredRevoked.length > 0 && (
              <div className="border border-rose-200 bg-rose-50/40 dark:border-rose-900/60 dark:bg-rose-950/20 rounded-xl p-4 space-y-3 shadow-2xs">
                <div className="flex items-center justify-between border-b border-rose-200 dark:border-rose-900/60 pb-2">
                  <h4 className="font-semibold text-xs text-rose-800 dark:text-rose-300 uppercase tracking-wider flex items-center gap-2">
                    <XCircle className="size-3.5 text-rose-600 dark:text-rose-400" />
                    Blocked & Revoked Permissions
                  </h4>
                  <span className="text-xs text-rose-700/80 dark:text-rose-400">
                    {filteredRevoked.length} blocked
                  </span>
                </div>

                <div className="divide-y divide-rose-200/50 dark:divide-rose-900/40">
                  {filteredRevoked.map((r) => {
                    const plainName = getPermissionPlainName(r.code);
                    return (
                      <div
                        key={r.code}
                        className="py-2.5 px-2 flex flex-col sm:flex-row sm:items-center justify-between gap-2"
                      >
                        <div className="space-y-0.5 min-w-0">
                          <div className="flex items-center gap-2">
                            <XCircle className="size-3.5 text-rose-500 shrink-0" />
                            <span className="font-semibold text-xs text-foreground line-through opacity-75">
                              {plainName}
                            </span>
                            <span className="text-[11px] font-mono text-muted-foreground line-through opacity-75">
                              ({r.code})
                            </span>
                          </div>
                          {r.reason && (
                            <p className="text-[11px] text-rose-700 dark:text-rose-400 italic pl-5.5">
                              Blocked: {r.reason}
                            </p>
                          )}
                        </div>

                        <div className="shrink-0 pl-5.5 sm:pl-0">
                          <Badge
                            variant="outline"
                            className="text-[10px] bg-rose-500/10 text-rose-700 dark:text-rose-300 border-rose-500/30"
                          >
                            Revoked Override
                          </Badge>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            )}
          </div>
        )}
      </CardContent>
    </Card>
  );
}
