"use client";

import * as React from "react";
import { VendorDocument } from "@/src/types/vendor-documents";
import { DocumentRow } from "./DocumentRow";
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "@/components/ui/collapsible";
import { ChevronDown, FolderPlus, FileText } from "lucide-react";
import { cn } from "@/lib/utils";

interface OptionalDocumentsSectionProps {
  optionalDocuments: VendorDocument[];
  canEdit?: boolean;
  defaultOpen?: boolean;
  onViewDocument?: (doc: VendorDocument) => void;
  onReplaceDocument?: (doc: VendorDocument) => void;
  onUploadDocument?: (doc: VendorDocument) => void;
  className?: string;
}

/**
 * Optional Documents Section per VENDOR-DOCUMENTS-UI.md §4.2 & Part 2.
 * - Collapsed by default: "Optional documents (0)" with chevron.
 * - Same row anatomy when expanded using DocumentRow.
 * - Note on TASK 4: No backend endpoint exists in the API contract for creating
 *   arbitrary custom document codes outside the schema, so arbitrary additions
 *   are omitted per specification instructions.
 */
export function OptionalDocumentsSection({
  optionalDocuments = [],
  canEdit = true,
  defaultOpen = false,
  onViewDocument,
  onReplaceDocument,
  onUploadDocument,
  className,
}: OptionalDocumentsSectionProps) {
  const [isOpen, setIsOpen] = React.useState(defaultOpen);
  const count = optionalDocuments.length;

  return (
    <div
      className={cn(
        "bg-card border border-border/70 rounded-xl p-4.5 shadow-xs space-y-3 transition-colors",
        className
      )}
    >
      <Collapsible open={isOpen} onOpenChange={setIsOpen} className="w-full">
        {/* Collapsible Header Trigger: "Optional documents (0)" with chevron */}
        <CollapsibleTrigger asChild>
          <button
            type="button"
            className="w-full flex items-center justify-between py-1 text-left cursor-pointer group focus:outline-hidden focus-visible:ring-2 focus-visible:ring-primary/40 rounded-md"
            aria-expanded={isOpen}
          >
            <div className="flex items-center gap-2">
              <FolderPlus className="size-4 text-muted-foreground group-hover:text-foreground transition-colors" />
              <span className="font-semibold text-sm text-foreground">
                {`Optional documents (${count})`}
              </span>
            </div>

            <div className="flex items-center gap-1.5 text-xs text-muted-foreground group-hover:text-foreground">
              <span className="text-[11px]">
                {isOpen ? "Collapse" : "Expand"}
              </span>
              <ChevronDown
                className={cn(
                  "size-4 transition-transform duration-200",
                  isOpen && "rotate-180"
                )}
              />
            </div>
          </button>
        </CollapsibleTrigger>

        {/* Collapsible Content */}
        <CollapsibleContent className="space-y-3 pt-3 overflow-hidden transition-all data-[state=closed]:animate-collapsible-up data-[state=open]:animate-collapsible-down">
          {count > 0 ? (
            <div className="space-y-3 pt-1 border-t border-border/40">
              {optionalDocuments.map((doc) => (
                <DocumentRow
                  key={doc.code}
                  document={{ ...doc, isOptional: true }}
                  canEdit={canEdit}
                  onView={onViewDocument}
                  onReplace={onReplaceDocument}
                  onUpload={onUploadDocument}
                />
              ))}
            </div>
          ) : (
            <div className="p-4 rounded-lg bg-muted/20 border border-dashed border-border/70 text-center space-y-1.5">
              <FileText className="size-5 text-muted-foreground/60 mx-auto" />
              <p className="text-xs font-medium text-foreground/80">
                No optional documents attached
              </p>
              <p className="text-[11px] text-muted-foreground max-w-md mx-auto">
                Supplementary certifications, project references, or additional diplomas are optional and not mandatory for submission.
              </p>
            </div>
          )}
        </CollapsibleContent>
      </Collapsible>
    </div>
  );
}
