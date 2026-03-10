import type { RecommendationCandidate } from "@/lib/recommendation-engine/types";

interface ExplanationFacts {
  recentStressAverage?: number;
  recentSleepAverage?: number;
  recentMovementAverage?: number;
  recentFocusAverage?: number;
  recentWorkloadAverage?: number;
  recentDismissCount?: number;
}

export function buildRecommendationExplanation(
  reasonCode: RecommendationCandidate["reasonCode"],
  facts: ExplanationFacts
) {
  switch (reasonCode) {
    case "sustained_stress_low_sleep":
      return `Recommended because your stress has been elevated across recent check-ins while sleep has stayed below your healthier range.`;
    case "low_movement_low_focus":
      return `Recommended because low movement and lower focus have been showing up together in your recent check-ins.`;
    case "poor_sleep_trend":
      return `Recommended because your recent sleep trend has dipped and a smaller reset can improve recovery.`;
    case "high_workload_pattern":
      return `Recommended because workload has stayed high long enough to warrant a boundary-setting reset.`;
    case "low_completion_pattern":
      return `Recommended because lighter-weight actions tend to work better when recent nudges have felt too demanding.`;
    case "social_reset_pattern":
      return `Recommended because sustained pressure plus reduced focus can improve with a short social or support-oriented reset.`;
    default:
      return `Recommended to help you maintain steady routines based on your recent check-ins and action history.`;
  }
}
