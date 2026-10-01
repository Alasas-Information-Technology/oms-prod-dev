"use client";

import * as React from "react";
import { ClarificationDetail } from "@/types/clarification";
import { ConsequenceBanner } from "@/components/oms/clarification/ConsequenceBanner";

interface ClarificationConsequenceBannerProps {
  clarification: ClarificationDetail;
  className?: string;
}

/**
 * Consequence Banner per Part 3.1:
 * Delegates to extracted ConsequenceBanner in direction="receiving"
 */
export function ClarificationConsequenceBanner({
  clarification,
  className,
}: ClarificationConsequenceBannerProps) {
  return (
    <ConsequenceBanner
      mode={clarification.type}
      consequence={clarification.consequence}
      approvers={clarification.consequence?.approvers}
      direction="receiving"
      className={className}
    />
  );
}

