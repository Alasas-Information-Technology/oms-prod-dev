"use client";

import * as React from "react";
import Link from "next/link";
import {
  Users,
  Shield,
  Layers,
  CheckCircle2,
  AlertTriangle,
  ArrowRight,
  Info,
  Clock,
  Sparkles,
  Key,
  Building2,
  Lock,
  RotateCcw,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import {
  UserStatusBadge,
  UserAvatar,
  RoleChip,
  RoleOption,
  SummaryCard,
  SummaryCardRow,
  UserDetailPanel,
} from "@/components/users";
import {
  ROLE_DEFINITIONS,
  ERROR_MESSAGES,
  getPlainErrorMessage,
  getRoleExplanation,
  getRoleDisplayName,
  getPermissionPlainName,
  getPermissionArea,
  PERMISSION_CAPABILITIES,
} from "@/lib/constants/user-admin.constants";
import { toast } from "sonner";

export default function UserPrimitivesDemoPage() {
  // State for interactive RoleOption demonstration
  const [selectedRoles, setSelectedRoles] = React.useState<Record<string, boolean>>({
    HOD: true,
    FINANCE: false,
    SYSTEM_ADMIN: false,
  });

  // State for Slide-over Panel Live Demonstration
  const [demoUserId, setDemoUserId] = React.useState<string | null>(null);
  const [isDemoDirty, setIsDemoDirty] = React.useState<boolean>(false);

  // State for Error Code & Permission Lookup Demo
  const [selectedErrorCode, setSelectedErrorCode] = React.useState<string>("USER_LAST_ADMIN");
  const [searchPermCode, setSearchPermCode] = React.useState<string>("USER.DEACTIVATE");

  return (
    <div className="p-6 space-y-8 w-full">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b pb-5">
        <div>
          <div className="flex items-center gap-2">
            <span className="text-xs font-mono px-2 py-0.5 rounded bg-primary/10 text-primary font-semibold">
              DOMAIN 3 • PART 2 & PART 3.3
            </span>
          </div>
          <h1 className="text-2xl font-bold tracking-tight text-foreground flex items-center gap-2.5 mt-1.5">
            <Layers className="size-7 text-primary" />
            User Administration Primitives & Vocabulary System
          </h1>
          <p className="text-sm text-muted-foreground mt-1">
            Standard shared components and plain-language mappings designed for non-technical administrators (HR, managers). Uses existing theme tokens only.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <Button
            onClick={() => {
              setDemoUserId("3053433E-F36B-1410-85ED-009A959FB201");
              setIsDemoDirty(true);
            }}
            size="sm"
            className="gap-1.5 shadow-xs"
          >
            <Users className="size-4" />
            Preview 520px Slide-over Panel
          </Button>
          <Button asChild variant="outline" size="sm">
            <Link href="/app/administration/users">Back to Users</Link>
          </Button>
        </div>
      </div>

      {/* Grid of Primitive Demos */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* 1. UserStatusBadge Component */}
        <Card className="border-border/80 shadow-xs">
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle className="text-base font-semibold flex items-center gap-2">
                <CheckCircle2 className="size-5 text-primary" />
                1. UserStatusBadge (§Part 2)
              </CardTitle>
              <Badge variant="outline" className="text-[11px] font-mono">
                UserStatusBadge.tsx
              </Badge>
            </div>
            <CardDescription>
              Four strict plain-language states. Never displays raw backend codes.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 p-4 rounded-xl bg-muted/30 border">
              <div className="space-y-1">
                <span className="text-xs text-muted-foreground font-medium block">Active</span>
                <UserStatusBadge status="ACTIVE" />
              </div>

              <div className="space-y-1">
                <span className="text-xs text-muted-foreground font-medium block">Invited / Pending</span>
                <UserStatusBadge status="INVITED" />
              </div>

              <div className="space-y-1">
                <span className="text-xs text-muted-foreground font-medium block">Locked (Rate-limit)</span>
                <UserStatusBadge status="LOCKED" />
              </div>

              <div className="space-y-1">
                <span className="text-xs text-muted-foreground font-medium block">Inactive / Deactivated</span>
                <UserStatusBadge status="INACTIVE" />
              </div>
            </div>

            {/* Sizes & Dot variant */}
            <div className="pt-2 border-t space-y-2">
              <span className="text-xs font-semibold text-foreground">With status dot & medium size:</span>
              <div className="flex flex-wrap items-center gap-2.5">
                <UserStatusBadge status="ACTIVE" size="md" showDot />
                <UserStatusBadge status="INVITED" size="md" showDot />
                <UserStatusBadge status="LOCKED" size="md" showDot />
                <UserStatusBadge status="INACTIVE" size="md" showDot />
              </div>
            </div>
          </CardContent>
        </Card>

        {/* 2. UserAvatar Component */}
        <Card className="border-border/80 shadow-xs">
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle className="text-base font-semibold flex items-center gap-2">
                <Users className="size-5 text-primary" />
                2. UserAvatar (Sizes 24, 32, 56)
              </CardTitle>
              <Badge variant="outline" className="text-[11px] font-mono">
                UserAvatar.tsx
              </Badge>
            </div>
            <CardDescription>
              Deterministic pastel tint backgrounds based on identity string hash with 1-2 letter initials.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="p-4 rounded-xl bg-muted/30 border space-y-4">
              {/* Size 56 */}
              <div className="flex items-center gap-4">
                <UserAvatar name="Ahmed Al Mansouri" size={56} />
                <div>
                  <div className="text-sm font-semibold text-foreground">Ahmed Al Mansouri (56px)</div>
                  <div className="text-xs text-muted-foreground">Used in the Slide-over Panel Header (§3.2)</div>
                </div>
              </div>

              {/* Size 32 */}
              <div className="flex items-center gap-4">
                <UserAvatar name="Sara Ahmed" size={32} />
                <div>
                  <div className="text-sm font-semibold text-foreground">Sara Ahmed (32px)</div>
                  <div className="text-xs text-muted-foreground">Used in DataTable rows & delegation listings</div>
                </div>
              </div>

              {/* Size 24 */}
              <div className="flex items-center gap-4">
                <UserAvatar name="Omar Tariq" size={24} />
                <div>
                  <div className="text-sm font-semibold text-foreground">Omar Tariq (24px)</div>
                  <div className="text-xs text-muted-foreground">Used in compact badges and audit lines</div>
                </div>
              </div>

              {/* Deterministic Palette Variety */}
              <div className="pt-2 border-t flex items-center gap-2">
                <UserAvatar name="Khalid Ibrahim" size={32} />
                <UserAvatar name="Fatima Hassan" size={32} />
                <UserAvatar name="Zayd Noor" size={32} />
                <UserAvatar name="Mariam Saeed" size={32} />
                <UserAvatar name="Yousef Rashid" size={32} />
                <UserAvatar name="Layla Qasim" size={32} />
              </div>
            </div>
          </CardContent>
        </Card>

        {/* 3. RoleChip Component */}
        <Card className="border-border/80 shadow-xs">
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle className="text-base font-semibold flex items-center gap-2">
                <Shield className="size-5 text-primary" />
                3. RoleChip with Plain Explanation Tooltip
              </CardTitle>
              <Badge variant="outline" className="text-[11px] font-mono">
                RoleChip.tsx
              </Badge>
            </div>
            <CardDescription>
              Displays role label; hover reveals one-line plain language capability explanation.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="p-4 rounded-xl bg-muted/30 border space-y-3">
              <p className="text-xs text-muted-foreground">
                Hover any chip below to inspect its plain explanation:
              </p>
              <div className="flex flex-wrap gap-2">
                <RoleChip roleCode="HOD" />
                <RoleChip roleCode="SYSTEM_ADMIN" />
                <RoleChip roleCode="FINANCE" />
                <RoleChip roleCode="PROCUREMENT" />
                <RoleChip roleCode="HR" />
                <RoleChip roleCode="LINE_MANAGER" />
                <RoleChip roleCode="AUDITOR" />
                <RoleChip roleCode="VENDOR" />
              </div>
            </div>
          </CardContent>
        </Card>

        {/* 4. SummaryCard Component (§Part 3.3) */}
        <Card className="border-border/80 shadow-xs">
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle className="text-base font-semibold flex items-center gap-2">
                <Building2 className="size-5 text-primary" />
                4. SummaryCard Metric Rows (§Part 3.3)
              </CardTitle>
              <Badge variant="outline" className="text-[11px] font-mono">
                SummaryCard.tsx
              </Badge>
            </div>
            <CardDescription>
              Four interactive summary rows with chevron triggers matching the panel reference design.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <SummaryCard>
              <SummaryCardRow
                icon={Shield}
                label="Roles"
                value="2 roles"
                onClick={() => toast.info("Scrolling to Roles section...")}
              />
              <SummaryCardRow
                icon={Building2}
                label="What they can see"
                value="47 departments"
                onClick={() => toast.info("Scrolling to Access section...")}
              />
              <SummaryCardRow
                icon={Key}
                label="What they can do"
                value="34 capabilities"
                onClick={() => toast.info("Opening full Permissions Audit Modal...")}
                badge={
                  <Badge variant="secondary" className="text-[10px]">
                    Audit
                  </Badge>
                }
              />
              <SummaryCardRow
                icon={Clock}
                label="Last signed in"
                value="2 hours ago"
                onClick={() => toast.info("Opening Activity Trail...")}
              />
            </SummaryCard>
          </CardContent>
        </Card>
      </div>

      {/* 5. RoleOption Component (§Part 3.5 & Invite Flow) */}
      <Card className="border-border/80 shadow-xs">
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle className="text-base font-semibold flex items-center gap-2">
              <Shield className="size-5 text-primary" />
              5. RoleOption Checkbox Rows (§Part 3.5 & Invite Flow)
            </CardTitle>
            <Badge variant="outline" className="text-[11px] font-mono">
              RoleOption.tsx
            </Badge>
          </div>
          <CardDescription>
            Interactive checkbox rows featuring role name and plain one-line explanation beneath.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-3">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            <RoleOption
              roleCode="HOD"
              checked={selectedRoles.HOD}
              onCheckedChange={(c) =>
                setSelectedRoles((prev) => ({ ...prev, HOD: c }))
              }
              onSetDatesClick={() => toast.info("Configure effective dates for HOD")}
            />

            <RoleOption
              roleCode="FINANCE"
              checked={selectedRoles.FINANCE}
              onCheckedChange={(c) =>
                setSelectedRoles((prev) => ({ ...prev, FINANCE: c }))
              }
              futureStartDate="1 Oct 2026"
              onSetDatesClick={() => toast.info("Configure effective dates for Finance")}
            />

            <RoleOption
              roleCode="PROCUREMENT"
              checked={false}
              onCheckedChange={() => toast.info("Selected Procurement")}
            />

            <RoleOption
              roleCode="SYSTEM_ADMIN"
              checked={selectedRoles.SYSTEM_ADMIN}
              onCheckedChange={(c) =>
                setSelectedRoles((prev) => ({ ...prev, SYSTEM_ADMIN: c }))
              }
            />
          </div>
        </CardContent>
      </Card>

      {/* 6. Constants & Error Messages Mapping Explorer */}
      <Card className="border-border/80 shadow-xs">
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle className="text-base font-semibold flex items-center gap-2">
              <AlertTriangle className="size-5 text-amber-500" />
              6. Domain 3 Plain Language Error & Permission Mapping Engine
            </CardTitle>
            <Badge variant="outline" className="text-[11px] font-mono">
              user-admin.constants.ts
            </Badge>
          </div>
          <CardDescription>
            Translates technical backend error codes and raw permission codes into human-centered, actionable copy.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* Error Message Tester */}
          <div className="space-y-2">
            <span className="text-xs font-semibold text-foreground">
              Backend Error Code to Actionable Message Translator:
            </span>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
              <select
                value={selectedErrorCode}
                onChange={(e) => setSelectedErrorCode(e.target.value)}
                className="w-full h-10 px-3 rounded-lg border bg-background text-xs font-mono"
              >
                {Object.keys(ERROR_MESSAGES).map((code) => (
                  <option key={code} value={code}>
                    {code}
                  </option>
                ))}
              </select>

              <div className="md:col-span-2 p-3 rounded-xl border bg-rose-50/50 border-rose-200 dark:bg-rose-950/20 dark:border-rose-800 text-xs flex items-center gap-2.5">
                <AlertTriangle className="size-4 text-rose-600 shrink-0" />
                <span className="font-medium text-rose-800 dark:text-rose-300">
                  {getPlainErrorMessage(selectedErrorCode)}
                </span>
              </div>
            </div>
          </div>

          {/* Permission Code Translator */}
          <div className="space-y-2 pt-4 border-t">
            <span className="text-xs font-semibold text-foreground">
              Raw Permission Code to Plain Capability Name:
            </span>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
              <select
                value={searchPermCode}
                onChange={(e) => setSearchPermCode(e.target.value)}
                className="w-full h-10 px-3 rounded-lg border bg-background text-xs font-mono"
              >
                {Object.keys(PERMISSION_CAPABILITIES).map((code) => (
                  <option key={code} value={code}>
                    {code} ({PERMISSION_CAPABILITIES[code].area})
                  </option>
                ))}
              </select>

              <div className="md:col-span-2 p-3 rounded-xl border bg-primary/5 border-primary/20 text-xs flex items-center justify-between gap-2.5">
                <div className="flex items-center gap-2">
                  <Key className="size-4 text-primary shrink-0" />
                  <span className="font-semibold text-foreground">
                    &quot;{getPermissionPlainName(searchPermCode)}&quot;
                  </span>
                </div>
                <Badge variant="secondary" className="text-[10px]">
                  {getPermissionArea(searchPermCode)}
                </Badge>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* 520px Slide-over Person Details Panel Demonstration */}
      <UserDetailPanel
        isOpen={Boolean(demoUserId)}
        userId={demoUserId}
        onClose={() => setDemoUserId(null)}
        isDirty={isDemoDirty}
        onSave={() => {
          setIsDemoDirty(false);
          toast.success("Saved changes successfully.");
        }}
        onDiscard={() => {
          setIsDemoDirty(false);
          toast.info("Discarded changes.");
        }}
        onOpenPermissionsModal={() => toast.info("Opening full Permissions Audit Modal (§3.7)...")}
        onOpenActivityModal={() => toast.info("Opening Activity Trail...")}
      >
        <div className="p-4 rounded-xl border bg-muted/20 space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-foreground">Slide-over Panel Slot Demo</span>
            <Button
              variant="outline"
              size="sm"
              onClick={() => setIsDemoDirty(!isDemoDirty)}
              className="h-7 text-xs"
            >
              {isDemoDirty ? "Clear dirty state" : "Simulate dirty state"}
            </Button>
          </div>
          <p className="text-xs text-muted-foreground">
            Try clicking the close button or outside when dirty to test the Unsaved Changes Guard dialog!
          </p>
        </div>
      </UserDetailPanel>
    </div>
  );
}
