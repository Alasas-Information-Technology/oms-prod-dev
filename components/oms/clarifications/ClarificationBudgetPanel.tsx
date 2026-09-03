"use client";

import * as React from "react";
import { ClarificationBudgetResult } from "@/types/clarification";
import { BudgetImpactPanel } from "@/components/oms/clarification/BudgetImpactPanel";

interface ClarificationBudgetPanelProps {
  budget?: ClarificationBudgetResult;
  isLoading?: boolean;
  className?: string;
  title?: string;
}

export function ClarificationBudgetPanel({
  budget,
  isLoading = false,
  className,
  title,
}: ClarificationBudgetPanelProps) {
  return (
    <BudgetImpactPanel
      variant="revalidation"
      figures={budget}
      isLoading={isLoading}
      className={className}
      title={title}
    />
  );
}

