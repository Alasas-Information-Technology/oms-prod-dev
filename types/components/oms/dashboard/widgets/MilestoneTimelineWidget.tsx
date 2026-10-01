"use client";

import React from "react";
import { UpcomingMilestonesWidget } from "./UpcomingMilestonesWidget";
import { WidgetProps } from "@/lib/dashboard/registry";
import { UpcomingMilestonesData } from "@/types/dashboard";

/**
 * MilestoneTimelineWidget (Alias for milestone-timeline widget ID)
 */
export function MilestoneTimelineWidget(props: WidgetProps<UpcomingMilestonesData>) {
  return <UpcomingMilestonesWidget {...props} />;
}
