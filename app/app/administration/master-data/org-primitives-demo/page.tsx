"use client";

import * as React from "react";
import {
  OrgTypeSigil,
  HierarchySpine,
  OrgBreadcrumb,
  UnitPath,
  OrgBreadcrumbItem,
} from "@/components/oms/org";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { Slider } from "@/components/ui/slider";
import {
  Layers,
  GitBranch,
  Navigation,
  FileText,
  CheckCircle2,
  Sparkles,
  Info,
} from "lucide-react";

export default function OrgPrimitivesDemoPage() {
  // Sandbox states
  const [sandboxDepth, setSandboxDepth] = React.useState(2);
  const [sandboxIsLast, setSandboxIsLast] = React.useState(false);
  const [sandboxHasChildren, setSandboxHasChildren] = React.useState(true);
  const [breadcrumbShowSigils, setBreadcrumbShowSigils] = React.useState(true);
  const [breadcrumbShowCodes, setBreadcrumbShowCodes] = React.useState(true);
  const [lastClickedNode, setLastClickedNode] = React.useState<string | null>(null);

  // Mock tree structure for spine demonstration
  const mockTreeNodes = [
    { id: "1", name: "Dubai Integrated Economic Zones (DIEZ)", type: "ORG", depth: 0, isLast: true, ancestorIsLast: [] },
    { id: "2", name: "Corporate Services", type: "BU", depth: 1, isLast: false, ancestorIsLast: [true] },
    { id: "3", name: "Information Technology", type: "DEP", depth: 2, isLast: false, ancestorIsLast: [true, false] },
    { id: "4", name: "Application Development", type: "SEC", depth: 3, isLast: false, ancestorIsLast: [true, false, false] },
    { id: "5", name: "Frontend Platforms", type: "SEC", depth: 4, isLast: true, ancestorIsLast: [true, false, false, false] },
    { id: "6", name: "Cloud Infrastructure", type: "SEC", depth: 3, isLast: true, ancestorIsLast: [true, false, false] },
    { id: "7", name: "Finance & Accounting", type: "DEP", depth: 2, isLast: true, ancestorIsLast: [true, false] },
    { id: "8", name: "Free Zones Authority", type: "BU", depth: 1, isLast: true, ancestorIsLast: [true] },
    { id: "9", name: "Licensing & Operations", type: "DEP", depth: 2, isLast: true, ancestorIsLast: [true, true] },
  ];

  // Mock deep hierarchy breadcrumbs
  const shallowBreadcrumb: OrgBreadcrumbItem[] = [
    { orgUnitId: "1", name: "DIEZ", nameAr: "ديز", code: "DIEZ", typeCode: "ORG" },
    { orgUnitId: "2", name: "Technology", nameAr: "التكنولوجيا", code: "TECH", typeCode: "BU" },
  ];

  const deepBreadcrumb: OrgBreadcrumbItem[] = [
    { orgUnitId: "1", name: "DIEZ Holding", nameAr: "سلطة دبي للمناطق الاقتصادية", code: "DIEZ", typeCode: "ORG" },
    { orgUnitId: "2", name: "Corporate Services", nameAr: "الخدمات المؤسسية", code: "CORP", typeCode: "BU" },
    { orgUnitId: "3", name: "Information Technology", nameAr: "تقنية المعلومات", code: "IT", typeCode: "DEP" },
    { orgUnitId: "4", name: "Digital Engineering", nameAr: "الهندسة الرقمية", code: "ENG", typeCode: "SEC" },
    { orgUnitId: "5", name: "Core Application Development", nameAr: "تطوير التطبيقات", code: "APP-DEV", typeCode: "SEC" },
    { orgUnitId: "6", name: "Frontend Portal Section", nameAr: "قسم واجهة المستخدم", code: "FE-TEAM", typeCode: "SEC" },
  ];

  return (
    <div className="space-y-8 p-6 max-w-7xl mx-auto pb-20">
      {/* Header Banner */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 p-6 rounded-2xl bg-card border border-border shadow-xs">
        <div>
          <div className="flex items-center gap-2">
            <Badge variant="outline" className="font-mono text-xs text-primary border-primary/30">
              PROMPT U2 FOUNDATION
            </Badge>
            <span className="text-xs text-muted-foreground">Domain 2 Organization UI</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-foreground mt-1">
            Organization Visual Primitives Showroom
          </h1>
          <p className="text-sm text-muted-foreground mt-1 max-w-3xl">
            Isolated demonstration and verification of the 4 shared visual primitives defined in Part 1 of{" "}
            <code className="font-mono text-xs text-foreground bg-muted px-1.5 py-0.5 rounded">DOMAIN-2-ORGANIZATION-UI.md</code>:
            Fixed-width Type Sigils, Pixel-Perfect Hierarchy Spine, Middle-Truncating Breadcrumb, and Inline Ancestor Path.
          </p>
        </div>
      </div>

      {/* Grid of Primitive Showcases */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        
        {/* ========================================================================= */}
        {/* 1. OrgTypeSigil Showroom */}
        {/* ========================================================================= */}
        <Card className="border border-border shadow-xs">
          <CardHeader className="pb-4">
            <CardTitle className="text-lg font-bold flex items-center gap-2">
              <Layers className="h-5 w-5 text-primary" />
              1. OrgTypeSigil (Fixed-Width Monospace Type Indicator)
            </CardTitle>
            <CardDescription>
              Structural monospace indicator (<code className="font-mono text-xs">ORG</code> / <code className="font-mono text-xs">BU</code> / <code className="font-mono text-xs">DEP</code> / <code className="font-mono text-xs">SEC</code>) that aligns into a clean vertical column across rows without turning the screen into colourful confetti.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            {/* Sizes Showcase */}
            <div className="space-y-3 p-4 rounded-xl bg-muted/30 border border-border/60">
              <h4 className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                Canonical Types & Sizes
              </h4>
              <div className="grid grid-cols-4 gap-3 text-center">
                {(["ORG", "BU", "DEP", "SEC"] as const).map((type) => (
                  <div key={type} className="space-y-2 flex flex-col items-center">
                    <OrgTypeSigil type={type} size="md" />
                    <span className="text-[11px] font-medium text-muted-foreground">
                      {type === "ORG" && "Holding"}
                      {type === "BU" && "Division"}
                      {type === "DEP" && "Budget Owner"}
                      {type === "SEC" && "Subunit"}
                    </span>
                  </div>
                ))}
              </div>
            </div>

            {/* Column Alignment in Table Preview */}
            <div className="space-y-2">
              <h4 className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                Column Alignment Proof (Dense Row List)
              </h4>
              <div className="border border-border rounded-lg overflow-hidden divide-y divide-border text-xs">
                {[
                  { name: "Dubai Integrated Economic Zones", type: "ORG", code: "DIEZ" },
                  { name: "Corporate Services Division", type: "BU", code: "CORP-SERV" },
                  { name: "Information Technology Department", type: "DEP", code: "CC-1042" },
                  { name: "Frontend Platform Section", type: "SEC", code: "FE-PLAT" },
                ].map((row, idx) => (
                  <div key={idx} className="flex items-center justify-between px-3 py-2 bg-card hover:bg-muted/40 transition-colors">
                    <div className="flex items-center gap-3">
                      <OrgTypeSigil type={row.type} size="sm" />
                      <span className="font-medium text-foreground">{row.name}</span>
                    </div>
                    <span className="font-mono text-xs text-muted-foreground">{row.code}</span>
                  </div>
                ))}
              </div>
            </div>
          </CardContent>
        </Card>

        {/* ========================================================================= */}
        {/* 2. HierarchySpine Showroom */}
        {/* ========================================================================= */}
        <Card className="border border-border shadow-xs">
          <CardHeader className="pb-4">
            <CardTitle className="text-lg font-bold flex items-center gap-2">
              <GitBranch className="h-5 w-5 text-primary" />
              2. HierarchySpine (Geometric Lineage Rules)
            </CardTitle>
            <CardDescription>
              Presentation-only spine component rendering vertical lineage rules (<code className="font-mono text-xs">│</code>) with last-child elbow handling (<code className="font-mono text-xs">└─</code> and <code className="font-mono text-xs">├─</code>).
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            {/* Tree Lineage Render Demo */}
            <div className="p-4 rounded-xl bg-muted/30 border border-border/60 space-y-1">
              <h4 className="text-xs font-semibold uppercase tracking-wider text-muted-foreground mb-2">
                Multi-Level Tree Geometry (Depths 0 to 4)
              </h4>
              <div className="space-y-0.5">
                {mockTreeNodes.map((node) => (
                  <div key={node.id} className="flex items-center h-8 text-xs hover:bg-muted/50 rounded px-1 transition-colors">
                    <HierarchySpine
                      depth={node.depth}
                      isLast={node.isLast}
                      ancestorIsLast={node.ancestorIsLast}
                      stepWidthPx={20}
                    />
                    <div className="flex items-center gap-2 ml-1">
                      <OrgTypeSigil type={node.type} size="sm" />
                      <span className="font-medium text-foreground truncate">{node.name}</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Interactive Sandbox */}
            <div className="p-3 rounded-lg border border-border bg-card space-y-3">
              <h4 className="text-xs font-semibold uppercase tracking-wider text-muted-foreground flex items-center gap-1.5">
                <Sparkles className="h-3.5 w-3.5 text-primary" />
                Spine Sandbox Controls
              </h4>
              <div className="grid grid-cols-2 gap-4 text-xs">
                <div className="space-y-1">
                  <Label className="text-xs">Depth Level ({sandboxDepth})</Label>
                  <input
                    type="range"
                    min="0"
                    max="4"
                    value={sandboxDepth}
                    onChange={(e) => setSandboxDepth(Number(e.target.value))}
                    className="w-full accent-primary"
                  />
                </div>
                <div className="flex items-center justify-between pt-3">
                  <Label htmlFor="isLastToggle" className="text-xs cursor-pointer">
                    Is Last Sibling (Elbow └─)
                  </Label>
                  <Switch
                    id="isLastToggle"
                    checked={sandboxIsLast}
                    onCheckedChange={setSandboxIsLast}
                  />
                </div>
              </div>
              <div className="flex items-center h-10 border border-dashed border-border rounded px-3 bg-muted/20">
                <HierarchySpine
                  depth={sandboxDepth}
                  isLast={sandboxIsLast}
                  hasChildren={sandboxHasChildren}
                  stepWidthPx={24}
                />
                <span className="text-xs font-mono text-primary font-semibold ml-2">
                  Sample Unit Node at Depth {sandboxDepth}
                </span>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* ========================================================================= */}
        {/* 3. OrgBreadcrumb Showroom */}
        {/* ========================================================================= */}
        <Card className="border border-border shadow-xs">
          <CardHeader className="pb-4">
            <CardTitle className="text-lg font-bold flex items-center gap-2">
              <Navigation className="h-5 w-5 text-primary" />
              3. OrgBreadcrumb (Middle-Truncating Lineage)
            </CardTitle>
            <CardDescription>
              Variable-depth clickable breadcrumb that guarantees the Root and the last TWO levels are always visible, collapsing deep intermediate ancestors behind an interactive dropdown popover.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            {/* Options Toggle */}
            <div className="flex items-center gap-6 p-3 rounded-lg bg-muted/30 border border-border/60 text-xs">
              <div className="flex items-center gap-2">
                <Switch
                  id="showSigils"
                  checked={breadcrumbShowSigils}
                  onCheckedChange={setBreadcrumbShowSigils}
                />
                <Label htmlFor="showSigils" className="text-xs cursor-pointer">
                  Show Type Sigils
                </Label>
              </div>
              <div className="flex items-center gap-2">
                <Switch
                  id="showCodes"
                  checked={breadcrumbShowCodes}
                  onCheckedChange={setBreadcrumbShowCodes}
                />
                <Label htmlFor="showCodes" className="text-xs cursor-pointer">
                  Show Short Codes
                </Label>
              </div>
            </div>

            {/* Deep 6-Level Hierarchy Demo */}
            <div className="space-y-2">
              <h4 className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                Deep 6-Level Path (Middle Truncated: Root › ... › Sec › Leaf)
              </h4>
              <div className="p-3.5 rounded-lg border border-border bg-card">
                <OrgBreadcrumb
                  items={deepBreadcrumb}
                  maxVisible={4}
                  showSigils={breadcrumbShowSigils}
                  showCodes={breadcrumbShowCodes}
                  onSelect={(item) => setLastClickedNode(`${item.name} (${item.code})`)}
                />
              </div>
            </div>

            {/* Shallow 2-Level Hierarchy Demo */}
            <div className="space-y-2">
              <h4 className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                Shallow 2-Level Path (Full View)
              </h4>
              <div className="p-3.5 rounded-lg border border-border bg-card">
                <OrgBreadcrumb
                  items={shallowBreadcrumb}
                  showSigils={breadcrumbShowSigils}
                  showCodes={breadcrumbShowCodes}
                  onSelect={(item) => setLastClickedNode(`${item.name} (${item.code})`)}
                />
              </div>
            </div>

            {lastClickedNode && (
              <div className="flex items-center gap-2 text-xs text-primary font-medium p-2 rounded bg-primary/10">
                <CheckCircle2 className="h-4 w-4" />
                Interacted with node: <span className="underline">{lastClickedNode}</span>
              </div>
            )}
          </CardContent>
        </Card>

        {/* ========================================================================= */}
        {/* 4. UnitPath Showroom */}
        {/* ========================================================================= */}
        <Card className="border border-border shadow-xs">
          <CardHeader className="pb-4">
            <CardTitle className="text-lg font-bold flex items-center gap-2">
              <FileText className="h-5 w-5 text-primary" />
              4. UnitPath (Inline Ancestor Path Secondary Text)
            </CardTitle>
            <CardDescription>
              Compact secondary lineage path for flat list screens, search results, and combobox pickers to disambiguate identically named departments (e.g. "Operations").
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            {/* Flat List Secondary Text Demo */}
            <div className="space-y-2">
              <h4 className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                Flat List Row Secondary Line Simulation
              </h4>
              <div className="border border-border rounded-lg overflow-hidden divide-y divide-border text-xs">
                {[
                  {
                    name: "Operations Section",
                    code: "OPS-TECH",
                    ancestors: ["DIEZ Holding", "Corporate Services", "Technology Department"],
                  },
                  {
                    name: "Operations Section",
                    code: "OPS-FZ",
                    ancestors: ["DIEZ Holding", "Free Zones Authority", "Licensing Department"],
                  },
                  {
                    name: "Cloud & DevOps Unit",
                    code: "CLOUD-ENG",
                    ancestors: ["DIEZ Holding", "Technology", "Infrastructure", "Core Systems"],
                  },
                ].map((item, idx) => (
                  <div key={idx} className="p-3 bg-card hover:bg-muted/30 transition-colors flex flex-col gap-1">
                    <div className="flex items-center justify-between">
                      <span className="font-semibold text-sm text-foreground">{item.name}</span>
                      <span className="font-mono text-xs bg-muted px-1.5 py-0.5 rounded text-muted-foreground">
                        {item.code}
                      </span>
                    </div>
                    <UnitPath ancestors={item.ancestors} maxSegments={3} showCodes />
                  </div>
                ))}
              </div>
            </div>

            {/* Combobox Option Secondary Text Demo */}
            <div className="space-y-2">
              <h4 className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                Combobox Item Selection Preview
              </h4>
              <div className="p-3 rounded-lg border border-primary/30 bg-primary/5 flex items-center justify-between text-xs">
                <div>
                  <p className="font-bold text-foreground">Frontend Engineering Team</p>
                  <UnitPath
                    path={["DIEZ Holding", "Technology BU", "AppDev Department"]}
                    className="text-muted-foreground mt-0.5"
                  />
                </div>
                <Badge variant="default" className="text-[10px]">SELECTED</Badge>
              </div>
            </div>
          </CardContent>
        </Card>

      </div>

      {/* Accessibility & Theme Conformance Notes */}
      <div className="p-4 rounded-xl border border-border bg-card flex items-start gap-3 text-xs text-muted-foreground">
        <Info className="h-4 w-4 text-primary shrink-0 mt-0.5" />
        <div className="space-y-1">
          <p className="font-semibold text-foreground">Design Token & Accessibility Verification</p>
          <p>
            All 4 primitives strictly respect existing theme tokens (<code className="font-mono text-xs">--background</code>, <code className="font-mono text-xs">--border</code>, <code className="font-mono text-xs">--muted</code>, <code className="font-mono text-xs">--font-mono</code>), utilize visible keyboard focus rings (<code className="font-mono text-xs">focus-visible:ring-2</code>), respect <code className="font-mono text-xs">prefers-reduced-motion</code>, and include accessible ARIA labels.
          </p>
        </div>
      </div>
    </div>
  );
}
