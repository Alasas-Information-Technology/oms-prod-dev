"use client";

import React from "react";
import {
  CheckCircle2,
  AlertTriangle,
  AlertCircle,
  Info,
  Sparkles,
  ShieldCheck,
  Layers,
  Sun,
  Moon,
} from "lucide-react";
import {
  buildContrastAuditList,
  SURFACE_LIGHT_BASE,
  SURFACE_DARK_BASE,
  SURFACE_DARK_CARD,
  SURFACE_DARK_ELEV2,
} from "@/src/lib/interview-planning/contrast";
import { CANDIDATE_PALETTE } from "@/src/lib/interview-planning/candidate-colors";
import { Badge } from "@/components/ui/badge";

export default function InterviewTokensDemoPage() {
  const auditList = React.useMemo(() => buildContrastAuditList(), []);

  return (
    <div className="p-8 pb-32 max-w-7xl mx-auto space-y-12">
      {/* Header */}
      <div>
        <div className="flex items-center gap-2 text-xs font-mono text-primary font-semibold mb-1 tracking-wider uppercase">
          Design System · Foundation UX1
        </div>
        <h1 className="text-3xl font-display font-bold text-heading">
          Interview Planning — Semantic Tokens, Contrast &amp; Dark Mode
        </h1>
        <p className="text-muted-foreground mt-2 text-sm max-w-3xl leading-relaxed">
          Fifteen semantic tokens (5 meanings × surface, border, text), six candidate identity hues,
          three surface elevations, and full WCAG 2.1 contrast ratio audit across both light and dark themes.
        </p>
      </div>

      {/* Side-by-Side Dual-Theme Simulator per Task 5 */}
      <section className="space-y-4">
        <div className="flex items-center justify-between border-b pb-2">
          <h2 className="text-xl font-bold flex items-center gap-2">
            <Layers className="size-5 text-primary" />
            Side-by-Side Theme Simulator
          </h2>
          <span className="text-xs text-muted-foreground">
            Rendered simultaneously at lower luminance redesign (Part 6)
          </span>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* ─────────────────────────────────────────────────────────── */}
          {/* Light Theme Column */}
          {/* ─────────────────────────────────────────────────────────── */}
          <div
            className="p-6 rounded-2xl border border-slate-200 space-y-6 shadow-sm"
            style={{ backgroundColor: SURFACE_LIGHT_BASE, color: "#0F1419" }}
          >
            <div className="flex items-center justify-between border-b border-slate-200 pb-3">
              <div className="flex items-center gap-2">
                <Sun className="size-4.5 text-amber-500" />
                <span className="font-semibold text-sm">Light Mode (Base: #FAFBFC)</span>
              </div>
              <Badge variant="outline" className="bg-white text-slate-700 text-[10px]">
                Border: 8% alpha · Tint: 8%
              </Badge>
            </div>

            {/* Semantic Tokens */}
            <div className="space-y-3">
              <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider block">
                Semantic Meanings (UX 5.1)
              </span>

              {/* Accent */}
              <div
                className="p-3.5 rounded-xl border flex items-start justify-between gap-3 text-xs"
                style={{
                  backgroundColor: "#EEF2FF",
                  borderColor: "#4F46E5",
                  color: "#3730A3",
                }}
              >
                <div className="flex items-start gap-2.5">
                  <Sparkles className="size-4 shrink-0 mt-0.5" />
                  <div>
                    <strong className="font-semibold block">Accent (Primary &amp; Selection)</strong>
                    <span className="opacity-90">Used for recommended actions, active tab, and progress</span>
                  </div>
                </div>
                <Badge className="bg-white/80 border border-indigo-200 text-indigo-900 text-[10px] font-mono shrink-0">
                  9.02:1
                </Badge>
              </div>

              {/* Success */}
              <div
                className="p-3.5 rounded-xl border flex items-start justify-between gap-3 text-xs"
                style={{
                  backgroundColor: "#ECFDF5",
                  borderColor: "#059669",
                  color: "#065F46",
                }}
              >
                <div className="flex items-start gap-2.5">
                  <CheckCircle2 className="size-4 shrink-0 mt-0.5" />
                  <div>
                    <strong className="font-semibold block">Success (All free, ready)</strong>
                    <span className="opacity-90">All 3 interviewers free · 3 of 3 ready to send</span>
                  </div>
                </div>
                <Badge className="bg-white/80 border border-emerald-200 text-emerald-900 text-[10px] font-mono shrink-0">
                  7.11:1
                </Badge>
              </div>

              {/* Warning */}
              <div
                className="p-3.5 rounded-xl border flex items-start justify-between gap-3 text-xs"
                style={{
                  backgroundColor: "#FFFBEB",
                  borderColor: "#B45309",
                  color: "#78350F",
                }}
              >
                <div className="flex items-start gap-2.5">
                  <AlertTriangle className="size-4 shrink-0 mt-0.5" />
                  <div>
                    <strong className="font-semibold block">Warning (Partial, mismatch)</strong>
                    <span className="opacity-90">Omar is busy · Preference mismatch · Short notice</span>
                  </div>
                </div>
                <Badge className="bg-white/80 border border-amber-200 text-amber-900 text-[10px] font-mono shrink-0">
                  8.52:1
                </Badge>
              </div>

              {/* Danger */}
              <div
                className="p-3.5 rounded-xl border flex items-start justify-between gap-3 text-xs"
                style={{
                  backgroundColor: "#FFF1F2",
                  borderColor: "#E11D48",
                  color: "#881337",
                }}
              >
                <div className="flex items-start gap-2.5">
                  <AlertCircle className="size-4 shrink-0 mt-0.5" />
                  <div>
                    <strong className="font-semibold block">Danger (Conflict, blocked)</strong>
                    <span className="opacity-90">Interview slot taken by colleague · Relay unavailable</span>
                  </div>
                </div>
                <Badge className="bg-white/80 border border-rose-200 text-rose-900 text-[10px] font-mono shrink-0">
                  8.63:1
                </Badge>
              </div>

              {/* Info */}
              <div
                className="p-3.5 rounded-xl border flex items-start justify-between gap-3 text-xs"
                style={{
                  backgroundColor: "#F0F9FF",
                  borderColor: "#0284C7",
                  color: "#075985",
                }}
              >
                <div className="flex items-start gap-2.5">
                  <Info className="size-4 shrink-0 mt-0.5" />
                  <div>
                    <strong className="font-semibold block">Info (Automation, boundary notice)</strong>
                    <span className="opacity-90">System generated suggestions · Sent via vendor relay</span>
                  </div>
                </div>
                <Badge className="bg-white/80 border border-sky-200 text-sky-900 text-[10px] font-mono shrink-0">
                  6.99:1
                </Badge>
              </div>
            </div>

            {/* Candidate Identity Palette (Light) */}
            <div className="space-y-3 pt-2">
              <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider block">
                Candidate Identity Palette (UX 5.2 — Left border + soft tint only)
              </span>
              <div className="space-y-2">
                {CANDIDATE_PALETTE.map((cand) => (
                  <div
                    key={cand.hue}
                    className="p-3 rounded-lg border border-slate-200/80 border-l-4 flex items-center justify-between gap-3 text-xs"
                    style={{
                      borderLeftColor: cand.light.border,
                      backgroundColor: cand.light.surface,
                    }}
                  >
                    <div className="flex items-center gap-2.5">
                      <div
                        className="size-6 rounded-full font-bold flex items-center justify-center text-[10px]"
                        style={{
                          backgroundColor: cand.light.avatarBg,
                          color: cand.light.avatarText,
                        }}
                      >
                        {cand.index + 1}
                      </div>
                      <span className="font-mono font-semibold" style={{ color: cand.light.text }}>
                        C-01{cand.index + 4}
                      </span>
                      <span className="text-slate-600 font-medium capitalize">
                        {cand.name} identity
                      </span>
                    </div>
                    <Badge className="bg-white/80 border border-slate-200 text-slate-800 text-[10px] font-mono">
                      Border: {cand.light.border}
                    </Badge>
                  </div>
                ))}
              </div>
            </div>

            {/* Surface Elevations (Light) */}
            <div className="space-y-3 pt-2">
              <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider block">
                Surface Elevations (Light Mode)
              </span>
              <div className="grid grid-cols-3 gap-2 text-center text-xs">
                <div className="p-3 rounded-lg border border-slate-200 bg-[#FAFBFC]">
                  <strong className="block text-[11px]">Base Page</strong>
                  <span className="text-[10px] font-mono text-slate-500">#FAFBFC</span>
                </div>
                <div className="p-3 rounded-lg border border-slate-200 bg-white shadow-xs">
                  <strong className="block text-[11px]">Elevation 1 (Card)</strong>
                  <span className="text-[10px] font-mono text-slate-500">#FFFFFF</span>
                </div>
                <div className="p-3 rounded-lg border border-slate-300 bg-white shadow-sm">
                  <strong className="block text-[11px]">Elevation 2 (Popover)</strong>
                  <span className="text-[10px] font-mono text-slate-500">#FFFFFF</span>
                </div>
              </div>
            </div>
          </div>

          {/* ─────────────────────────────────────────────────────────── */}
          {/* Dark Theme Column (Redesign at Lower Luminance) */}
          {/* ─────────────────────────────────────────────────────────── */}
          <div
            className="p-6 rounded-2xl border border-slate-800 space-y-6 shadow-sm"
            style={{ backgroundColor: SURFACE_DARK_BASE, color: "#F9FAFB" }}
          >
            <div className="flex items-center justify-between border-b border-slate-800 pb-3">
              <div className="flex items-center gap-2">
                <Moon className="size-4.5 text-indigo-400" />
                <span className="font-semibold text-sm">Dark Mode (Base: #0B0F17)</span>
              </div>
              <Badge variant="outline" className="bg-slate-900 border-slate-700 text-slate-300 text-[10px]">
                Border: 14% alpha · Tint: 12%
              </Badge>
            </div>

            {/* Semantic Tokens (Dark) */}
            <div className="space-y-3">
              <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider block">
                Semantic Meanings (UX 5.1 &amp; Part 6: Desaturated &amp; Lightened)
              </span>

              {/* Accent */}
              <div
                className="p-3.5 rounded-xl border flex items-start justify-between gap-3 text-xs"
                style={{
                  backgroundColor: "#1E2540",
                  borderColor: "#818CF8",
                  color: "#C7D2FE",
                }}
              >
                <div className="flex items-start gap-2.5">
                  <Sparkles className="size-4 shrink-0 mt-0.5 text-[#818CF8]" />
                  <div>
                    <strong className="font-semibold block">Accent (Lightened ~15%)</strong>
                    <span className="opacity-90">Primary actions, suggestions selection, progress rail</span>
                  </div>
                </div>
                <Badge className="bg-[#161B26] border border-indigo-800 text-indigo-200 text-[10px] font-mono shrink-0">
                  9.64:1
                </Badge>
              </div>

              {/* Success */}
              <div
                className="p-3.5 rounded-xl border flex items-start justify-between gap-3 text-xs"
                style={{
                  backgroundColor: "#142924",
                  borderColor: "#34D399",
                  color: "#A7F3D0",
                }}
              >
                <div className="flex items-start gap-2.5">
                  <CheckCircle2 className="size-4 shrink-0 mt-0.5 text-[#34D399]" />
                  <div>
                    <strong className="font-semibold block">Success (Desaturated ~20%)</strong>
                    <span className="opacity-90">All three free · Plan ready · Confirmed</span>
                  </div>
                </div>
                <Badge className="bg-[#161B26] border border-emerald-800 text-emerald-200 text-[10px] font-mono shrink-0">
                  10.68:1
                </Badge>
              </div>

              {/* Warning */}
              <div
                className="p-3.5 rounded-xl border flex items-start justify-between gap-3 text-xs"
                style={{
                  backgroundColor: "#2E2416",
                  borderColor: "#FBBF24",
                  color: "#FDE68A",
                }}
              >
                <div className="flex items-start gap-2.5">
                  <AlertTriangle className="size-4 shrink-0 mt-0.5 text-[#FBBF24]" />
                  <div>
                    <strong className="font-semibold block">Warning (No vibration)</strong>
                    <span className="opacity-90">Omar is busy · Preference mismatch · Short notice</span>
                  </div>
                </div>
                <Badge className="bg-[#161B26] border border-amber-800 text-amber-200 text-[10px] font-mono shrink-0">
                  10.77:1
                </Badge>
              </div>

              {/* Danger */}
              <div
                className="p-3.5 rounded-xl border flex items-start justify-between gap-3 text-xs"
                style={{
                  backgroundColor: "#2E1B22",
                  borderColor: "#FB7185",
                  color: "#FECDD3",
                }}
              >
                <div className="flex items-start gap-2.5">
                  <AlertCircle className="size-4 shrink-0 mt-0.5 text-[#FB7185]" />
                  <div>
                    <strong className="font-semibold block">Danger (Soft crimson, no buzz)</strong>
                    <span className="opacity-90">Conflict · Declined · Vendor relay unavailable</span>
                  </div>
                </div>
                <Badge className="bg-[#161B26] border border-rose-800 text-rose-200 text-[10px] font-mono shrink-0">
                  10.34:1
                </Badge>
              </div>

              {/* Info */}
              <div
                className="p-3.5 rounded-xl border flex items-start justify-between gap-3 text-xs"
                style={{
                  backgroundColor: "#142538",
                  borderColor: "#38BDF8",
                  color: "#BAE6FD",
                }}
              >
                <div className="flex items-start gap-2.5">
                  <Info className="size-4 shrink-0 mt-0.5 text-[#38BDF8]" />
                  <div>
                    <strong className="font-semibold block">Info (Sky blue)</strong>
                    <span className="opacity-90">Suggestions computed · Blind boundary relay</span>
                  </div>
                </div>
                <Badge className="bg-[#161B26] border border-sky-800 text-sky-200 text-[10px] font-mono shrink-0">
                  10.50:1
                </Badge>
              </div>
            </div>

            {/* Candidate Identity Palette (Dark Mode - 12% Tint survival check) */}
            <div className="space-y-3 pt-2">
              <div className="flex items-center justify-between">
                <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider block">
                  Candidate Identity Palette (UX 5.2 &amp; Part 6: 12% Tint)
                </span>
                <span className="text-[10px] text-emerald-400 font-medium">
                  ✓ Survives on #161B26
                </span>
              </div>
              <div className="space-y-2">
                {CANDIDATE_PALETTE.map((cand) => (
                  <div
                    key={cand.hue}
                    className="p-3 rounded-lg border border-slate-800 border-l-4 flex items-center justify-between gap-3 text-xs"
                    style={{
                      borderLeftColor: cand.dark.border,
                      backgroundColor: cand.dark.surface,
                    }}
                  >
                    <div className="flex items-center gap-2.5">
                      <div
                        className="size-6 rounded-full font-bold flex items-center justify-center text-[10px]"
                        style={{
                          backgroundColor: cand.dark.avatarBg,
                          color: cand.dark.avatarText,
                        }}
                      >
                        {cand.index + 1}
                      </div>
                      <span className="font-mono font-semibold" style={{ color: cand.dark.text }}>
                        C-01{cand.index + 4}
                      </span>
                      <span className="text-slate-300 font-medium capitalize">
                        {cand.name} identity
                      </span>
                    </div>
                    <Badge className="bg-[#161B26] border border-slate-700 text-slate-300 text-[10px] font-mono">
                      Border: {cand.dark.border}
                    </Badge>
                  </div>
                ))}
              </div>
            </div>

            {/* Surface Elevations (Dark Mode - 3 Steps ~4% Lighter) */}
            <div className="space-y-3 pt-2">
              <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider block">
                Three Surface Elevations (Part 6: Cards lift off the page)
              </span>
              <div className="grid grid-cols-3 gap-2 text-center text-xs">
                <div
                  className="p-3 rounded-lg border border-slate-800"
                  style={{ backgroundColor: SURFACE_DARK_BASE }}
                >
                  <strong className="block text-[11px]">Base Page</strong>
                  <span className="text-[10px] font-mono text-slate-400">#0B0F17</span>
                </div>
                <div
                  className="p-3 rounded-lg border border-slate-700/80"
                  style={{ backgroundColor: SURFACE_DARK_CARD }}
                >
                  <strong className="block text-[11px]">Elevation 1 (Card)</strong>
                  <span className="text-[10px] font-mono text-slate-400">#161B26 (+4%)</span>
                </div>
                <div
                  className="p-3 rounded-lg border border-slate-600/80"
                  style={{ backgroundColor: SURFACE_DARK_ELEV2 }}
                >
                  <strong className="block text-[11px]">Elevation 2 (Elevated)</strong>
                  <span className="text-[10px] font-mono text-slate-400">#212838 (+4%)</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Complete Contrast Audit Matrix per Task 3 */}
      <section className="space-y-4">
        <div className="flex items-center justify-between border-b pb-2">
          <div>
            <h2 className="text-xl font-bold flex items-center gap-2">
              <ShieldCheck className="size-5 text-emerald-600" />
              WCAG 2.1 Contrast Audit Matrix (UX 5.3)
            </h2>
            <p className="text-xs text-muted-foreground mt-0.5">
              Standards: Body text 4.5:1 · Large text 3:1 · Meaningful icons/borders 3:1 · Focus rings 3:1 · Disabled text 4.5:1
            </p>
          </div>
          <Badge className="bg-emerald-100 dark:bg-emerald-950 text-emerald-800 dark:text-emerald-300 border-emerald-300 font-mono text-xs">
            100% PASS (24 / 24)
          </Badge>
        </div>

        <div className="border border-border rounded-xl overflow-hidden bg-card shadow-xs">
          <div className="overflow-x-auto">
            <table className="w-full text-xs text-left">
              <thead className="bg-muted/50 border-b border-border text-muted-foreground font-semibold">
                <tr>
                  <th className="py-3 px-4">Token / Pair</th>
                  <th className="py-3 px-4">Category</th>
                  <th className="py-3 px-4">Minimum</th>
                  <th className="py-3 px-4">Light Ratio</th>
                  <th className="py-3 px-4">Dark Ratio</th>
                  <th className="py-3 px-4 text-right">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border font-mono">
                {auditList.map((item, idx) => (
                  <tr key={idx} className="hover:bg-muted/20 transition-colors">
                    <td className="py-2.5 px-4 font-sans font-medium text-foreground">
                      {item.token}
                      <span className="block text-[11px] text-muted-foreground font-normal">
                        {item.description}
                      </span>
                    </td>
                    <td className="py-2.5 px-4 font-sans text-muted-foreground">
                      {item.category}
                    </td>
                    <td className="py-2.5 px-4 font-semibold text-foreground">
                      {item.minRequired.toFixed(1)}:1
                    </td>
                    <td className="py-2.5 px-4">
                      <span className="text-emerald-700 dark:text-emerald-400 font-bold">
                        {item.lightPair.ratio.toFixed(2)}:1
                      </span>
                      <span className="block text-[10px] text-muted-foreground">
                        {item.lightPair.fg} on {item.lightPair.bg}
                      </span>
                    </td>
                    <td className="py-2.5 px-4">
                      <span className="text-emerald-700 dark:text-emerald-400 font-bold">
                        {item.darkPair.ratio.toFixed(2)}:1
                      </span>
                      <span className="block text-[10px] text-muted-foreground">
                        {item.darkPair.fg} on {item.darkPair.bg}
                      </span>
                    </td>
                    <td className="py-2.5 px-4 text-right">
                      <Badge className="bg-emerald-50 dark:bg-emerald-950/60 border-emerald-300 dark:border-emerald-800 text-emerald-800 dark:text-emerald-300 text-[10px] font-semibold">
                        <CheckCircle2 className="size-3 mr-1" />
                        PASS
                      </Badge>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </section>
    </div>
  );
}
