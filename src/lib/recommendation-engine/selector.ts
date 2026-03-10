import type {
  RecommendationCandidate,
  RecommendationContext,
  RecommendationPack
} from "@/lib/recommendation-engine/types";
import { calculateWellnessScores } from "@/lib/recommendation-engine/score-calculator";
import { recommendationRules } from "@/lib/recommendation-engine/rules";
import { sortByDate } from "@/lib/utils";

function scoreCandidate(context: RecommendationContext, candidate: RecommendationCandidate) {
  const preferredCategories = new Set(context.profile?.preferredNudgeCategories ?? []);
  const recentHistory = sortByDate(context.history, "desc").slice(0, 6);
  const recentCategoryHits = recentHistory.filter((entry) => entry.category === candidate.category).length;
  const dismissHits = recentHistory.filter(
    (entry) => entry.category === candidate.category && entry.status === "DISMISSED"
  ).length;
  const completeHits = recentHistory.filter(
    (entry) => entry.category === candidate.category && entry.status === "COMPLETED"
  ).length;
  const lowCompletionRate =
    recentHistory.length > 0 &&
    recentHistory.filter((entry) => entry.status === "COMPLETED").length / recentHistory.length < 0.34;
  const effortPenalty =
    lowCompletionRate && candidate.effortLevel === "HIGH"
      ? 10
      : lowCompletionRate && candidate.effortLevel === "MEDIUM"
        ? 4
        : 0;

  return (
    candidate.priority +
    (preferredCategories.has(candidate.category) ? 8 : 0) +
    completeHits * 4 -
    recentCategoryHits * 3 -
    dismissHits * 6 -
    effortPenalty
  );
}

function normalizeCandidateEffort(
  context: RecommendationContext,
  candidate: RecommendationCandidate
): RecommendationCandidate {
  const recentHistory = sortByDate(context.history, "desc").slice(0, 5);
  const dismissRate =
    recentHistory.length === 0
      ? 0
      : recentHistory.filter((entry) => entry.status === "DISMISSED").length / recentHistory.length;

  if (dismissRate < 0.4 || candidate.effortLevel === "LOW") {
    return candidate;
  }

  return {
    ...candidate,
    effortLevel: "LOW",
    description: `Keep this extra small today: ${candidate.description}`
  };
}

export function generateRecommendationPack(context: RecommendationContext): RecommendationPack {
  const rawCandidates = recommendationRules.flatMap((rule) => rule(context));
  const uniqueCandidates = rawCandidates.reduce<RecommendationCandidate[]>((list, candidate) => {
    if (list.some((entry) => entry.reasonCode === candidate.reasonCode)) {
      return list;
    }

    return [...list, normalizeCandidateEffort(context, candidate)];
  }, []);

  const ranked = uniqueCandidates.sort(
    (left, right) => scoreCandidate(context, right) - scoreCandidate(context, left)
  );
  const [primary, ...rest] = ranked;
  const scores = calculateWellnessScores(
    context.checkIns,
    context.history,
    context.challengeParticipations ?? []
  );

  return {
    primary,
    secondary: rest.slice(0, 2),
    scores
  };
}
