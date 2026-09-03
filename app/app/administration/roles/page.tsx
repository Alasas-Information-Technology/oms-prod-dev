"use client";

import React from "react";
import { ShieldCheck } from "lucide-react";
import { ModuleUnderDevelopment } from "@/components/oms/shared/ModuleUnderDevelopment";

export default function RolesPage() {
  return (
    <ModuleUnderDevelopment
      moduleName="Roles & Permission Matrix"
      category="Administration"
      icon={ShieldCheck}
      description="Configure fine-grained Role-Based Access Control (RBAC), approval delegation rules, financial signing thresholds, and role assignments."
      targetRelease="Target Release: Q4 2026"
      features={[
        {
          title: "Granular Permission Matrix",
          description: "Over 80 discrete permission gates spanning requisitions, financial commitments, vendor reviews, and user administration.",
        },
        {
          title: "Temporary Delegation Authority",
          description: "Time-bound authority delegation for out-of-office approvers with automatic revocation.",
        },
        {
          title: "Azure AD Role Mapping",
          description: "Automated group-to-role synchronization via SCIM and SAML 2.0.",
        },
      ]}
    />
  );
}
