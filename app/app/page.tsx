import { getAuthSession } from "@/app/actions/auth";
import { BudgetKpiCard, SimpleKpiCard } from "@/components/budget";
import { NeedsAttentionWidget } from "@/components/oms/dashboard/NeedsAttentionWidget";
import { Badge } from "@/components/ui/badge";

export default async function Page() {
  const user = await getAuthSession();

  if (!user || user === "REFRESH_REQUIRED") {
    return <div className="p-6">Access Denied</div>;
  }

  return (
    <div className="flex flex-1 flex-col gap-6 p-6 max-w-[1680px] mx-auto w-full">
      {/* Top Section: Cross-Type Awareness Needs Your Attention */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-1">
          <NeedsAttentionWidget />
        </div>

        <div className="lg:col-span-2 flex flex-col gap-4">
          <div className="p-5 rounded-lg border border-border/60 bg-card shadow-xs flex flex-col gap-3">
            <div className="flex items-center justify-between">
              <div>
                <h1 className="text-lg font-bold text-foreground">
                  Welcome back, {user.username}
                </h1>
                <p className="text-xs text-muted-foreground mt-0.5">
                  Here is your daily operational overview and pending items.
                </p>
              </div>
              <Badge variant="default">{user.roles.join(", ")}</Badge>
            </div>

            <div className="pt-2 border-t border-border/40 flex flex-wrap gap-2 text-xs">
              <span className="text-muted-foreground font-medium">Scopes:</span>
              {user.scopes.map((scope) => (
                <span
                  key={scope.scopeCode}
                  className="px-2 py-0.5 rounded bg-muted font-mono text-[11px]"
                >
                  {scope.scopeCode}
                </span>
              ))}
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <BudgetKpiCard reserved={65.893} consumed={22} />
            <SimpleKpiCard
              icon="material-symbols:unknown-document-outline"
              value={1000}
              title="Total Active Contracts"
              description="Across all departments"
            />
          </div>
        </div>
      </div>
    </div>
  );
}
