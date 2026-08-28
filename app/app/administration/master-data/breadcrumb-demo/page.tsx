"use client";

import * as React from "react";
import { Breadcrumb } from "@/components/shared/Breadcrumb";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { PageBarActions } from "@/components/ui/layouts/page-bar-context";
import { Sparkles, Layers, Type, MousePointerClick, Info, Plus, Trash2 } from "lucide-react";

export default function BreadcrumbDemoPage() {
  const [customCrumbs, setCustomCrumbs] = React.useState<string[]>([
    "Administration",
    "Governance",
    "Security",
    "Compliance",
    "Identity Policies",
    "Multi-Factor Authentication",
  ]);
  const [newCrumbInput, setNewCrumbInput] = React.useState("");

  const addCrumb = () => {
    if (newCrumbInput.trim()) {
      setCustomCrumbs((prev) => [...prev, newCrumbInput.trim()]);
      setNewCrumbInput("");
    }
  };

  const removeCrumb = (index: number) => {
    setCustomCrumbs((prev) => prev.filter((_, i) => i !== index));
  };

  return (
    <div className="p-6 space-y-8 pb-24">
      <PageBarActions>
        <Badge variant="secondary" className="gap-1.5 font-mono text-xs h-9 px-3">
          <Type className="h-3.5 w-3.5 text-primary" />
          Part 5 Breadcrumb Spec
        </Badge>
      </PageBarActions>

      {/* Intro Overview Banner */}
      <div className="rounded-2xl bg-linear-to-r from-primary/10 via-primary/5 to-transparent p-6 border border-primary/20">
        <div className="flex items-start gap-4">
          <div className="p-3 bg-primary/10 text-primary rounded-xl shrink-0">
            <Sparkles className="h-6 w-6" />
          </div>
          <div>
            <h2 className="text-xl font-bold text-foreground">
              Breadcrumb Typography & Truncation System
            </h2>
            <p className="text-sm text-muted-foreground mt-1 max-w-3xl leading-relaxed">
              Per Part 5 of the design spec, the breadcrumb serves as both location and primary page
              title. It strictly adheres to the typography scale (14px ancestors, “/” separator with 8px
              margins, 15px font-medium current page), 4-crumb threshold truncation with “…” dropdown
              menus, and 28-character tooltips.
            </p>
          </div>
        </div>
      </div>

      {/* Test Cases Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Case 1: 2 Crumbs */}
        <Card className="border border-border shadow-2xs">
          <CardHeader className="pb-3 border-b border-border/40">
            <div className="flex items-center justify-between">
              <CardTitle className="text-sm font-semibold flex items-center gap-2">
                <Badge variant="outline" className="text-xs">Case 1</Badge>
                2 Crumbs (Standard 1st-level view)
              </CardTitle>
              <span className="text-[11px] font-mono text-muted-foreground">Length: 2</span>
            </div>
            <CardDescription className="text-xs">
              Simple 2-level trail with 1 ancestor and 1 active current page.
            </CardDescription>
          </CardHeader>
          <CardContent className="p-5 space-y-3">
            <div className="p-4 rounded-xl bg-card border border-border/80 flex items-center">
              <Breadcrumb
                items={[
                  { label: "Administration", href: "/app/administration" },
                  { label: "Organization" },
                ]}
              />
            </div>
            <p className="text-[11px] text-muted-foreground">
              Ancestor is 14px / 400 (`--text-secondary`), separator is “/” (`mx-2`), current page is 15px / 500 (`--text-primary`).
            </p>
          </CardContent>
        </Card>

        {/* Case 2: 3 Crumbs */}
        <Card className="border border-border shadow-2xs">
          <CardHeader className="pb-3 border-b border-border/40">
            <div className="flex items-center justify-between">
              <CardTitle className="text-sm font-semibold flex items-center gap-2">
                <Badge variant="outline" className="text-xs">Case 2</Badge>
                3 Crumbs (Master Data drill-down)
              </CardTitle>
              <span className="text-[11px] font-mono text-muted-foreground">Length: 3</span>
            </div>
            <CardDescription className="text-xs">
              Direct path matching the route tree without sidebar grouping noise.
            </CardDescription>
          </CardHeader>
          <CardContent className="p-5 space-y-3">
            <div className="p-4 rounded-xl bg-card border border-border/80 flex items-center">
              <Breadcrumb
                items={[
                  { label: "Administration", href: "/app/administration" },
                  { label: "Master data", href: "/app/administration/master-data" },
                  { label: "Organization" },
                ]}
              />
            </div>
            <p className="text-[11px] text-muted-foreground">
              Shows all 3 levels directly without collapsing. No home icon.
            </p>
          </CardContent>
        </Card>

        {/* Case 3: 4 Crumbs (Boundary Case) */}
        <Card className="border border-border shadow-2xs">
          <CardHeader className="pb-3 border-b border-border/40">
            <div className="flex items-center justify-between">
              <CardTitle className="text-sm font-semibold flex items-center gap-2">
                <Badge variant="outline" className="text-xs">Case 3</Badge>
                4 Crumbs (Maximum Full Display)
              </CardTitle>
              <span className="text-[11px] font-mono text-muted-foreground">Length: 4</span>
            </div>
            <CardDescription className="text-xs">
              Exactly at the 4-crumb limit — displays all 4 crumbs without collapsing into “…”.
            </CardDescription>
          </CardHeader>
          <CardContent className="p-5 space-y-3">
            <div className="p-4 rounded-xl bg-card border border-border/80 flex items-center">
              <Breadcrumb
                items={[
                  { label: "Administration", href: "/app/administration" },
                  { label: "Master data", href: "/app/administration/master-data" },
                  { label: "Organization", href: "/app/administration/master-data/organization" },
                  { label: "Engineering" },
                ]}
              />
            </div>
            <p className="text-[11px] text-muted-foreground">
              Per Part 5: "Up to 4 crumbs: show all."
            </p>
          </CardContent>
        </Card>

        {/* Case 4: 6 Crumbs (5+ Truncation Rule with Dropdown) */}
        <Card className="border border-border shadow-2xs">
          <CardHeader className="pb-3 border-b border-border/40">
            <div className="flex items-center justify-between">
              <CardTitle className="text-sm font-semibold flex items-center gap-2">
                <Badge variant="outline" className="text-xs">Case 4</Badge>
                6 Crumbs (Collapsed Menu Menu “…”)
              </CardTitle>
              <span className="text-[11px] font-mono text-muted-foreground">Length: 6</span>
            </div>
            <CardDescription className="text-xs">
              5 or more crumbs: shows first, “…” button opening dropdown menu, then last two.
            </CardDescription>
          </CardHeader>
          <CardContent className="p-5 space-y-3">
            <div className="p-4 rounded-xl bg-card border border-border/80 flex items-center">
              <Breadcrumb
                items={[
                  { label: "Administration", href: "/app/administration" },
                  { label: "Master data", href: "/app/administration/master-data" },
                  { label: "Organization", href: "/app/administration/master-data/organization" },
                  { label: "Technology", href: "/app/administration/master-data/organization/tech" },
                  { label: "Core Systems", href: "/app/administration/master-data/organization/tech/core" },
                  { label: "Platform Reliability" },
                ]}
              />
            </div>
            <p className="text-[11px] text-muted-foreground flex items-center gap-1.5">
              <MousePointerClick className="h-3 w-3 text-primary" />
              Click the <span className="font-bold px-1 bg-muted rounded">…</span> button to reveal the 3 hidden levels (Master data, Organization, Technology).
            </p>
          </CardContent>
        </Card>

        {/* Case 5: Very Long Crumb Name (>28 Characters Tooltip) */}
        <Card className="border border-border shadow-2xs md:col-span-2">
          <CardHeader className="pb-3 border-b border-border/40">
            <div className="flex items-center justify-between">
              <CardTitle className="text-sm font-semibold flex items-center gap-2">
                <Badge variant="outline" className="text-xs">Case 5</Badge>
                Very Long Crumb Name (&gt; 28 Characters)
              </CardTitle>
              <span className="text-[11px] font-mono text-muted-foreground">Length: 63 chars</span>
            </div>
            <CardDescription className="text-xs">
              Any crumb over 28 characters truncates with an ellipsis and displays the full title inside a hover tooltip.
            </CardDescription>
          </CardHeader>
          <CardContent className="p-5 space-y-3">
            <div className="p-4 rounded-xl bg-card border border-border/80 flex items-center">
              <Breadcrumb
                items={[
                  { label: "Administration", href: "/app/administration" },
                  { label: "Master data", href: "/app/administration/master-data" },
                  {
                    label: "Department of Strategic Global Infrastructure and Autonomous Cloud Operations",
                  },
                ]}
              />
            </div>
            <p className="text-[11px] text-muted-foreground flex items-center gap-1.5">
              <Info className="h-3.5 w-3.5 text-primary" />
              Hover over the long department name to see the full 63-character string in the floating tooltip.
            </p>
          </CardContent>
        </Card>

        {/* Case 6: Deep Drill-Down Replacement Rule */}
        <Card className="border border-border shadow-2xs md:col-span-2">
          <CardHeader className="pb-3 border-b border-border/40">
            <div className="flex items-center justify-between">
              <CardTitle className="text-sm font-semibold flex items-center gap-2">
                <Badge variant="outline" className="text-xs">Case 6</Badge>
                Deep Drill-Down Replacement Pattern (Org Units &gt; 3 levels)
              </CardTitle>
              <span className="text-[11px] font-mono text-muted-foreground">Replace vs Extend</span>
            </div>
            <CardDescription className="text-xs">
              For units nested deeper than three levels, replace rather than extend because the org chart canvas already communicates tree depth.
            </CardDescription>
          </CardHeader>
          <CardContent className="p-5 space-y-3">
            <div className="p-4 rounded-xl bg-card border border-border/80 flex items-center">
              <Breadcrumb
                items={[
                  { label: "Organization", href: "/app/administration/master-data/organization" },
                  { label: "Information Technology" },
                ]}
              />
            </div>
            <p className="text-[11px] text-muted-foreground">
              Even if Information Technology is 5 levels deep in the corporate tree, the top breadcrumb stays clean and readable as `Organization / Information Technology`.
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Interactive Playground */}
      <Card className="border border-border shadow-2xs">
        <CardHeader className="pb-3 border-b border-border/40">
          <CardTitle className="text-base font-semibold flex items-center gap-2">
            <Layers className="h-4 w-4 text-primary" />
            Interactive Breadcrumb Playground
          </CardTitle>
          <CardDescription className="text-xs">
            Dynamically add, remove, and edit crumbs to observe automatic truncation and tooltip behavior in real-time.
          </CardDescription>
        </CardHeader>
        <CardContent className="p-6 space-y-6">
          {/* Live Preview Box */}
          <div className="space-y-1.5">
            <span className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
              Live Breadcrumb Preview ({customCrumbs.length} Levels)
            </span>
            <div className="p-5 rounded-2xl bg-card border-2 border-primary/20 shadow-xs flex items-center min-h-[64px]">
              <Breadcrumb items={customCrumbs} />
            </div>
          </div>

          {/* Controls: Add Crumb */}
          <div className="flex flex-col sm:flex-row items-center gap-3">
            <Input
              placeholder="Enter custom crumb title (try typing > 28 chars)..."
              value={newCrumbInput}
              onChange={(e) => setNewCrumbInput(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === "Enter") addCrumb();
              }}
              className="h-10 text-xs rounded-xl"
            />
            <Button
              type="button"
              onClick={addCrumb}
              disabled={!newCrumbInput.trim()}
              className="h-10 px-4 text-xs font-semibold gap-1.5 shrink-0 rounded-xl cursor-pointer w-full sm:w-auto"
            >
              <Plus className="h-4 w-4" />
              Add Crumb
            </Button>
          </div>

          {/* List of Active Crumbs with Delete Action */}
          <div className="space-y-2">
            <span className="text-xs font-semibold text-muted-foreground">
              Current Crumb Trail (Drag or Delete):
            </span>
            <div className="flex flex-wrap gap-2">
              {customCrumbs.map((crumb, idx) => (
                <Badge
                  key={crumb + idx}
                  variant="secondary"
                  className="pl-3 pr-1.5 py-1 text-xs gap-2 rounded-lg border border-border"
                >
                  <span className="font-mono text-[10px] text-muted-foreground">{idx + 1}.</span>
                  <span className="font-medium truncate max-w-[200px]">{crumb}</span>
                  <button
                    type="button"
                    onClick={() => removeCrumb(idx)}
                    className="p-1 hover:bg-destructive/10 hover:text-destructive rounded transition-colors cursor-pointer"
                    aria-label={`Remove crumb ${crumb}`}
                  >
                    <Trash2 className="h-3 w-3" />
                  </button>
                </Badge>
              ))}
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
