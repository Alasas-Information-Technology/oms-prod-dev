"use client";

import * as React from "react";
import { ClarificationDiffItem } from "@/types/clarification";
import { FieldDiffTable } from "@/components/oms/clarification/FieldDiffTable";

interface ClarificationDiffPanelProps {
  diff?: ClarificationDiffItem[];
  isLoading?: boolean;
  className?: string;
  title?: string;
}

export function ClarificationDiffPanel({
  diff = [],
  isLoading = false,
  className,
  title,
}: ClarificationDiffPanelProps) {
  return (
    <FieldDiffTable
      variant="live"
      rows={diff}
      isLoading={isLoading}
      className={className}
      title={title}
    />
  );
}

