import { signUpAction } from "@/app/actions";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

export default function SignUpPage() {
  return (
    <main className="mx-auto flex min-h-screen max-w-2xl items-center px-4 py-12 sm:px-6">
      <Card className="w-full">
        <CardHeader>
          <p className="text-sm uppercase tracking-[0.18em] text-[color:var(--muted)]">Employee sign-up</p>
          <CardTitle className="text-3xl">Create a fresh MVP employee account</CardTitle>
        </CardHeader>
        <CardContent>
          <form action={signUpAction} className="grid gap-5">
            <label className="space-y-2">
              <span className="text-sm font-medium">Full name</span>
              <input className="h-12 w-full rounded-2xl border border-[rgba(21,50,39,0.1)] bg-white px-4" name="name" placeholder="Jordan Lee" required />
            </label>
            <label className="space-y-2">
              <span className="text-sm font-medium">Email</span>
              <input className="h-12 w-full rounded-2xl border border-[rgba(21,50,39,0.1)] bg-white px-4" name="email" placeholder="jordan@northstar.health" required type="email" />
            </label>
            <label className="space-y-2">
              <span className="text-sm font-medium">Department</span>
              <input className="h-12 w-full rounded-2xl border border-[rgba(21,50,39,0.1)] bg-white px-4" name="department" placeholder="Operations" required />
            </label>
            <div className="grid gap-5 sm:grid-cols-2">
              <label className="space-y-2">
                <span className="text-sm font-medium">Work mode</span>
                <select className="h-12 w-full rounded-2xl border border-[rgba(21,50,39,0.1)] bg-white px-4" defaultValue="HYBRID" name="workMode">
                  <option value="REMOTE">Remote</option>
                  <option value="HYBRID">Hybrid</option>
                  <option value="ONSITE">Onsite</option>
                </select>
              </label>
              <label className="space-y-2">
                <span className="text-sm font-medium">Check-in cadence</span>
                <select className="h-12 w-full rounded-2xl border border-[rgba(21,50,39,0.1)] bg-white px-4" defaultValue="DAILY" name="checkInFrequency">
                  <option value="DAILY">Daily</option>
                  <option value="WEEKLY">Weekly</option>
                </select>
              </label>
            </div>
            <Button className="w-full" size="lg" type="submit">Create account and continue</Button>
          </form>
        </CardContent>
      </Card>
    </main>
  );
}
