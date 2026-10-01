"use client";

import * as React from "react";
import { ClarificationRouteStep } from "@/types/clarification";
import { ReapprovalRoute } from "@/components/oms/clarification/ReapprovalRoute";

interface ClarificationRouteStepperProps {
  route?: ClarificationRouteStep[];
  isLoading?: boolean;
  className?: string;
  title?: string;
}

export function ClarificationRouteStepper({
  route = [],
  isLoading = false,
  className,
  title,
}: ClarificationRouteStepperProps) {
  return (
    <ReapprovalRoute
      variant="after-submit"
      route={route}
      isLoading={isLoading}
      className={className}
      title={title}
    />
  );
}

