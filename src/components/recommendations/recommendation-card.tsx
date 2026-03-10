import { completeRecommendationAction, dismissRecommendationAction, snoozeRecommendationAction } from "@/app/actions";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import type { Recommendation } from "@/lib/types";
import { formatDateTime } from "@/lib/utils";

export function RecommendationCard({ recommendation, actionable = false }: { recommendation: Recommendation; actionable?: boolean }) {
  return (
    <Card>
      <CardHeader>
        <div className="flex flex-wrap items-center gap-3">
          <Badge>{recommendation.category.replaceAll("_", " ")}</Badge>
          <Badge tone={recommendation.status === "COMPLETED" ? "positive" : recommendation.status === "DISMISSED" ? "warning" : "neutral"}>
            {recommendation.status.toLowerCase()}
          </Badge>
        </div>
        <CardTitle className="text-xl">{recommendation.title}</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <p className="text-sm text-[color:var(--muted)]">{recommendation.description}</p>
        <div className="rounded-3xl bg-[#f5f8f4] p-4 text-sm text-[color:var(--muted)]">
          <p className="font-medium text-ink">Why this now</p>
          <p className="mt-2">{recommendation.explanation}</p>
        </div>
        <div className="flex flex-wrap items-center justify-between gap-3 text-sm text-[color:var(--muted)]">
          <span>Generated {formatDateTime(recommendation.generatedAt)}</span>
          <span>Effort: {recommendation.effortLevel.toLowerCase()}</span>
        </div>
        {actionable ? (
          <div className="flex flex-wrap gap-3">
            <form action={completeRecommendationAction}>
              <input type="hidden" name="id" value={recommendation.id} />
              <Button type="submit">{recommendation.completionCta}</Button>
            </form>
            <form action={snoozeRecommendationAction}>
              <input type="hidden" name="id" value={recommendation.id} />
              <Button variant="outline" type="submit">Snooze</Button>
            </form>
            <form action={dismissRecommendationAction}>
              <input type="hidden" name="id" value={recommendation.id} />
              <Button variant="ghost" type="submit">Dismiss</Button>
            </form>
          </div>
        ) : null}
      </CardContent>
    </Card>
  );
}
