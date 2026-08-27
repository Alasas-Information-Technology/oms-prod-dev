"use client";

import * as React from "react";
import {
  Key,
  ShieldCheck,
  ShieldAlert,
  Search,
  Plus,
  ArrowUpRight,
  Filter,
  CheckCircle2,
  XCircle,
  HelpCircle,
  Clock,
  Sparkles,
} from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { EffectivePermissionsResponse, EffectivePermissionItem, RevokedPermissionItem } from "@/lib/types/authorization.types";
import { usePermission } from "@/hooks/usePermission";

interface UserPermissionsListProps {
  userId: string;
  effectiveData?: EffectivePermissionsResponse;
  isLoading?: boolean;
  onOpenOverrideDialog?: () => void;
}

export function UserPermissionsList({
  userId,
  effectiveData,
  isLoading = false,
  onOpenOverrideDialog,
}: UserPermissionsListProps) {
  const { can } = usePermission();
  const [searchTerm, setSearchTerm] = React.useState("");
  const [filterSource, setFilterSource] = React.useState<string>("ALL");

  const permissions = effectiveData?.permissions || [];
  const revoked = effectiveData?.revoked || [];

  // Group by Module (e.g. USER, ORG, PROCUREMENT, BUDGET, SECURITY)
  const groupedPermissions = React.useMemo(() => {
    const map = new Map<string, Array<{ code: string; item?: EffectivePermissionItem; isRevoked?: boolean; reason?: string }>>();

    // 1. Add active permissions
    permissions.forEach((p) => {
      const moduleName = p.code.split(".")[0] || "GENERAL";
      if (!map.has(moduleName)) {
        map.set(moduleName, []);
      }
      map.get(moduleName)!.push({ code: p.code, item: p, isRevoked: false });
    });

    // 2. Add revoked overrides
    revoked.forEach((r) => {
      const moduleName = r.code.split(".")[0] || "GENERAL";
      if (!map.has(moduleName)) {
        map.set(moduleName, []);
      }
      map.get(moduleName)!.push({ code: r.code, isRevoked: true, reason: r.reason });
    });

    return map;
  }, [permissions, revoked]);

  // Filter items
  const filteredGroups = React.useMemo(() => {
    const result: Array<{ module: string; items: Array<{ code: string; item?: EffectivePermissionItem; isRevoked?: boolean; reason?: string }> }> = [];

    groupedPermissions.forEach((items, module) => {
      const filtered = items.filter((entry) => {
        const matchesSearch =
          !searchTerm ||
          entry.code.toLowerCase().includes(searchTerm.toLowerCase()) ||
          module.toLowerCase().includes(searchTerm.toLowerCase());

        if (!matchesSearch) return false;

        if (filterSource === "ALL") return true;
        if (filterSource === "OVERRIDE") {
          return entry.isRevoked || entry.item?.source === "OVERRIDE_GRANT";
        }
        if (filterSource === "ROLE") {
          return entry.item?.source === "ROLE" || entry.item?.source === "ROLE_INHERITED";
        }
        if (filterSource === "DELEGATION") {
          return entry.item?.source === "DELEGATION";
        }
        return true;
      });

      if (filtered.length > 0) {
        result.push({ module, items: filtered });
      }
    });

    return result.sort((a, b) => a.module.localeCompare(b.module));
  }, [groupedPermissions, searchTerm, filterSource]);

  return (
    <Card className="border-border/60 shadow-xs">
      <CardHeader className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4">
        <div>
          <CardTitle className="text-lg font-semibold flex items-center gap-2">
            <Key className="size-5 text-primary" />
            What this user can do
          </CardTitle>
          <CardDescription>
            Live evaluation of all operational permissions computed from roles, overrides, and active delegations.
          </CardDescription>
        </div>
        {can("USER.OVERRIDE.MANAGE") && onOpenOverrideDialog && (
          <Button onClick={onOpenOverrideDialog} size="sm" variant="outline" className="gap-1.5 shrink-0">
            <Plus className="size-4" />
            Add Permission Override
          </Button>
        )}
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Search & Filter Bar */}
        <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 size-4 text-muted-foreground" />
            <Input
              placeholder="Search capabilities or module (e.g. USER.CREATE, ORG, BUDGET)..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-9 h-9 bg-background"
            />
          </div>
          <div className="flex items-center gap-1 bg-muted p-1 rounded-lg border text-xs">
            <button
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
              onClick={() => setFilterSource("ROLE")}
              className={`px-2.5 py-1 rounded-md transition-all font-medium ${
                filterSource === "ROLE"
                  ? "bg-background text-foreground shadow-xs"
                  : "text-muted-foreground hover:text-foreground"
              }`}
            >
              From Roles
            </button>
            <button
              onClick={() => setFilterSource("OVERRIDE")}
              className={`px-2.5 py-1 rounded-md transition-all font-medium ${
                filterSource === "OVERRIDE"
                  ? "bg-background text-foreground shadow-xs"
                  : "text-muted-foreground hover:text-foreground"
              }`}
            >
              Overrides ({revoked.length + permissions.filter((p) => p.source === "OVERRIDE_GRANT").length})
            </button>
          </div>
        </div>

        {/* Permissions Groups */}
        {isLoading ? (
          <div className="py-12 text-center text-sm text-muted-foreground">
            Evaluating effective capabilities...
          </div>
        ) : filteredGroups.length === 0 ? (
          <div className="py-10 text-center border rounded-xl border-dashed bg-muted/20">
            <Key className="size-8 text-muted-foreground/50 mx-auto mb-2" />
            <p className="text-sm font-medium text-foreground">No capabilities found</p>
            <p className="text-xs text-muted-foreground mt-1">
              Try adjusting your search query or filter source.
            </p>
          </div>
        ) : (
          <div className="space-y-4">
            {filteredGroups.map(({ module, items }) => (
              <div key={module} className="border rounded-xl p-4 bg-card/60 space-y-3">
                <div className="flex items-center justify-between border-b pb-2">
                  <h4 className="font-semibold text-sm text-foreground flex items-center gap-2">
                    <span className="size-2 rounded-full bg-primary" />
                    {module} Module
                  </h4>
                  <span className="text-xs text-muted-foreground">
                    {items.length} capability{items.length !== 1 ? "ies" : ""}
                  </span>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                  {items.map(({ code, item, isRevoked, reason }) => {
                    return (
                      <div
                        key={code}
                        className={`p-2.5 rounded-lg border text-xs flex items-center justify-between gap-2 transition-all ${
                          isRevoked
                            ? "bg-rose-500/5 border-rose-500/30 text-rose-700 dark:text-rose-400"
                            : item?.source === "OVERRIDE_GRANT"
                            ? "bg-purple-500/5 border-purple-500/30 text-foreground"
                            : "bg-background border-border/80 text-foreground"
                        }`}
                      >
                        <div className="flex items-center gap-2 min-w-0">
                          {isRevoked ? (
                            <XCircle className="size-4 text-rose-500 shrink-0" />
                          ) : (
                            <CheckCircle2 className="size-4 text-emerald-500 shrink-0" />
                          )}
                          <div className="min-w-0">
                            <p
                              className={`font-mono font-medium truncate ${
                                isRevoked ? "line-through text-muted-foreground" : "text-foreground"
                              }`}
                            >
                              {code}
                            </p>
                            {reason && (
                              <p className="text-[11px] text-rose-600 dark:text-rose-400 italic truncate">
                                Overridden: {reason}
                              </p>
                            )}
                          </div>
                        </div>

                        {/* Origin Source Badge */}
                        <div className="shrink-0">
                          {isRevoked ? (
                            <Badge
                              variant="outline"
                              className="text-[10px] bg-rose-500/10 text-rose-600 dark:text-rose-400 border-rose-500/20"
                            >
                              Override Revoke
                            </Badge>
                          ) : item?.source === "OVERRIDE_GRANT" ? (
                            <Badge
                              variant="outline"
                              className="text-[10px] bg-purple-500/10 text-purple-600 dark:text-purple-400 border-purple-500/20"
                            >
                              Explicit Grant
                            </Badge>
                          ) : item?.source === "DELEGATION" ? (
                            <Badge
                              variant="outline"
                              className="text-[10px] bg-blue-500/10 text-blue-600 dark:text-blue-400 border-blue-500/20"
                            >
                              Delegation
                            </Badge>
                          ) : (
                            <Badge
                              variant="secondary"
                              className="text-[10px] text-muted-foreground font-normal"
                            >
                              {item?.via ? `Via ${item.via}` : "Role"}
                            </Badge>
                          )}
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  );
}
