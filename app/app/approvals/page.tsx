import { redirect } from "next/navigation";

export default function ApprovalsPage() {
  redirect("/app/requests?tab=needs-my-action");
}
