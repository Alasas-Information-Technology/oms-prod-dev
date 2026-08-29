"use client";

import * as React from "react";
import {
  Globe,
  Building2,
  Layers,
  MapPin,
  Trash2,
  Plus,
  CheckCircle2,
  Eye,
  Info,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { IUserScopeAssignmentDto, ScopeCode } from "@/lib/types/authorization.types";
import { usePermission } from "@/hooks/usePermission";
import { useRevokeScope } from "@/hooks/useAuthorization";
import { toast } from "sonner";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";

interface UserScopeCoverageCardProps {
  userId: string;
  scopes: IUserScopeAssignmentDto[];
  onOpenAssignDialog?: () => void;
}

export function UserScopeCoverageCard({
  userId,
  scopes,
  onOpenAssignDialog,
}: UserScopeCoverageCardProps) {
  const { can } = usePermission();
  const [scopeToRevoke, setScopeToRevoke] = React.useState<IUserScopeAssignmentDto | null>(null);

  const revokeMutation = useRevokeScope();

  const handleRevoke = async () => {
    if (!scopeToRevoke) return;
    try {
      await revokeMutation.mutateAsync({
        userId,
        scopeId: scopeToRevoke.userOrganizationScopeId,
      });
      toast.success("Organizational scope revoked successfully.");
      setScopeToRevoke(null);
    } catch (err: any) {
      toast.error(err?.response?.data?.message || err?.message || "Failed to revoke scope");
    }
  };

  const activeScopes = scopes.filter((s) => s.isActive);

  return (
    <Card className="border-border/60 shadow-xs">
      <CardHeader className="flex flex-row items-center justify-between pb-4">
        <div>
          <CardTitle className="text-lg font-semibold flex items-center gap-2">
            <Building2 className="size-5 text-primary" />
            Organizational Scope & Data Access
          </CardTitle>
          <CardDescription>
            Controls which departments, business units, or sections this user can view and operate on across the enterprise.
          </CardDescription>
        </div>
        {can("USER.SCOPE.ASSIGN") && onOpenAssignDialog && (
          <Button onClick={onOpenAssignDialog} size="sm" className="gap-1.5 shadow-xs">
            <Plus className="size-4" />
            Grant Scope
          </Button>
        )}
      </CardHeader>
      <CardContent className="space-y-6">
        {activeScopes.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-10 text-center border rounded-md border-dashed bg-muted/20">
            <Globe className="size-10 text-muted-foreground/50 mb-3" />
            <p className="text-sm font-medium text-foreground">No organizational scopes assigned</p>
            <p className="text-xs text-muted-foreground mt-1 max-w-sm">
              Without an explicit organizational scope, this user cannot access or view departmental records.
            </p>
            {can("USER.SCOPE.ASSIGN") && onOpenAssignDialog && (
              <Button onClick={onOpenAssignDialog} variant="outline" size="sm" className="mt-4 gap-1.5">
                <Plus className="size-4" />
                Assign Scope
              </Button>
            )}
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {activeScopes.map((scope) => {
              const isGlobal = scope.scopeCode === ScopeCode.GLOBAL;
              return (
                <div
                  key={scope.userOrganizationScopeId}
                  className={`p-4 rounded-md border transition-all ${
                    isGlobal
                      ? "bg-primary/5 border-primary/30 shadow-xs"
                      : "bg-card border-border/80 shadow-xs"
                  }`}
                >
                  <div className="flex items-start justify-between">
                    <div className="flex items-center gap-2.5">
                      <div
                        className={`size-9 rounded-lg flex items-center justify-center ${
                          isGlobal
                            ? "bg-primary text-primary-foreground"
                            : "bg-muted text-foreground"
                        }`}
                      >
                        {isGlobal ? (
                          <Globe className="size-5" />
                        ) : (
                          <Building2 className="size-5" />
                        )}
                      </div>
                      <div>
                        <div className="flex items-center gap-2">
                          <h4 className="font-semibold text-sm text-foreground">
                            {scope.scopeName || scope.scopeCode}
                          </h4>
                          <Badge
                            variant="secondary"
                            className="text-xs font-mono px-2 py-0"
                          >
                            {scope.scopeCode}
                          </Badge>
                        </div>
                        <p className="text-xs text-muted-foreground mt-0.5">
                          {isGlobal
                            ? "Full enterprise-wide access across all units"
                            : scope.orgUnitName
                            ? `${scope.orgUnitName} (${scope.orgUnitCode || "Unit"})`
                            : "Target unit access"}
                        </p>
                      </div>
                    </div>

                    {can("USER.SCOPE.ASSIGN") && (
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => setScopeToRevoke(scope)}
                        className="text-rose-600 hover:text-rose-700 hover:bg-rose-50 dark:hover:bg-rose-950/30 size-8 p-0"
                        title="Revoke Scope"
                      >
                        <Trash2 className="size-4" />
                      </Button>
                    )}
                  </div>

                  {/* Coverage note */}
                  <div className="mt-3 pt-3 border-t border-border/40 flex items-center justify-between text-xs text-muted-foreground">
                    <span className="flex items-center gap-1.5">
                      <Eye className="size-3.5 text-primary" />
                      <span>
                        {isGlobal
                          ? "Access to all current and future organizational units"
                          : "Includes all child units under this node in the hierarchy tree"}
                      </span>
                    </span>
                  </div>
                </div>
              );
            })}
          </div>
        )}

        {/* Confirmation Dialog */}
        <AlertDialog
          open={Boolean(scopeToRevoke)}
          onOpenChange={(o) => !o && setScopeToRevoke(null)}
        >
          <AlertDialogContent>
            <AlertDialogHeader>
              <AlertDialogTitle>Revoke Organizational Scope?</AlertDialogTitle>
              <AlertDialogDescription>
                Revoking this scope will immediately remove this user&apos;s visibility over records in{" "}
                <strong>{scopeToRevoke?.orgUnitName || scopeToRevoke?.scopeCode}</strong> and its descendant branches.
              </AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter>
              <AlertDialogCancel>Cancel</AlertDialogCancel>
              <AlertDialogAction
                onClick={handleRevoke}
                className="bg-rose-600 hover:bg-rose-700 text-white"
              >
                Revoke Scope
              </AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>
      </CardContent>
    </Card>
  );
}
