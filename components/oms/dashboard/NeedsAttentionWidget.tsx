"use client";

import Link from "next/link";
import { getNeedsAttentionSummary } from "@/lib/fixtures/dashboard-attention.fixtures";
import { ArrowRight, BellRing, CheckCircle2 } from "lucide-react";
import { Badge } from "@/components/ui/badge";

export function NeedsAttentionWidget() {
  const { items, totalCount } = getNeedsAttentionSummary();

  if (items.length === 0) {
    return (
      <div className="p-5 rounded-lg border border-border/60 bg-card shadow-xs flex items-center gap-3 text-muted-foreground">
        <CheckCircle2 className="size-5 text-emerald-600" />
        <span className="text-sm font-medium">Nothing waiting on you right now.</span>
      </div>
    );
  }

  return (
    <div className="p-5 rounded-lg border border-border/70 bg-card shadow-xs flex flex-col gap-4">
      <div className="flex items-center justify-between border-b border-border/40 pb-3">
        <div className="flex items-center gap-2">
          <BellRing className="size-4 text-amber-600" />
          <h2 className="text-sm font-bold text-foreground tracking-tight">
            Needs your attention
          </h2>
        </div>
        <Badge
          variant="secondary"
          className="text-xs font-semibold px-2 py-0.5 bg-amber-100 text-amber-900 border-amber-200"
        >
          {totalCount} total
        </Badge>
      </div>

      <div className="divide-y divide-border/30">
        {items.map((item) => (
          <Link
            key={item.id}
            href={item.href}
            className="group py-3 flex items-center justify-between text-sm transition-colors hover:bg-muted/40 px-2 rounded-lg -mx-2"
          >
            <div className="flex items-center gap-3">
              <span className="w-6 h-6 rounded-full bg-primary/10 text-primary font-bold text-xs flex items-center justify-center tabular-nums">
                {item.count}
              </span>
              <span className="font-medium text-foreground group-hover:text-primary transition-colors">
                {item.label}
              </span>
            </div>

            <div className="flex items-center gap-1.5 text-xs text-muted-foreground group-hover:text-primary transition-colors">
              <span className="hidden sm:inline text-[11px] font-mono">
                {item.href.split("?")[0]}
              </span>
              <ArrowRight className="size-3.5 transition-transform group-hover:translate-x-0.5" />
            </div>
          </Link>
        ))}
      </div>
    </div>
  );
}
