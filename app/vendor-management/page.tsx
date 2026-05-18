"use client";

import React, { useState } from "react";
import AppLayout from "@/components/AppLayout";
import { Plus, Download, RefreshCw, Building2 } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import VendorTable from "./components/VendorTable";
import VendorModal from "./components/VendorModal";

export default function VendorManagementPage() {
  const [refreshKey, setRefreshKey] = useState(0);
  const [showNewModal, setShowNewModal] = useState(false);

  const handleRefresh = () => setRefreshKey((prev) => prev + 1);

  return (
    <AppLayout>
      <div className=" mx-auto space-y-5">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <h1 className="text-2xl font-bold text-[#0C66E4] flex items-center gap-3">
              <Building2 size={24} className="text-[#0C66E4]" />
              Vendor Management
            </h1>
            <p className="text-slate-500 text-sm mt-0.5">
              Manage all registered vendors · CRUD operations
            </p>
          </div>
          <div className="flex items-center gap-2">
            <Button variant="ghost" size="sm" onClick={handleRefresh}>
              <RefreshCw size={14} /> Refresh
            </Button>
            <Button
              variant="secondary"
              size="sm"
              onClick={() => toast.info("Generating Excel export…")}
            >
              <Download size={14} /> Export
            </Button>
            <Button size="sm" onClick={() => setShowNewModal(true)}>
              <Plus size={14} /> New Vendor
            </Button>
          </div>
        </div>

        {/* Table */}
        <VendorTable refreshTrigger={refreshKey} />
      </div>

      {showNewModal && (
        <VendorModal
          mode="create"
          onClose={() => setShowNewModal(false)}
          onSuccess={handleRefresh}
        />
      )}
    </AppLayout>
  );
}
