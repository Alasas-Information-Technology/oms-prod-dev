"use client";

import * as React from "react";
import {
  useQuery,
  useMutation,
  useQueryClient,
  type UseQueryOptions,
} from "@tanstack/react-query";
import {
  VendorOnboardingDocumentsWorkspace,
  VendorDocument,
  VendorDocumentUploadResponse,
  VendorDocumentReplaceResponse,
  VendorSignatureInfo,
  VendorSignatureSendResponse,
  VendorDocumentDraftPayload,
  VendorDocumentDraftResponse,
  VendorDocumentSubmitPayload,
  VendorDocumentSubmitResponse,
  VendorDocumentsApiError,
} from "@/src/types/vendor-documents";
import {
  MOCK_VENDOR_DOCUMENTS_FIXTURES,
  FIXTURE_VENDOR_DOCUMENTS_REFERENCE,
  getVendorDocumentsFixture,
} from "./fixtures";
import { useDebounce } from "@/hooks/useDebounce";

/**
 * Feature flag for local mock fixtures during development
 */
export const USE_FIXTURES = true;

/**
 * Vendor Documents API Service Layer
 */
export const vendorDocumentsApi = {
  /**
   * GET /api/v1/vendor/onboarding/{onboardingId}/documents
   */
  async getDocuments(
    onboardingId: string,
    fixtureKey?: string
  ): Promise<VendorOnboardingDocumentsWorkspace> {
    if (USE_FIXTURES) {
      await new Promise((resolve) => setTimeout(resolve, 200));

      if (fixtureKey && MOCK_VENDOR_DOCUMENTS_FIXTURES[fixtureKey]) {
        return JSON.parse(JSON.stringify(MOCK_VENDOR_DOCUMENTS_FIXTURES[fixtureKey]));
      }

      const match =
        getVendorDocumentsFixture(onboardingId) ||
        MOCK_VENDOR_DOCUMENTS_FIXTURES[onboardingId];

      if (!match) {
        throw {
          statusCode: 404,
          code: "NOT_FOUND",
          message: `Vendor onboarding documents workspace for ${onboardingId} not found`,
        };
      }

      return JSON.parse(JSON.stringify(match));
    }

    const res = await fetch(
      `/api/v1/vendor/onboarding/${encodeURIComponent(onboardingId)}/documents`
    );

    if (!res.ok) {
      const errorData = (await res.json().catch(() => ({}))) as Partial<VendorDocumentsApiError>;
      throw {
        statusCode: res.status,
        code: errorData.code || "FETCH_DOCUMENTS_ERROR",
        message: errorData.message || "Failed to load candidate onboarding documents",
        details: errorData.details,
      };
    }

    return res.json();
  },

  /**
   * POST /api/v1/vendor/onboarding/{onboardingId}/documents/{documentCode}/upload
   * Uploads a new document file.
   */
  async uploadDocument(
    onboardingId: string,
    documentCode: string,
    file: File,
    expiresOn?: string
  ): Promise<VendorDocumentUploadResponse> {
    // TODO(file-storage): wire real upload when the storage service ships
    // TODO(malware-scan): wire real scan results when the scanning service ships

    if (USE_FIXTURES) {
      await new Promise((resolve) => setTimeout(resolve, 350));

      const isEicarTest = file.name.toLowerCase().includes("eicar") || file.name.toLowerCase().includes("corrupt");
      if (isEicarTest) {
        throw {
          statusCode: 422,
          code: "SCAN_FAILED",
          message: "Malware threat detected in uploaded file. File quarantined.",
          details: { fileName: file.name },
        };
      }

      const updatedDoc: VendorDocument = {
        code: documentCode,
        label: documentCode.replace(/_/g, " "),
        status: "UPLOADED",
        file: {
          id: `file-${Date.now()}`,
          name: file.name,
          sizeBytes: file.size,
          mimeType: file.type || "application/pdf",
          uploadedAt: new Date().toISOString(),
        },
        expiresOn: expiresOn || null,
        expiringWithinDays: expiresOn ? 365 : null,
        malwareScanPassed: true,
        fileTypeValid: true,
        rejectionReason: null,
      };

      return {
        success: true,
        document: updatedDoc,
      };
    }

    const formData = new FormData();
    formData.append("file", file);
    if (expiresOn) {
      formData.append("expiresOn", expiresOn);
    }

    const res = await fetch(
      `/api/v1/vendor/onboarding/${encodeURIComponent(onboardingId)}/documents/${encodeURIComponent(
        documentCode
      )}/upload`,
      {
        method: "POST",
        body: formData,
      }
    );

    if (!res.ok) {
      const err = (await res.json().catch(() => ({}))) as Partial<VendorDocumentsApiError>;
      throw {
        statusCode: res.status,
        code: err.code || "UPLOAD_FAILED",
        message: err.message || "Failed to upload document",
        details: err.details,
      };
    }

    return res.json();
  },

  /**
   * POST /api/v1/vendor/onboarding/{onboardingId}/documents/{documentCode}/replace
   * Replaces an existing document; previous file retained until new file passes scanning.
   */
  async replaceDocument(
    onboardingId: string,
    documentCode: string,
    file: File,
    expiresOn?: string
  ): Promise<VendorDocumentReplaceResponse> {
    // TODO(file-storage): wire real upload when the storage service ships
    // TODO(malware-scan): wire real scan results when the scanning service ships

    if (USE_FIXTURES) {
      await new Promise((resolve) => setTimeout(resolve, 350));

      const isEicarTest = file.name.toLowerCase().includes("eicar") || file.name.toLowerCase().includes("corrupt");
      if (isEicarTest) {
        throw {
          statusCode: 422,
          code: "SCAN_FAILED",
          message: "Replacement file failed security scan and was quarantined.",
          details: { fileName: file.name },
        };
      }

      const updatedDoc: VendorDocument = {
        code: documentCode,
        label: documentCode.replace(/_/g, " "),
        status: "UPLOADED",
        file: {
          id: `file-replaced-${Date.now()}`,
          name: file.name,
          sizeBytes: file.size,
          mimeType: file.type || "application/pdf",
          uploadedAt: new Date().toISOString(),
        },
        expiresOn: expiresOn || null,
        expiringWithinDays: expiresOn ? 365 : null,
        malwareScanPassed: true,
        fileTypeValid: true,
        rejectionReason: null,
      };

      return {
        success: true,
        document: updatedDoc,
        previousFileArchived: true,
      };
    }

    const formData = new FormData();
    formData.append("file", file);
    if (expiresOn) {
      formData.append("expiresOn", expiresOn);
    }

    const res = await fetch(
      `/api/v1/vendor/onboarding/${encodeURIComponent(onboardingId)}/documents/${encodeURIComponent(
        documentCode
      )}/replace`,
      {
        method: "POST",
        body: formData,
      }
    );

    if (!res.ok) {
      const err = (await res.json().catch(() => ({}))) as Partial<VendorDocumentsApiError>;
      throw {
        statusCode: res.status,
        code: err.code || "REPLACE_FAILED",
        message: err.message || "Failed to replace document",
        details: err.details,
      };
    }

    return res.json();
  },

  /**
   * POST /api/v1/vendor/onboarding/{onboardingId}/signature/send
   * Dispatches the NDA e-signature envelope via DocuSign.
   */
  async sendSignature(
    onboardingId: string
  ): Promise<VendorSignatureSendResponse> {
    if (USE_FIXTURES) {
      await new Promise((resolve) => setTimeout(resolve, 300));

      const signature: VendorSignatureInfo = {
        templateName: "DIEZ Outsourced Resource NDA",
        envelopeStatus: "SENT",
        signers: [
          { order: 1, name: "Candidate", role: "Candidate", status: "PENDING" },
          { order: 2, name: "DIEZ Representative", role: "DIEZ", status: "PENDING" },
        ],
        previewUrl: "/mock/nda-preview.pdf",
        sentAt: new Date().toISOString(),
        signedAt: null,
      };

      return {
        success: true,
        signature,
      };
    }

    const res = await fetch(
      `/api/v1/vendor/onboarding/${encodeURIComponent(onboardingId)}/signature/send`,
      {
        method: "POST",
        headers: { "Content-Type": "application/json" },
      }
    );

    if (!res.ok) {
      const err = (await res.json().catch(() => ({}))) as Partial<VendorDocumentsApiError>;
      throw {
        statusCode: res.status,
        code: err.code || "SEND_SIGNATURE_FAILED",
        message: err.message || "Failed to send envelope for e-signature",
        details: err.details,
      };
    }

    return res.json();
  },

  /**
   * PUT /api/v1/vendor/onboarding/{onboardingId}/draft
   * Auto-save draft, debounced 2000ms.
   */
  async saveDraft(
    onboardingId: string,
    payload: VendorDocumentDraftPayload
  ): Promise<VendorDocumentDraftResponse> {
    if (USE_FIXTURES) {
      await new Promise((resolve) => setTimeout(resolve, 150));
      return {
        success: true,
        savedAt: new Date().toISOString(),
      };
    }

    const res = await fetch(
      `/api/v1/vendor/onboarding/${encodeURIComponent(onboardingId)}/draft`,
      {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      }
    );

    if (!res.ok) {
      const err = (await res.json().catch(() => ({}))) as Partial<VendorDocumentsApiError>;
      throw {
        statusCode: res.status,
        code: err.code || "SAVE_DRAFT_FAILED",
        message: err.message || "Failed to save draft",
        details: err.details,
      };
    }

    return res.json();
  },

  /**
   * POST /api/v1/vendor/onboarding/{onboardingId}/submit
   * Final submission to DIEZ with receipt generation.
   */
  async submitDocuments(
    onboardingId: string,
    payload: VendorDocumentSubmitPayload
  ): Promise<VendorDocumentSubmitResponse> {
    if (!payload.idempotencyKey) {
      throw {
        statusCode: 400,
        code: "IDEMPOTENCY_KEY_REQUIRED",
        message: "An idempotency key is required to prevent duplicate submissions.",
      };
    }

    if (USE_FIXTURES) {
      await new Promise((resolve) => setTimeout(resolve, 500));

      const receiptNumber = `RCT-2026-${Date.now().toString().slice(-6)}`;
      return {
        success: true,
        receiptNumber,
        submittedAt: new Date().toISOString(),
        receiptDownloadUrl: `/mock/receipts/${receiptNumber}.pdf`,
        nextStage: "DIEZ_REVIEW",
      };
    }

    const res = await fetch(
      `/api/v1/vendor/onboarding/${encodeURIComponent(onboardingId)}/submit`,
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Idempotency-Key": payload.idempotencyKey,
        },
        body: JSON.stringify(payload),
      }
    );

    if (!res.ok) {
      const err = (await res.json().catch(() => ({}))) as Partial<VendorDocumentsApiError>;
      throw {
        statusCode: res.status,
        code: err.code || "SUBMISSION_FAILED",
        message: err.message || "Failed to submit documents to DIEZ",
        details: err.details,
      };
    }

    return res.json();
  },
};

/**
 * ─────────────────────────────────────────────────────────────────────────────
 * React Query Hooks
 * ─────────────────────────────────────────────────────────────────────────────
 */

export const VENDOR_DOCUMENTS_QUERY_KEY = (onboardingId: string) => [
  "vendor-onboarding-documents",
  onboardingId,
];

/**
 * Hook to fetch candidate onboarding documents workspace
 */
export function useVendorDocuments(
  onboardingId: string,
  fixtureKey?: string,
  options?: Partial<UseQueryOptions<VendorOnboardingDocumentsWorkspace, VendorDocumentsApiError>>
) {
  return useQuery({
    queryKey: [...VENDOR_DOCUMENTS_QUERY_KEY(onboardingId), fixtureKey],
    queryFn: () => vendorDocumentsApi.getDocuments(onboardingId, fixtureKey),
    staleTime: 30_000,
    ...options,
  });
}

/**
 * Hook to upload a document
 */
export function useUploadDocument(onboardingId: string) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({
      documentCode,
      file,
      expiresOn,
    }: {
      documentCode: string;
      file: File;
      expiresOn?: string;
    }) => vendorDocumentsApi.uploadDocument(onboardingId, documentCode, file, expiresOn),
    onSuccess: (result, variables) => {
      queryClient.setQueryData(
        VENDOR_DOCUMENTS_QUERY_KEY(onboardingId),
        (old: VendorOnboardingDocumentsWorkspace | undefined) => {
          if (!old) return old;
          return {
            ...old,
            requiredDocuments: old.requiredDocuments.map((doc) =>
              doc.code === variables.documentCode ? result.document : doc
            ),
            optionalDocuments: old.optionalDocuments.map((doc) =>
              doc.code === variables.documentCode ? result.document : doc
            ),
          };
        }
      );
    },
  });
}

/**
 * Hook to replace a document
 */
export function useReplaceDocument(onboardingId: string) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({
      documentCode,
      file,
      expiresOn,
    }: {
      documentCode: string;
      file: File;
      expiresOn?: string;
    }) => vendorDocumentsApi.replaceDocument(onboardingId, documentCode, file, expiresOn),
    onSuccess: (result, variables) => {
      queryClient.setQueryData(
        VENDOR_DOCUMENTS_QUERY_KEY(onboardingId),
        (old: VendorOnboardingDocumentsWorkspace | undefined) => {
          if (!old) return old;
          return {
            ...old,
            requiredDocuments: old.requiredDocuments.map((doc) =>
              doc.code === variables.documentCode ? result.document : doc
            ),
            optionalDocuments: old.optionalDocuments.map((doc) =>
              doc.code === variables.documentCode ? result.document : doc
            ),
          };
        }
      );
    },
  });
}

/**
 * Hook to send NDA for e-signature
 */
export function useSendForSignature(onboardingId: string) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: () => vendorDocumentsApi.sendSignature(onboardingId),
    onSuccess: (result) => {
      queryClient.setQueryData(
        VENDOR_DOCUMENTS_QUERY_KEY(onboardingId),
        (old: VendorOnboardingDocumentsWorkspace | undefined) => {
          if (!old) return old;
          return {
            ...old,
            signature: result.signature,
          };
        }
      );
    },
  });
}

/**
 * Hook to auto-save draft with a 2-second debounce
 */
export function useDebouncedDraftSave(
  onboardingId: string,
  draftPayload: VendorDocumentDraftPayload,
  debounceMs: number = 2000
) {
  const debouncedPayload = useDebounce(draftPayload, debounceMs);
  const [lastSavedAt, setLastSavedAt] = React.useState<string | null>(null);
  const [isSaving, setIsSaving] = React.useState<boolean>(false);
  const initialMount = React.useRef(true);

  const mutation = useMutation({
    mutationFn: (payload: VendorDocumentDraftPayload) =>
      vendorDocumentsApi.saveDraft(onboardingId, payload),
    onMutate: () => {
      setIsSaving(true);
    },
    onSuccess: (data) => {
      setLastSavedAt(data.savedAt);
      setIsSaving(false);
    },
    onError: () => {
      setIsSaving(false);
    },
  });

  React.useEffect(() => {
    if (initialMount.current) {
      initialMount.current = false;
      return;
    }
    mutation.mutate(debouncedPayload);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [debouncedPayload]);

  return {
    lastSavedAt,
    isSaving,
    saveNow: () => mutation.mutate(draftPayload),
  };
}

/**
 * Hook to submit candidate onboarding documents
 */
export function useSubmitDocuments(onboardingId: string) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (payload: VendorDocumentSubmitPayload) =>
      vendorDocumentsApi.submitDocuments(onboardingId, payload),
    onSuccess: (data) => {
      queryClient.setQueryData(
        VENDOR_DOCUMENTS_QUERY_KEY(onboardingId),
        (old: VendorOnboardingDocumentsWorkspace | undefined) => {
          if (!old) return old;
          return {
            ...old,
            receiptIssued: true,
            receiptNumber: data.receiptNumber,
            receiptDownloadUrl: data.receiptDownloadUrl,
          };
        }
      );
    },
  });
}
