"use client";

import * as React from "react";
import {
  VendorDocument,
  VendorDocumentFile,
} from "@/src/types/vendor-documents";
import { AttachmentList } from "@/components/oms/clarification/AttachmentList";
import { ClarificationAttachment } from "@/types/clarification";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  ShieldAlert,
  ShieldCheck,
  FileText,
  Clock,
  RefreshCw,
  Upload,
  Calendar,
  AlertTriangle,
  Info,
} from "lucide-react";
import { cn } from "@/lib/utils";

interface DocumentUploadModalProps {
  isOpen: boolean;
  onClose: () => void;
  document: VendorDocument | null;
  onUploadSuccess: (
    documentCode: string,
    updatedFile: VendorDocumentFile,
    expiresOn?: string
  ) => void;
  onUploadError?: (documentCode: string, error: { message: string; code?: string }) => void;
}

/**
 * Format bytes to readable string
 */
function formatBytes(bytes: number): string {
  if (!bytes || bytes === 0) return "0 KB";
  if (bytes < 1024 * 1024) {
    return `${(bytes / 1024).toFixed(1)} KB`;
  }
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
}

/**
 * Document Upload & Replace Modal per VENDOR-DOCUMENTS-UI.md §1.13 & §4.2.
 * - Reuses the AttachmentList pattern and component from CLARIFICATION-RESPONSE-UI.md.
 * - Stated file types (PDF, DOCX, XLSX, PNG, JPG) and 10MB size limit BEFORE upload.
 * - Scanning-pending state simulating server-side malware scanning.
 * - CRITICAL: In Replace flow, previous file is retained until new upload clears scan (§1.13).
 */
export interface DocumentUploadModalContentProps {
  document: VendorDocument;
  onClose: () => void;
  onUploadSuccess: (
    documentCode: string,
    updatedFile: VendorDocumentFile,
    expiresOn?: string
  ) => void;
  onUploadError?: (documentCode: string, error: { message: string; code?: string }) => void;
}

/**
 * Inner content component for Document Upload & Replace.
 * Useful for direct unit testing and embeddable contexts.
 */
export function DocumentUploadModalContent({
  document: doc,
  onClose,
  onUploadSuccess,
  onUploadError,
}: DocumentUploadModalContentProps) {
  const [selectedFile, setSelectedFile] = React.useState<File | null>(null);
  const [expiresOn, setExpiresOn] = React.useState<string>(doc.expiresOn || "");
  const [isScanning, setIsScanning] = React.useState<boolean>(false);
  const [scanResult, setScanResult] = React.useState<"CLEAN" | "FAILED" | null>(
    null
  );
  const [errorMessage, setErrorMessage] = React.useState<string | null>(null);
  const fileInputRef = React.useRef<HTMLInputElement>(null);

  // Reset state when document changes
  React.useEffect(() => {
    if (doc) {
      setSelectedFile(null);
      setExpiresOn(doc.expiresOn || "");
      setIsScanning(false);
      setScanResult(null);
      setErrorMessage(null);
    }
  }, [doc]);

  const isReplaceFlow = Boolean(doc.file);

  const handleFileSelect = (file: File) => {
    setSelectedFile(file);
    setScanResult(null);
    setErrorMessage(null);
  };

  const handleUploadAndScan = async () => {
    if (!selectedFile) return;

    setIsScanning(true);
    setErrorMessage(null);

    // Simulate server-side virus/malware inspection and file verification
    await new Promise((resolve) => setTimeout(resolve, 800));

    const isMalicious =
      selectedFile.name.toLowerCase().includes("eicar") ||
      selectedFile.name.toLowerCase().includes("corrupt") ||
      selectedFile.name.toLowerCase().includes("infected");

    if (isMalicious) {
      setIsScanning(false);
      setScanResult("FAILED");
      const errText = `Malware threat detected in "${selectedFile.name}". File has been quarantined and rejected.`;
      setErrorMessage(errText);
      onUploadError?.(doc.code, {
        code: "SCAN_FAILED",
        message: errText,
      });
      // NOTICE: Previous file is NOT discarded! It is retained.
      return;
    }

    setIsScanning(false);
    setScanResult("CLEAN");

    const newFileMeta: VendorDocumentFile = {
      id: `file-${Date.now()}`,
      name: selectedFile.name,
      sizeBytes: selectedFile.size,
      mimeType: selectedFile.type || "application/pdf",
      uploadedAt: new Date().toISOString(),
      downloadUrl: `/mock-files/${selectedFile.name}`,
    };

    onUploadSuccess(doc.code, newFileMeta, expiresOn || undefined);
    onClose();
  };

  // Build attachment array for AttachmentList preview
  const attachmentsPreview: ClarificationAttachment[] = selectedFile
    ? [
        {
          id: "temp-upload-1",
          name: selectedFile.name,
          sizeBytes: selectedFile.size,
          scanStatus: isScanning
            ? "PENDING"
            : scanResult === "FAILED"
            ? "FAILED"
            : "VERIFIED",
        },
      ]
    : [];

  return (
    <>
      <DialogHeader className="space-y-1">
        <DialogTitle className="text-base sm:text-lg font-semibold text-foreground flex items-center gap-2">
          {isReplaceFlow ? (
            <>
              <RefreshCw className="size-4 text-teal-600 dark:text-teal-400" />
              <span>{`Replace ${doc.label}`}</span>
            </>
          ) : (
            <>
              <Upload className="size-4 text-teal-600 dark:text-teal-400" />
              <span>{`Upload ${doc.label}`}</span>
            </>
          )}
        </DialogTitle>
        <DialogDescription className="text-xs text-muted-foreground">
          {isReplaceFlow
            ? "Upload an updated scan. The previous file will be retained if scanning fails."
            : "Upload an official document scan for DIEZ compliance verification."}
        </DialogDescription>
      </DialogHeader>

      <div className="space-y-4 py-2 text-xs">
        {/* Previous File Retention Card (Replace Flow §1.13) */}
        {isReplaceFlow && doc.file && (
          <div className="p-3 rounded-lg bg-muted/40 border border-border/70 space-y-1.5">
            <div className="flex items-center justify-between text-muted-foreground text-[11px]">
              <span className="uppercase font-semibold">Currently Active File</span>
              <span>Retained until scan clears</span>
            </div>
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2 min-w-0">
                <FileText className="size-4 text-teal-600 dark:text-teal-400 shrink-0" />
                <span className="font-semibold text-foreground truncate select-all">
                  {doc.file.name}
                </span>
                <span className="text-muted-foreground tabular-nums">
                  ({formatBytes(doc.file.sizeBytes)})
                </span>
              </div>
              <span className="text-[10px] px-1.5 py-0.2 rounded-full bg-emerald-500/10 text-emerald-700 dark:text-emerald-300 font-medium">
                Active
              </span>
            </div>
          </div>
        )}

        {/* Stated Limits BEFORE Upload per §1.13 & §4.2 */}
        <div className="p-2.5 rounded-md bg-muted/20 border border-border/50 text-muted-foreground space-y-1">
          <p className="text-[11px] leading-relaxed">
            <strong>Accepted file types:</strong> PDF, DOCX, XLSX, PNG, JPG. Max file size: <strong>10 MB</strong>.
          </p>
          <p className="text-[10px] text-muted-foreground/80 flex items-center gap-1">
            <ShieldCheck className="size-3 text-teal-600 dark:text-teal-400" />
            All files are automatically verified by server-side malware scanning before acceptance.
          </p>
        </div>

        {/* Drag & Drop Upload Zone reusing AttachmentList dropzone pattern */}
        {!selectedFile ? (
          <div
            onDragOver={(e) => e.preventDefault()}
            onDrop={(e) => {
              e.preventDefault();
              if (e.dataTransfer.files && e.dataTransfer.files[0]) {
                handleFileSelect(e.dataTransfer.files[0]);
              }
            }}
            onClick={() => fileInputRef.current?.click()}
            className="p-6 rounded-xl border-2 border-dashed border-border hover:border-primary/50 hover:bg-muted/20 bg-muted/10 transition-all flex flex-col items-center justify-center gap-2.5 cursor-pointer text-center"
          >
            <input
              ref={fileInputRef}
              type="file"
              accept=".pdf,.docx,.xlsx,.png,.jpg,.jpeg"
              onChange={(e) => {
                if (e.target.files && e.target.files[0]) {
                  handleFileSelect(e.target.files[0]);
                }
              }}
              className="hidden"
            />
            <div className="size-10 rounded-full bg-primary/10 text-primary flex items-center justify-center">
              <Upload className="size-5" />
            </div>
            <div className="space-y-0.5">
              <p className="text-xs sm:text-sm font-semibold text-foreground">
                <span className="text-primary hover:underline">Click to browse file</span> or drag and drop here
              </p>
              <p className="text-[11px] text-muted-foreground">
                Official high-resolution scan or digital document
              </p>
            </div>
          </div>
        ) : (
          /* Selected File Preview with AttachmentList scanning states */
          <div className="space-y-3">
            <AttachmentList
              attachments={attachmentsPreview}
              editable={!isScanning}
              onRemoveAttachment={() => {
                setSelectedFile(null);
                setScanResult(null);
                setErrorMessage(null);
              }}
              scanningStates={true}
              showDropzone={false}
              title="Staged Document"
            />

            {/* Scanning Pending Indicator */}
            {isScanning && (
              <div className="p-3 rounded-lg bg-sky-500/10 border border-sky-500/20 text-sky-800 dark:text-sky-300 flex items-center gap-2.5">
                <Clock className="size-4 animate-spin text-sky-600 dark:text-sky-400 shrink-0" />
                <div>
                  <p className="font-semibold text-xs leading-tight">
                    Scanning for security threats...
                  </p>
                  <p className="text-[11px] text-sky-700/80 dark:text-sky-300/80 leading-tight mt-0.5">
                    Checking file signature and malware hashes before ingestion
                  </p>
                </div>
              </div>
            )}

            {/* Scan Failed Banner */}
            {scanResult === "FAILED" && (
              <div className="p-3 rounded-lg bg-destructive/10 border border-destructive/30 text-destructive space-y-1">
                <div className="flex items-center gap-1.5 font-semibold text-xs">
                  <ShieldAlert className="size-4 shrink-0" />
                  <span>Malware Scan Failed — Quarantined</span>
                </div>
                <p className="text-[11px] text-destructive/90 leading-normal pl-5.5">
                  {errorMessage}
                </p>
                {isReplaceFlow && (
                  <p className="text-[10px] text-muted-foreground/80 pl-5.5 pt-0.5 italic">
                    ✓ Previous file "{doc.file?.name}" remains active and undamaged.
                  </p>
                )}
              </div>
            )}
          </div>
        )}

        {/* Expiry Date Input (for documents requiring expiry like Passport, EID, Police Clearance) */}
        <div className="space-y-1.5 pt-1">
          <Label htmlFor="doc-expires-on" className="text-xs flex items-center gap-1.5">
            <Calendar className="size-3.5 text-muted-foreground" />
            Document Expiry Date (if applicable)
          </Label>
          <Input
            id="doc-expires-on"
            type="date"
            value={expiresOn}
            onChange={(e) => setExpiresOn(e.target.value)}
            className="text-xs h-8.5"
          />
        </div>
      </div>

      <DialogFooter className="flex items-center justify-between sm:justify-end gap-2 pt-2 border-t border-border/40">
        <Button
          type="button"
          variant="ghost"
          size="sm"
          onClick={onClose}
          disabled={isScanning}
          className="text-xs"
        >
          Cancel
        </Button>

        <Button
          type="button"
          variant="default"
          size="sm"
          onClick={handleUploadAndScan}
          disabled={!selectedFile || isScanning}
          className="text-xs font-semibold bg-teal-600 hover:bg-teal-700 text-white"
        >
          {isScanning ? (
            <>
              <Clock className="size-3.5 mr-1.5 animate-spin" />
              Scanning...
            </>
          ) : isReplaceFlow ? (
            <>
              <RefreshCw className="size-3.5 mr-1.5" />
              Upload & Replace
            </>
          ) : (
            <>
              <Upload className="size-3.5 mr-1.5" />
              Upload & Verify
            </>
          )}
        </Button>
      </DialogFooter>
    </>
  );
}

/**
 * Document Upload & Replace Modal per VENDOR-DOCUMENTS-UI.md §1.13 & §4.2.
 */
export function DocumentUploadModal({
  isOpen,
  onClose,
  document: doc,
  onUploadSuccess,
  onUploadError,
}: DocumentUploadModalProps) {
  if (!doc) return null;

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="sm:max-w-lg bg-card border-border shadow-xl">
        <DocumentUploadModalContent
          document={doc}
          onClose={onClose}
          onUploadSuccess={onUploadSuccess}
          onUploadError={onUploadError}
        />
      </DialogContent>
    </Dialog>
  );
}
