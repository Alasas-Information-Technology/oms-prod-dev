import { CheckCircle2, ShieldCheck } from "lucide-react";

import { Card } from "@/components/ui/card";

import { LeaveEntitlementRule } from "./leave.types";

interface LeaveEntitlementRulesProps {
  rules: LeaveEntitlementRule[];
}

export function LeaveEntitlementRules({ rules }: LeaveEntitlementRulesProps) {
  return (
    <Card className="h-full gap-4 rounded-xl border border-border/60 bg-card p-5 shadow-xs hover:translate-y-0">
      <div className="flex items-start gap-3">
        <span className="flex size-9 shrink-0 items-center justify-center rounded-xl bg-primary/10 text-primary">
          <ShieldCheck className="size-4" />
        </span>
        <div>
          <h2 className="text-sm font-semibold text-foreground">Entitlement Rules</h2>
          <p className="mt-1 text-xs text-muted-foreground">Important policy reminders.</p>
        </div>
      </div>

      <ul className="space-y-3">
        {rules.map((rule) => (
          <li key={rule.id} className="flex items-start gap-2.5 text-xs leading-5 text-foreground-secondary">
            <CheckCircle2 className="mt-0.5 size-4 shrink-0 text-brand-teal" />
            <span>{rule.label}</span>
          </li>
        ))}
      </ul>
    </Card>
  );
}
