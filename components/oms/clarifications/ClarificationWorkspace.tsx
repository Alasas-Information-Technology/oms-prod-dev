"use client";

import * as React from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import {
  ClarificationDetail,
  ClarificationAttachment,
  ClarificationDraftPayload,
  ClarificationSubmitError,
} from "@/types/clarification";
import {
  useClarificationPreview,
  useClarificationDraft,
  useSubmitClarification,
} from "@/lib/clarification/api";
import { ClarificationShell } from "./ClarificationShell";
import { ClarificationMessagePanel } from "./ClarificationMessagePanel";
import { ClarificationResponseComposer } from "./ClarificationResponseComposer";
import { ClarificationInlineFieldEditors } from "./ClarificationInlineFieldEditors";
import { ClarificationSubmitDialog } from "./ClarificationSubmitDialog";
import {
  AskList,
  ClarificationThread,
  FieldDiffTable,
  ReapprovalRoute,
  BudgetImpactPanel,
} from "@/components/oms/clarification";

interface ClarificationWorkspaceProps {
  clarification: ClarificationDetail;
  onSubmitted?: () => void;
  rightColumnContent?: React.ReactNode;
}

export function ClarificationWorkspace({
  clarification,
  onSubmitted,
  rightColumnContent,
}: ClarificationWorkspaceProps) {
  const router = useRouter();
  const {
    requestId,
    clarificationId,
    type,
    canRespond,
    editableFields = [],
    draft,
    asks = [],
  } = clarification;

  const isMoreInfo = type === "MORE_INFO";

  // Form State initialized with draft data or proposed values
  const [message, setMessage] = React.useState<string>(draft?.message || "");
  const [attachments, setAttachments] = React.useState<ClarificationAttachment[]>(
    draft?.attachments || []
  );

  const initialFieldValues = React.useMemo(() => {
    const values: Record<string, any> = {};
    if (draft?.fieldValues && Object.keys(draft.fieldValues).length > 0) {
      return { ...draft.fieldValues };
    }
    if (editableFields && editableFields.length > 0) {
      editableFields.forEach((f) => {
        values[f.key] = f.proposedValue !== undefined ? f.proposedValue : f.currentValue;
      });
    }
    return values;
  }, [draft, editableFields]);

  const [fieldValues, setFieldValues] = React.useState<Record<string, any>>(initialFieldValues);

  // Submit Modal & Error State
  const [isSubmitDialogOpen, setIsSubmitDialogOpen] = React.useState<boolean>(false);
  const [submitError, setSubmitError] = React.useState<ClarificationSubmitError | null>(null);

  // 1. Live Preview Hook (Debounced 500ms internally, stable placeholderData)
  const { data: preview, isFetching: isFetchingPreview } = useClarificationPreview(
    requestId,
    clarificationId,
    fieldValues,
    { enabled: !isMoreInfo }
  );

  // Current draft payload for autosave
  const currentDraftPayload: ClarificationDraftPayload = React.useMemo(
    () => ({
      message,
      fieldValues,
      attachmentIds: attachments.map((a) => a.id),
    }),
    [message, fieldValues, attachments]
  );

  // 2. Draft Autosave Hook (Debounced 2000ms internally)
  const { saveDraft, isSaving: isSavingDraft, lastSavedAt } = useClarificationDraft(
    requestId,
    clarificationId,
    currentDraftPayload,
    { autoSave: canRespond }
  );

  // 3. Submit Response Mutation
  const submitMutation = useSubmitClarification(requestId, clarificationId);

  const handleFieldChange = (key: string, value: any) => {
    setFieldValues((prev) => ({
      ...prev,
      [key]: value,
    }));
  };

  const handleRevertField = (key: string) => {
    const field = editableFields.find((f) => f.key === key);
    if (field) {
      setFieldValues((prev) => ({
        ...prev,
        [key]: field.currentValue,
      }));
    }
  };

  const handleRevertAll = () => {
    const reverted: Record<string, any> = {};
    editableFields.forEach((f) => {
      reverted[f.key] = f.currentValue;
    });
    setFieldValues(reverted);
  };

  const handleAddAttachment = (att: ClarificationAttachment) => {
    setAttachments((prev) => [...prev, att]);
  };

  const handleRemoveAttachment = (attId: string) => {
    setAttachments((prev) => prev.filter((a) => a.id !== attId));
  };

  const handleManualSaveDraft = () => {
    saveDraft(currentDraftPayload);
    toast.success("Draft saved successfully");
  };

  const handleOpenSubmitDialog = () => {
    setSubmitError(null);
    setIsSubmitDialogOpen(true);
  };

  const handleConfirmSubmit = async (idempotencyKey: string) => {
    try {
      setSubmitError(null);

      // Check for pending/failed attachments before submission
      const pendingAtt = attachments.find((a) => a.scanStatus === "PENDING");
      if (pendingAtt) {
        setSubmitError({
          code: "ATTACHMENT_SCAN_PENDING",
          message: "One attachment is still being checked. Try again in a moment.",
        });
        return;
      }

      const failedAtt = attachments.find((a) => a.scanStatus === "FAILED");
      if (failedAtt) {
        setSubmitError({
          code: "ATTACHMENT_SCAN_FAILED",
          filename: failedAtt.name,
          message: `The file "${failedAtt.name}" failed security scanning and cannot be used.`,
        });
        return;
      }

      const result = await submitMutation.mutateAsync({
        message,
        fieldValues,
        attachmentIds: attachments.map((a) => a.id),
        idempotencyKey,
      });

      // Clear local draft from localStorage
      if (typeof window !== "undefined") {
        try {
          localStorage.removeItem(`draft_${requestId}_${clarificationId}`);
        } catch {
          // ignore
        }
      }

      setIsSubmitDialogOpen(false);

      // Success notification naming the next approver
      const nextPerson = result.nextApproverName || "HR";
      toast.success(`Response submitted. It now goes to ${nextPerson} for approval.`);

      if (onSubmitted) {
        onSubmitted();
      } else {
        router.push(`/app/requests/${encodeURIComponent(requestId)}?tab=history`);
      }
    } catch (err: any) {
      if (err?.code) {
        setSubmitError(err as ClarificationSubmitError);
      } else {
        setSubmitError({
          code: "CLARIFICATION_CLOSED",
          message: err?.message || "Failed to submit response. Please try again.",
        });
      }
    }
  };

  // Left Column Content Assembly
  const renderedLeftColumn = (
    <div className="space-y-6">
      {/* 1. What HR Needs Checklist (per Part 3.2, omitted if asks is empty) */}
      {asks && asks.length > 0 && (
        <AskList
          mode="read"
          asks={asks}
          preview={preview}
          clarification={clarification}
        />
      )}

      {/* 2. HR Request Panel (per Part 3.3, untruncated message & attachments) */}
      <ClarificationMessagePanel clarification={clarification} />

      {/* 3. Thread History (per Part 3.3, latest expanded, earlier collapsible) */}
      {clarification.thread && clarification.thread.length > 0 && (
        <ClarificationThread
          entries={clarification.thread}
          cycleNumber={clarification.cycleNumber}
        />
      )}

      {/* 4. Response Composer (per Part 3.4, auto-growing, drag-drop attachments with limits) */}
      <ClarificationResponseComposer
        message={message}
        onChangeMessage={setMessage}
        attachments={attachments}
        onAddAttachment={handleAddAttachment}
        onRemoveAttachment={handleRemoveAttachment}
        isSavingDraft={isSavingDraft}
        lastSavedAt={lastSavedAt || draft?.savedAt}
        readOnly={!canRespond}
      />

      {/* 5. Inline Field Editors (per Part 3.5, for INFO_WITH_APPROVAL / AMEND) */}
      {!isMoreInfo && editableFields.length > 0 && (
        <ClarificationInlineFieldEditors
          fields={editableFields}
          asks={asks}
          fieldValues={fieldValues}
          onChangeField={handleFieldChange}
          onRevertField={handleRevertField}
          onRevertAll={handleRevertAll}
          readOnly={!canRespond}
        />
      )}
    </div>
  );

  // Right Column Content Assembly (STRICTLY ABSENT FOR MORE_INFO)
  const renderedRightColumn = !isMoreInfo ? (
    rightColumnContent || (
      <div className="space-y-6">
        {/* 1. Live Diff Table per Part 3.6 */}
        <FieldDiffTable
          variant="live"
          rows={preview?.diff}
          isLoading={isFetchingPreview}
        />

        {/* 2. Dynamic Route Stepper per Part 3.7 */}
        <ReapprovalRoute
          variant="after-submit"
          route={preview?.route}
          isLoading={isFetchingPreview}
        />

        {/* 3. Budget Ledger Preview per Part 3.8 */}
        {preview?.budget && preview.budget.applicable && (
          <BudgetImpactPanel
            variant="revalidation"
            figures={preview.budget}
            isLoading={isFetchingPreview}
          />
        )}
      </div>
    )
  ) : null;

  return (
    <>
      <ClarificationShell
        clarification={clarification}
        preview={preview}
        onSaveDraft={handleManualSaveDraft}
        onSubmitResponse={handleOpenSubmitDialog}
        isSavingDraft={isSavingDraft}
        isSubmitting={submitMutation.isPending}
        lastSavedAt={lastSavedAt || draft?.savedAt}
        leftColumnContent={renderedLeftColumn}
        rightColumnContent={renderedRightColumn}
      />

      {/* Submit Confirmation Dialog */}
      <ClarificationSubmitDialog
        open={isSubmitDialogOpen}
        onOpenChange={setIsSubmitDialogOpen}
        clarification={clarification}
        preview={preview}
        message={message}
        fieldValues={fieldValues}
        attachmentIds={attachments.map((a) => a.id)}
        isSubmitting={submitMutation.isPending}
        onConfirmSubmit={handleConfirmSubmit}
        submitError={submitError}
        onClearError={() => setSubmitError(null)}
      />
    </>
  );
}
