import { requestDataDeletionAction, requestDataExportAction, updatePrivacyAction } from "@/app/actions";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { requireSessionId } from "@/lib/auth/require-viewer";
import { getEmployeeDashboard } from "@/server/services/pulse-service";

export default async function PrivacyPage({
  searchParams
}: {
  searchParams?: Promise<Record<string, string | string[] | undefined>>;
}) {
  const userId = await requireSessionId();
  const dashboard = getEmployeeDashboard(userId);
  const params = searchParams ? await searchParams : {};

  return (
    <div className="space-y-6">
      <section className="rounded-[32px] border border-[rgba(21,50,39,0.08)] bg-white/85 px-6 py-8 shadow-card">
        <Badge>Transparency and control</Badge>
        <h1 className="mt-4 text-4xl font-semibold text-ink">Your privacy controls</h1>
        <p className="mt-3 max-w-3xl text-[color:var(--muted)]">
          Pulse collects short check-ins, action feedback, and optional challenge participation to personalize preventive wellness support. Admins see anonymized trends only and never see individual notes or person-level health records in the UI.
        </p>
        {params.exported ? <p className="mt-4 text-sm text-moss">Your export request has been recorded for this MVP session.</p> : null}
        {params.deletion ? <p className="mt-2 text-sm text-[#b55b52]">Your data deletion request has been recorded for this MVP session.</p> : null}
      </section>
      <div className="grid gap-6 xl:grid-cols-[1.05fr_0.95fr]">
        <Card>
          <CardHeader>
            <CardTitle className="text-2xl">Manage preferences</CardTitle>
          </CardHeader>
          <CardContent>
            <form action={updatePrivacyAction} className="space-y-5">
              <label className="flex items-center gap-3 rounded-[24px] bg-[#f5f8f4] px-4 py-4 text-sm">
                <input defaultChecked={dashboard.privacyPreference.challengeOptIn} name="challengeOptIn" type="checkbox" value="true" />
                Stay opted into optional team challenges.
              </label>
              <label className="flex items-center gap-3 rounded-[24px] bg-[#f5f8f4] px-4 py-4 text-sm">
                <input defaultChecked={dashboard.privacyPreference.notesAnalyticsOptIn} name="notesAnalyticsOptIn" type="checkbox" value="true" />
                Allow optional notes to inform personal recommendation logic.
              </label>
              <label className="space-y-2">
                <span className="text-sm font-medium">Reminder frequency</span>
                <select className="h-12 w-full rounded-2xl border border-[rgba(21,50,39,0.1)] bg-white px-4" defaultValue={dashboard.privacyPreference.reminderFrequency} name="reminderFrequency">
                  <option value="LOW">Low</option>
                  <option value="NORMAL">Normal</option>
                  <option value="HIGH">High</option>
                </select>
              </label>
              <Button type="submit">Save privacy settings</Button>
            </form>
          </CardContent>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle className="text-2xl">Data rights</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="rounded-[24px] bg-[#f5f8f4] p-4 text-sm text-[color:var(--muted)]">
              <p className="font-medium text-ink">What admins can see</p>
              <p className="mt-2">Participation rates, average trend lines, active challenge participation, and privacy-safe burnout buckets.</p>
            </div>
            <div className="rounded-[24px] bg-[#f5f8f4] p-4 text-sm text-[color:var(--muted)]">
              <p className="font-medium text-ink">What admins cannot see</p>
              <p className="mt-2">Your raw note text, your named check-in records, or a personally identifiable health timeline in the UI.</p>
            </div>
            <div className="flex flex-wrap gap-3">
              <form action={requestDataExportAction}>
                <Button type="submit">Export my data</Button>
              </form>
              <form action={requestDataDeletionAction}>
                <Button type="submit" variant="danger">Delete my data</Button>
              </form>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

