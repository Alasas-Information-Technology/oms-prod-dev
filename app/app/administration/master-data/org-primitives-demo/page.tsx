"use client";

import * as React from "react";
import {
  OrgUnitCard,
  OrgTypeIcon,
  OrgBreadcrumb,
  UnitPath,
  OrgBreadcrumbItem,
} from "@/components/organization";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import {
  Layers,
  Sparkles,
  Building2,
  Briefcase,
  Landmark,
  Eye,
  CheckCircle2,
  AlertCircle,
  Sun,
  Moon,
} from "lucide-react";

export default function OrgPrimitivesDemoPage() {
  // Theme simulator state for container preview
  const [isDarkPreview, setIsDarkPreview] = React.useState(false);

  // Interactive Sandbox state
  const [sandboxName, setSandboxName] = React.useState("Information Technology");
  const [sandboxNameAr, setSandboxNameAr] = React.useState("تقنية المعلومات");
  const [sandboxCode, setSandboxCode] = React.useState("CORP-IT");
  const [sandboxType, setSandboxType] = React.useState<"ORG" | "BU" | "DEP" | "SEC">("DEP");
  const [sandboxHead, setSandboxHead] = React.useState("Ahmed Al Mansouri");
  const [sandboxChildCount, setSandboxChildCount] = React.useState(4);
  const [sandboxPeopleCount, setSandboxPeopleCount] = React.useState(23);
  const [sandboxSelected, setSandboxSelected] = React.useState(false);
  const [sandboxExpanded, setSandboxExpanded] = React.useState(false);
  const [sandboxArchived, setSandboxArchived] = React.useState(false);
  const [sandboxNeedsAttention, setSandboxNeedsAttention] = React.useState(false);
  const [lastAction, setLastAction] = React.useState<string>("Click card buttons to test events");

  const deepBreadcrumb: OrgBreadcrumbItem[] = [
    { orgUnitId: "1", name: "DIEZ Holding", nameAr: "سلطة دبي للمناطق الاقتصادية", code: "DIEZ", typeCode: "ORG" },
    { orgUnitId: "2", name: "Corporate Services", nameAr: "الخدمات المؤسسية", code: "CORP", typeCode: "BU" },
    { orgUnitId: "3", name: "Information Technology", nameAr: "تقنية المعلومات", code: "IT", typeCode: "DEP" },
    { orgUnitId: "4", name: "Digital Platforms", nameAr: "المنصات الرقمية", code: "ENG", typeCode: "SEC" },
  ];

  return (
    <div className="space-y-8 p-6 pb-24">
      {/* Header Banner */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 p-6 rounded-2xl bg-card border border-border shadow-xs">
        <div>
          <div className="flex items-center gap-2">
            <Badge variant="outline" className="font-mono text-xs text-primary border-primary/30">
              V2 FOUNDATIONS
            </Badge>
            <span className="text-xs text-muted-foreground">Domain 2 Organization UI (v2)</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-foreground mt-1">
            Organization Visual Foundations Showroom
          </h1>
          <p className="text-sm text-muted-foreground mt-1 max-w-3xl">
            Isolated demonstration and verification of the human-centered visual foundations defined in Part 1 &amp; Part 3 of{" "}
            <code className="font-mono text-xs text-foreground bg-muted px-1.5 py-0.5 rounded">DOMAIN-2-ORGANIZATION-UI-V2.md</code>:
            OrgUnitCard anatomy, icon-based type badges, natural sentence counts, and light/dark theme compliance.
          </p>
        </div>

        <div className="flex items-center gap-3 shrink-0">
          <Button
            variant="outline"
            size="sm"
            onClick={() => setIsDarkPreview(!isDarkPreview)}
            className="gap-2 text-xs"
          >
            {isDarkPreview ? <Sun className="h-3.5 w-3.5" /> : <Moon className="h-3.5 w-3.5" />}
            {isDarkPreview ? "Show in Light Container" : "Simulate Dark Container"}
          </Button>
        </div>
      </div>

      {/* ========================================================================= */}
      {/* 1. OrgUnitCard State Showroom */}
      {/* ========================================================================= */}
      <Card className="border border-border shadow-xs">
        <CardHeader className="pb-4">
          <div className="flex items-center justify-between">
            <CardTitle className="text-lg font-bold flex items-center gap-2">
              <Building2 className="h-5 w-5 text-primary" />
              1. OrgUnitCard — Production State Matrix
            </CardTitle>
            <Badge variant="secondary" className="text-xs">
              Part 3.3 Anatomy
            </Badge>
          </div>
          <CardDescription>
            Card anatomy featuring tinted type icon, monospace code, bilingual names with RTL text isolation, who&apos;s in charge avatar, sentence counts, details action, and dynamic expand chevron.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <div
            className={`p-6 rounded-2xl border transition-colors ${
              isDarkPreview ? "dark bg-zinc-950 border-zinc-800 text-zinc-100" : "bg-muted/30 border-border"
            }`}
          >
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 items-start">
              {/* State A: Default */}
              <div className="space-y-2">
                <span className="text-xs font-semibold text-muted-foreground flex items-center gap-1.5">
                  <CheckCircle2 className="h-3.5 w-3.5 text-emerald-500" /> Default Rest State
                </span>
                <OrgUnitCard
                  id="card-default"
                  code="CORP-IT"
                  name="Information Technology"
                  nameAr="تقنية المعلومات"
                  typeName="Department"
                  typeCode="DEPARTMENT"
                  headName="Ahmed Al Mansouri"
                  childCount={4}
                  peopleCount={23}
                  onOpenDetails={() => setLastAction("Opened details for CORP-IT")}
                  onToggleExpand={() => setLastAction("Toggled expand for CORP-IT")}
                />
              </div>

              {/* State B: Selected (2px near-black border / weight change) */}
              <div className="space-y-2">
                <span className="text-xs font-semibold text-muted-foreground flex items-center gap-1.5">
                  <Sparkles className="h-3.5 w-3.5 text-primary" /> Selected (Weight Change)
                </span>
                <OrgUnitCard
                  id="card-selected"
                  code="CORP-IT"
                  name="Information Technology"
                  nameAr="تقنية المعلومات"
                  typeName="Department"
                  typeCode="DEPARTMENT"
                  headName="Ahmed Al Mansouri"
                  childCount={4}
                  peopleCount={23}
                  isSelected
                  isExpanded
                  onOpenDetails={() => setLastAction("Opened details for Selected Unit")}
                  onToggleExpand={() => setLastAction("Toggled expand for Selected Unit")}
                />
              </div>

              {/* State C: Needs Attention (Amber Dot for missing leader) */}
              <div className="space-y-2">
                <span className="text-xs font-semibold text-muted-foreground flex items-center gap-1.5">
                  <AlertCircle className="h-3.5 w-3.5 text-amber-500" /> Needs Attention (No Head)
                </span>
                <OrgUnitCard
                  id="card-attention"
                  code="DATA-ENG"
                  name="Data Engineering Section"
                  nameAr="قسم هندسة البيانات"
                  typeName="Section"
                  typeCode="SECTION"
                  headName={null}
                  childCount={0}
                  peopleCount={8}
                  needsAttention
                  onOpenDetails={() => setLastAction("Opened details for Data Engineering")}
                />
              </div>

              {/* State D: Archived (50% Opacity + Badge) */}
              <div className="space-y-2">
                <span className="text-xs font-semibold text-muted-foreground flex items-center gap-1.5">
                  <Eye className="h-3.5 w-3.5 text-muted-foreground" /> Archived (50% Opacity)
                </span>
                <OrgUnitCard
                  id="card-archived"
                  code="LEGACY-QA"
                  name="Legacy Systems & QA"
                  typeName="Section"
                  typeCode="SECTION"
                  headName="Mariam Al Zaabi"
                  childCount={0}
                  peopleCount={0}
                  isArchived
                  onOpenDetails={() => setLastAction("Opened details for Archived QA")}
                />
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* ========================================================================= */}
      {/* 2. OrgTypeIcon Showroom */}
      {/* ========================================================================= */}
      <Card className="border border-border shadow-xs">
        <CardHeader className="pb-4">
          <div className="flex items-center justify-between">
            <CardTitle className="text-lg font-bold flex items-center gap-2">
              <Layers className="h-5 w-5 text-primary" />
              2. OrgTypeIcon — Human-Friendly Iconography
            </CardTitle>
            <Badge variant="secondary" className="text-xs">
              Part 0 &amp; Part 3.3
            </Badge>
          </div>
          <CardDescription>
            Replaces dense engineering abbreviations (ORG, BU, DEP, SEC) with soft tinted iconography and accessible labels.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {/* Level 1: Organization */}
            <div className="p-4 rounded-xl border border-border bg-card space-y-3">
              <div className="flex items-center justify-between">
                <OrgTypeIcon type="ORGANIZATION" size="lg" />
                <Badge variant="outline" className="text-[10px] font-mono">Level 1</Badge>
              </div>
              <div>
                <p className="text-sm font-semibold text-foreground">Organization / Holding</p>
                <p className="text-xs text-muted-foreground">Top-level root authority (e.g. DIEZ)</p>
              </div>
              <OrgTypeIcon type="ORGANIZATION" size="sm" showLabel />
            </div>

            {/* Level 2: Business Unit */}
            <div className="p-4 rounded-xl border border-border bg-card space-y-3">
              <div className="flex items-center justify-between">
                <OrgTypeIcon type="BUSINESS_UNIT" size="lg" />
                <Badge variant="outline" className="text-[10px] font-mono">Level 2</Badge>
              </div>
              <div>
                <p className="text-sm font-semibold text-foreground">Business Unit</p>
                <p className="text-xs text-muted-foreground">Major executive division</p>
              </div>
              <OrgTypeIcon type="BUSINESS_UNIT" size="sm" showLabel />
            </div>

            {/* Level 3: Department */}
            <div className="p-4 rounded-xl border border-border bg-card space-y-3">
              <div className="flex items-center justify-between">
                <OrgTypeIcon type="DEPARTMENT" size="lg" />
                <Badge variant="outline" className="text-[10px] font-mono">Level 3</Badge>
              </div>
              <div>
                <p className="text-sm font-semibold text-foreground">Department</p>
                <p className="text-xs text-muted-foreground">Functional team &amp; budget owner</p>
              </div>
              <OrgTypeIcon type="DEPARTMENT" size="sm" showLabel />
            </div>

            {/* Level 4: Section */}
            <div className="p-4 rounded-xl border border-border bg-card space-y-3">
              <div className="flex items-center justify-between">
                <OrgTypeIcon type="SECTION" size="lg" />
                <Badge variant="outline" className="text-[10px] font-mono">Level 4</Badge>
              </div>
              <div>
                <p className="text-sm font-semibold text-foreground">Section</p>
                <p className="text-xs text-muted-foreground">Operational delivery team</p>
              </div>
              <OrgTypeIcon type="SECTION" size="sm" showLabel />
            </div>
          </div>
        </CardContent>
      </Card>

      {/* ========================================================================= */}
      {/* 3. Interactive Sandbox */}
      {/* ========================================================================= */}
      <Card className="border border-border shadow-xs">
        <CardHeader className="pb-4">
          <CardTitle className="text-lg font-bold flex items-center gap-2">
            <Sparkles className="h-5 w-5 text-primary" />
            3. Interactive Card Sandbox
          </CardTitle>
          <CardDescription>
            Adjust card properties in real-time to verify dynamic layout wrapping, bilingual RTL strings, and interactive states.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* Controls */}
            <div className="space-y-4 lg:col-span-2">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <Label className="text-xs font-semibold">Unit Name (English)</Label>
                  <Input
                    value={sandboxName}
                    onChange={(e) => setSandboxName(e.target.value)}
                    className="h-9 text-xs"
                  />
                </div>
                <div className="space-y-1.5">
                  <Label className="text-xs font-semibold">Unit Name (Arabic)</Label>
                  <Input
                    value={sandboxNameAr}
                    dir="rtl"
                    onChange={(e) => setSandboxNameAr(e.target.value)}
                    className="h-9 text-xs font-arabic text-right"
                  />
                </div>
                <div className="space-y-1.5">
                  <Label className="text-xs font-semibold">Code Chip</Label>
                  <Input
                    value={sandboxCode}
                    onChange={(e) => setSandboxCode(e.target.value)}
                    className="h-9 text-xs font-mono uppercase"
                  />
                </div>
                <div className="space-y-1.5">
                  <Label className="text-xs font-semibold">Who&apos;s In Charge</Label>
                  <Input
                    value={sandboxHead}
                    placeholder="Leave empty for amber dot"
                    onChange={(e) => setSandboxHead(e.target.value)}
                    className="h-9 text-xs"
                  />
                </div>
              </div>

              {/* Toggles */}
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 pt-2">
                <div className="flex items-center justify-between p-3 rounded-lg border bg-muted/20">
                  <Label className="text-xs font-medium cursor-pointer" htmlFor="toggle-selected">
                    Selected
                  </Label>
                  <Switch
                    id="toggle-selected"
                    checked={sandboxSelected}
                    onCheckedChange={setSandboxSelected}
                  />
                </div>
                <div className="flex items-center justify-between p-3 rounded-lg border bg-muted/20">
                  <Label className="text-xs font-medium cursor-pointer" htmlFor="toggle-expanded">
                    Expanded
                  </Label>
                  <Switch
                    id="toggle-expanded"
                    checked={sandboxExpanded}
                    onCheckedChange={setSandboxExpanded}
                  />
                </div>
                <div className="flex items-center justify-between p-3 rounded-lg border bg-muted/20">
                  <Label className="text-xs font-medium cursor-pointer" htmlFor="toggle-archived">
                    Archived
                  </Label>
                  <Switch
                    id="toggle-archived"
                    checked={sandboxArchived}
                    onCheckedChange={setSandboxArchived}
                  />
                </div>
                <div className="flex items-center justify-between p-3 rounded-lg border bg-muted/20">
                  <Label className="text-xs font-medium cursor-pointer" htmlFor="toggle-attention">
                    Amber Dot
                  </Label>
                  <Switch
                    id="toggle-attention"
                    checked={sandboxNeedsAttention}
                    onCheckedChange={setSandboxNeedsAttention}
                  />
                </div>
              </div>

              {/* Unit Type Radio Buttons */}
              <div className="space-y-1.5 pt-1">
                <Label className="text-xs font-semibold">Unit Type</Label>
                <div className="flex items-center gap-2 flex-wrap">
                  {(["ORG", "BU", "DEP", "SEC"] as const).map((t) => (
                    <Button
                      key={t}
                      type="button"
                      variant={sandboxType === t ? "default" : "outline"}
                      size="sm"
                      onClick={() => setSandboxType(t)}
                      className="text-xs h-8"
                    >
                      {t === "ORG" ? "Organization" : t === "BU" ? "Business Unit" : t === "DEP" ? "Department" : "Section"}
                    </Button>
                  ))}
                </div>
              </div>

              {/* Event Log Output */}
              <div className="p-3 rounded-lg bg-muted/40 border border-border text-xs font-mono text-muted-foreground flex items-center justify-between">
                <span>Last Action: <strong className="text-foreground">{lastAction}</strong></span>
              </div>
            </div>

            {/* Live Preview Pane */}
            <div className="flex flex-col items-center justify-center p-6 rounded-2xl bg-muted/30 border border-border">
              <span className="text-[11px] font-mono text-muted-foreground uppercase mb-4 tracking-wider">
                Live Render Output
              </span>
              <OrgUnitCard
                id="sandbox-node"
                code={sandboxCode || "CODE"}
                name={sandboxName || "Untitled Unit"}
                nameAr={sandboxNameAr}
                typeCode={sandboxType}
                headName={sandboxHead || null}
                childCount={sandboxChildCount}
                peopleCount={sandboxPeopleCount}
                isSelected={sandboxSelected}
                isExpanded={sandboxExpanded}
                isArchived={sandboxArchived}
                needsAttention={sandboxNeedsAttention}
                onOpenDetails={() => setLastAction(`Clicked [Details] on ${sandboxCode}`)}
                onToggleExpand={() => {
                  setSandboxExpanded(!sandboxExpanded);
                  setLastAction(`Toggled expand chevron (expanded: ${!sandboxExpanded})`);
                }}
              />
            </div>
          </div>
        </CardContent>
      </Card>

      {/* ========================================================================= */}
      {/* 4. Breadcrumb & Lineage Support */}
      {/* ========================================================================= */}
      <Card className="border border-border shadow-xs">
        <CardHeader className="pb-4">
          <CardTitle className="text-lg font-bold flex items-center gap-2">
            <Landmark className="h-5 w-5 text-primary" />
            4. Lineage &amp; Breadcrumb Integration
          </CardTitle>
          <CardDescription>
            Preserved OrgBreadcrumb and UnitPath primitives using the new OrgTypeIcon badges.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="p-4 rounded-xl border border-border bg-card space-y-2">
            <span className="text-xs font-semibold text-muted-foreground">OrgBreadcrumb (with Icon Badges):</span>
            <OrgBreadcrumb items={deepBreadcrumb} showIcons />
          </div>
          <div className="p-4 rounded-xl border border-border bg-card space-y-2">
            <span className="text-xs font-semibold text-muted-foreground">UnitPath (Plain Lineage Sentence):</span>
            <UnitPath ancestors={deepBreadcrumb} showCurrent currentName="Frontend Portal Section" />
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
