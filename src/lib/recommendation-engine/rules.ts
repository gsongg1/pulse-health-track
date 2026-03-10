import { buildRecommendationExplanation } from "@/lib/recommendation-engine/explanation-builder";
import type { RecommendationContext, RecommendationRule } from "@/lib/recommendation-engine/types";
import { average, sortByDate } from "@/lib/utils";

function lastCheckIns(context: RecommendationContext, count: number) {
  return sortByDate(context.checkIns, "desc").slice(0, count);
}

export const detectSustainedStress: RecommendationRule = (context) => {
  const recent = lastCheckIns(context, 3);

  if (recent.length < 3) {
    return [];
  }

  const avgStress = average(recent.map((checkIn) => checkIn.stressScore));
  const avgSleep = average(recent.map((checkIn) => checkIn.sleepScore));

  if (avgStress < 4 || avgSleep > 2.6) {
    return [];
  }

  return [
    {
      category: "RECOVERY",
      title: "Take a two-minute breathing reset",
      description: "A short recovery prompt to lower pressure before the day compounds.",
      explanation: buildRecommendationExplanation("sustained_stress_low_sleep", {
        recentStressAverage: avgStress,
        recentSleepAverage: avgSleep
      }),
      reasonCode: "sustained_stress_low_sleep",
      priority: 95,
      effortLevel: "LOW",
      completionCta: "Start reset"
    }
  ];
};

export const detectLowMovementLowFocus: RecommendationRule = (context) => {
  const recent = lastCheckIns(context, 3);

  if (recent.length < 3) {
    return [];
  }

  const avgMovement = average(recent.map((checkIn) => checkIn.movementScore));
  const avgFocus = average(recent.map((checkIn) => checkIn.focusScore));

  if (avgMovement > 2.4 || avgFocus > 2.6) {
    return [];
  }

  return [
    {
      category: "MOVEMENT",
      title: "Take a 10-minute walk between tasks",
      description: "Reset your attention with a small movement break before the next work block.",
      explanation: buildRecommendationExplanation("low_movement_low_focus", {
        recentMovementAverage: avgMovement,
        recentFocusAverage: avgFocus
      }),
      reasonCode: "low_movement_low_focus",
      priority: 88,
      effortLevel: "LOW",
      completionCta: "Log walk"
    }
  ];
};

export const detectPoorSleepTrend: RecommendationRule = (context) => {
  const recent = lastCheckIns(context, 4);

  if (recent.length < 4) {
    return [];
  }

  const avgSleep = average(recent.map((checkIn) => checkIn.sleepScore));

  if (avgSleep > 2.7) {
    return [];
  }

  return [
    {
      category: "SLEEP_HYGIENE",
      title: "Plan a lightweight shutdown routine tonight",
      description: "Create a small end-of-day transition so your next sleep window starts cleaner.",
      explanation: buildRecommendationExplanation("poor_sleep_trend", {
        recentSleepAverage: avgSleep
      }),
      reasonCode: "poor_sleep_trend",
      priority: 81,
      effortLevel: "MEDIUM",
      completionCta: "Plan routine"
    }
  ];
};

export const detectHighWorkloadPattern: RecommendationRule = (context) => {
  const recent = lastCheckIns(context, 5);

  if (recent.length < 5) {
    return [];
  }

  const avgWorkload = average(recent.map((checkIn) => checkIn.workloadScore));

  if (avgWorkload < 4) {
    return [];
  }

  return [
    {
      category: "WORKLOAD_MANAGEMENT",
      title: "Review workload boundaries before tomorrow starts",
      description: "Take five minutes to identify one task to defer, delegate, or clarify.",
      explanation: buildRecommendationExplanation("high_workload_pattern", {
        recentWorkloadAverage: avgWorkload
      }),
      reasonCode: "high_workload_pattern",
      priority: 84,
      effortLevel: "MEDIUM",
      completionCta: "Set boundary"
    }
  ];
};

export const detectLowCompletionPattern: RecommendationRule = (context) => {
  const recentHistory = sortByDate(context.history, "desc").slice(0, 5);

  if (!recentHistory.length) {
    return [];
  }

  const dismissCount = recentHistory.filter((entry) => entry.status === "DISMISSED").length;

  if (dismissCount < 2) {
    return [];
  }

  return [
    {
      category: "STRESS_REGULATION",
      title: "Step away from your screen for five minutes",
      description: "A lower-effort reset that helps rebuild momentum without adding pressure.",
      explanation: buildRecommendationExplanation("low_completion_pattern", {
        recentDismissCount: dismissCount
      }),
      reasonCode: "low_completion_pattern",
      priority: 76,
      effortLevel: "LOW",
      completionCta: "Take micro-break"
    }
  ];
};

export const detectSocialResetPattern: RecommendationRule = (context) => {
  const recent = lastCheckIns(context, 4);

  if (recent.length < 4 || context.profile?.workMode === "ONSITE") {
    return [];
  }

  const avgStress = average(recent.map((checkIn) => checkIn.stressScore));
  const avgFocus = average(recent.map((checkIn) => checkIn.focusScore));

  if (avgStress < 3.8 || avgFocus > 2.8) {
    return [];
  }

  return [
    {
      category: "SOCIAL_WELLBEING",
      title: "Book a short check-in with a teammate",
      description: "A 10-minute social reset can help reduce isolation during heavier weeks.",
      explanation: buildRecommendationExplanation("social_reset_pattern", {
        recentStressAverage: avgStress,
        recentFocusAverage: avgFocus
      }),
      reasonCode: "social_reset_pattern",
      priority: 70,
      effortLevel: "LOW",
      completionCta: "Schedule check-in"
    }
  ];
};

export const fallbackRule: RecommendationRule = () => [
  {
    category: "FOCUS",
    title: "Protect one 25-minute focus block",
    description: "Reserve a short uninterrupted block for your highest-friction task today.",
    explanation: buildRecommendationExplanation("steady_routine", {}),
    reasonCode: "steady_routine",
    priority: 52,
    effortLevel: "MEDIUM",
    completionCta: "Block time"
  }
];

export const recommendationRules = [
  detectSustainedStress,
  detectLowMovementLowFocus,
  detectPoorSleepTrend,
  detectHighWorkloadPattern,
  detectLowCompletionPattern,
  detectSocialResetPattern,
  fallbackRule
];
