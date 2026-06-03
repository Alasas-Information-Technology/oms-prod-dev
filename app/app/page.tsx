import { getAuthSession } from "@/app/actions/auth";

export default async function Page() {
  const user = await getAuthSession();

  if (!user) {
    return <div>Access Denied</div>;
  }

  return (

    <div className="flex flex-1 flex-col gap-4 p-4 pt-0">


      <div className="grid auto-rows-min gap-4 md:grid-cols-3">
        <p>Hello {user.username}, you are viewing this via SSR!</p>

        <p>Your Scopes:</p>
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
