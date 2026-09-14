"use client";

import * as React from "react";
import Link from "next/link";
import {
  HelpCircle,
  Send,
  Paperclip,
  ShieldAlert,
  Clock,
  CheckCircle2,
  Building2,
  MessageSquare,
  FileText,
  AlertCircle,
  Sparkles,
  Info,
  Layers,
  FileCheck,
  X,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { AttachmentList } from "@/components/oms/clarification/AttachmentList";
import { ClarificationAttachment } from "@/types/clarification";
import {
  listVendorSupportMessages,
  sendVendorSupportMessage,
} from "@/src/lib/demo-data";
import { VendorSupportMessage } from "@/src/lib/demo-data/entities";
import { cn } from "@/lib/utils";

interface VendorSupportWorkspaceProps {
  vendorId?: string;
  className?: string;
}

type SupportCategory = "GENERAL_INQUIRY" | "TECHNICAL_ISSUE" | "CONTRACT_QUERY" | "BILLING";

export function VendorSupportWorkspace({
  vendorId = "ven-falcon",
  className,
}: VendorSupportWorkspaceProps) {
  const [messages, setMessages] = React.useState<VendorSupportMessage[]>(() =>
    listVendorSupportMessages(vendorId)
  );

  // Form State
  const [category, setCategory] = React.useState<SupportCategory>("GENERAL_INQUIRY");
  const [subject, setSubject] = React.useState("");
  const [body, setBody] = React.useState("");
  const [attachments, setAttachments] = React.useState<ClarificationAttachment[]>([]);
  const [isSending, setIsSending] = React.useState(false);
  const [formError, setFormError] = React.useState<string | null>(null);
  const [toastMessage, setToastMessage] = React.useState<string | null>(null);

  const messagesEndRef = React.useRef<HTMLDivElement | null>(null);

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 4000);
  };

  const handleSendMessage = (e: React.FormEvent) => {
    e.preventDefault();
    setFormError(null);

    if (!subject.trim()) {
      setFormError("Please provide an inquiry subject.");
      return;
    }
    if (!body.trim()) {
      setFormError("Message body is required.");
      return;
    }

    setIsSending(true);

    try {
      const supportAtts = attachments.map((att) => ({
        id: att.id,
        name: att.name,
        sizeBytes: att.sizeBytes,
      }));

      const newMsg = sendVendorSupportMessage({
        vendorId,
        senderName: "Layla Hassan",
        senderRole: "Vendor Coordinator",
        isVendor: true,
        subject: subject.trim(),
        body: body.trim(),
        category,
        attachments: supportAtts.length > 0 ? supportAtts : undefined,
      });

      setMessages([...listVendorSupportMessages(vendorId)]);
      setSubject("");
      setBody("");
      setAttachments([]);
      showToast("Your support message was dispatched to DIEZ Procurement Operations.");

      // Scroll to bottom
      setTimeout(() => {
        messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
      }, 100);
    } catch (err: any) {
      setFormError(err.message || "Failed to send message.");
    } finally {
      setIsSending(false);
    }
  };

  const formatCategoryLabel = (cat: SupportCategory): string => {
    switch (cat) {
      case "GENERAL_INQUIRY":
        return "General Operations";
      case "TECHNICAL_ISSUE":
        return "Technical / System Issue";
      case "CONTRACT_QUERY":
        return "Contract & Rate Query";
      case "BILLING":
        return "Invoicing & Billing";
      default:
        return cat;
    }
  };

  return (
    <div className={cn("space-y-6 max-w-7xl mx-auto pb-12", className)}>
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 border-b border-border/60 pb-5">
        <div className="space-y-1">
          <div className="flex items-center gap-2">
            <span className="text-[11px] font-bold tracking-wider uppercase text-muted-foreground">
              Operational Helpdesk
            </span>
            <span className="text-muted-foreground/40">/</span>
            <span className="text-[11px] font-medium text-teal-600 dark:text-teal-400">
              Procurement Desk
            </span>
          </div>
          <h1 className="text-xl sm:text-2xl font-bold tracking-tight text-foreground flex items-center gap-2.5">
            <HelpCircle className="w-6 h-6 text-teal-600 dark:text-teal-400 shrink-0" />
            Procurement Support Channel
          </h1>
          <p className="text-xs sm:text-sm text-muted-foreground max-w-3xl">
            Direct operational and administrative communication channel between Falcon Tech
            Resourcing and the DIEZ Procurement Division.
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
        </div>
      </div>

      {/* Prominent Blind-Review Boundary Callout (Mandatory requirement from 4.11) */}
      <div className="p-4 sm:p-5 rounded-xl border border-amber-500/30 bg-gradient-to-r from-amber-500/10 via-amber-500/5 to-transparent text-xs text-foreground/90 backdrop-blur-sm space-y-2">
        <div className="flex items-start gap-3">
          <div className="p-2 rounded-lg bg-amber-500/20 text-amber-700 dark:text-amber-300 shrink-0 mt-0.5">
            <ShieldAlert className="w-4 h-4" />
          </div>
          <div className="space-y-1">
            <p className="font-bold text-foreground flex items-center gap-1.5">
              General Operations Support Only — Strict Separation from Candidate Evaluation
              <span className="text-[10px] px-1.5 py-0.2 rounded bg-amber-500/20 text-amber-700 dark:text-amber-300">
                RFP Section 4.11
              </span>
            </p>
            <p className="text-muted-foreground text-[11px] leading-relaxed">
              This channel connects directly with the DIEZ Procurement Division for administrative,
              invoicing, contract addenda, and statutory compliance inquiries. In accordance with
              UAE government blind-review governance,{" "}
              <strong className="text-foreground font-semibold">
                this channel is NEVER used to discuss or inquire about a specific candidate's
                evaluation, scorecard, or selection outcome.
              </strong>{" "}
              Candidate reviews remain strictly privileged and blind.
            </p>
          </div>
        </div>
      </div>

      {/* Main Grid: Thread Stream (Left 60%) + Compose Box (Right 40%) */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-5 items-start">
        {/* Left 7 Cols: Message History Thread */}
        <div className="lg:col-span-7 space-y-4">
          <div className="flex items-center justify-between border-b border-border/40 pb-2">
            <h2 className="text-sm font-bold text-foreground flex items-center gap-2">
              <MessageSquare className="w-4 h-4 text-teal-600 dark:text-teal-400" />
              Communication Thread
            </h2>
            <span className="text-[11px] text-muted-foreground">
              {messages.length} Messages Recorded
            </span>
          </div>

          <div className="space-y-4">
            {messages.map((msg) => {
              const isVendor = msg.isVendor;

              return (
                <Card
                  key={msg.id}
                  className={cn(
                    "p-5 rounded-xl border transition-all duration-200 text-xs space-y-3 bg-card",
                    isVendor
                      ? "border-teal-500/30 bg-teal-500/[0.02]"
                      : "border-border/70 dark:border-white/[0.08]"
                  )}
                >
                  {/* Message Top Row */}
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-border/40 pb-2.5">
                    <div className="flex items-center gap-2">
                      <span className="font-bold text-foreground">{msg.senderName}</span>
                      <span
                        className={cn(
                          "text-[10px] px-2 py-0.5 rounded font-semibold border",
                          isVendor
                            ? "bg-teal-500/15 text-teal-700 dark:text-teal-300 border-teal-500/30"
                            : "bg-blue-500/15 text-blue-700 dark:text-blue-300 border-blue-500/30"
                        )}
                      >
                        {msg.senderRole}
                      </span>
                    </div>

                    <div className="flex items-center gap-2 text-[11px] text-muted-foreground">
                      <Badge variant="outline" className="text-[10px] border-border/60">
                        {formatCategoryLabel(msg.category)}
                      </Badge>
                      <span>{msg.sentAt.replace("T", " ").substring(0, 16)}</span>
                    </div>
                  </div>

                  {/* Subject & Body */}
                  <div className="space-y-1.5">
                    <h4 className="font-bold text-foreground text-sm">{msg.subject}</h4>
                    <p className="text-muted-foreground text-xs leading-relaxed whitespace-pre-line">
                      {msg.body}
                    </p>
                  </div>

                  {/* Attachments (if any) */}
                  {msg.attachments && msg.attachments.length > 0 && (
                    <div className="pt-2 border-t border-border/40 space-y-1.5">
                      <span className="text-[11px] font-medium text-muted-foreground flex items-center gap-1">
                        <Paperclip className="w-3 h-3 text-teal-600 dark:text-teal-400" />
                        Attached Files ({msg.attachments.length}):
                      </span>
                      <div className="flex flex-wrap gap-2">
                        {msg.attachments.map((att) => (
                          <div
                            key={att.id}
                            className="p-2 rounded-md bg-muted/40 border border-border/60 text-[11px] text-foreground flex items-center gap-1.5"
                          >
                            <FileText className="w-3 h-3 text-teal-600 dark:text-teal-400" />
                            <span>{att.name}</span>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </Card>
              );
            })}
            <div ref={messagesEndRef} />
          </div>
        </div>

        {/* Right 5 Cols: Compose New Message */}
        <Card className="lg:col-span-5 p-5 sm:p-6 rounded-xl border border-border/70 dark:border-white/[0.08] bg-card space-y-4 sticky top-6">
          <div className="border-b border-border/40 pb-3">
            <h3 className="text-base font-bold text-foreground flex items-center gap-2">
              <Send className="w-4 h-4 text-teal-600 dark:text-teal-400" />
              Compose Support Message
            </h3>
            <p className="text-xs text-muted-foreground mt-0.5">
              Dispatched directly to the DIEZ Procurement Operations queue.
            </p>
          </div>

          {formError && (
            <div className="p-3 rounded-lg bg-destructive/10 border border-destructive/30 text-xs text-destructive flex items-center gap-2">
              <AlertCircle className="w-4 h-4 shrink-0" />
              <span>{formError}</span>
            </div>
          )}

          <form onSubmit={handleSendMessage} className="space-y-3.5 text-xs">
            {/* Category Selector */}
            <div className="space-y-1.5">
              <Label htmlFor="sup-cat" className="text-xs font-medium text-foreground">
                Inquiry Category <span className="text-destructive">*</span>
              </Label>
              <Select
                value={category}
                onValueChange={(val: SupportCategory) => setCategory(val)}
              >
                <SelectTrigger id="sup-cat" className="text-xs h-9 font-medium">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="GENERAL_INQUIRY" className="text-xs">
                    General Operational Inquiry
                  </SelectItem>
                  <SelectItem value="TECHNICAL_ISSUE" className="text-xs">
                    Technical / Portal Access Issue
                  </SelectItem>
                  <SelectItem value="CONTRACT_QUERY" className="text-xs">
                    Contract, Addendum & Rate Cards
                  </SelectItem>
                  <SelectItem value="BILLING" className="text-xs">
                    Invoicing & Timesheet Payment
                  </SelectItem>
                </SelectContent>
              </Select>
            </div>

            {/* Subject */}
            <div className="space-y-1.5">
              <Label htmlFor="sup-subject" className="text-xs font-medium text-foreground">
                Subject <span className="text-destructive">*</span>
              </Label>
              <Input
                id="sup-subject"
                placeholder="e.g. Commercial Trade Licence update..."
                value={subject}
                onChange={(e) => setSubject(e.target.value)}
                className="text-xs h-9 font-medium"
                required
              />
            </div>

            {/* Body */}
            <div className="space-y-1.5">
              <Label htmlFor="sup-body" className="text-xs font-medium text-foreground">
                Message Body <span className="text-destructive">*</span>
              </Label>
              <Textarea
                id="sup-body"
                rows={4}
                placeholder="Provide detailed context regarding your operational or commercial request..."
                value={body}
                onChange={(e) => setBody(e.target.value)}
                className="text-xs resize-none"
                required
              />
            </div>

            {/* AttachmentList for files */}
            <div className="space-y-1.5">
              <Label className="text-xs font-medium text-foreground">Supporting Files</Label>
              <AttachmentList
                title="Support Document Upload"
                attachments={attachments}
                editable={true}
                scanningStates={true}
                showDropzone={true}
                onAddAttachment={(att) => setAttachments((prev) => [...prev, att])}
                onRemoveAttachment={(id) =>
                  setAttachments((prev) => prev.filter((a) => a.id !== id))
                }
              />
            </div>

            {/* Send Button */}
            <Button
              type="submit"
              disabled={isSending}
              className="w-full text-xs h-9 gap-1.5 bg-teal-600 hover:bg-teal-700 text-white font-semibold shadow-xs"
            >
              <Send className="w-3.5 h-3.5" />
              {isSending ? "Dispatching..." : "Send Message to Procurement"}
            </Button>
          </form>
        </Card>
      </div>

      {/* Floating Toast */}
      {toastMessage && (
        <div className="fixed bottom-6 right-6 z-50 p-4 rounded-xl bg-card border border-teal-500/40 shadow-xl text-xs flex items-center gap-3 animate-in fade-in slide-in-from-bottom-2 max-w-md">
          <div className="p-2 rounded-lg bg-teal-500/20 text-teal-600 dark:text-teal-400 shrink-0">
            <CheckCircle2 className="w-4 h-4" />
          </div>
          <div className="space-y-0.5">
            <p className="font-bold text-foreground">Message Dispatched</p>
            <p className="text-muted-foreground text-[11px] leading-relaxed">{toastMessage}</p>
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
