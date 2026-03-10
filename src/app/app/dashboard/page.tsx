import Link from "next/link";
import { ArrowUpRight, Flame, HeartPulse, ShieldCheck, Sparkles } from "lucide-react";
import { WellnessTrendChart } from "@/components/charts/wellness-trend-chart";
import { MetricCard } from "@/components/dashboard/metric-card";
import { RecommendationCard } from "@/components/recommendations/recommendation-card";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { requireSessionId } from "@/lib/auth/require-viewer";
import { formatDate } from "@/lib/utils";
import { getEmployeeDashboard } from "@/server/services/pulse-service";

export default async function DashboardPage() {
  const userId = await requireSessionId();
  const dashboard = getEmployeeDashboard(userId);
  const snapshot = dashboard.latestSnapshot;
  const wellnessMetrics = snapshot
    ? [
        { label: "Burnout risk", value: `${snapshot.burnoutRiskScore}/100`, detail: "Trend-based risk, not diagnostic" },
        { label: "Recovery", value: `${snapshot.recoveryScore}/100`, detail: "Sleep and stress weighted recovery score" },
        { label: "Engagement", value: `${snapshot.engagementScore}/100`, detail: "Check-ins, actions, and challenge activity" },
        { label: "Consistency", value: `${snapshot.consistencyScore}/100`, detail: "Habit consistency over recent periods" }
      ]
    : [];

  return (
    <div className="space-y-6">
      <section className="rounded-[32px] border border-[rgba(21,50,39,0.08)] bg-white/85 px-6 py-8 shadow-card">
        <div className="flex flex-wrap items-center justify-between gap-4">
          <div className="space-y-3">
            <Badge>Private employee view</Badge>
            <h1 className="text-4xl font-semibold text-ink">Good to see you, {dashboard.user.name.split(" ")[0]}.</h1>
            <p className="max-w-2xl text-[color:var(--muted)]">
              Your dashboard focuses on the smallest useful next step. Optional notes remain personal, and only high-level anonymized patterns contribute to organization reporting.
            </p>
          </div>
          <div className="rounded-[28px] bg-[#143126] px-5 py-4 text-white shadow-card">
            <p className="text-sm text-white/70">Current streak</p>
            <div className="mt-2 flex items-center gap-3">
              <Flame className="h-5 w-5 text-[#f6c17b]" />
              <p className="text-3xl font-semibold">{dashboard.streakCount} days</p>
            </div>
          </div>
        </div>
      </section>
      <section className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
        {wellnessMetrics.map((metric) => (
          <MetricCard key={metric.label} metric={metric} />
        ))}
      </section>
      <section className="grid gap-6 xl:grid-cols-[1.1fr_0.9fr]">
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between gap-3">
              <div>
                <Badge>Trend view</Badge>
                <CardTitle className="mt-3 text-2xl">Sleep, stress, and focus</CardTitle>
              </div>
              <div className="flex items-center gap-2 rounded-full bg-[#f5f8f4] px-3 py-2 text-sm text-[color:var(--muted)]">
                <HeartPulse className="h-4 w-4 text-moss" />
                Last 10 check-ins
              </div>
            </div>
          </CardHeader>
          <CardContent>
            <WellnessTrendChart data={dashboard.trendPoints} />
          </CardContent>
        </Card>
        {dashboard.currentRecommendation ? (
          <RecommendationCard actionable recommendation={dashboard.currentRecommendation} />
        ) : (
          <Card>
            <CardContent className="space-y-4 p-8">
              <Sparkles className="h-10 w-10 text-moss" />
              <h2 className="text-2xl font-semibold">Your next recommendation will appear after a check-in.</h2>
              <p className="text-[color:var(--muted)]">Pulse keeps the feed intentionally quiet until it has enough signal to suggest something useful.</p>
            </CardContent>
          </Card>
        )}
      </section>
      <section className="grid gap-6 xl:grid-cols-[0.95fr_1.05fr]">
        <Card>
          <CardHeader>
            <CardTitle className="text-2xl">Recent completed actions</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {dashboard.recentCompletedActions.length ? dashboard.recentCompletedActions.map((action) => (
              <div className="rounded-[24px] bg-[#f5f8f4] p-4" key={action.id}>
                <div className="flex items-center justify-between gap-3">
                  <p className="font-medium text-ink">{action.title}</p>
                  <Badge tone="positive">Completed</Badge>
                </div>
                <p className="mt-2 text-sm text-[color:var(--muted)]">{action.description}</p>
              </div>
            )) : <p className="text-sm text-[color:var(--muted)]">Completed actions will show up here once you start responding to recommendations.</p>}
          </CardContent>
        </Card>
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between gap-3">
              <CardTitle className="text-2xl">Active challenges</CardTitle>
              <Link className="text-sm font-medium text-moss" href="/app/challenges">See all</Link>
            </div>
          </CardHeader>
          <CardContent className="space-y-4">
            {dashboard.activeChallengeProgress.map((entry) => (
              <div className="rounded-[24px] bg-[#f5f8f4] p-4" key={entry.challenge.id}>
                <div className="flex items-center justify-between gap-3">
                  <div>
                    <p className="font-medium text-ink">{entry.challenge.title}</p>
                    <p className="mt-1 text-sm text-[color:var(--muted)]">Ends {formatDate(entry.challenge.endDate)}</p>
                  </div>
                  <ArrowUpRight className="h-4 w-4 text-moss" />
                </div>
                <p className="mt-3 text-sm text-[color:var(--muted)]">
                  {entry.participation ? `Your progress: ${entry.participation.progressValue}/${entry.challenge.targetValue}` : `Join ${entry.participants} teammates already participating.`}
                </p>
              </div>
            ))}
            <div className="rounded-[24px] bg-[#143126] p-4 text-white">
              <div className="flex items-center gap-3">
                <ShieldCheck className="h-5 w-5 text-[#9fd7c1]" />
                <p className="font-medium">Privacy stays intact inside team motivation.</p>
              </div>
              <p className="mt-2 text-sm text-white/80">Leaderboards can stay alias-based or anonymized, and organization reporting only rolls up completion trends.</p>
            </div>
          </CardContent>
        </Card>
      </section>
    </div>
  );
}
