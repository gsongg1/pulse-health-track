import { BurnoutBucketsChart } from "@/components/charts/burnout-buckets-chart";
import { WellnessTrendChart } from "@/components/charts/wellness-trend-chart";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { requireSessionId } from "@/lib/auth/require-viewer";
import { adminFilterSchema } from "@/lib/validation";
import { getAdminOverview } from "@/server/services/pulse-service";

export default async function AdminInsightsPage({
  searchParams
}: {
  searchParams?: Promise<Record<string, string | string[] | undefined>>;
}) {
  const userId = await requireSessionId();
  const rawParams = searchParams ? await searchParams : {};
  const filters = adminFilterSchema.parse({
    range: typeof rawParams.range === "string" ? rawParams.range : undefined,
    department: typeof rawParams.department === "string" ? rawParams.department : undefined
  });
  const overview = getAdminOverview(userId, filters.range, filters.department);

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <div className="flex flex-wrap items-center justify-between gap-4">
            <div>
              <Badge>Filterable insights</Badge>
              <CardTitle className="mt-3 text-3xl">Department and timeframe insights</CardTitle>
            </div>
            <form className="flex flex-wrap gap-3" method="get">
              <select className="h-11 rounded-full border border-[rgba(21,50,39,0.1)] bg-white px-4" defaultValue={filters.range} name="range">
                <option value="7d">Last 7 days</option>
                <option value="30d">Last 30 days</option>
                <option value="90d">Last 90 days</option>
              </select>
              <select className="h-11 rounded-full border border-[rgba(21,50,39,0.1)] bg-white px-4" defaultValue={filters.department} name="department">
                {overview.departments.map((department) => (
                  <option key={department.name} value={department.name}>{department.name === "ALL" ? "All departments" : department.name}</option>
                ))}
              </select>
              <Button type="submit" variant="outline">Apply</Button>
            </form>
          </div>
        </CardHeader>
        <CardContent className="space-y-4 text-sm text-[color:var(--muted)]">
          <p>
            Filtered views stay privacy-safe. If a department falls below the minimum group size, Pulse suppresses the segmented result and reverts to organization-level reporting.
          </p>
          {overview.isSuppressed && overview.suppressionReason ? (
            <div className="rounded-[24px] bg-[#fbf1de] p-4 text-[#8a6116]">{overview.suppressionReason}</div>
          ) : null}
        </CardContent>
      </Card>
      <section className="grid gap-6 xl:grid-cols-[1.1fr_0.9fr]">
        <Card>
          <CardHeader>
            <CardTitle className="text-2xl">Trend detail</CardTitle>
          </CardHeader>
          <CardContent>
            <WellnessTrendChart data={overview.wellbeingTrends} />
          </CardContent>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle className="text-2xl">Risk distribution</CardTitle>
          </CardHeader>
          <CardContent>
            <BurnoutBucketsChart data={overview.burnoutBuckets} />
          </CardContent>
        </Card>
      </section>
    </div>
  );
}
