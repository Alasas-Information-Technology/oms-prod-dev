"use client";

import * as React from "react";
import { ClarificationAsk, ClarificationDetail, ClarificationPreviewResponse } from "@/types/clarification";
import { AskList } from "@/components/oms/clarification/AskList";

interface ClarificationAsksChecklistProps {
  asks: ClarificationAsk[];
  asksAddressed?: string[];
  preview?: ClarificationPreviewResponse;
  clarification?: ClarificationDetail;
  onSelectField?: (fieldKey: string) => void;
  className?: string;
  title?: string;
}

export function ClarificationAsksChecklist(props: ClarificationAsksChecklistProps) {
  return <AskList mode="read" {...props} />;
}

