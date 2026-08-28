"use client";

import * as React from "react";
import { Upload, FileSpreadsheet, Download, CheckCircle2, AlertCircle } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";

export interface UploadBudgetDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  periodCode?: string;
}

export function UploadBudgetDialog({
  open,
  onOpenChange,
  periodCode = "FY 2026",
}: UploadBudgetDialogProps) {
  const [isUploading, setIsUploading] = React.useState(false);
  const [selectedFile, setSelectedFile] = React.useState<File | null>(null);

  const handleUploadSubmit = () => {
    if (!selectedFile) {
      toast.error("Please select a budget baseline spreadsheet to upload.");
      return;
    }

    setIsUploading(true);
    setTimeout(() => {
      setIsUploading(false);
      onOpenChange(false);
      setSelectedFile(null);
      toast.success(`Baseline budget for ${periodCode} uploaded successfully!`);
    }, 800);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-lg rounded-2xl p-6">
        <DialogHeader className="space-y-2">
          <div className="size-10 rounded-xl bg-primary/10 text-primary flex items-center justify-center mb-1">
            <Upload className="size-5" />
          </div>
          <DialogTitle className="text-lg font-bold font-display">
            Upload Annual Budget Baseline — {periodCode}
          </DialogTitle>
          <DialogDescription className="text-xs text-muted-foreground leading-relaxed">
            Upload approved departmental budget allocations. Figures will be verified against the
            DIEZ chart of accounts and imported into the core financial ledger.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4 py-2">
          {/* File Dropzone */}
          <div
            onClick={() => {
              const dummyFile = new File(["mock-budget-content"], `DIEZ_Budget_${periodCode.replace(" ", "_")}_v1.xlsx`, {
                type: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
              });
              setSelectedFile(dummyFile);
            }}
            className="border-2 border-dashed border-border/80 hover:border-primary/50 bg-muted/20 hover:bg-muted/40 rounded-xl p-6 text-center cursor-pointer transition-all duration-150 space-y-2"
          >
            <FileSpreadsheet className="size-8 mx-auto text-muted-foreground" />
            <div className="space-y-1">
              <p className="text-xs font-semibold text-foreground">
                {selectedFile ? selectedFile.name : "Click to select or drop budget file here"}
              </p>
              <p className="text-[11px] text-muted-foreground">
                Supports .xlsx or .csv formatted with minor units (fils) integer values
              </p>
            </div>
          </div>

          {/* Template Download Link */}
          <div className="flex items-center justify-between p-3 rounded-xl bg-background/80 border border-border/60 text-xs">
            <div className="flex items-center gap-2">
              <Download className="size-4 text-primary" />
              <span className="text-muted-foreground font-medium">Official DIEZ Template</span>
            </div>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => toast.info("Downloading official Excel budget template...")}
              className="text-xs text-primary font-semibold h-7 px-2"
            >
              Download Template
            </Button>
          </div>
        </div>

        <DialogFooter className="gap-2 sm:gap-0">
          <Button
            variant="outline"
            size="sm"
            onClick={() => onOpenChange(false)}
            className="rounded-xl text-xs h-9"
          >
            Cancel
          </Button>
          <Button
            variant="default"
            size="sm"
            disabled={!selectedFile || isUploading}
            onClick={handleUploadSubmit}
            className="rounded-xl text-xs h-9 font-semibold"
          >
            {isUploading ? "Validating & Uploading..." : "Upload & Validate"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
