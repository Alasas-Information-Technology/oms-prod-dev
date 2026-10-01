import { Metadata } from "next";
import { VendorSubmissionHistoryWorkspace } from "@/components/oms/vendor-portal/VendorSubmissionHistoryWorkspace";

export const metadata: Metadata = {
  title: "Candidate Submission History | Vendor Portal | DIEZ OMS",
  description:
    "View and track status of candidates submitted by your agency, respond to interview time proposals, and monitor hiring progress.",
};

export default function VendorSubmissionHistoryPage() {
  return <VendorSubmissionHistoryWorkspace />;
}
