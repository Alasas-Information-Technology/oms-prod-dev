"use client";

import React from "react";
import { BarChart3 } from "lucide-react";
import { ModuleUnderDevelopment } from "@/components/oms/shared/ModuleUnderDevelopment";

export default function ReportsPage() {
  return (
    <ModuleUnderDevelopment
      moduleName="Executive Reporting & Analytics"
      category="Governance"
      icon={BarChart3}
      description="Comprehensive reporting engine with regulatory compliance exports, Emiratisation tracking, budget variance analysis, and audit reports."
      targetRelease="Target Release: Q4 2026"
      features={[
        {
          title: "Regulatory Compliance Exports",
          description: "One-click export of UAE government procurement reports in PDF, XLSX, and structured JSON formats.",
        },
        {
          title: "Emiratisation Quota & Diversity Analytics",
          description: "Real-time monitoring of Emiratisation ratios across contract types and vendor organizations.",
        },
        {
          title: "Spend Variance & Predictive Forecasting",
          description: "AI-driven spend projections against committed departmental budgets and fiscal ceilings.",
        },
      ]}
    />
  );
}
