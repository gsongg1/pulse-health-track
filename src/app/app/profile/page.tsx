import { updateProfileAction } from "@/app/actions";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { requireSessionId } from "@/lib/auth/require-viewer";
import { getEmployeeDashboard } from "@/server/services/pulse-service";

export default async function ProfilePage() {
  const userId = await requireSessionId();
  const dashboard = getEmployeeDashboard(userId);

  return (
    <div className="grid gap-6 xl:grid-cols-[0.95fr_1.05fr]">
      <Card>
        <CardHeader>
          <CardTitle className="text-2xl">Profile details</CardTitle>
        </CardHeader>
        <CardContent>
          <form action={updateProfileAction} className="grid gap-5">
            <label className="space-y-2">
              <span className="text-sm font-medium">Name</span>
              <input className="h-12 w-full rounded-2xl border border-[rgba(21,50,39,0.1)] bg-white px-4" defaultValue={dashboard.user.name} name="name" />
            </label>
            <label className="space-y-2">
              <span className="text-sm font-medium">Department</span>
              <input className="h-12 w-full rounded-2xl border border-[rgba(21,50,39,0.1)] bg-white px-4" defaultValue={dashboard.user.department} name="department" />
            </label>
            <Button className="w-fit" type="submit">Save profile</Button>
          </form>
        </CardContent>
      </Card>
      <Card>
        <CardHeader>
          <CardTitle className="text-2xl">Onboarding baseline</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          {dashboard.profile ? (
            <>
              <div className="flex flex-wrap gap-3">
                <Badge>{dashboard.profile.workMode.toLowerCase()}</Badge>
                <Badge tone="neutral">{dashboard.profile.checkInFrequency.toLowerCase()} check-ins</Badge>
              </div>
              <div className="grid gap-4 sm:grid-cols-3">
                <div className="rounded-[24px] bg-[#f5f8f4] p-4">
                  <p className="text-sm text-[color:var(--muted)]">Baseline sleep</p>
                  <p className="mt-2 text-3xl font-semibold text-ink">{dashboard.profile.baselineSleep}/5</p>
                </div>
                <div className="rounded-[24px] bg-[#f5f8f4] p-4">
                  <p className="text-sm text-[color:var(--muted)]">Baseline stress</p>
                  <p className="mt-2 text-3xl font-semibold text-ink">{dashboard.profile.baselineStress}/5</p>
                </div>
                <div className="rounded-[24px] bg-[#f5f8f4] p-4">
                  <p className="text-sm text-[color:var(--muted)]">Baseline movement</p>
                  <p className="mt-2 text-3xl font-semibold text-ink">{dashboard.profile.baselineMovement}/5</p>
                </div>
              </div>
              <div className="rounded-[24px] bg-[#f5f8f4] p-4">
                <p className="text-sm font-medium text-ink">Preferred nudge categories</p>
                <div className="mt-3 flex flex-wrap gap-2">
                  {dashboard.profile.preferredNudgeCategories.map((category) => (
                    <Badge key={category}>{category.replaceAll("_", " ")}</Badge>
                  ))}
                </div>
              </div>
            </>
          ) : (
            <p className="text-sm text-[color:var(--muted)]">No onboarding baseline found yet.</p>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
