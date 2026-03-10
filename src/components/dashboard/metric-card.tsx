import { Card, CardContent } from "@/components/ui/card";
import type { DashboardMetric } from "@/lib/types";

export function MetricCard({ metric }: { metric: DashboardMetric }) {
  return (
    <Card className="h-full">
      <CardContent className="space-y-2">
        <p className="text-sm text-[color:var(--muted)]">{metric.label}</p>
        <p className="text-3xl font-semibold tracking-tight text-ink">{metric.value}</p>
        <p className="text-sm text-[color:var(--muted)]">{metric.detail}</p>
      </CardContent>
    </Card>
  );
}
