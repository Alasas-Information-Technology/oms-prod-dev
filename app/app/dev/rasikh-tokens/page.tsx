"use client";

import React, { useState } from "react";
import {
  ShieldCheck,
  AlertTriangle,
  CheckCircle2,
  XCircle,
  ExternalLink,
  Sun,
  Moon,
  Info,
  Sparkles,
  ArrowRight,
  RefreshCw,
  Eye,
  Layers,
  LayoutDashboard,
  FileSpreadsheet,
} from "lucide-react";
import { Badge } from "@/components/ui/badge";

// WCAG 2.1 algorithm
interface RgbColor {
  r: number;
  g: number;
  b: number;
}

function hexToRgb(hex: string): RgbColor {
  const cleanHex = hex.replace("#", "").trim();
  const fullHex =
    cleanHex.length === 3
      ? cleanHex
          .split("")
          .map((c) => c + c)
          .join("")
      : cleanHex;
  const num = parseInt(fullHex, 16);
  return {
    r: (num >> 16) & 255,
    g: (num >> 8) & 255,
    b: num & 255,
  };
}

function relativeLuminance({ r, g, b }: RgbColor): number {
  const [rs, gs, bs] = [r, g, b].map((c) => {
    const s = c / 255;
    return s <= 0.03928 ? s / 12.92 : Math.pow((s + 0.055) / 1.055, 2.4);
  });
  return 0.2126 * rs + 0.7152 * gs + 0.0722 * bs;
}

function calculateContrastRatio(hex1: string, hex2: string): number {
  const lum1 = relativeLuminance(hexToRgb(hex1));
  const lum2 = relativeLuminance(hexToRgb(hex2));
  const brightest = Math.max(lum1, lum2);
  const darkest = Math.min(lum1, lum2);
  const ratio = (brightest + 0.05) / (darkest + 0.05);
  return Math.round(ratio * 100) / 100;
}

// Token specifications from RASIKH-PALETTE-MIGRATION.md Part 2
export const RASIKH_PART2_TOKENS = {
  primary: {
    name: "--rasikh-primary",
    role: "Operational interactive accent",
    light: "#1B2B5C",
    dark: "#8C97C9",
  },
  primaryDeep: {
    name: "--rasikh-primary-deep",
    role: "Global bar, formal documents",
    light: "#101B3D",
    dark: "#101B3D",
  },
  teal: {
    name: "--rasikh-teal",
    role: "Vendor/candidate portal, info border",
    light: "#23879C",
    dark: "#5CB8CC",
  },
  indigoAccent: {
    name: "--rasikh-indigo-accent",
    role: "Dashboard interactive accent",
    light: "#6669A3",
    dark: "#9B9DCB",
    proposedAdjustedLight: "#6063A2", // L=50.5% nudge to pass 4.5:1 on #E9EAF4
  },
  gold: {
    name: "--rasikh-gold",
    role: "Milestone accent (Qualified / Plan-complete)",
    light: "#CBA876",
    dark: "#E0C79A",
  },
  wash: {
    name: "--rasikh-wash",
    role: "Dashboard page background",
    light: "#E9EAF4",
    dark: "#161A2B",
  },
  success: {
    name: "success triad",
    light: { surface: "#EBF5EE", border: "#3A8F6B", text: "#1E5C42" },
    dark: { surface: "#12271F", border: "#5FC79A", text: "#A7E8C7" },
  },
  warning: {
    name: "warning triad",
    light: { surface: "#FBF2E3", border: "#B4791F", text: "#7A4E0C" },
    dark: { surface: "#2E2416", border: "#E0A94A", text: "#F5D89A" },
  },
  danger: {
    name: "danger triad",
    light: { surface: "#FBEDEA", border: "#B0432C", text: "#7A2818" },
    dark: { surface: "#2E1B18", border: "#E8795C", text: "#F5B8A5" },
  },
  info: {
    name: "info triad",
    light: { surface: "#E9F4F6", border: "#23879C", text: "#144F5C" },
    dark: { surface: "#122A2E", border: "#5CB8CC", text: "#A9DCE6" },
  },
  // Operational mode neutral surfaces (Warm Sand preserved per Part 2)
  neutralSurfaces: {
    base: { light: "#FAF8F3", dark: "#0E0D0B" },
    card: { light: "#FFFFFF", dark: "#171310" },
    elevated: { light: "#F8F4EC", dark: "#201A14" },
    textMuted: { light: "#7C7362", dark: "#948C7A" },
    textPrimary: { light: "#1A1712", dark: "#F7F5F0" },
  },
};

export default function RasikhTokensGatePage() {
  const [useAdjustedIndigo, setUseAdjustedIndigo] = useState(false);

  const lightIndigo = useAdjustedIndigo
    ? RASIKH_PART2_TOKENS.indigoAccent.proposedAdjustedLight
    : RASIKH_PART2_TOKENS.indigoAccent.light;

  // Specific audit pairs
  const auditResults = [
    {
      id: "indigo-wash",
      name: "rasikh-indigo-accent text/links on rasikh-wash",
      role: "Dashboard-mode primary text / links",
      minRequired: 4.5,
      type: "Body text (>=4.5:1)",
      lightFg: lightIndigo,
      lightBg: RASIKH_PART2_TOKENS.wash.light,
      darkFg: RASIKH_PART2_TOKENS.indigoAccent.dark,
      darkBg: RASIKH_PART2_TOKENS.wash.dark,
      notes: useAdjustedIndigo
        ? "Adjusted to #6063A2 (L=50.5%) — PASSES WCAG AA"
        : "Part 2 raw source value #6669A3 yields 4.26:1 (FAILS 4.5:1 requirement)",
    },
    {
      id: "indigo-card",
      name: "rasikh-indigo-accent on dashboard card (#FFFFFF / #171310)",
      role: "Dashboard card link / button text",
      minRequired: 4.5,
      type: "Body text (>=4.5:1)",
      lightFg: lightIndigo,
      lightBg: RASIKH_PART2_TOKENS.neutralSurfaces.card.light,
      darkFg: RASIKH_PART2_TOKENS.indigoAccent.dark,
      darkBg: RASIKH_PART2_TOKENS.neutralSurfaces.card.dark,
      notes: "Passes on white card in both raw and adjusted values",
    },
    {
      id: "primary-sand-base",
      name: "rasikh-primary text on sand base surface",
      role: "Operational-mode page body / links",
      minRequired: 4.5,
      type: "Body text (>=4.5:1)",
      lightFg: RASIKH_PART2_TOKENS.primary.light,
      lightBg: RASIKH_PART2_TOKENS.neutralSurfaces.base.light,
      darkFg: RASIKH_PART2_TOKENS.primary.dark,
      darkBg: RASIKH_PART2_TOKENS.neutralSurfaces.base.dark,
      notes: "High contrast in both light (12.79:1) and dark (6.83:1)",
    },
    {
      id: "primary-sand-card",
      name: "rasikh-primary text on sand card surface",
      role: "Operational-mode card content & tables",
      minRequired: 4.5,
      type: "Body text (>=4.5:1)",
      lightFg: RASIKH_PART2_TOKENS.primary.light,
      lightBg: RASIKH_PART2_TOKENS.neutralSurfaces.card.light,
      darkFg: RASIKH_PART2_TOKENS.primary.dark,
      darkBg: RASIKH_PART2_TOKENS.neutralSurfaces.card.dark,
      notes: "High contrast in both light (13.58:1) and dark (6.49:1)",
    },
    {
      id: "primary-sand-elevated",
      name: "rasikh-primary text on sand elevated surface",
      role: "Operational-mode inset wells & headers",
      minRequired: 4.5,
      type: "Body text (>=4.5:1)",
      lightFg: RASIKH_PART2_TOKENS.primary.light,
      lightBg: RASIKH_PART2_TOKENS.neutralSurfaces.elevated.light,
      darkFg: RASIKH_PART2_TOKENS.primary.dark,
      darkBg: RASIKH_PART2_TOKENS.neutralSurfaces.elevated.dark,
      notes: "High contrast in both light (12.38:1) and dark (6.06:1)",
    },
    {
      id: "success-triad-text",
      name: "success-text on success-surface",
      role: "Task complete, approvals, valid states",
      minRequired: 4.5,
      type: "Body text (>=4.5:1)",
      lightFg: RASIKH_PART2_TOKENS.success.light.text,
      lightBg: RASIKH_PART2_TOKENS.success.light.surface,
      darkFg: RASIKH_PART2_TOKENS.success.dark.text,
      darkBg: RASIKH_PART2_TOKENS.success.dark.surface,
      notes: "Exceeds 7:1 in light and 11:1 in dark",
    },
    {
      id: "success-triad-border",
      name: "success-border on success-surface",
      role: "Badge borders, verification ticks",
      minRequired: 3.0,
      type: "Icon / Border (>=3:1)",
      lightFg: RASIKH_PART2_TOKENS.success.light.border,
      lightBg: RASIKH_PART2_TOKENS.success.light.surface,
      darkFg: RASIKH_PART2_TOKENS.success.dark.border,
      darkBg: RASIKH_PART2_TOKENS.success.dark.surface,
      notes: "Passes 3:1 non-text requirement",
    },
    {
      id: "warning-triad-text",
      name: "warning-text on warning-surface",
      role: "Clarifications, SLA cautions, budget warnings",
      minRequired: 4.5,
      type: "Body text (>=4.5:1)",
      lightFg: RASIKH_PART2_TOKENS.warning.light.text,
      lightBg: RASIKH_PART2_TOKENS.warning.light.surface,
      darkFg: RASIKH_PART2_TOKENS.warning.dark.text,
      darkBg: RASIKH_PART2_TOKENS.warning.dark.surface,
      notes: "Exceeds 6.4:1 in light and 10.9:1 in dark",
    },
    {
      id: "warning-triad-border",
      name: "warning-border on warning-surface",
      role: "Warning badge borders, alert icons",
      minRequired: 3.0,
      type: "Icon / Border (>=3:1)",
      lightFg: RASIKH_PART2_TOKENS.warning.light.border,
      lightBg: RASIKH_PART2_TOKENS.warning.light.surface,
      darkFg: RASIKH_PART2_TOKENS.warning.dark.border,
      darkBg: RASIKH_PART2_TOKENS.warning.dark.surface,
      notes: "Passes 3:1 non-text requirement",
    },
    {
      id: "danger-triad-text",
      name: "danger-text on danger-surface",
      role: "Rejections, over-budget, errors",
      minRequired: 4.5,
      type: "Body text (>=4.5:1)",
      lightFg: RASIKH_PART2_TOKENS.danger.light.text,
      lightBg: RASIKH_PART2_TOKENS.danger.light.surface,
      darkFg: RASIKH_PART2_TOKENS.danger.dark.text,
      darkBg: RASIKH_PART2_TOKENS.danger.dark.surface,
      notes: "Exceeds 8.5:1 in light and 9.5:1 in dark",
    },
    {
      id: "danger-triad-border",
      name: "danger-border on danger-surface",
      role: "Error badge borders, destructive borders",
      minRequired: 3.0,
      type: "Icon / Border (>=3:1)",
      lightFg: RASIKH_PART2_TOKENS.danger.light.border,
      lightBg: RASIKH_PART2_TOKENS.danger.light.surface,
      darkFg: RASIKH_PART2_TOKENS.danger.dark.border,
      darkBg: RASIKH_PART2_TOKENS.danger.dark.surface,
      notes: "Passes 3:1 non-text requirement",
    },
    {
      id: "info-triad-text",
      name: "info-text on info-surface (built on teal)",
      role: "Guidance chips, informative alerts",
      minRequired: 4.5,
      type: "Body text (>=4.5:1)",
      lightFg: RASIKH_PART2_TOKENS.info.light.text,
      lightBg: RASIKH_PART2_TOKENS.info.light.surface,
      darkFg: RASIKH_PART2_TOKENS.info.dark.text,
      darkBg: RASIKH_PART2_TOKENS.info.dark.surface,
      notes: "Exceeds 8.1:1 in light and 10:1 in dark",
    },
    {
      id: "info-triad-border",
      name: "info-border (rasikh-teal) on info-surface",
      role: "Info badge border, subtle dividers",
      minRequired: 3.0,
      type: "Icon / Border (>=3:1)",
      lightFg: RASIKH_PART2_TOKENS.info.light.border,
      lightBg: RASIKH_PART2_TOKENS.info.light.surface,
      darkFg: RASIKH_PART2_TOKENS.info.dark.border,
      darkBg: RASIKH_PART2_TOKENS.info.dark.surface,
      notes: "Passes 3:1 non-text requirement (3.73:1 light, 6.58:1 dark)",
    },
    {
      id: "gold-badge-darktext",
      name: "dark text on rasikh-gold (milestone badge fill)",
      role: "Part 4: Qualified candidate outcome badge fill",
      minRequired: 4.5,
      type: "Badge text (>=4.5:1)",
      lightFg: "#1A1712",
      lightBg: RASIKH_PART2_TOKENS.gold.light,
      darkFg: "#0E0D0B",
      darkBg: RASIKH_PART2_TOKENS.gold.dark,
      notes: "Strong pass with charcoal text (8.00:1 light, 11.85:1 dark)",
    },
    {
      id: "gold-badge-whitetext",
      name: "white text on rasikh-gold (counter-test)",
      role: "Invalid pairing test: white text on gold",
      minRequired: 4.5,
      type: "Prohibited pairing",
      lightFg: "#FFFFFF",
      lightBg: RASIKH_PART2_TOKENS.gold.light,
      darkFg: "#FFFFFF",
      darkBg: RASIKH_PART2_TOKENS.gold.dark,
      notes: "FAILS (2.23:1 / 1.64:1). Gold MUST always use dark text, never white.",
    },
    {
      id: "primary-deep-globalbar",
      name: "white text on rasikh-primary-deep",
      role: "Global application bar & formal documents",
      minRequired: 4.5,
      type: "Header text (>=4.5:1)",
      lightFg: "#FFFFFF",
      lightBg: RASIKH_PART2_TOKENS.primaryDeep.light,
      darkFg: "#FFFFFF",
      darkBg: RASIKH_PART2_TOKENS.primaryDeep.dark,
      notes: "Ultra-high contrast: 16.85:1 in both light and dark",
    },
    {
      id: "focus-ring-operational",
      name: "focus ring (rasikh-primary) on sand surface",
      role: "Keyboard accessibility focus outline",
      minRequired: 3.0,
      type: "Focus indicator (>=3:1)",
      lightFg: RASIKH_PART2_TOKENS.primary.light,
      lightBg: RASIKH_PART2_TOKENS.neutralSurfaces.base.light,
      darkFg: RASIKH_PART2_TOKENS.primary.dark,
      darkBg: RASIKH_PART2_TOKENS.neutralSurfaces.base.dark,
      notes: "Passes 3:1 indicator minimum (12.79:1 light, 6.83:1 dark)",
    },
    {
      id: "focus-ring-dashboard",
      name: "focus ring (rasikh-indigo-accent) on wash surface",
      role: "Keyboard accessibility in dashboard mode",
      minRequired: 3.0,
      type: "Focus indicator (>=3:1)",
      lightFg: lightIndigo,
      lightBg: RASIKH_PART2_TOKENS.wash.light,
      darkFg: RASIKH_PART2_TOKENS.indigoAccent.dark,
      darkBg: RASIKH_PART2_TOKENS.wash.dark,
      notes: "Passes 3:1 focus ring minimum in both raw and adjusted values",
    },
  ];

  return (
    <div className="p-8 pb-32 max-w-7xl mx-auto space-y-12">
      {/* Page Header */}
      <div>
        <div className="flex items-center gap-2 text-xs font-semibold text-primary mb-1 tracking-wider uppercase">
          <ShieldCheck className="size-4 text-emerald-600 dark:text-emerald-400" />
          Migration Sandbox · Gate RP2
        </div>
        <h1 className="text-3xl font-display font-bold text-heading">
          RASIKH Palette Migration — Sandbox Contrast Gate
        </h1>
        <p className="text-muted-foreground mt-2 text-sm max-w-4xl leading-relaxed">
          Evaluating all token values from <code>docs/RASIKH-PALETTE-MIGRATION.md Part 2</code> against
          WCAG 2.1 contrast thresholds. The live theme file is untouched. Failures represent source
          value defects requiring calibrated adjustments before writing to production.
        </p>
      </div>

      {/* Interactive Lightness Adjustment Toggle */}
      <div className="p-4 rounded-lg border border-amber-200 dark:border-amber-900/40 bg-amber-500/10 flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="space-y-1">
          <div className="flex items-center gap-2 font-semibold text-sm text-amber-900 dark:text-amber-200">
            <AlertTriangle className="size-4.5 text-amber-600 dark:text-amber-400" />
            Detected Defect: <code>--rasikh-indigo-accent</code> on <code>--rasikh-wash</code>
          </div>
          <p className="text-xs text-amber-800 dark:text-amber-300/80">
            Raw Part 2 light value <code>#6669A3</code> produces <strong>4.26:1</strong> against wash{" "}
            <code>#E9EAF4</code> (requires 4.5:1). Toggle below to preview the proposed calibrated value{" "}
            <code>#6063A2</code> (L=50.5%, same hue, achieves <strong>4.61:1</strong>).
          </p>
        </div>
        <button
          onClick={() => setUseAdjustedIndigo((prev) => !prev)}
          className={`px-4 py-2 rounded-lg text-xs font-medium border transition-colors shadow-xs shrink-0 flex items-center gap-2 ${
            useAdjustedIndigo
              ? "bg-emerald-600 text-white border-emerald-700 hover:bg-emerald-700"
              : "bg-white dark:bg-zinc-800 text-zinc-900 dark:text-zinc-100 border-zinc-300 dark:border-zinc-700 hover:bg-zinc-50"
          }`}
        >
          <RefreshCw className="size-3.5" />
          {useAdjustedIndigo ? "Using Calibrated #6063A2" : "Using Raw #6669A3 (Fails)"}
        </button>
      </div>

      {/* ─────────────────────────────────────────────────────────── */}
      {/* SECTION 1: SIDE-BY-SIDE REAL SIZE RENDERING               */}
      {/* ─────────────────────────────────────────────────────────── */}
      <section className="space-y-6">
        <div className="flex items-center justify-between border-b pb-2">
          <h2 className="text-xl font-bold flex items-center gap-2">
            <Eye className="size-5 text-primary" />
            Real-Size Side-by-Side Surface Renderers
          </h2>
          <span className="text-xs text-muted-foreground">
            Rendered at actual production typography &amp; component geometry
          </span>
        </div>

        <div className="grid grid-cols-1 xl:grid-cols-2 gap-8">
          {/* Light Theme Panel */}
          <div
            className="p-6 rounded-lg border space-y-6 shadow-sm"
            style={{ backgroundColor: "#FAF8F3", color: "#1A1712", borderColor: "#E6DFD0" }}
          >
            <div className="flex items-center justify-between border-b pb-3" style={{ borderColor: "#E6DFD0" }}>
              <div className="flex items-center gap-2 font-bold text-sm">
                <Sun className="size-4 text-amber-600" />
                <span>Light Mode (Warm Sand Base #FAF8F3)</span>
              </div>
              <Badge variant="outline" className="bg-white text-zinc-700 border-[#E6DFD0] text-[10px]">
                Operational Mode
              </Badge>
            </div>

            {/* Global Bar Preview */}
            <div
              className="p-3.5 rounded-lg flex items-center justify-between shadow-xs"
              style={{ backgroundColor: RASIKH_PART2_TOKENS.primaryDeep.light, color: "#FFFFFF" }}
            >
              <div className="flex items-center gap-2 font-semibold text-xs tracking-wide">
                <span>DIEZ · Outsource Management System</span>
              </div>
              <span className="text-[11px] opacity-80">--rasikh-primary-deep #101B3D</span>
            </div>

            {/* Operational Interactive Controls */}
            <div
              className="p-4 rounded-lg border space-y-3 shadow-xs"
              style={{ backgroundColor: "#FFFFFF", borderColor: "#E6DFD0" }}
            >
              <div className="text-xs font-semibold text-[#544D3F] uppercase tracking-wider">
                Operational Controls (rasikh-primary: #1B2B5C)
              </div>
              <div className="flex flex-wrap items-center gap-3">
                <button
                  className="px-3.5 py-1.5 rounded-md text-xs font-medium text-white shadow-xs"
                  style={{ backgroundColor: RASIKH_PART2_TOKENS.primary.light }}
                >
                  Primary Action
                </button>
                <a
                  href="#gate"
                  className="text-xs font-semibold underline underline-offset-2 flex items-center gap-1"
                  style={{ color: RASIKH_PART2_TOKENS.primary.light }}
                >
                  Text Link Example <ExternalLink className="size-3" />
                </a>
                <span
                  className="px-2 py-0.5 rounded text-[11px] font-mono border"
                  style={{
                    backgroundColor: "#EEF1FB",
                    color: RASIKH_PART2_TOKENS.primary.light,
                    borderColor: "#3E4E8C",
                  }}
                >
                  AED 1,248,320.00
                </span>
              </div>
            </div>

            {/* Dashboard Mode Simulation on Wash */}
            <div
              className="p-4 rounded-lg border space-y-3"
              style={{ backgroundColor: RASIKH_PART2_TOKENS.wash.light, borderColor: "#D5D8E8" }}
            >
              <div className="flex items-center justify-between">
                <span className="text-xs font-semibold text-[#544D3F] uppercase tracking-wider flex items-center gap-1.5">
                  <LayoutDashboard className="size-3.5" />
                  Dashboard Mode Canvas (rasikh-wash: #E9EAF4)
                </span>
                <span className="text-[10px] font-mono text-zinc-500">
                  {calculateContrastRatio(lightIndigo, RASIKH_PART2_TOKENS.wash.light)}:1
                </span>
              </div>
              <div className="space-y-2">
                <p className="text-xs leading-relaxed" style={{ color: lightIndigo }}>
                  This is body copy and KPI annotation text rendered in{" "}
                  <strong>rasikh-indigo-accent ({lightIndigo})</strong> directly against the lavender wash.
                </p>
                <div className="flex items-center gap-3">
                  <a
                    href="#dash"
                    className="text-xs font-semibold underline flex items-center gap-1"
                    style={{ color: lightIndigo }}
                  >
                    View detailed analytics <ArrowRight className="size-3" />
                  </a>
                  {!useAdjustedIndigo && (
                    <span className="text-[10px] font-bold text-red-600 bg-red-100 px-2 py-0.5 rounded border border-red-300">
                      FAILS WCAG 4.5:1 (4.26:1)
                    </span>
                  )}
                  {useAdjustedIndigo && (
                    <span className="text-[10px] font-bold text-emerald-700 bg-emerald-100 px-2 py-0.5 rounded border border-emerald-300">
                      PASSES WCAG AA (4.61:1)
                    </span>
                  )}
                </div>
              </div>
            </div>

            {/* Semantic Matrix (4 Triads) */}
            <div className="space-y-2.5">
              <div className="text-xs font-semibold text-[#544D3F] uppercase tracking-wider">
                Semantic Matrix (15-Token System)
              </div>
              <div className="grid grid-cols-2 gap-2.5">
                {/* Success */}
                <div
                  className="p-3 rounded-lg border text-xs flex flex-col justify-between gap-1.5"
                  style={{
                    backgroundColor: RASIKH_PART2_TOKENS.success.light.surface,
                    borderColor: RASIKH_PART2_TOKENS.success.light.border,
                    color: RASIKH_PART2_TOKENS.success.light.text,
                  }}
                >
                  <div className="flex items-center justify-between font-semibold">
                    <span className="flex items-center gap-1">
                      <CheckCircle2 className="size-3.5" /> Approved / Success
                    </span>
                    <span className="text-[10px] font-mono opacity-80">7.07:1</span>
                  </div>
                  <span className="text-[11px] opacity-90">Budget check passed</span>
                </div>

                {/* Warning */}
                <div
                  className="p-3 rounded-lg border text-xs flex flex-col justify-between gap-1.5"
                  style={{
                    backgroundColor: RASIKH_PART2_TOKENS.warning.light.surface,
                    borderColor: RASIKH_PART2_TOKENS.warning.light.border,
                    color: RASIKH_PART2_TOKENS.warning.light.text,
                  }}
                >
                  <div className="flex items-center justify-between font-semibold">
                    <span className="flex items-center gap-1">
                      <AlertTriangle className="size-3.5" /> Pending SLA / Warning
                    </span>
                    <span className="text-[10px] font-mono opacity-80">6.47:1</span>
                  </div>
                  <span className="text-[11px] opacity-90">Clarification requested</span>
                </div>

                {/* Danger */}
                <div
                  className="p-3 rounded-lg border text-xs flex flex-col justify-between gap-1.5"
                  style={{
                    backgroundColor: RASIKH_PART2_TOKENS.danger.light.surface,
                    borderColor: RASIKH_PART2_TOKENS.danger.light.border,
                    color: RASIKH_PART2_TOKENS.danger.light.text,
                  }}
                >
                  <div className="flex items-center justify-between font-semibold">
                    <span className="flex items-center gap-1">
                      <XCircle className="size-3.5" /> Rejected / Danger
                    </span>
                    <span className="text-[10px] font-mono opacity-80">8.58:1</span>
                  </div>
                  <span className="text-[11px] opacity-90">Budget cap exceeded</span>
                </div>

                {/* Info (Teal) */}
                <div
                  className="p-3 rounded-lg border text-xs flex flex-col justify-between gap-1.5"
                  style={{
                    backgroundColor: RASIKH_PART2_TOKENS.info.light.surface,
                    borderColor: RASIKH_PART2_TOKENS.info.light.border,
                    color: RASIKH_PART2_TOKENS.info.light.text,
                  }}
                >
                  <div className="flex items-center justify-between font-semibold">
                    <span className="flex items-center gap-1">
                      <Info className="size-3.5" /> Guidance / Info
                    </span>
                    <span className="text-[10px] font-mono opacity-80">8.14:1</span>
                  </div>
                  <span className="text-[11px] opacity-90">Built on DIEZ teal #23879C</span>
                </div>
              </div>
            </div>

            {/* Gold Rare Moment Preview */}
            <div
              className="p-3.5 rounded-lg border flex items-center justify-between"
              style={{ backgroundColor: "#FFFFFF", borderColor: "#E6DFD0" }}
            >
              <div>
                <span className="text-xs font-semibold text-[#544D3F] block">
                  Rare Milestone: Qualified Outcome
                </span>
                <span className="text-[11px] text-zinc-500">Paired strictly with dark charcoal text</span>
              </div>
              <span
                className="px-3 py-1 rounded-md text-xs font-bold shadow-2xs flex items-center gap-1.5"
                style={{
                  backgroundColor: RASIKH_PART2_TOKENS.gold.light,
                  color: "#1A1712",
                }}
              >
                <Sparkles className="size-3.5 text-[#1A1712]" />
                Qualified (8.00:1)
              </span>
            </div>
          </div>

          {/* Dark Theme Panel */}
          <div
            className="p-6 rounded-lg border space-y-6 shadow-sm"
            style={{ backgroundColor: "#0E0D0B", color: "#F7F5F0", borderColor: "#2A2620" }}
          >
            <div className="flex items-center justify-between border-b pb-3" style={{ borderColor: "#2A2620" }}>
              <div className="flex items-center gap-2 font-bold text-sm">
                <Moon className="size-4 text-indigo-400" />
                <span>Dark Mode (Warm Black Base #0E0D0B)</span>
              </div>
              <Badge variant="outline" className="bg-zinc-900 text-zinc-300 border-[#2A2620] text-[10px]">
                Operational Mode
              </Badge>
            </div>

            {/* Global Bar Preview */}
            <div
              className="p-3.5 rounded-lg flex items-center justify-between shadow-xs"
              style={{ backgroundColor: RASIKH_PART2_TOKENS.primaryDeep.dark, color: "#FFFFFF" }}
            >
              <div className="flex items-center gap-2 font-semibold text-xs tracking-wide">
                <span>DIEZ · Outsource Management System</span>
              </div>
              <span className="text-[11px] opacity-80">--rasikh-primary-deep #101B3D</span>
            </div>

            {/* Operational Interactive Controls */}
            <div
              className="p-4 rounded-lg border space-y-3 shadow-xs"
              style={{ backgroundColor: "#171310", borderColor: "#2A2620" }}
            >
              <div className="text-xs font-semibold text-[#C9C2B3] uppercase tracking-wider">
                Operational Controls (rasikh-primary: #8C97C9)
              </div>
              <div className="flex flex-wrap items-center gap-3">
                <button
                  className="px-3.5 py-1.5 rounded-md text-xs font-medium text-[#0E0D0B] shadow-xs font-semibold"
                  style={{ backgroundColor: RASIKH_PART2_TOKENS.primary.dark }}
                >
                  Primary Action
                </button>
                <a
                  href="#gate-dark"
                  className="text-xs font-semibold underline underline-offset-2 flex items-center gap-1"
                  style={{ color: RASIKH_PART2_TOKENS.primary.dark }}
                >
                  Text Link Example <ExternalLink className="size-3" />
                </a>
                <span
                  className="px-2 py-0.5 rounded text-[11px] font-mono border"
                  style={{
                    backgroundColor: "#1E2540",
                    color: RASIKH_PART2_TOKENS.primary.dark,
                    borderColor: "#7C8FC4",
                  }}
                >
                  AED 1,248,320.00
                </span>
              </div>
            </div>

            {/* Dashboard Mode Simulation on Wash */}
            <div
              className="p-4 rounded-lg border space-y-3"
              style={{ backgroundColor: RASIKH_PART2_TOKENS.wash.dark, borderColor: "#262C44" }}
            >
              <div className="flex items-center justify-between">
                <span className="text-xs font-semibold text-[#C9C2B3] uppercase tracking-wider flex items-center gap-1.5">
                  <LayoutDashboard className="size-3.5 text-indigo-400" />
                  Dashboard Mode Canvas (rasikh-wash: #161A2B)
                </span>
                <span className="text-[10px] font-mono text-zinc-400">
                  {calculateContrastRatio(
                    RASIKH_PART2_TOKENS.indigoAccent.dark,
                    RASIKH_PART2_TOKENS.wash.dark
                  )}
                  :1
                </span>
              </div>
              <div className="space-y-2">
                <p
                  className="text-xs leading-relaxed"
                  style={{ color: RASIKH_PART2_TOKENS.indigoAccent.dark }}
                >
                  This is body copy and KPI annotation text rendered in{" "}
                  <strong>rasikh-indigo-accent ({RASIKH_PART2_TOKENS.indigoAccent.dark})</strong>{" "}
                  directly against the dark wash.
                </p>
                <div className="flex items-center gap-3">
                  <a
                    href="#dash-dark"
                    className="text-xs font-semibold underline flex items-center gap-1"
                    style={{ color: RASIKH_PART2_TOKENS.indigoAccent.dark }}
                  >
                    View detailed analytics <ArrowRight className="size-3" />
                  </a>
                  <span className="text-[10px] font-bold text-emerald-300 bg-emerald-950/60 px-2 py-0.5 rounded border border-emerald-800">
                    PASSES WCAG AA (6.64:1)
                  </span>
                </div>
              </div>
            </div>

            {/* Semantic Matrix (4 Triads) */}
            <div className="space-y-2.5">
              <div className="text-xs font-semibold text-[#C9C2B3] uppercase tracking-wider">
                Semantic Matrix (15-Token System)
              </div>
              <div className="grid grid-cols-2 gap-2.5">
                {/* Success */}
                <div
                  className="p-3 rounded-lg border text-xs flex flex-col justify-between gap-1.5"
                  style={{
                    backgroundColor: RASIKH_PART2_TOKENS.success.dark.surface,
                    borderColor: RASIKH_PART2_TOKENS.success.dark.border,
                    color: RASIKH_PART2_TOKENS.success.dark.text,
                  }}
                >
                  <div className="flex items-center justify-between font-semibold">
                    <span className="flex items-center gap-1">
                      <CheckCircle2 className="size-3.5" /> Approved / Success
                    </span>
                    <span className="text-[10px] font-mono opacity-80">11.24:1</span>
                  </div>
                  <span className="text-[11px] opacity-90">Budget check passed</span>
                </div>

                {/* Warning */}
                <div
                  className="p-3 rounded-lg border text-xs flex flex-col justify-between gap-1.5"
                  style={{
                    backgroundColor: RASIKH_PART2_TOKENS.warning.dark.surface,
                    borderColor: RASIKH_PART2_TOKENS.warning.dark.border,
                    color: RASIKH_PART2_TOKENS.warning.dark.text,
                  }}
                >
                  <div className="flex items-center justify-between font-semibold">
                    <span className="flex items-center gap-1">
                      <AlertTriangle className="size-3.5" /> Pending SLA / Warning
                    </span>
                    <span className="text-[10px] font-mono opacity-80">10.99:1</span>
                  </div>
                  <span className="text-[11px] opacity-90">Clarification requested</span>
                </div>

                {/* Danger */}
                <div
                  className="p-3 rounded-lg border text-xs flex flex-col justify-between gap-1.5"
                  style={{
                    backgroundColor: RASIKH_PART2_TOKENS.danger.dark.surface,
                    borderColor: RASIKH_PART2_TOKENS.danger.dark.border,
                    color: RASIKH_PART2_TOKENS.danger.dark.text,
                  }}
                >
                  <div className="flex items-center justify-between font-semibold">
                    <span className="flex items-center gap-1">
                      <XCircle className="size-3.5" /> Rejected / Danger
                    </span>
                    <span className="text-[10px] font-mono opacity-80">9.55:1</span>
                  </div>
                  <span className="text-[11px] opacity-90">Budget cap exceeded</span>
                </div>

                {/* Info (Teal) */}
                <div
                  className="p-3 rounded-lg border text-xs flex flex-col justify-between gap-1.5"
                  style={{
                    backgroundColor: RASIKH_PART2_TOKENS.info.dark.surface,
                    borderColor: RASIKH_PART2_TOKENS.info.dark.border,
                    color: RASIKH_PART2_TOKENS.info.dark.text,
                  }}
                >
                  <div className="flex items-center justify-between font-semibold">
                    <span className="flex items-center gap-1">
                      <Info className="size-3.5" /> Guidance / Info
                    </span>
                    <span className="text-[10px] font-mono opacity-80">10.07:1</span>
                  </div>
                  <span className="text-[11px] opacity-90">Built on DIEZ teal #5CB8CC</span>
                </div>
              </div>
            </div>

            {/* Gold Rare Moment Preview */}
            <div
              className="p-3.5 rounded-lg border flex items-center justify-between"
              style={{ backgroundColor: "#171310", borderColor: "#2A2620" }}
            >
              <div>
                <span className="text-xs font-semibold text-[#C9C2B3] block">
                  Rare Milestone: Qualified Outcome
                </span>
                <span className="text-[11px] text-zinc-400">Paired strictly with dark warm-black text</span>
              </div>
              <span
                className="px-3 py-1 rounded-md text-xs font-bold shadow-2xs flex items-center gap-1.5"
                style={{
                  backgroundColor: RASIKH_PART2_TOKENS.gold.dark,
                  color: "#0E0D0B",
                }}
              >
                <Sparkles className="size-3.5 text-[#0E0D0B]" />
                Qualified (11.85:1)
              </span>
            </div>
          </div>
        </div>
      </section>

      {/* ─────────────────────────────────────────────────────────── */}
      {/* SECTION 2: AUDIT RESULTS TABLE                             */}
      {/* ─────────────────────────────────────────────────────────── */}
      <section className="space-y-4">
        <div className="border-b pb-2">
          <h2 className="text-xl font-bold flex items-center gap-2">
            <ShieldCheck className="size-5 text-primary" />
            Computed Contrast Audit Table
          </h2>
          <p className="text-xs text-muted-foreground mt-1">
            Thresholds: Body text &ge; 4.5:1, Large text &ge; 3.0:1, UI icons/borders/focus rings &ge; 3.0:1
          </p>
        </div>

        <div className="overflow-x-auto rounded-lg border bg-card shadow-xs">
          <table className="w-full text-xs text-left">
            <thead className="bg-muted/50 text-muted-foreground border-b uppercase text-[10px] tracking-wider font-semibold">
              <tr>
                <th className="py-3 px-4">Pairing Description</th>
                <th className="py-3 px-4">Role &amp; Min Ratio</th>
                <th className="py-3 px-4">Light Values &amp; Ratio</th>
                <th className="py-3 px-4">Dark Values &amp; Ratio</th>
                <th className="py-3 px-4">Status</th>
                <th className="py-3 px-4">Diagnostic / Recommendation</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              {auditResults.map((item) => {
                const lr = calculateContrastRatio(item.lightFg, item.lightBg);
                const dr = calculateContrastRatio(item.darkFg, item.darkBg);
                const lp = lr >= item.minRequired;
                const dp = dr >= item.minRequired;
                const passes = lp && dp;

                return (
                  <tr
                    key={item.id}
                    className={`hover:bg-muted/30 transition-colors ${
                      !passes ? "bg-red-500/5 dark:bg-red-950/10" : ""
                    }`}
                  >
                    <td className="py-3.5 px-4 font-semibold">
                      <div className="text-foreground">{item.name}</div>
                      <div className="text-[11px] text-muted-foreground">{item.role}</div>
                    </td>
                    <td className="py-3.5 px-4">
                      <span className="font-mono">{item.minRequired}:1</span>
                      <div className="text-[10px] text-muted-foreground">{item.type}</div>
                    </td>
                    <td className="py-3.5 px-4 font-mono">
                      <div className="flex items-center gap-1.5">
                        <span
                          className="size-3 rounded-full border border-black/20 shrink-0"
                          style={{ backgroundColor: item.lightFg }}
                        />
                        <span>{item.lightFg}</span>
                        <span className="text-muted-foreground">on</span>
                        <span
                          className="size-3 rounded-full border border-black/20 shrink-0"
                          style={{ backgroundColor: item.lightBg }}
                        />
                        <span>{item.lightBg}</span>
                      </div>
                      <div className="font-bold mt-0.5">
                        {lr}:1{" "}
                        <span className={lp ? "text-emerald-600 dark:text-emerald-400" : "text-red-600 dark:text-red-400"}>
                          ({lp ? "PASS" : "FAIL"})
                        </span>
                      </div>
                    </td>
                    <td className="py-3.5 px-4 font-mono">
                      <div className="flex items-center gap-1.5">
                        <span
                          className="size-3 rounded-full border border-white/20 shrink-0"
                          style={{ backgroundColor: item.darkFg }}
                        />
                        <span>{item.darkFg}</span>
                        <span className="text-muted-foreground">on</span>
                        <span
                          className="size-3 rounded-full border border-white/20 shrink-0"
                          style={{ backgroundColor: item.darkBg }}
                        />
                        <span>{item.darkBg}</span>
                      </div>
                      <div className="font-bold mt-0.5">
                        {dr}:1{" "}
                        <span className={dp ? "text-emerald-600 dark:text-emerald-400" : "text-red-600 dark:text-red-400"}>
                          ({dp ? "PASS" : "FAIL"})
                        </span>
                      </div>
                    </td>
                    <td className="py-3.5 px-4">
                      {passes ? (
                        <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded text-[11px] font-bold bg-emerald-100 text-emerald-800 dark:bg-emerald-950/60 dark:text-emerald-300 border border-emerald-300 dark:border-emerald-800">
                          <CheckCircle2 className="size-3" /> PASS
                        </span>
                      ) : (
                        <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded text-[11px] font-bold bg-red-100 text-red-800 dark:bg-red-950/60 dark:text-red-300 border border-red-300 dark:border-red-800">
                          <XCircle className="size-3" /> FAIL
                        </span>
                      )}
                    </td>
                    <td className="py-3.5 px-4 text-muted-foreground text-[11px] max-w-xs">
                      {item.notes}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </section>
    </div>
  );
}
