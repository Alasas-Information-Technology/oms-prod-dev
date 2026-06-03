import { getAuthSession } from "@/app/actions/auth";
import { Search, Type } from "lucide-react";
import { GlobalSearch } from "@/components/ui/global-search"

export default async function Page() {
  const user = await getAuthSession();

  if (!user) {
    return <div>Access Denied</div>;
  }

  return (

    <div className="flex flex-1 flex-col gap-4 p-4 pt-0 border">

      <div className="grid auto-rows-min gap-4 md:grid-cols-3">
        <p>Hello {user.username}, you are viewing this via SSR!</p>

        <p>Your Scopes:</p>

        <div className=" flex justify-end mt-1">
          <GlobalSearch />
        </div>


        <ul>
          {user.scopes.map(scope => (
            <li key={scope.scopeCode}>{scope.scopeCode}</li>
          ))}
        </ul>
        <div className="aspect-video rounded-xl bg-muted/50" />
        <div className="aspect-video rounded-xl bg-muted/50" />
      </div>
      <div className="min-h-screen flex-1 rounded-xl bg-muted/50 md:min-h-min" />
    </div>
  )
}
