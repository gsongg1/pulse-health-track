import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { requireSessionId } from "@/lib/auth/require-viewer";
import { formatPercent } from "@/lib/utils";
import { getAdminChallengeStats } from "@/server/services/pulse-service";

export default async function AdminChallengesPage() {
  const userId = await requireSessionId();
  const challengeStats = getAdminChallengeStats(userId);

  return (
    <div className="space-y-6">
      <section className="rounded-[32px] border border-[rgba(21,50,39,0.08)] bg-white/85 px-6 py-8 shadow-card">
        <Badge>Seeded challenge program</Badge>
        <h1 className="mt-4 text-4xl font-semibold text-ink">Challenge participation and completion</h1>
        <p className="mt-3 max-w-3xl text-[color:var(--muted)]">
          For MVP, Pulse ships with seeded challenge templates and reports adoption at the aggregate level so employers can encourage healthier routines without forcing visibility into individual behavior.
        </p>
      </section>
      <div className="grid gap-6 lg:grid-cols-2 xl:grid-cols-3">
        {challengeStats.map((challenge) => (
          <Card key={challenge.id}>
            <CardHeader>
              <CardTitle>{challenge.title}</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3 text-sm text-[color:var(--muted)]">
              <p>Participation rate: {formatPercent(challenge.participationRate)}</p>
              <p>Completion rate: {formatPercent(challenge.completionRate)}</p>
              <p>Average progress: {formatPercent(challenge.averageProgress)}</p>
              <div className="rounded-[20px] bg-[#f5f8f4] p-4">
                <p className="font-medium text-ink">Admin visibility stays aggregate.</p>
                <p className="mt-2">Pulse reports adoption and completion trends only, not named participant-level logs.</p>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}
