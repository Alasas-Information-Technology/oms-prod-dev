"use client";

import React from "react";
import {
  X,
  Edit3,
  User,
  Briefcase,
  GraduationCap,
  DollarSign,
  Building2,
  FileText,
  Star,
  Clock,
} from "lucide-react";
import { Button } from "@/components/ui/button";

interface CandidateDetailDrawerProps {
  candidate: any;
  onClose: () => void;
  onEdit: () => void;
}

const statusColors: Record<string, { bg: string; dot: string; text: string }> =
  {
    SUBMITTED: { bg: "bg-blue-50", dot: "bg-blue-500", text: "text-blue-700" },
    UNDER_REVIEW: {
      bg: "bg-amber-50",
      dot: "bg-amber-500",
      text: "text-amber-700",
    },
    SHORTLISTED: {
      bg: "bg-violet-50",
      dot: "bg-violet-500",
      text: "text-violet-700",
    },
    INTERVIEW_SCHEDULED: {
      bg: "bg-cyan-50",
      dot: "bg-cyan-500",
      text: "text-cyan-700",
    },
    SELECTED: {
      bg: "bg-green-50",
      dot: "bg-green-500",
      text: "text-green-700",
    },
    REJECTED: { bg: "bg-red-50", dot: "bg-red-500", text: "text-red-700" },
    WITHDRAWN: {
      bg: "bg-slate-100",
      dot: "bg-slate-400",
      text: "text-slate-500",
    },
  };

const priorityColors: Record<string, string> = {
  P1: "bg-red-50 text-red-700",
  P2: "bg-amber-50 text-amber-700",
  P3: "bg-slate-100 text-slate-500",
};

export default function CandidateDetailDrawer({
  candidate,
  onClose,
  onEdit,
}: CandidateDetailDrawerProps) {
  const status = statusColors[candidate.status] || statusColors["SUBMITTED"];

  const Field = ({
    label,
    value,
    mono = false,
  }: {
    label: string;
    value?: string | null;
    mono?: boolean;
  }) =>
    value ? (
      <div className="flex flex-col gap-0.5">
        <span className="text-[10px] font-semibold text-slate-400 uppercase tracking-wider">
          {label}
        </span>
        <span className={`text-sm text-slate-700 ${mono ? "font-mono" : ""}`}>
          {value}
        </span>
      </div>
    ) : null;

  return (
    <div className="fixed inset-0 z-50 flex justify-end">
      <div
        className="absolute inset-0 bg-black/30 backdrop-blur-sm"
        onClick={onClose}
      />
      <div className="relative bg-white w-full max-w-md h-full flex flex-col shadow-2xl animate-in slide-in-from-right duration-300">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-100">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-[hsl(214,67%,32%)]/10 flex items-center justify-center text-[hsl(214,67%,32%)] text-sm font-bold">
              {candidate.alias?.slice(0, 2).toUpperCase()}
            </div>
            <div>
              <h2 className="font-bold text-slate-900 text-base leading-tight">
                {candidate.alias}
              </h2>
              <span
                className={`inline-flex items-center gap-1 text-xs font-semibold px-2 py-0.5 rounded-full ${status.bg} ${status.text}`}
              >
                <span className={`w-1.5 h-1.5 rounded-full ${status.dot}`} />
                {candidate.status?.replace(/_/g, " ")}
              </span>
            </div>
          </div>
          <Button
            variant="ghost"
            size="icon"
            onClick={onClose}
            className="h-8 w-8 text-slate-400"
          >
            <X size={16} />
          </Button>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto px-6 py-5 space-y-6">
          {/* Assignment */}
          <section>
            <div className="flex items-center gap-2 mb-3">
              <FileText size={12} className="text-[hsl(214,67%,32%)]" />
              <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider">
                Assignment
              </span>
            </div>
            <div className="space-y-3">
              <Field
                label="Requisition"
                value={
                  candidate.requisitions
                    ? `${candidate.requisitions.req_number} — ${candidate.requisitions.position_title}`
                    : candidate.requisition_id
                }
              />
              <Field
                label="Department"
                value={candidate.requisitions?.department}
              />
              <Field
                label="Vendor"
                value={candidate.vendors?.company_name || candidate.vendor_id}
              />
            </div>
          </section>

          {/* Profile */}
          <section>
            <div className="flex items-center gap-2 mb-3">
              <User size={12} className="text-[hsl(214,67%,32%)]" />
              <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider">
                Profile
              </span>
            </div>
            <div className="space-y-3">
              <Field
                label="Experience"
                value={
                  candidate.total_years_experience
                    ? `${candidate.total_years_experience} years`
                    : null
                }
              />
              <Field label="Education" value={candidate.education_level} />
              {candidate.top_skills?.length > 0 && (
                <div className="flex flex-col gap-1.5">
                  <span className="text-[10px] font-semibold text-slate-400 uppercase tracking-wider">
                    Top Skills
                  </span>
                  <div className="flex flex-wrap gap-1.5">
                    {candidate.top_skills.map((skill: string) => (
                      <span
                        key={skill}
                        className="px-2 py-0.5 rounded-full bg-[hsl(214,67%,32%)]/10 text-[hsl(214,67%,32%)] text-xs font-semibold"
                      >
                        {skill}
                      </span>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </section>

          {/* Commercial */}
          <section>
            <div className="flex items-center gap-2 mb-3">
              <DollarSign size={12} className="text-[hsl(214,67%,32%)]" />
              <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider">
                Commercial
              </span>
            </div>
            <div className="space-y-3">
              <Field
                label="Financial Quote (AED)"
                value={
                  candidate.financial_quote_aed
                    ? Number(candidate.financial_quote_aed).toLocaleString(
                        "en-AE",
                        { minimumFractionDigits: 2 },
                      )
                    : null
                }
                mono
              />
              {candidate.priority_ranking && (
                <div className="flex flex-col gap-1">
                  <span className="text-[10px] font-semibold text-slate-400 uppercase tracking-wider">
                    Priority
                  </span>
                  <span
                    className={`inline-flex w-fit items-center px-2.5 py-1 rounded-full text-xs font-semibold ${priorityColors[candidate.priority_ranking] || ""}`}
                  >
                    {candidate.priority_ranking}
                  </span>
                </div>
              )}
            </div>
          </section>

          {/* Meta */}
          <section>
            <div className="flex items-center gap-2 mb-3">
              <Clock size={12} className="text-[hsl(214,67%,32%)]" />
              <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider">
                Metadata
              </span>
            </div>
            <Field
              label="Submitted At"
              value={
                candidate.created_at
                  ? new Date(candidate.created_at).toLocaleString("en-AE")
                  : null
              }
            />
          </section>
        </div>

        {/* Footer */}
        <div className="px-6 py-4 border-t border-slate-100 bg-slate-50/50">
          <Button onClick={onEdit} className="w-full" size="sm">
            <Edit3 size={13} /> Edit Candidate
          </Button>
        </div>
      </div>
    </div>
  );
}
