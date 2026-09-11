"use client";

import * as React from "react";
import Link from "next/link";
import {
  Building2,
  Mail,
  Phone,
  MapPin,
  Globe,
  ShieldCheck,
  Lock,
  UserCheck,
  Users,
  CheckCircle2,
  ExternalLink,
  Info,
  Calendar,
  ArrowUpRight,
  FileText,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card } from "@/components/ui/card";
import { getVendorProfile } from "@/src/lib/demo-data";
import { cn } from "@/lib/utils";

interface VendorProfileWorkspaceProps {
  vendorId?: string;
  className?: string;
}

export function VendorProfileWorkspace({
  vendorId = "ven-falcon",
  className,
}: VendorProfileWorkspaceProps) {
  const profile = React.useMemo(() => getVendorProfile(vendorId), [vendorId]);

  if (!profile) {
    return (
      <div className="p-8 text-center text-muted-foreground text-sm">
        Vendor profile record not found.
      </div>
    );
  }

  return (
    <div className={cn("space-y-6 max-w-7xl mx-auto pb-12", className)}>
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 border-b border-border/60 pb-5">
        <div className="space-y-1">
          <div className="flex items-center gap-2">
            <span className="text-[11px] font-bold tracking-wider uppercase text-muted-foreground">
              Account & Governance
            </span>
            <span className="text-muted-foreground/40 font-mono">/</span>
            <span className="text-[11px] font-mono font-medium text-teal-600 dark:text-teal-400">
              Company Registration
            </span>
          </div>
          <h1 className="text-xl sm:text-2xl font-bold tracking-tight text-foreground flex items-center gap-2.5">
            <Building2 className="w-6 h-6 text-teal-600 dark:text-teal-400 shrink-0" />
            Company Profile
          </h1>
          <p className="text-xs sm:text-sm text-muted-foreground max-w-3xl">
            Corporate registration details, authorized primary contact, and verified coordinator
            directory for Falcon Tech Resourcing.
          </p>
        </div>

        <div className="flex items-center gap-2.5">
          <Link href="/vendor/support">
            <Button
              size="sm"
              className="text-xs h-9 gap-1.5 bg-teal-600 hover:bg-teal-700 text-white shadow-sm"
            >
              Request Account Changes
            </Button>
          </Link>
        </div>
      </div>

      {/* Main Grid: Company Details + Primary Contact */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">
        {/* Left 2 Cols: Corporate Registration & Details */}
        <Card className="lg:col-span-2 p-5 sm:p-6 rounded-xl border border-border/70 dark:border-white/[0.08] bg-card space-y-5">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-border/40 pb-4">
            <div className="space-y-1">
              <div className="flex items-center gap-2">
                <span className="text-lg font-bold text-foreground">{profile.companyName}</span>
                <span className="inline-flex items-center gap-1 text-[11px] font-semibold px-2 py-0.5 rounded-full bg-emerald-500/15 text-emerald-600 dark:text-emerald-400 border border-emerald-500/30">
                  <CheckCircle2 className="w-3 h-3" />
                  VERIFIED VENDOR
                </span>
              </div>
              <p className="text-xs text-muted-foreground font-mono">
                Vendor ID: {profile.vendorId} · {profile.tier}
              </p>
            </div>

            <Link href="/vendor/contracts">
              <Button
                variant="outline"
                size="sm"
                className="text-xs h-8 gap-1.5 border-border/70 hover:bg-muted/40"
              >
                <FileText className="w-3.5 h-3.5" />
                View Active Contracts ({profile.activeContractsCount})
              </Button>
            </Link>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
            <div className="space-y-1 p-3 rounded-lg bg-muted/20 border border-border/50">
              <span className="text-[11px] text-muted-foreground block">Commercial Licence Ref</span>
              <span className="font-mono font-bold text-foreground">
                {profile.tradeLicenceNumber}
              </span>
            </div>

            <div className="space-y-1 p-3 rounded-lg bg-muted/20 border border-border/50">
              <span className="text-[11px] text-muted-foreground block">
                Tax Registration Number (TRN)
              </span>
              <span className="font-mono font-bold text-foreground">
                {profile.taxRegistrationNumber}
              </span>
            </div>

            <div className="space-y-1 p-3 rounded-lg bg-muted/20 border border-border/50">
              <span className="text-[11px] text-muted-foreground block">Accredited Jurisdiction</span>
              <span className="font-medium text-foreground">{profile.jurisdiction}</span>
            </div>

            <div className="space-y-1 p-3 rounded-lg bg-muted/20 border border-border/50">
              <span className="text-[11px] text-muted-foreground block">Registered Website</span>
              <span className="font-mono text-teal-600 dark:text-teal-400">
                {profile.website}
              </span>
            </div>

            <div className="sm:col-span-2 space-y-1 p-3 rounded-lg bg-muted/20 border border-border/50">
              <span className="text-[11px] text-muted-foreground flex items-center gap-1">
                <MapPin className="w-3 h-3 text-teal-600 dark:text-teal-400" />
                Registered Business Address
              </span>
              <span className="font-medium text-foreground">{profile.businessAddress}</span>
            </div>

            <div className="space-y-1 p-3 rounded-lg bg-muted/20 border border-border/50">
              <span className="text-[11px] text-muted-foreground flex items-center gap-1">
                <Mail className="w-3 h-3 text-teal-600 dark:text-teal-400" />
                Central Dispatch Email
              </span>
              <span className="font-mono text-foreground">{profile.primaryEmail}</span>
            </div>

            <div className="space-y-1 p-3 rounded-lg bg-muted/20 border border-border/50">
              <span className="text-[11px] text-muted-foreground flex items-center gap-1">
                <Phone className="w-3 h-3 text-teal-600 dark:text-teal-400" />
                Main Office Telephone
              </span>
              <span className="font-mono text-foreground">{profile.primaryPhone}</span>
            </div>
          </div>
        </Card>

        {/* Right Col: Primary Authorized Representative */}
        <Card className="p-5 sm:p-6 rounded-xl border border-border/70 dark:border-white/[0.08] bg-card space-y-4 flex flex-col justify-between">
          <div className="space-y-3">
            <div className="flex items-center justify-between border-b border-border/40 pb-3">
              <span className="text-xs font-bold text-foreground uppercase tracking-wide flex items-center gap-1.5">
                <UserCheck className="w-4 h-4 text-teal-600 dark:text-teal-400" />
                Primary Contact
              </span>
              <Badge variant="outline" className="text-[10px] border-teal-500/30 text-teal-600">
                Signatory
              </Badge>
            </div>

            <div className="space-y-1">
              <h4 className="text-base font-bold text-foreground">
                {profile.primaryContact.name}
              </h4>
              <p className="text-xs text-muted-foreground">{profile.primaryContact.role}</p>
            </div>

            <div className="space-y-2 pt-2 text-xs">
              <div className="flex items-center gap-2 text-muted-foreground">
                <Mail className="w-3.5 h-3.5 text-muted-foreground/70" />
                <span className="font-mono text-foreground">{profile.primaryContact.email}</span>
              </div>
              <div className="flex items-center gap-2 text-muted-foreground">
                <Phone className="w-3.5 h-3.5 text-muted-foreground/70" />
                <span className="font-mono text-foreground">{profile.primaryContact.phone}</span>
              </div>
            </div>

            <p className="text-[11px] text-muted-foreground bg-muted/30 p-3 rounded-lg border border-border/40 leading-relaxed">
              Designated as the primary commercial and legal point of contact for SLA notifications,
              MSA amendments, and formal communications from DIEZ.
            </p>
          </div>

          <Link href="/vendor/support">
            <Button
              variant="outline"
              size="sm"
              className="w-full text-xs h-8 gap-1 border-border/70 hover:bg-muted/40"
            >
              Update Contact via Support
            </Button>
          </Link>
        </Card>
      </div>

      {/* Coordinators Directory & Domain 3 Rule V8 Governance Section */}
      <Card className="p-5 sm:p-6 rounded-xl border border-border/70 dark:border-white/[0.08] bg-card space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-border/40 pb-4">
          <div>
            <h3 className="text-base font-bold text-foreground flex items-center gap-2">
              <Users className="w-4 h-4 text-teal-600 dark:text-teal-400" />
              Authorized Agency Coordinators
            </h3>
            <p className="text-xs text-muted-foreground mt-0.5">
              Individuals permitted to access the OEMS Vendor Portal on behalf of Falcon Tech
              Resourcing.
            </p>
          </div>

          <span className="text-[11px] font-mono px-2 py-0.5 rounded bg-muted text-muted-foreground self-start sm:self-center">
            {profile.coordinators.length} Authorized Users
          </span>
        </div>

        {/* Domain 3 Rule V8 Governance Notice (Crucial requirement from 4.10) */}
        <div className="p-4 rounded-xl border border-teal-500/30 bg-teal-500/5 text-xs text-foreground/90 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div className="flex items-start gap-3">
            <div className="p-2 rounded-lg bg-teal-500/20 text-teal-700 dark:text-teal-300 shrink-0 mt-0.5 sm:mt-0">
              <Lock className="w-4 h-4" />
            </div>
            <div className="space-y-0.5">
              <p className="font-semibold text-foreground flex items-center gap-1.5">
                Coordinator Management Governance (Domain 3 Rule V8)
                <span className="text-[10px] px-1.5 py-0.2 rounded bg-teal-500/20 text-teal-700 dark:text-teal-300 font-mono">
                  VENDORUSER.MANAGE
                </span>
              </p>
              <p className="text-muted-foreground text-[11px] leading-relaxed">
                Permission to provision, edit, or deactivate vendor coordinator accounts (
                <code className="text-[10px] font-mono text-foreground font-semibold">
                  VENDORUSER.MANAGE
                </code>
                ) is held exclusively by DIEZ Procurement Division to prevent unauthorized agency
                credential creation. This section is read-mostly for vendor coordinators.
              </p>
            </div>
          </div>

          <Link
            href="/vendor/support"
            className="text-xs font-semibold text-teal-600 dark:text-teal-400 hover:underline flex items-center gap-1 shrink-0 self-end sm:self-center"
          >
            Request User Changes
            <ArrowUpRight className="w-3.5 h-3.5" />
          </Link>
        </div>

        {/* Coordinators Table */}
        <div className="overflow-x-auto rounded-lg border border-border/60">
          <table className="w-full text-left text-xs border-collapse">
            <thead>
              <tr className="border-b border-border/70 bg-muted/40 text-[11px] font-semibold text-muted-foreground">
                <th className="py-2.5 px-3">Coordinator Name</th>
                <th className="py-2.5 px-3">Email Address</th>
                <th className="py-2.5 px-3">Contact Phone</th>
                <th className="py-2.5 px-3">Agency Role</th>
                <th className="py-2.5 px-3">Status</th>
                <th className="py-2.5 px-3 text-right">Governed By</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border/40">
              {profile.coordinators.map((coord) => (
                <tr key={coord.id} className="hover:bg-muted/20 transition-colors">
                  <td className="py-3 px-3 font-semibold text-foreground flex items-center gap-2">
                    {coord.name}
                    {coord.isPrimary && (
                      <span className="text-[10px] px-1.5 py-0.2 rounded bg-teal-500/15 text-teal-700 dark:text-teal-300 font-semibold border border-teal-500/30">
                        Primary
                      </span>
                    )}
                  </td>
                  <td className="py-3 px-3 font-mono text-muted-foreground">{coord.email}</td>
                  <td className="py-3 px-3 font-mono text-muted-foreground">{coord.phone}</td>
                  <td className="py-3 px-3 text-foreground">{coord.role}</td>
                  <td className="py-3 px-3">
                    <span className="inline-flex items-center gap-1 text-[11px] font-medium text-emerald-600 dark:text-emerald-400">
                      <CheckCircle2 className="w-3 h-3" />
                      Active
                    </span>
                  </td>
                  <td className="py-3 px-3 text-right font-mono text-[11px] text-muted-foreground">
                    DIEZ Procurement
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </Card>
    </div>
  );
}
