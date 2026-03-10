import Link from "next/link";
import { redirect } from "next/navigation";
import { signInAction } from "@/app/actions";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { getSessionUserId } from "@/lib/auth/session";
import { getViewer } from "@/server/services/pulse-service";
import { getStore } from "@/server/repositories/demo-repository";

export default async function SignInPage() {
  const sessionUserId = await getSessionUserId();
  if (sessionUserId) {
    const viewer = getViewer(sessionUserId);
    redirect(viewer.user.role === "ADMIN" || viewer.user.role === "MANAGER" ? "/admin/dashboard" : "/app/dashboard");
  }

  const store = getStore();
  const demoAccounts = store.users.slice(0, 8);

  return (
    <main className="mx-auto grid min-h-screen max-w-6xl gap-6 px-4 py-6 sm:px-6 lg:grid-cols-[0.95fr_1.05fr] lg:px-8">
      <Card className="bg-[#143126] text-white">
        <CardContent className="space-y-6 p-8">
          <p className="text-sm uppercase tracking-[0.18em] text-white/70">Pulse demo access</p>
          <h1 className="text-4xl font-semibold">Choose a seeded employee, manager, or admin account.</h1>
          <p className="text-white/80">
            This MVP uses demo auth so you can explore private employee flows and a deliberately limited admin view without external setup.
          </p>
          <div className="grid gap-3">
            {demoAccounts.map((account) => (
              <div className="rounded-[24px] bg-white/10 p-4" key={account.id}>
                <p className="font-medium">{account.name}</p>
                <p className="text-sm text-white/70">{account.role.toLowerCase()} - {account.department}</p>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
      <Card>
        <CardHeader>
          <CardTitle className="text-3xl">Sign in to Pulse</CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          <form action={signInAction} className="space-y-5">
            <label className="block space-y-2">
              <span className="text-sm font-medium text-ink">Demo account</span>
              <select className="h-12 w-full rounded-2xl border border-[rgba(21,50,39,0.1)] bg-white px-4" name="userId">
                {store.users.map((user) => (
                  <option key={user.id} value={user.id}>
                    {user.name} - {user.role.toLowerCase()} - {user.department}
                  </option>
                ))}
              </select>
            </label>
            <Button className="w-full" size="lg" type="submit">Continue with demo account</Button>
          </form>
          <p className="text-sm text-[color:var(--muted)]">
            Need a fresh employee profile instead? Use the test sign-up flow to create one and complete onboarding.
          </p>
          <Link className="text-sm font-medium text-moss" href="/sign-up">Create test employee</Link>
        </CardContent>
      </Card>
    </main>
  );
}
