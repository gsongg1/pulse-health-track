import { BurnoutBucketsChart } from "@/components/charts/burnout-buckets-chart";
import { WellnessTrendChart } from "@/components/charts/wellness-trend-chart";
import { MetricCard } from "@/components/dashboard/metric-card";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { requireSessionId } from "@/lib/auth/require-viewer";
import { formatPercent } from "@/lib/utils";
import { getAdminOverview } from "@/server/services/pulse-service";

export default async function AdminDashboardPage() {
  const userId = await requireSessionId();
  const overview = getAdminOverview(userId);

  return (
    <div className="space-y-6">
      <section className="rounded-[32px] border border-[rgba(21,50,39,0.08)] bg-white/85 px-6 py-8 shadow-card">
        <Badge>Aggregate-only organization view</Badge>
        <h1 className="mt-4 text-4xl font-semibold text-ink">Organization wellbeing overview</h1>
        <p className="mt-3 max-w-3xl text-[color:var(--muted)]">
          This admin view is intentionally limited. It supports team planning with anonymized trends, participation health, and challenge engagement while keeping employee-by-employee records out of reach.
        </p>
      </section>
      <section className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
        {overview.metricCards.map((metric) => (
          <MetricCard key={metric.label} metric={metric} />
        ))}
      </section>
      <section className="grid gap-6 xl:grid-cols-[1.1fr_0.9fr]">
        <Card>
          <CardHeader>
            <CardTitle className="text-2xl">Wellbeing trends</CardTitle>
          </CardHeader>
          <CardContent>
            <WellnessTrendChart data={overview.wellbeingTrends} />
          </CardContent>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle className="text-2xl">Burnout risk buckets</CardTitle>
          </CardHeader>
          <CardContent>
            <BurnoutBucketsChart data={overview.burnoutBuckets} />
          </CardContent>
        </Card>
      </section>
      <Card>
        <CardHeader>
          <CardTitle className="text-2xl">Active challenge participation</CardTitle>
        </CardHeader>
        <CardContent className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
          {overview.challengeStats.map((challenge) => (
            <div className="rounded-[24px] bg-[#f5f8f4] p-4" key={challenge.id}>
              <p className="font-medium text-ink">{challenge.title}</p>
              <p className="mt-3 text-sm text-[color:var(--muted)]">Participation {formatPercent(challenge.participationRate)}</p>
              <p className="mt-1 text-sm text-[color:var(--muted)]">Completion {formatPercent(challenge.completionRate)}</p>
              <p className="mt-1 text-sm text-[color:var(--muted)]">Average progress {formatPercent(challenge.averageProgress)}</p>
            </div>
          ))}
        </CardContent>
      </Card>
    </div>
  );
}
