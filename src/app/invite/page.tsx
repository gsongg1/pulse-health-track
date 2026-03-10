import { redirect } from "next/navigation";
import { submitOnboardingAction } from "@/app/actions";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { requireViewer } from "@/lib/auth/require-viewer";

const categories = [
  ["MOVEMENT", "Movement prompts"],
  ["RECOVERY", "Recovery resets"],
  ["FOCUS", "Focus support"],
  ["SLEEP_HYGIENE", "Sleep hygiene"],
  ["STRESS_REGULATION", "Stress regulation"],
  ["WORKLOAD_MANAGEMENT", "Workload management"],
  ["SOCIAL_WELLBEING", "Social wellbeing"],
  ["SUPPORT_RESOURCES", "Support resources"]
] as const;

export default async function InvitePage() {
  const viewer = await requireViewer();
  if (viewer.user.role === "ADMIN" || viewer.user.role === "MANAGER") {
    redirect("/admin/dashboard");
  }

  if (viewer.profile) {
    redirect("/app/dashboard");
  }

  return (
    <main className="mx-auto max-w-5xl px-4 py-8 sm:px-6 lg:px-8">
      <div className="grid gap-6 lg:grid-cols-[0.85fr_1.15fr]">
        <Card className="bg-[#143126] text-white">
          <CardContent className="space-y-6 p-8">
            <Badge className="w-fit bg-white/10 text-white">Northstar Health Labs</Badge>
            <h1 className="text-4xl font-semibold">Finish onboarding in under two minutes.</h1>
            <p className="text-white/80">
              Pulse uses your baseline answers to shape your first recommendations and tune effort levels. Team admins do not see your individual answers.
            </p>
            <div className="rounded-[28px] bg-white/10 p-5">
              <p className="text-sm uppercase tracking-[0.18em] text-white/60">Privacy promise</p>
              <ul className="mt-4 space-y-3 text-sm text-white/80">
                <li>Optional notes stay out of admin views.</li>
                <li>Department segments under 5 people are suppressed.</li>
                <li>This experience is for support and prevention, not performance review, diagnosis, or medical advice.</li>
              </ul>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle className="text-3xl">Set your baseline</CardTitle>
          </CardHeader>
          <CardContent>
            <form action={submitOnboardingAction} className="grid gap-6">
              <div className="grid gap-5 sm:grid-cols-3">
                <label className="space-y-2">
                  <span className="text-sm font-medium">Typical sleep</span>
                  <select className="h-12 w-full rounded-2xl border border-[rgba(21,50,39,0.1)] bg-white px-4" defaultValue="3" name="baselineSleep">
                    {[1, 2, 3, 4, 5].map((value) => <option key={value} value={value}>{value}</option>)}
                  </select>
                </label>
                <label className="space-y-2">
                  <span className="text-sm font-medium">Baseline stress</span>
                  <select className="h-12 w-full rounded-2xl border border-[rgba(21,50,39,0.1)] bg-white px-4" defaultValue="3" name="baselineStress">
                    {[1, 2, 3, 4, 5].map((value) => <option key={value} value={value}>{value}</option>)}
                  </select>
                </label>
                <label className="space-y-2">
                  <span className="text-sm font-medium">Weekly movement</span>
                  <select className="h-12 w-full rounded-2xl border border-[rgba(21,50,39,0.1)] bg-white px-4" defaultValue="3" name="baselineMovement">
                    {[1, 2, 3, 4, 5].map((value) => <option key={value} value={value}>{value}</option>)}
                  </select>
                </label>
              </div>
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
              <div className="rounded-[28px] bg-[#f5f8f4] p-5">
                <p className="text-sm font-medium text-ink">Preferred nudge categories</p>
                <div className="mt-4 grid gap-3 sm:grid-cols-2">
                  {categories.map(([value, label]) => (
                    <label className="flex items-center gap-3 rounded-2xl bg-white px-4 py-3" key={value}>
                      <input defaultChecked={value === "MOVEMENT" || value === "RECOVERY"} name="preferredNudgeCategories" type="checkbox" value={value} />
                      <span className="text-sm">{label}</span>
                    </label>
                  ))}
                </div>
              </div>
              <label className="flex items-center gap-3 rounded-2xl bg-[#f5f8f4] px-4 py-3 text-sm">
                <input defaultChecked name="challengeOptIn" type="checkbox" value="true" />
                Join optional team challenges with alias-based or anonymized participation.
              </label>
              <Button size="lg" type="submit">Finish onboarding</Button>
            </form>
          </CardContent>
        </Card>
      </div>
    </main>
  );
}
