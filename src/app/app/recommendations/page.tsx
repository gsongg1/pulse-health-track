import { RecommendationCard } from "@/components/recommendations/recommendation-card";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { requireSessionId } from "@/lib/auth/require-viewer";
import { getCurrentRecommendation, getRecommendationHistory } from "@/server/services/pulse-service";

export default async function RecommendationsPage() {
  const userId = await requireSessionId();
  const currentRecommendation = getCurrentRecommendation(userId);
  const history = getRecommendationHistory(userId);

  return (
    <div className="space-y-6">
      <section className="rounded-[32px] border border-[rgba(21,50,39,0.08)] bg-white/85 px-6 py-8 shadow-card">
        <Badge>Explainable recommendation engine</Badge>
        <h1 className="mt-4 text-4xl font-semibold text-ink">Your recommendation feed</h1>
        <p className="mt-3 max-w-2xl text-[color:var(--muted)]">
          Pulse keeps one primary action in focus, adapts effort when completion drops, and avoids repeating the same category too aggressively.
        </p>
      </section>
      {currentRecommendation ? <RecommendationCard actionable recommendation={currentRecommendation} /> : null}
      <Card>
        <CardHeader>
          <CardTitle className="text-2xl">History and adaptation trail</CardTitle>
        </CardHeader>
        <CardContent className="grid gap-4 lg:grid-cols-2">
          {history.map((recommendation) => (
            <RecommendationCard key={recommendation.id} recommendation={recommendation} />
          ))}
        </CardContent>
      </Card>
    </div>
  );
}
