import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { requireSessionId } from "@/lib/auth/require-viewer";
import { formatPercent } from "@/lib/utils";
import { getAdminOverview } from "@/server/services/pulse-service";

export default async function AdminPrivacyPage() {
  const userId = await requireSessionId();
  const overview = getAdminOverview(userId);

  return (
    <div className="space-y-6">
      <section className="rounded-[32px] border border-[rgba(21,50,39,0.08)] bg-white/85 px-6 py-8 shadow-card">
        <Badge>Trust and restraint</Badge>
        <h1 className="mt-4 text-4xl font-semibold text-ink">Admin privacy summary</h1>
        <p className="mt-3 max-w-3xl text-[color:var(--muted)]">
          Pulse is designed so employer customers can learn about overall wellbeing patterns without exposing raw personal health records, note text, or identifiable check-in timelines.
        </p>
      </section>
      <div className="grid gap-6 xl:grid-cols-[1fr_1fr]">
        <Card>
          <CardHeader>
            <CardTitle className="text-2xl">What the platform shows</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4 text-sm text-[color:var(--muted)]">
            <div className="rounded-[24px] bg-[#f5f8f4] p-4">
              Participation rate, challenge engagement, average stress and sleep trends, weekly active usage, and broad burnout risk buckets.
            </div>
            <div className="rounded-[24px] bg-[#f5f8f4] p-4">
              Department filters only when at least five people match the segment.
            </div>
            <div className="rounded-[24px] bg-[#f5f8f4] p-4">
              Aggregate counts of export and deletion requests for operational follow-up.
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle className="text-2xl">What the platform withholds</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4 text-sm text-[color:var(--muted)]">
            <div className="rounded-[24px] bg-[#f5f8f4] p-4">
              Individual notes, named health timelines, and user-by-user recommendation histories are not available in the admin UI.
            </div>
            <div className="rounded-[24px] bg-[#f5f8f4] p-4">
              Challenge participation is summarized without exposing sensitive context.
            </div>
            <div className="rounded-[24px] bg-[#f5f8f4] p-4">
              Pulse supports prevention and engagement only. It does not diagnose or provide medical advice.
            </div>
          </CardContent>
        </Card>
      </div>
      <Card>
        <CardHeader>
          <CardTitle className="text-2xl">Privacy posture metrics</CardTitle>
        </CardHeader>
        <CardContent className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
          <div className="rounded-[24px] bg-[#f5f8f4] p-4">
            <p className="text-sm text-[color:var(--muted)]">Data exports requested</p>
            <p className="mt-2 text-3xl font-semibold text-ink">{overview.privacySummary.dataExportsRequested}</p>
          </div>
          <div className="rounded-[24px] bg-[#f5f8f4] p-4">
            <p className="text-sm text-[color:var(--muted)]">Deletion requests</p>
            <p className="mt-2 text-3xl font-semibold text-ink">{overview.privacySummary.deletionRequests}</p>
          </div>
          <div className="rounded-[24px] bg-[#f5f8f4] p-4">
            <p className="text-sm text-[color:var(--muted)]">Notes analytics opt-out</p>
            <p className="mt-2 text-3xl font-semibold text-ink">{formatPercent(overview.privacySummary.notesOptOutRate)}</p>
          </div>
          <div className="rounded-[24px] bg-[#f5f8f4] p-4">
            <p className="text-sm text-[color:var(--muted)]">Challenge opt-out</p>
            <p className="mt-2 text-3xl font-semibold text-ink">{formatPercent(overview.privacySummary.challengeOptOutRate)}</p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
