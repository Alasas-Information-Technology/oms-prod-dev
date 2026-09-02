"use client";

import { use } from "react";
import { notFound, useRouter } from "next/navigation";
import { useClarification } from "@/lib/clarification/api";
import { ClarificationWorkspace } from "@/components/oms/clarifications";
import { Loader2 } from "lucide-react";

interface ClarificationPageProps {
  params: Promise<{
    id: string;
    clarificationId: string;
  }>;
}

export default function ClarificationResponsePage({
  params,
}: ClarificationPageProps) {
  const { id, clarificationId } = use(params);
  const router = useRouter();

  const {
    data: clarification,
    isLoading,
    error,
  } = useClarification(id, clarificationId);

  if (error) {
    notFound();
  }

  if (isLoading || !clarification) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh] gap-3">
        <Loader2 className="size-8 animate-spin text-primary" />
        <p className="text-sm text-muted-foreground font-medium">
          Loading clarification details...
        </p>
      </div>
    );
  }

  const handleSubmitted = () => {
    router.push(`/app/requests/${encodeURIComponent(id)}?tab=history`);
  };

  return (
    <ClarificationWorkspace
      clarification={clarification}
      onSubmitted={handleSubmitted}
    />
  );
}
