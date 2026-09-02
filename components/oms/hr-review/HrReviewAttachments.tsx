import {
  Download,
  FileText,
  Paperclip,
} from "lucide-react";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";

import { HrAttachment } from "./hr-review.types";

interface HrReviewAttachmentsProps {
  attachments: HrAttachment[];
}

export function HrReviewAttachments({
  attachments,
}: HrReviewAttachmentsProps) {
  return (
    <Card className="gap-4 rounded-xl bg-white p-5 shadow-xs hover:translate-y-0">
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div className="flex items-start gap-3">
          <span className="flex size-9 shrink-0 items-center justify-center rounded-xl bg-primary/10 text-primary">
            <Paperclip className="size-4" />
          </span>

          <div>
            <p className="text-sm font-semibold text-foreground">
              Attachments
            </p>

            <p className="mt-1 text-xs text-muted-foreground">
              Supporting documents submitted
              with this request.
            </p>
          </div>
        </div>

        <Badge
          variant="secondary"
          className="rounded-full"
        >
          {attachments.length}
        </Badge>
      </div>

      <div className="overflow-hidden rounded-xl border border-border">
        {attachments.length === 0 ? (
          <div className="flex min-h-40 flex-col items-center justify-center text-center">
            <Paperclip className="size-8 text-muted-foreground/50" />

            <p className="mt-3 text-sm font-medium">
              No attachments
            </p>
          </div>
        ) : (
          attachments.map(
            (attachment, index) => (
              <div
                key={attachment.id}
                className={`flex flex-col gap-3 px-4 py-4 sm:flex-row sm:items-center sm:justify-between ${
                  index <
                  attachments.length - 1
                    ? "border-b border-border"
                    : ""
                }`}
              >
                <div className="flex min-w-0 items-start gap-3">
                  <span className="flex size-9 shrink-0 items-center justify-center rounded-lg bg-slate-100 text-slate-600">
                    <FileText className="size-4" />
                  </span>

                  <div className="min-w-0">
                    <p className="whitespace-normal break-words text-sm font-medium text-foreground">
                      {attachment.name}
                    </p>

                    <p className="mt-1 whitespace-normal text-xs text-muted-foreground">
                      {attachment.type} ·{" "}
                      {attachment.size} ·
                      Uploaded by{" "}
                      {
                        attachment.uploadedBy
                      }
                    </p>

                    <p className="mt-1 text-xs text-muted-foreground">
                      {
                        attachment.uploadedAt
                      }
                    </p>
                  </div>
                </div>

                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  className="shrink-0 rounded-lg"
                >
                  <Download className="size-4" />
                  Download
                </Button>
              </div>
            )
          )
        )}
      </div>
    </Card>
  );
}