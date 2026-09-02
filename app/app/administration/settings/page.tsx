"use client";

import React from "react";
import { Sliders } from "lucide-react";
import { ModuleUnderDevelopment } from "@/components/oms/shared/ModuleUnderDevelopment";

export default function SystemSettingsPage() {
  return (
    <ModuleUnderDevelopment
      moduleName="System & Environment Configuration"
      category="Administration"
      icon={Sliders}
      description="Global OMS system parameters, notification channels, email templates, document retention rules, and feature flags."
      targetRelease="Target Release: Q4 2026"
      features={[
        {
          title: "Notification Routing Engine",
          description: "Configurable email, SMS, and in-app webhook delivery channels per notification category.",
        },
        {
          title: "Fiscal Year & Period Controls",
          description: "Manage active fiscal calendars, rollover deadlines, and budget freeze periods.",
        },
        {
          title: "Audit & Data Retention Policies",
          description: "Configurable lifecycle retention thresholds for requisitions, audit logs, and security histories.",
        },
      ]}
    />
  );
}
