import { getAuthSession } from "@/app/actions/auth";
import { BudgetKpiCard } from "@/components/oms/budget-kpi";
import { SimpleKpiCard } from "@/components/oms/simple-kpi";
import { Badge } from "@/components/ui/badge";
export default async function Page() {
  const user = await getAuthSession();

  if (!user || user === "REFRESH_REQUIRED") {
    return <div>Access Denied</div>;
  }

  return (

    <div className="flex flex-1 flex-col gap-8 p-8 pt-8">

      <div className="grid auto-rows-min gap-8 md:grid-cols-3">
        <div className="flex flex-col gap-2">
          <p>Hello {user.username}, you are viewing this via SSR!</p>

          <Badge variant="default">{user.roles.join(", ")}</Badge>
          <p>User Id: {user.userId}</p>
          <p>Email: {user.email}</p>
          <p>User Type: {user.userType}</p>
        </div>






        <div className="col-span-2">
          <p>Your Permissions:</p>

          <ul className="flex gap-2 flex-wrap">
            {user.permissions.map(permission => (
              <li key={permission}><Badge variant="secondary">{permission}</Badge></li>
            ))}
          </ul>
        </div>

        <div>
          <p>Your Scopes:</p>

          <ul>
            {user.scopes.map(scope => (
              <li key={scope.scopeCode}>{scope.scopeCode}</li>
            ))}
          </ul>


        </div>
        <BudgetKpiCard reserved={65.893} consumed={22} />
        <SimpleKpiCard icon="material-symbols:unknown-document-outline" value={1000} title="Total Contracts" description="aarush" />
        <div className="aspect-video rounded-2xl bg-card border border-border shadow-sm" />
        <div className="aspect-video rounded-2xl bg-card border border-border shadow-sm" />
      </div>
      <div className="min-h-screen flex-1 rounded-2xl bg-card border border-border shadow-sm md:min-h-min" />
    </div>
  )
}
