"use client";

import React, { useState } from "react";
import { AlertTriangle, Loader2 } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { candidateService } from "@/lib/services/candidateService";

interface DeleteCandidateDialogProps {
  candidate: any;
  onClose: () => void;
  onSuccess: () => void;
}

export default function DeleteCandidateDialog({
  candidate,
  onClose,
  onSuccess,
}: DeleteCandidateDialogProps) {
  const [deleting, setDeleting] = useState(false);

  const handleDelete = async () => {
    setDeleting(true);
    try {
      await candidateService.deleteCandidate(candidate.id);
      toast.success(`Candidate "${candidate.alias}" removed`);
      onSuccess();
      onClose();
    } catch (err: any) {
      toast.error(err?.message || "Failed to delete candidate");
    } finally {
      setDeleting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      <div
        className="absolute inset-0 bg-black/40 backdrop-blur-sm"
        onClick={onClose}
      />
      <div className="relative bg-white rounded-2xl shadow-2xl w-full max-w-sm mx-4 p-6 animate-in fade-in zoom-in-95 duration-200">
        <div className="flex flex-col items-center text-center gap-3">
          <div className="w-12 h-12 rounded-full bg-red-50 flex items-center justify-center">
            <AlertTriangle size={22} className="text-red-500" />
          </div>
          <div>
            <h3 className="text-base font-bold text-slate-900">
              Remove Candidate
            </h3>
            <p className="text-sm text-slate-500 mt-1">
              Are you sure you want to remove{" "}
              <span className="font-semibold text-slate-700">
                {candidate.alias}
              </span>
              ? This action cannot be undone.
            </p>
          </div>
        </div>
        <div className="flex gap-2 mt-5">
          <Button
            variant="ghost"
            onClick={onClose}
            disabled={deleting}
            className="flex-1"
          >
            Cancel
          </Button>
          <Button
            variant="destructive"
            onClick={handleDelete}
            disabled={deleting}
            className="flex-1"
          >
            {deleting ? (
              <>
                <Loader2 size={13} className="animate-spin" /> Deleting…
              </>
            ) : (
              "Yes, Remove"
            )}
          </Button>
        </div>
      </div>
    </div>
  );
}
