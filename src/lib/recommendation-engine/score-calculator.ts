import type { CheckIn, ChallengeParticipation, Recommendation, WellnessScores } from "@/lib/types";
import { average, clamp, differenceInDays, sortByDate } from "@/lib/utils";

function takeRecentCheckIns(checkIns: CheckIn[], count = 7) {
  return sortByDate(checkIns, "desc").slice(0, count);
}

export function calculateBurnoutRisk(checkIns: CheckIn[]) {
  const recent = takeRecentCheckIns(checkIns);

  if (!recent.length) {
    return 32;
  }

  const avgStress = average(recent.map((checkIn) => checkIn.stressScore));
  const avgWorkload = average(recent.map((checkIn) => checkIn.workloadScore));
  const avgSleep = average(recent.map((checkIn) => checkIn.sleepScore));
  const avgFocus = average(recent.map((checkIn) => checkIn.focusScore));
  const sustainedHighStress = recent.filter((checkIn) => checkIn.stressScore >= 4).length >= 3 ? 12 : 0;
  const sustainedWorkload = recent.filter((checkIn) => checkIn.workloadScore >= 4).length >= 4 ? 10 : 0;

  return clamp(
    avgStress * 15 +
      avgWorkload * 13 +
      (6 - avgSleep) * 9 +
      (6 - avgFocus) * 8 +
      sustainedHighStress +
      sustainedWorkload -
      12,
    0,
    100
  );
}

export function calculateRecoveryScore(checkIns: CheckIn[]) {
  const recent = takeRecentCheckIns(checkIns);

  if (!recent.length) {
    return 54;
  }

  const avgSleep = average(recent.map((checkIn) => checkIn.sleepScore));
  const avgStress = average(recent.map((checkIn) => checkIn.stressScore));
  const avgMovement = average(recent.map((checkIn) => checkIn.movementScore));

  return clamp(avgSleep * 17 + (6 - avgStress) * 11 + avgMovement * 6 + 5, 0, 100);
}

export function calculateEngagementScore(
  checkIns: CheckIn[],
  recommendations: Recommendation[],
  challenges: ChallengeParticipation[]
) {
  const recentCheckIns = countRecentCheckIns(checkIns, 14);
  const completedRecommendations = recommendations.filter(
    (recommendation) => recommendation.status === "COMPLETED"
  ).length;
  const activeChallengeDays = challenges.filter((challenge) => challenge.progressValue > 0).length;

  return clamp(recentCheckIns * 4 + completedRecommendations * 10 + activeChallengeDays * 6 + 12, 0, 100);
}

export function calculateConsistencyScore(checkIns: CheckIn[], recommendations: Recommendation[]) {
  const sortedCheckIns = sortByDate(checkIns, "desc");

  if (!sortedCheckIns.length) {
    return 22;
  }

  let currentStreak = 1;
  for (let index = 1; index < sortedCheckIns.length; index += 1) {
    const gap = Math.abs(differenceInDays(sortedCheckIns[index - 1].date, sortedCheckIns[index].date));
    if (gap <= 1) {
      currentStreak += 1;
      continue;
    }
    break;
  }

  const completedRecommendations = recommendations.filter(
    (recommendation) => recommendation.status === "COMPLETED"
  ).length;

  return clamp(currentStreak * 10 + completedRecommendations * 8 + 20, 0, 100);
}

function countRecentCheckIns(checkIns: CheckIn[], days: number) {
  const now = new Date();
  return checkIns.filter((checkIn) => differenceInDays(now, checkIn.date) <= days).length;
}

export function calculateWellnessScores(
  checkIns: CheckIn[],
  recommendations: Recommendation[],
  challenges: ChallengeParticipation[]
): WellnessScores {
  return {
    burnoutRiskScore: Math.round(calculateBurnoutRisk(checkIns)),
    recoveryScore: Math.round(calculateRecoveryScore(checkIns)),
    engagementScore: Math.round(calculateEngagementScore(checkIns, recommendations, challenges)),
    consistencyScore: Math.round(calculateConsistencyScore(checkIns, recommendations))
  };
}
