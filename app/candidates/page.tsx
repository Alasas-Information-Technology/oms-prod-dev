"use client";

import React, { useState } from "react";
import AppLayout from "@/components/AppLayout";
import { Plus, Download, RefreshCw, Users } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import CandidateTable from "./components/CandidateTable";
import CandidateModal from "./components/CandidateModal";

export default function CandidatesPage() {
  const [refreshKey, setRefreshKey] = useState(0);
  const [showNewModal, setShowNewModal] = useState(false);

  const handleRefresh = () => setRefreshKey((prev) => prev + 1);

  return (
    <AppLayout>
      <div className="max-w-screen-2xl mx-auto space-y-5">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <h1 className="text-2xl font-bold text-[#0C66E4] flex items-center gap-3">
              <Users size={24} className="text-[#0C66E4]" />
              Candidates
            </h1>
            <p className="text-slate-500 text-sm mt-0.5">
              Blind candidate pool · Vendor submissions across all requisitions
            </p>
          </div>
          <div className="flex items-center gap-2">
            <Button variant="ghost" size="sm" onClick={handleRefresh}>
              <RefreshCw size={14} /> Refresh
            </Button>
            <Button
              variant="secondary"
              size="sm"
              onClick={() => toast.info("Generating export…")}
            >
              <Download size={14} /> Export
            </Button>
            <Button size="sm" onClick={() => setShowNewModal(true)}>
              <Plus size={14} /> Add Candidate
            </Button>
          </div>
        </div>

        <CandidateTable refreshTrigger={refreshKey} />
      </div>

      {showNewModal && (
        <CandidateModal
          mode="create"
          onClose={() => setShowNewModal(false)}
          onSuccess={handleRefresh}
        />
      )}
    </AppLayout>
  );
}
