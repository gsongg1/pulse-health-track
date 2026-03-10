import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { requireSessionId } from "@/lib/auth/require-viewer";
import { formatDate, formatDateTime } from "@/lib/utils";
import { getCheckInHistory, getRecommendationHistory } from "@/server/services/pulse-service";

export default async function HistoryPage() {
  const userId = await requireSessionId();
  const checkIns = getCheckInHistory(userId);
  const recommendations = getRecommendationHistory(userId);

  return (
    <div className="grid gap-6 xl:grid-cols-[1fr_1fr]">
      <Card>
        <CardHeader>
          <CardTitle className="text-2xl">Check-in history</CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          {checkIns.slice(0, 12).map((checkIn) => (
            <div className="rounded-[24px] bg-[#f5f8f4] p-4" key={checkIn.id}>
              <div className="flex flex-wrap items-center justify-between gap-3">
                <p className="font-medium text-ink">{formatDate(checkIn.date, { month: "long", day: "numeric" })}</p>
                <Badge tone="neutral">Logged {formatDateTime(checkIn.createdAt)}</Badge>
              </div>
              <p className="mt-3 text-sm text-[color:var(--muted)]">
                Sleep {checkIn.sleepScore}/5 · Stress {checkIn.stressScore}/5 · Movement {checkIn.movementScore}/5 · Focus {checkIn.focusScore}/5 · Workload {checkIn.workloadScore}/5
              </p>
              {checkIn.optionalNote ? <p className="mt-2 text-sm text-[color:var(--muted)]">{checkIn.optionalNote}</p> : null}
            </div>
          ))}
        </CardContent>
      </Card>
      <Card>
        <CardHeader>
          <CardTitle className="text-2xl">Recommendation history</CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          {recommendations.map((recommendation) => (
            <div className="rounded-[24px] bg-[#f5f8f4] p-4" key={recommendation.id}>
              <div className="flex flex-wrap items-center justify-between gap-3">
                <p className="font-medium text-ink">{recommendation.title}</p>
                <Badge tone={recommendation.status === "COMPLETED" ? "positive" : recommendation.status === "DISMISSED" ? "warning" : "neutral"}>
                  {recommendation.status.toLowerCase()}
                </Badge>
              </div>
              <p className="mt-2 text-sm text-[color:var(--muted)]">{recommendation.explanation}</p>
              <p className="mt-3 text-xs uppercase tracking-[0.16em] text-[color:var(--muted)]">{recommendation.category.replaceAll("_", " ")}</p>
            </div>
          ))}
        </CardContent>
      </Card>
    </div>
  );
}
