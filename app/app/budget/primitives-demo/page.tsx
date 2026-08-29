"use client";

import * as React from "react";
import Link from "next/link";
import {
  Wallet,
  Building2,
  Lock,
  Layers,
  ArrowRight,
  Sparkles,
  ShieldAlert,
  Coins,
  Scale,
  Percent,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import {
  Amount,
  FundStateBadge,
  KpiCard,
  FundStateBar,
} from "@/components/budget";
import {
  formatAmount,
  formatAbbreviated,
  formatPercent,
  toBigIntFils,
} from "@/lib/money";
import { FundState } from "@/lib/types/budget.types";

export default function BudgetPrimitivesDemoPage() {
  // Interactive Calculator State
  const [customFilsInput, setCustomFilsInput] = React.useState<string>("2480000000");

  // Sum-Mismatch Simulator State
  const [simulateMismatch, setSimulateMismatch] = React.useState<boolean>(false);
  const [mismatchVarianceFils, setMismatchVarianceFils] = React.useState<string>("20000000");

  // Reference figures in fils
  const refTotal = BigInt("2480000000"); // AED 24.80M
  const refAvailable = BigInt("1020000000"); // AED 10.20M
  const refReserved = BigInt("540000000"); // AED 5.40M
  const refLocked = BigInt("710000000"); // AED 7.10M
  const refConsumed = BigInt("210000000"); // AED 2.10M

  // Calculated values for mismatch simulation
  const effectiveAvailable = simulateMismatch
    ? refAvailable - toBigIntFils(mismatchVarianceFils)
    : refAvailable;

  const parsedCustomFils = toBigIntFils(customFilsInput);

  return (
    <div className="p-6 space-y-8 animate-in fade-in-50 duration-200">
      {/* Header Banner */}
      <div className="relative overflow-hidden rounded-md border border-primary/20 bg-gradient-to-b from-primary/10 via-card to-card p-6 md:p-8 shadow-xs">
        <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div className="space-y-2 max-w-2xl">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-primary/10 border border-primary/20 text-primary text-xs font-semibold">
              <Coins className="size-3.5" />
              <span>Domain 2 / Prompt B2</span>
            </div>
            <h1 className="text-2xl md:text-3xl font-bold tracking-tight text-foreground font-display">
              Budget Money & Primitives Showcase
            </h1>
            <p className="text-sm text-muted-foreground leading-relaxed">
              Living design verification for <strong>minor units arithmetic (fils)</strong>,
              exact decimal rendering, executive KPI summary cards, and the sum-integrity fund
              state bar per Part 4 of <code className="text-primary font-mono text-xs">BUDGET-CONTROL-CENTER-UI.md</code>.
            </p>
          </div>

          <div className="flex items-center gap-3">
            <Button asChild variant="outline" size="sm" className="rounded-md text-xs gap-1.5 h-9">
              <Link href="/app/administration/users">
                <span>User Admin</span>
                <ArrowRight className="size-3.5" />
              </Link>
            </Button>
          </div>
        </div>
      </div>

      {/* 1. Core Rule & Invariants Assurance */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card className="rounded-md border-border/70 bg-card/70 backdrop-blur-xs p-5 space-y-2">
          <div className="flex items-center gap-2 text-xs font-semibold text-primary uppercase tracking-wider">
            <Scale className="size-4" />
            <span>Zero Floating Point</span>
          </div>
          <p className="text-xs text-muted-foreground leading-relaxed">
            All arithmetic uses <strong>64-bit integer BigInt</strong>. Float conversions are
            prohibited in all budget calculations to ensure absolute ledger consistency down to 1 fil.
          </p>
        </Card>

        <Card className="rounded-md border-border/70 bg-card/70 backdrop-blur-xs p-5 space-y-2">
          <div className="flex items-center gap-2 text-xs font-semibold text-emerald-600 dark:text-emerald-400 uppercase tracking-wider">
            <Coins className="size-4" />
            <span>Exact Minor Units (Fils)</span>
          </div>
          <p className="text-xs text-muted-foreground leading-relaxed">
            All APIs transport pure integer fils (<code className="font-mono text-foreground font-semibold">1 AED = 100 fils</code>). Table cells format to 2 decimals always, including <code className="font-mono">.00</code>.
          </p>
        </Card>

        <Card className="rounded-md border-border/70 bg-card/70 backdrop-blur-xs p-5 space-y-2">
          <div className="flex items-center gap-2 text-xs font-semibold text-amber-600 dark:text-amber-400 uppercase tracking-wider">
            <ShieldAlert className="size-4" />
            <span>Sum Integrity Guard</span>
          </div>
          <p className="text-xs text-muted-foreground leading-relaxed">
            If Available + Reserved + Locked + Consumed does not equal Total, visual normalization is suppressed and an audit warning renders.
          </p>
        </Card>
      </div>

      {/* 2. Executive KPI Cards Section */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-lg font-bold font-display text-foreground">Executive KPI Summary Cards</h2>
            <p className="text-xs text-muted-foreground">
              Headline cards using <code className="text-primary font-mono text-xs">formatAbbreviated()</code> with hover inspection tooltips.
            </p>
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4">
          <KpiCard
            icon={Wallet}
            label="Total Budget"
            amount={refTotal}
            isTotal={true}
            delta={{
              percent: 7.8,
              isPositive: true,
              label: "vs FY25",
            }}
          />

          <KpiCard
            icon={Coins}
            label="Available"
            amount={refAvailable}
            statusDotColor="bg-emerald-500"
            delta={{
              percent: "41.1%",
              isPositive: true,
              label: "share",
            }}
          />

          <KpiCard
            icon={Layers}
            label="Reserved"
            amount={refReserved}
            statusDotColor="bg-amber-500"
            delta={{
              percent: "21.8%",
              isPositive: true,
              label: "share",
            }}
          />

          <KpiCard
            icon={Lock}
            label="Locked"
            amount={refLocked}
            statusDotColor="bg-indigo-500"
            delta={{
              percent: "28.6%",
              isPositive: true,
              label: "share",
            }}
          />

          <KpiCard
            icon={Building2}
            label="Consumed"
            amount={refConsumed}
            statusDotColor="bg-zinc-500"
            delta={{
              percent: "8.5%",
              isPositive: false,
              label: "share",
            }}
          />
        </div>
      </div>

      {/* 3. Fund State Bar Section */}
      <div className="space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h2 className="text-lg font-bold font-display text-foreground">Fund State Stacked Bar</h2>
            <p className="text-xs text-muted-foreground">
              Stacked distribution bar with interactive legend hover and &lt; 8% label suppression.
            </p>
          </div>

          <div className="flex items-center gap-3 p-2 rounded-md bg-card border border-border/80 shadow-2xs">
            <Label htmlFor="mismatch-toggle" className="text-xs font-semibold cursor-pointer select-none">
              Simulate Sum Mismatch Discrepancy
            </Label>
            <Switch
              id="mismatch-toggle"
              checked={simulateMismatch}
              onCheckedChange={setSimulateMismatch}
            />
          </div>
        </div>

        {/* Live FundStateBar Component */}
        <FundStateBar
          title="FY 2026 Budget Distribution"
          totalFils={refTotal}
          availableFils={effectiveAvailable}
          reservedFils={refReserved}
          lockedFils={refLocked}
          consumedFils={refConsumed}
        />

        {simulateMismatch && (
          <div className="p-4 rounded-md border border-amber-300 bg-amber-50/80 dark:border-amber-900/60 dark:bg-amber-950/30 text-xs text-amber-900 dark:text-amber-200 flex items-center justify-between gap-3">
            <span>
              Simulating <strong>AED 200,000.00</strong> (20,000,000 fils) discrepancy on Available funds.
            </span>
            <Button
              size="sm"
              variant="outline"
              onClick={() => setSimulateMismatch(false)}
              className="text-xs h-7 rounded-lg"
            >
              Restore Exact Reconciliation
            </Button>
          </div>
        )}
      </div>

      {/* 4. FundStateBadge & Status Tokens */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <Card className="rounded-md border-border/70 bg-card/70 backdrop-blur-xs">
          <CardHeader className="pb-3 border-b border-border/50">
            <CardTitle className="text-base font-semibold font-display flex items-center gap-2">
              <Sparkles className="size-4 text-primary" />
              <span>Fund State Badges</span>
            </CardTitle>
            <CardDescription className="text-xs">
              Unified color badges mapped directly to ledger fund states.
            </CardDescription>
          </CardHeader>
          <CardContent className="pt-4 space-y-4">
            <div className="space-y-2">
              <span className="text-[11px] uppercase font-semibold tracking-wider text-muted-foreground">
                Default Size
              </span>
              <div className="flex flex-wrap gap-2">
                {(["AVAILABLE", "RESERVED", "LOCKED", "CONSUMED"] as FundState[]).map((state) => (
                  <FundStateBadge key={state} state={state} />
                ))}
              </div>
            </div>

            <div className="space-y-2 pt-2">
              <span className="text-[11px] uppercase font-semibold tracking-wider text-muted-foreground">
                Small Size (Table Cells)
              </span>
              <div className="flex flex-wrap gap-2">
                {(["AVAILABLE", "RESERVED", "LOCKED", "CONSUMED"] as FundState[]).map((state) => (
                  <FundStateBadge key={state} state={state} size="sm" />
                ))}
              </div>
            </div>
          </CardContent>
        </Card>

        {/* 5. Amount Component & Number Format Tests */}
        <Card className="rounded-md border-border/70 bg-card/70 backdrop-blur-xs">
          <CardHeader className="pb-3 border-b border-border/50">
            <CardTitle className="text-base font-semibold font-display flex items-center gap-2">
              <Percent className="size-4 text-primary" />
              <span>Amount Component Test Matrix</span>
            </CardTitle>
            <CardDescription className="text-xs">
              Exact formatting with tabular-nums and negative colorization.
            </CardDescription>
          </CardHeader>
          <CardContent className="pt-4 space-y-3 text-xs">
            <div className="flex items-center justify-between py-1 border-b border-border/40">
              <span className="text-muted-foreground">Standard Positive (3.2M AED)</span>
              <Amount value={BigInt(320000000)} showCurrency={true} className="font-semibold text-foreground" />
            </div>

            <div className="flex items-center justify-between py-1 border-b border-border/40">
              <span className="text-muted-foreground">Abbreviated (24.8M AED)</span>
              <Amount value={refTotal} abbreviate={true} showCurrency={true} className="font-bold text-foreground" />
            </div>

            <div className="flex items-center justify-between py-1 border-b border-border/40">
              <span className="text-muted-foreground">Negative Delta (-500k AED)</span>
              <Amount value={BigInt(-50000000)} showCurrency={true} />
            </div>

            <div className="flex items-center justify-between py-1 border-b border-border/40">
              <span className="text-muted-foreground">Zero Value (Never dash)</span>
              <Amount value={BigInt(0)} showCurrency={true} />
            </div>

            <div className="flex items-center justify-between py-1">
              <span className="text-muted-foreground">Micro-Amount (1 fil)</span>
              <Amount value={BigInt(1)} showCurrency={true} />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* 6. Live Minor Units Calculator */}
      <Card className="rounded-md border-border/70 bg-card/70 backdrop-blur-xs">
        <CardHeader className="pb-3 border-b border-border/50">
          <CardTitle className="text-base font-semibold font-display flex items-center gap-2">
            <Coins className="size-4 text-primary" />
            <span>Interactive Minor Units (Fils) Calculator</span>
          </CardTitle>
          <CardDescription className="text-xs">
            Input any integer value in minor units (fils) to verify edge formatting in real-time.
          </CardDescription>
        </CardHeader>
        <CardContent className="pt-4 space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 items-end">
            <div className="space-y-1.5 sm:col-span-1">
              <Label htmlFor="custom-fils-input" className="text-xs font-medium text-muted-foreground">
                Enter Minor Units (fils)
              </Label>
              <Input
                id="custom-fils-input"
                type="text"
                value={customFilsInput}
                onChange={(e) => setCustomFilsInput(e.target.value)}
                placeholder="e.g. 2480000000"
                className="font-mono text-sm h-10 rounded-md"
              />
            </div>

            <div className="p-3 rounded-md bg-background/60 border border-border/60 space-y-1">
              <span className="text-[11px] text-muted-foreground font-medium uppercase tracking-wider block">
                formatAmount()
              </span>
              <div className="text-sm font-bold text-foreground font-mono tabular-nums">
                AED {formatAmount(parsedCustomFils)}
              </div>
            </div>

            <div className="p-3 rounded-md bg-background/60 border border-border/60 space-y-1">
              <span className="text-[11px] text-muted-foreground font-medium uppercase tracking-wider block">
                formatAbbreviated()
              </span>
              <div className="text-sm font-bold text-primary font-mono tabular-nums">
                {formatAbbreviated(parsedCustomFils, { showCurrency: true })}
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
