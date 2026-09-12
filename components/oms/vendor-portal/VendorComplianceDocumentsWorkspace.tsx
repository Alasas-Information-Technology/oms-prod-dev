"use client";

import * as React from "react";
import Link from "next/link";
import {
  ShieldCheck,
  FileText,
  AlertTriangle,
  Clock,
  CheckCircle2,
  Download,
  Upload,
  Calendar,
  Building2,
  ExternalLink,
  RefreshCw,
  Eye,
  FileCheck,
  X,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card } from "@/components/ui/card";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { AttachmentList } from "@/components/oms/clarification/AttachmentList";
import { ClarificationAttachment } from "@/types/clarification";
import {
  getVendorComplianceDocuments,
  uploadOrReplaceVendorComplianceDocument,
} from "@/src/lib/demo-data";
import { VendorComplianceDocument } from "@/src/lib/demo-data/entities";
import { cn } from "@/lib/utils";

interface VendorComplianceDocumentsWorkspaceProps {
  vendorId?: string;
  className?: string;
}

function formatBytes(bytes: number): string {
  if (!bytes || bytes === 0) return "0 B";
  const k = 1024;
  const sizes = ["B", "KB", "MB", "GB"];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return `${parseFloat((bytes / Math.pow(k, i)).toFixed(1))} ${sizes[i]}`;
}

export function VendorComplianceDocumentsWorkspace({
  vendorId = "ven-falcon",
  className,
}: VendorComplianceDocumentsWorkspaceProps) {
  const [documents, setDocuments] = React.useState<VendorComplianceDocument[]>(() =>
    getVendorComplianceDocuments(vendorId)
  );
  const [selectedDoc, setSelectedDoc] = React.useState<VendorComplianceDocument | null>(null);
  const [isReplaceModalOpen, setIsReplaceModalOpen] = React.useState(false);
  const [replaceDocTarget, setReplaceDocTarget] = React.useState<VendorComplianceDocument | null>(
    null
  );
  const [modalAttachments, setModalAttachments] = React.useState<ClarificationAttachment[]>([]);
  const [toastMessage, setToastMessage] = React.useState<string | null>(null);

  const refreshDocs = () => {
    setDocuments([...getVendorComplianceDocuments(vendorId)]);
  };

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 4000);
  };

  // Metrics
  const expiringSoonDocs = React.useMemo(
    () =>
      documents.filter(
        (d) => d.status === "EXPIRING_SOON" || (d.daysRemaining <= 90 && d.daysRemaining >= 0)
      ),
    [documents]
  );
  const activeDocs = React.useMemo(
    () =>
      documents.filter(
        (d) => d.status === "ACTIVE" && !(d.daysRemaining <= 90 && d.daysRemaining >= 0)
      ),
    [documents]
  );

  const handleOpenReplace = (doc: VendorComplianceDocument) => {
    setReplaceDocTarget(doc);
    setModalAttachments([
      {
        id: doc.file.id,
        name: doc.file.name,
        sizeBytes: doc.file.sizeBytes,
        scanStatus: "VERIFIED",
      },
    ]);
    setIsReplaceModalOpen(true);
  };

  const handleConfirmReplace = () => {
    if (!replaceDocTarget || modalAttachments.length === 0) return;
    const newFile = modalAttachments[0];
    uploadOrReplaceVendorComplianceDocument(
      replaceDocTarget.id,
      {
        id: newFile.id,
        name: newFile.name,
        sizeBytes: newFile.sizeBytes,
      },
      vendorId
    );
    refreshDocs();
    setIsReplaceModalOpen(false);
    showToast(`Updated ${replaceDocTarget.title} with verified replacement file.`);
  };

  return (
    <div className={cn("space-y-6 max-w-7xl mx-auto pb-12", className)}>
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 border-b border-border/60 pb-5">
        <div className="space-y-1">
          <div className="flex items-center gap-2">
            <span className="text-[11px] font-bold tracking-wider uppercase text-muted-foreground">
              Statutory Compliance
            </span>
            <span className="text-muted-foreground/40 font-mono">/</span>
            <span className="text-[11px] font-mono font-medium text-teal-600 dark:text-teal-400">
              Corporate Records
            </span>
          </div>
          <h1 className="text-xl sm:text-2xl font-bold tracking-tight text-foreground flex items-center gap-2.5">
            <ShieldCheck className="w-6 h-6 text-teal-600 dark:text-teal-400 shrink-0" />
            Vendor Compliance Documents
          </h1>
          <p className="text-xs sm:text-sm text-muted-foreground max-w-3xl">
            Falcon Tech Resourcing's official corporate compliance repository: commercial trade
            licence, VAT tax registration, general liability insurance, and ISO certifications.
          </p>
        </div>

        <div className="flex items-center gap-2.5">
          <Link href="/vendor/profile">
            <Button
              variant="outline"
              size="sm"
              className="text-xs h-9 gap-1.5 border-border/70 hover:bg-muted/40"
            >
              <Building2 className="w-3.5 h-3.5" />
              Company Profile
            </Button>
          </Link>
          <Link href="/vendor/support">
            <Button
              size="sm"
              className="text-xs h-9 gap-1.5 bg-teal-600 hover:bg-teal-700 text-white shadow-sm"
            >
              Compliance Support
            </Button>
          </Link>
        </div>
      </div>

      {/* 90-Day Expiry Alert Notice (Consistent 90-day threshold with candidate documents) */}
      {expiringSoonDocs.length > 0 && (
        <div className="p-4 rounded-xl border border-amber-500/30 bg-gradient-to-r from-amber-500/10 via-amber-500/5 to-transparent text-xs text-foreground/90 backdrop-blur-sm flex flex-col sm:flex-row sm:items-center justify-between gap-3 shadow-xs">
          <div className="flex items-start gap-3">
            <div className="p-2 rounded-lg bg-amber-500/20 text-amber-700 dark:text-amber-300 shrink-0 mt-0.5 sm:mt-0">
              <AlertTriangle className="w-4 h-4" />
            </div>
            <div className="space-y-0.5">
              <p className="font-semibold text-foreground flex items-center gap-1.5">
                Statutory Compliance Expiry Alert
                <span className="text-[10px] px-1.5 py-0.2 rounded bg-amber-500/20 text-amber-700 dark:text-amber-300 font-mono">
                  90-Day Renewal Window
                </span>
              </p>
              <p className="text-muted-foreground text-[11px] leading-relaxed">
                {expiringSoonDocs[0].title} expires on{" "}
                <strong className="text-foreground">{expiringSoonDocs[0].expiresOn}</strong> (
                {expiringSoonDocs[0].daysRemaining} days remaining). Please upload the renewed
                certificate before expiry to ensure uninterrupted placement authorization under DIEZ
                procurement rules.
              </p>
            </div>
          </div>
          <Button
            size="sm"
            onClick={() => handleOpenReplace(expiringSoonDocs[0])}
            className="text-xs h-8 bg-amber-600 hover:bg-amber-700 text-white shrink-0 self-end sm:self-center"
          >
            Upload Renewal Copy
          </Button>
        </div>
      )}

      {/* KPI Metrics Strip */}
      <div className="grid grid-cols-1 sm:grid-cols-4 gap-3">
        <Card className="p-4 rounded-xl border border-border/70 dark:border-white/[0.08] bg-card flex items-center justify-between">
          <div className="space-y-1">
            <span className="text-[11px] font-medium text-muted-foreground">Total Documents</span>
            <p className="text-2xl font-bold font-mono text-foreground">{documents.length}</p>
          </div>
          <div className="p-2.5 rounded-lg bg-muted/60 text-muted-foreground">
            <FileText className="w-4 h-4" />
          </div>
        </Card>

        <Card className="p-4 rounded-xl border border-emerald-500/30 bg-emerald-500/5 dark:bg-emerald-500/10 flex items-center justify-between">
          <div className="space-y-1">
            <span className="text-[11px] font-medium text-emerald-700 dark:text-emerald-300">
              Active Compliant
            </span>
            <p className="text-2xl font-bold font-mono text-emerald-600 dark:text-emerald-400">
              {activeDocs.length}
            </p>
          </div>
          <div className="p-2.5 rounded-lg bg-emerald-500/20 text-emerald-600 dark:text-emerald-400">
            <CheckCircle2 className="w-4 h-4" />
          </div>
        </Card>

        <Card className="p-4 rounded-xl border border-amber-500/30 bg-amber-500/5 dark:bg-amber-500/10 flex items-center justify-between">
          <div className="space-y-1">
            <span className="text-[11px] font-medium text-amber-700 dark:text-amber-300">
              Expiring Soon (&le;90d)
            </span>
            <p className="text-2xl font-bold font-mono text-amber-600 dark:text-amber-400">
              {expiringSoonDocs.length}
            </p>
          </div>
          <div className="p-2.5 rounded-lg bg-amber-500/20 text-amber-600 dark:text-amber-400">
            <Clock className="w-4 h-4" />
          </div>
        </Card>

        <Card className="p-4 rounded-xl border border-border/70 dark:border-white/[0.08] bg-card flex items-center justify-between">
          <div className="space-y-1">
            <span className="text-[11px] font-medium text-muted-foreground">Audit Health</span>
            <p className="text-2xl font-bold font-mono text-foreground">98%</p>
          </div>
          <div className="p-2.5 rounded-lg bg-teal-500/10 text-teal-600 dark:text-teal-400">
            <ShieldCheck className="w-4 h-4" />
          </div>
        </Card>
      </div>

      {/* Compliance Documents Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {documents.map((doc) => {
          const isExpiringSoon =
            doc.status === "EXPIRING_SOON" || (doc.daysRemaining <= 90 && doc.daysRemaining >= 0);

          return (
            <Card
              key={doc.id}
              className={cn(
                "p-5 sm:p-6 rounded-xl border transition-all duration-200 bg-card space-y-4 flex flex-col justify-between",
                isExpiringSoon
                  ? "border-amber-500/40 bg-amber-500/[0.02]"
                  : "border-border/70 dark:border-white/[0.08] hover:border-teal-500/40"
              )}
            >
              <div className="space-y-3">
                {/* Top: Doc type badge and status */}
                <div className="flex items-center justify-between gap-2">
                  <span className="text-[11px] font-mono font-semibold px-2 py-0.5 rounded bg-muted/80 text-foreground border border-border/70">
                    {doc.licenceNumber}
                  </span>

                  {isExpiringSoon ? (
                    <span className="inline-flex items-center gap-1.5 text-[11px] font-semibold px-2.5 py-0.5 rounded-full bg-amber-500/15 text-amber-600 dark:text-amber-400 border border-amber-500/30">
                      <Clock className="w-3 h-3" />
                      Expires in {doc.daysRemaining} days · soon
                    </span>
                  ) : (
                    <span className="inline-flex items-center gap-1.5 text-[11px] font-medium px-2.5 py-0.5 rounded-full bg-emerald-500/15 text-emerald-600 dark:text-emerald-400 border border-emerald-500/30">
                      <CheckCircle2 className="w-3 h-3" />
                      Active
                    </span>
                  )}
                </div>

                {/* Title & Authority */}
                <div>
                  <h3 className="text-base font-bold text-foreground">{doc.title}</h3>
                  <p className="text-xs text-muted-foreground mt-0.5">
                    Issuing Authority: <strong className="text-foreground">{doc.issuingAuthority}</strong>
                  </p>
                </div>

                {/* Attached File Preview */}
                <div className="p-3 rounded-lg bg-muted/25 border border-border/50 space-y-1.5 text-xs">
                  <div className="flex items-center justify-between">
                    <span className="font-mono font-medium text-foreground flex items-center gap-1.5 truncate">
                      <FileText className="w-3.5 h-3.5 text-teal-600 dark:text-teal-400 shrink-0" />
                      {doc.file.name}
                    </span>
                    <span className="text-[11px] font-mono text-muted-foreground shrink-0 ml-2">
                      {formatBytes(doc.file.sizeBytes)}
                    </span>
                  </div>

                  <div className="flex items-center justify-between text-[11px] text-muted-foreground pt-1 border-t border-border/40">
                    <span className="flex items-center gap-1">
                      <Calendar className="w-3 h-3 text-muted-foreground/70" />
                      Validity: {doc.expiresOn}
                    </span>
                    <span className="text-emerald-600 dark:text-emerald-400 font-semibold flex items-center gap-1">
                      <CheckCircle2 className="w-3 h-3" />
                      Malware passed
                    </span>
                  </div>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="flex items-center justify-end gap-2 pt-3 border-t border-border/40 text-xs">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setSelectedDoc(doc)}
                  className="text-xs h-8 gap-1.5 border-border/70 hover:bg-muted/40"
                >
                  <Eye className="w-3.5 h-3.5" />
                  View Details
                </Button>
                <Button
                  size="sm"
                  onClick={() => handleOpenReplace(doc)}
                  className="text-xs h-8 gap-1.5 bg-teal-600 hover:bg-teal-700 text-white"
                >
                  <Upload className="w-3.5 h-3.5" />
                  Replace Certificate
                </Button>
              </div>
            </Card>
          );
        })}
      </div>

      {/* View Document Details Modal */}
      <Dialog open={!!selectedDoc} onOpenChange={(open) => !open && setSelectedDoc(null)}>
        <DialogContent className="max-w-lg">
          {selectedDoc && (
            <>
              <DialogHeader>
                <div className="flex items-center gap-2">
                  <span className="text-xs font-mono font-bold px-2 py-0.5 rounded bg-muted border">
                    {selectedDoc.licenceNumber}
                  </span>
                  <Badge variant="outline" className="text-xs border-teal-500/30 text-teal-600">
                    {selectedDoc.documentType}
                  </Badge>
                </div>
                <DialogTitle className="text-base font-bold text-foreground pt-1">
                  {selectedDoc.title}
                </DialogTitle>
                <DialogDescription className="text-xs text-muted-foreground">
                  Official statutory compliance record verified by DIEZ Procurement.
                </DialogDescription>
              </DialogHeader>

              <div className="space-y-3 py-2 text-xs">
                <div className="p-3.5 rounded-xl bg-muted/20 border border-border/60 space-y-2">
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Issuing Authority:</span>
                    <span className="font-semibold text-foreground">{selectedDoc.issuingAuthority}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Licence / Policy Ref:</span>
                    <span className="font-mono text-foreground">{selectedDoc.licenceNumber}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Expiry Date:</span>
                    <span className="font-mono text-foreground">{selectedDoc.expiresOn}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Remaining Validity:</span>
                    <span
                      className={cn(
                        "font-mono font-bold",
                        selectedDoc.daysRemaining <= 90
                          ? "text-amber-600 dark:text-amber-400"
                          : "text-emerald-600 dark:text-emerald-400"
                      )}
                    >
                      {selectedDoc.daysRemaining} days
                    </span>
                  </div>
                </div>

                <div className="p-3.5 rounded-xl bg-teal-500/5 border border-teal-500/20 space-y-1.5">
                  <span className="font-semibold text-foreground">File Repository Item</span>
                  <p className="font-mono text-muted-foreground">{selectedDoc.file.name}</p>
                  <p className="text-[11px] text-muted-foreground">
                    Size: {formatBytes(selectedDoc.file.sizeBytes)} · Stored on DIEZ sovereign cloud storage.
                  </p>
                </div>
              </div>

              <DialogFooter className="flex items-center justify-between gap-2 border-t border-border/50 pt-3">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setSelectedDoc(null)}
                  className="text-xs h-8"
                >
                  Close
                </Button>
                <Button
                  size="sm"
                  onClick={() => {
                    showToast("Downloaded document copy.");
                    setSelectedDoc(null);
                  }}
                  className="text-xs h-8 gap-1 bg-teal-600 hover:bg-teal-700 text-white"
                >
                  <Download className="w-3.5 h-3.5" />
                  Download File
                </Button>
              </DialogFooter>
            </>
          )}
        </DialogContent>
      </Dialog>

      {/* Replace Document Modal with AttachmentList */}
      <Dialog open={isReplaceModalOpen} onOpenChange={setIsReplaceModalOpen}>
        <DialogContent className="max-w-xl">
          {replaceDocTarget && (
            <>
              <DialogHeader>
                <DialogTitle className="text-base font-bold text-foreground flex items-center gap-2">
                  <Upload className="w-4 h-4 text-teal-600 dark:text-teal-400" />
                  Replace Compliance Certificate
                </DialogTitle>
                <DialogDescription className="text-xs text-muted-foreground">
                  Upload an updated certificate copy for {replaceDocTarget.title} (
                  {replaceDocTarget.licenceNumber}). Files undergo automatic server-side malware
                  scanning.
                </DialogDescription>
              </DialogHeader>

              <div className="py-3 text-xs space-y-3">
                <div className="p-3 rounded-lg bg-muted/20 border border-border/50 text-muted-foreground">
                  Replacing current file:{" "}
                  <strong className="text-foreground">{replaceDocTarget.file.name}</strong>
                </div>

                {/* Reuse AttachmentList with scanning states */}
                <AttachmentList
                  title="Compliance File Upload"
                  attachments={modalAttachments}
                  editable={true}
                  scanningStates={true}
                  showDropzone={true}
                  onAddAttachment={(att) => setModalAttachments([att])}
                  onRemoveAttachment={() => setModalAttachments([])}
                />
              </div>

              <DialogFooter className="flex items-center justify-between gap-2 border-t border-border/50 pt-3">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setIsReplaceModalOpen(false)}
                  className="text-xs h-8"
                >
                  Cancel
                </Button>
                <Button
                  size="sm"
                  disabled={modalAttachments.length === 0}
                  onClick={handleConfirmReplace}
                  className="text-xs h-8 gap-1.5 bg-teal-600 hover:bg-teal-700 text-white"
                >
                  <CheckCircle2 className="w-3.5 h-3.5" />
                  Confirm Replacement
                </Button>
              </DialogFooter>
            </>
          )}
        </DialogContent>
      </Dialog>

      {/* Toast */}
      {toastMessage && (
        <div className="fixed bottom-6 right-6 z-50 p-4 rounded-xl bg-card border border-teal-500/40 shadow-xl text-xs flex items-center gap-3 animate-in fade-in slide-in-from-bottom-2">
          <div className="p-2 rounded-lg bg-teal-500/20 text-teal-600 dark:text-teal-400">
            <FileCheck className="w-4 h-4" />
          </div>
          <div>
            <p className="font-bold text-foreground">Compliance Update</p>
            <p className="text-muted-foreground text-[11px]">{toastMessage}</p>
          </div>
          <button
            onClick={() => setToastMessage(null)}
            className="p-1 rounded-md hover:bg-muted text-muted-foreground ml-2"
          >
            <X className="w-3.5 h-3.5" />
          </button>
        </div>
      )}
    </div>
  );
}
