"use client";

import React, { useState, useEffect } from "react";
import { createPortal } from "react-dom";
import {
  X,
  User,
  Briefcase,
  GraduationCap,
  DollarSign,
  Building2,
  FileText,
  Plus,
  Trash2,
  Loader2,
  Star,
} from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { candidateService } from "@/lib/services/candidateService";

interface CandidateFormData {
  requisition_id: string;
  vendor_id: string;
  alias: string;
  total_years_experience: string;
  top_skills: string[];
  education_level: string;
  financial_quote_aed: string;
  priority_ranking: string;
  status: string;
  cv_path: string;
}

const emptyForm: CandidateFormData = {
  requisition_id: "",
  vendor_id: "",
  alias: "",
  total_years_experience: "",
  top_skills: [],
  education_level: "",
  financial_quote_aed: "",
  priority_ranking: "",
  status: "SUBMITTED",
  cv_path: "",
};

const EDUCATION_OPTIONS = [
  "High School",
  "Diploma",
  "Bachelor's Degree",
  "Master's Degree",
  "PhD / Doctorate",
  "Professional Certification",
  "Other",
];

const STATUS_OPTIONS = [
  "SUBMITTED",
  "UNDER_REVIEW",
  "SHORTLISTED",
  "INTERVIEW_SCHEDULED",
  "SELECTED",
  "REJECTED",
  "WITHDRAWN",
];

const PRIORITY_OPTIONS = ["P1", "P2", "P3"];

interface CandidateModalProps {
  mode: "create" | "edit";
  candidate?: any;
  onClose: () => void;
  onSuccess: () => void;
  preselectedRequisitionId?: string;
}

export default function CandidateModal({
  mode,
  candidate,
  onClose,
  onSuccess,
  preselectedRequisitionId,
}: CandidateModalProps) {
  const [form, setForm] = useState<CandidateFormData>(emptyForm);
  const [saving, setSaving] = useState(false);
  const [vendors, setVendors] = useState<any[]>([]);
  const [requisitions, setRequisitions] = useState<any[]>([]);
  const [loadingOptions, setLoadingOptions] = useState(true);
  const [skillInput, setSkillInput] = useState("");
  const [cvFile, setCvFile] = useState<File | null>(null);

  useEffect(() => {
    loadOptions();
  }, []);

  useEffect(() => {
    if (preselectedRequisitionId) {
      setForm(prev => ({ ...prev, requisition_id: preselectedRequisitionId }));
    }
  }, [preselectedRequisitionId]);

  useEffect(() => {
    if (mode === "edit" && candidate) {
      setForm({
        requisition_id: candidate.requisition_id || "",
        vendor_id: candidate.vendor_id || "",
        alias: candidate.alias || "",
        total_years_experience:
          candidate.total_years_experience?.toString() || "",
        top_skills: candidate.top_skills || [],
        education_level: candidate.education_level || "",
        financial_quote_aed: candidate.financial_quote_aed?.toString() || "",
        priority_ranking: candidate.priority_ranking || "",
        status: candidate.status || "SUBMITTED",
        cv_path: candidate.cv_path || "",
      });
    }
  }, [mode, candidate]);

  const loadOptions = async () => {
    try {
      const [v, r] = await Promise.all([
        candidateService.getVendorOptions(),
        candidateService.getRequisitionOptions(),
      ]);
      setVendors(v || []);
      setRequisitions(r || []);
    } catch {
      toast.error("Failed to load dropdown options");
    } finally {
      setLoadingOptions(false);
    }
  };

  const handleChange = (field: keyof CandidateFormData, value: string) => {
    setForm((prev) => ({ ...prev, [field]: value }));
  };

  const addSkill = () => {
    const trimmed = skillInput.trim();
    if (!trimmed) return;
    if (form.top_skills.includes(trimmed)) return;
    setForm((prev) => ({ ...prev, top_skills: [...prev.top_skills, trimmed] }));
    setSkillInput("");
  };

  const removeSkill = (skill: string) => {
    setForm((prev) => ({
      ...prev,
      top_skills: prev.top_skills.filter((s) => s !== skill),
    }));
  };

  const handleSkillKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter") {
      e.preventDefault();
      addSkill();
    }
  };

  const handleSubmit = async () => {
    if (!form.requisition_id) {
      toast.error("Please select a requisition");
      return;
    }
    if (!form.vendor_id) {
      toast.error("Please select a vendor");
      return;
    }
    if (!form.alias.trim()) {
      toast.error("Candidate alias is required");
      return;
    }
    if (!form.financial_quote_aed) {
      toast.error("Financial quote is required");
      return;
    }

    setSaving(true);
    try {
      const payload = {
        requisition_id: form.requisition_id,
        vendor_id: form.vendor_id,
        alias: form.alias.trim(),
        total_years_experience: form.total_years_experience
          ? parseFloat(form.total_years_experience)
          : null,
        top_skills: form.top_skills.length > 0 ? form.top_skills : null,
        education_level: form.education_level || null,
        financial_quote_aed: parseFloat(form.financial_quote_aed),
        priority_ranking: form.priority_ranking || null,
        status: form.status,
        cv_path: form.cv_path,
      };

      if (cvFile) {
        toast.loading("Uploading CV...", { id: "cv-upload" });
        // Use requisitionService directly or we can add it to candidateService
        const { requisitionService } = await import("@/lib/services/requisitionService");
        const url = await requisitionService._uploadFile(cvFile, "candidate-cvs");
        payload.cv_path = url || "";
        toast.dismiss("cv-upload");
      }

      if (mode === "create") {
        await candidateService.createCandidate(payload);
        toast.success("Candidate added successfully");
      } else {
        await candidateService.updateCandidate(candidate.id, payload);
        toast.success("Candidate updated successfully");
      }
      onSuccess();
      onClose();
    } catch (err: any) {
      toast.error(err?.message || "Failed to save candidate");
    } finally {
      setSaving(false);
    }
  };

  const statusColors: Record<string, string> = {
    SUBMITTED: "bg-blue-50 text-blue-700",
    UNDER_REVIEW: "bg-amber-50 text-amber-700",
    SHORTLISTED: "bg-violet-50 text-violet-700",
    INTERVIEW_SCHEDULED: "bg-cyan-50 text-cyan-700",
    SELECTED: "bg-green-50 text-green-700",
    REJECTED: "bg-red-50 text-red-700",
    WITHDRAWN: "bg-slate-100 text-slate-500",
  };

  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted) return null;

  return createPortal(
    <div className="fixed inset-0 z-[9999] flex items-center justify-center">
      <div
        className="absolute inset-0 bg-black/40 backdrop-blur-sm"
        onClick={onClose}
      />
      <div className="relative bg-white rounded-2xl shadow-2xl w-full max-w-2xl mx-4 max-h-[92vh] flex flex-col animate-in fade-in zoom-in-95 duration-200">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-100">
          <div>
            <h2 className="text-lg font-bold text-slate-900">
              {mode === "create" ? "Add New Candidate" : "Edit Candidate"}
            </h2>
            <p className="text-xs text-slate-400 mt-0.5">
              {mode === "create"
                ? "Submit a candidate for a requisition"
                : `Editing: ${candidate?.alias}`}
            </p>
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

        {/* Body */}
        <div className="overflow-y-auto flex-1 px-6 py-5 space-y-6">
          {/* Requisition + Vendor */}
          <section>
            <div className="flex items-center gap-2 mb-3">
              <FileText size={13} className="text-[hsl(214,67%,32%)]" />
              <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider">
                Assignment
              </span>
            </div>
            <div className="grid grid-cols-1 gap-3">
              {/* Requisition dropdown */}
              <div>
                <label className="block text-xs font-medium text-slate-600 mb-1">
                  Requisition (Position) <span className="text-red-500">*</span>
                </label>
                {loadingOptions ? (
                  <div className="h-9 bg-slate-100 rounded-md animate-pulse" />
                ) : (
                  <select
                    value={form.requisition_id}
                    onChange={(e) =>
                      handleChange("requisition_id", e.target.value)
                    }
                    className="w-full h-9 px-3 text-sm border border-slate-200 rounded-md bg-white text-slate-800 focus:outline-none focus:ring-2 focus:ring-[hsl(214,67%,32%)]/30 focus:border-[hsl(214,67%,32%)]"
                  >
                    <option value="">Select a requisition…</option>
                    {requisitions.map((r) => (
                      <option key={r.id} value={r.id}>
                        {r.req_number} — {r.position_title} ({r.department})
                      </option>
                    ))}
                  </select>
                )}
              </div>

              {/* Vendor dropdown */}
              <div>
                <label className="block text-xs font-medium text-slate-600 mb-1">
                  Submitting Vendor <span className="text-red-500">*</span>
                </label>
                {loadingOptions ? (
                  <div className="h-9 bg-slate-100 rounded-md animate-pulse" />
                ) : (
                  <select
                    value={form.vendor_id}
                    onChange={(e) => handleChange("vendor_id", e.target.value)}
                    className="w-full h-9 px-3 text-sm border border-slate-200 rounded-md bg-white text-slate-800 focus:outline-none focus:ring-2 focus:ring-[hsl(214,67%,32%)]/30 focus:border-[hsl(214,67%,32%)]"
                  >
                    <option value="">Select a vendor…</option>
                    {vendors.map((v) => (
                      <option key={v.id} value={v.id}>
                        {v.company_name}
                      </option>
                    ))}
                  </select>
                )}
              </div>
            </div>
          </section>

          {/* Candidate Identity */}
          <section>
            <div className="flex items-center gap-2 mb-3">
              <User size={13} className="text-[hsl(214,67%,32%)]" />
              <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider">
                Candidate Identity
              </span>
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div className="col-span-2">
                <label className="block text-xs font-medium text-slate-600 mb-1">
                  Candidate Name <span className="text-red-500">*</span>
                </label>
                <Input
                  value={form.alias}
                  onChange={(e) => handleChange("alias", e.target.value)}
                  placeholder="e.g. Candidate-Alpha-01"
                  className="h-9 text-sm"
                />
                <p className="text-[10px] text-slate-400 mt-1">
                  Used for blind selection — do not include real name
                </p>
              </div>
              <div>
                <label className="block text-xs font-medium text-slate-600 mb-1">
                  Years of Experience
                </label>
                <Input
                  type="number"
                  min="0"
                  max="50"
                  step="0.5"
                  value={form.total_years_experience}
                  onChange={(e) =>
                    handleChange("total_years_experience", e.target.value)
                  }
                  placeholder="e.g. 7.5"
                  className="h-9 text-sm"
                />
              </div>
              <div>
                <label className="block text-xs font-medium text-slate-600 mb-1">
                  Education Level
                </label>
                <select
                  value={form.education_level}
                  onChange={(e) =>
                    handleChange("education_level", e.target.value)
                  }
                  className="w-full h-9 px-3 text-sm border border-slate-200 rounded-md bg-white text-slate-800 focus:outline-none focus:ring-2 focus:ring-[hsl(214,67%,32%)]/30 focus:border-[hsl(214,67%,32%)]"
                >
                  <option value="">Select level…</option>
                  {EDUCATION_OPTIONS.map((opt) => (
                    <option key={opt} value={opt}>
                      {opt}
                    </option>
                  ))}
                </select>
              </div>
            </div>
          </section>

          {/* Skills */}
          <section>
            <div className="flex items-center gap-2 mb-3">
              <Briefcase size={13} className="text-[hsl(214,67%,32%)]" />
              <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider">
                Top Skills
              </span>
            </div>
            <div className="flex gap-2 mb-2">
              <Input
                value={skillInput}
                onChange={(e) => setSkillInput(e.target.value)}
                onKeyDown={handleSkillKeyDown}
                placeholder="Type a skill and press Enter or Add"
                className="h-9 text-sm flex-1"
              />
              <Button
                type="button"
                variant="secondary"
                size="sm"
                onClick={addSkill}
                className="shrink-0"
              >
                <Plus size={13} /> Add
              </Button>
            </div>
            {form.top_skills.length > 0 && (
              <div className="flex flex-wrap gap-1.5 mt-2">
                {form.top_skills.map((skill) => (
                  <span
                    key={skill}
                    className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full bg-[hsl(214,67%,32%)]/10 text-[hsl(214,67%,32%)] text-xs font-semibold"
                  >
                    {skill}
                    <button
                      onClick={() => removeSkill(skill)}
                      className="hover:text-red-500 transition-colors"
                    >
                      <X size={10} />
                    </button>
                  </span>
                ))}
              </div>
            )}
          </section>

          {/* Financial + Ranking */}
          <section>
            <div className="flex items-center gap-2 mb-3">
              <Briefcase size={13} className="text-[hsl(214,67%,32%)]" />
              <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider">
                Financial
              </span>
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-medium text-slate-600 mb-1">
                  Financial Quote (AED) <span className="text-red-500">*</span>
                </label>
                <Input
                  type="number"
                  min="0"
                  step="0.01"
                  value={form.financial_quote_aed}
                  onChange={(e) =>
                    handleChange("financial_quote_aed", e.target.value)
                  }
                  placeholder="e.g. 25000.00"
                  className="h-9 text-sm font-mono"
                />
              </div>

              <div className="col-span-2">
                <label className="block text-xs font-medium text-slate-600 mb-1">
                  CV Attachment (Optional)
                </label>
                <div className="flex items-center gap-3 p-3 bg-slate-50 border border-dashed border-slate-200 rounded-lg">
                  <Input
                    type="file"
                    className="hidden"
                    id="cv-upload-input"
                    accept=".pdf,.doc,.docx"
                    onChange={(e) => setCvFile(e.target.files?.[0] || null)}
                  />
                  <label
                    htmlFor="cv-upload-input"
                    className="flex items-center gap-2 px-3 py-1.5 bg-white border border-slate-200 rounded text-xs font-semibold text-slate-600 hover:border-[hsl(214,67%,32%)] cursor-pointer transition-all"
                  >
                    <FileText size={14} className="text-slate-400" />
                    {cvFile ? cvFile.name : "Choose File"}
                  </label>
                  {cvFile && (
                    <span className="text-[10px] text-slate-400 italic truncate max-w-[200px]">
                      Ready for upload
                    </span>
                  )}
                  {form.cv_path && !cvFile && (
                    <a href={form.cv_path} target="_blank" rel="noopener noreferrer" className="text-[10px] text-[hsl(214,67%,32%)] font-bold hover:underline">
                      View Existing CV
                    </a>
                  )}
                </div>
              </div>
            </div>
          </section>
        </div>

        {/* Footer */}
        <div className="flex items-center justify-end gap-2 px-6 py-4 border-t border-slate-100 bg-slate-50/50 rounded-b-2xl">
          <Button variant="ghost" onClick={onClose} disabled={saving}>
            Cancel
          </Button>
          <Button
            onClick={handleSubmit}
            disabled={saving || loadingOptions}
            size="sm"
            className="min-w-[120px]"
          >
            {saving ? (
              <>
                <Loader2 size={13} className="animate-spin" /> Saving…
              </>
            ) : mode === "create" ? (
              "Add Candidate"
            ) : (
              "Save Changes"
            )}
          </Button>
        </div>
      </div>
    </div>,
    document.body
  );
}
