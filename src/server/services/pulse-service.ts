import { recordAnalyticsEvent } from "@/lib/analytics/tracker";
import { generateRecommendationPack, calculateWellnessScores } from "@/lib/recommendation-engine";
import type {
  AdminOverview,
  Challenge,
  ChallengeParticipation,
  CheckIn,
  DashboardMetric,
  EmployeeDashboardData,
  OnboardingProfile,
  Organization,
  PrivacyPreference,
  PulseStore,
  Recommendation,
  RecommendationStatus,
  Role,
  TrendPoint,
  User,
  WellnessSnapshot
} from "@/lib/types";
import {
  addDays,
  average,
  clamp,
  dateKey,
  differenceInDays,
  formatPercent,
  sortByDate,
  startOfDay,
  sum
} from "@/lib/utils";
import { getStore } from "@/server/repositories/demo-repository";

function requireUser(store: PulseStore, userId: string) {
  const user = store.users.find((entry) => entry.id === userId);

  if (!user) {
    throw new Error("User not found.");
  }

  return user;
}

function requireOrganization(store: PulseStore, organizationId: string) {
  const organization = store.organizations.find((entry) => entry.id === organizationId);

  if (!organization) {
    throw new Error("Organization not found.");
  }

  return organization;
}

function getProfile(store: PulseStore, userId: string) {
  return store.onboardingProfiles.find((entry) => entry.userId === userId) ?? null;
}

function getPrivacyPreference(store: PulseStore, userId: string) {
  const preference = store.privacyPreferences.find((entry) => entry.userId === userId);

  if (!preference) {
    throw new Error("Privacy preference not found.");
  }

  return preference;
}

function getCheckInsForUser(store: PulseStore, userId: string) {
  return sortByDate(
    store.checkIns.filter((entry) => entry.userId === userId),
    "desc"
  );
}

function getRecommendationsForUser(store: PulseStore, userId: string) {
  return sortByDate(
    store.recommendations.filter((entry) => entry.userId === userId),
    "desc"
  );
}

function getParticipationsForUser(store: PulseStore, userId: string) {
  return store.challengeParticipations.filter((entry) => entry.userId === userId);
}

function getLatestSnapshotForUser(store: PulseStore, userId: string) {
  return sortByDate(
    store.wellnessSnapshots.filter((entry) => entry.userId === userId),
    "desc"
  )[0] ?? null;
}

function streakCount(checkIns: CheckIn[]) {
  const sorted = sortByDate(checkIns, "desc");
  if (!sorted.length) {
    return 0;
  }

  let streak = 1;
  for (let index = 1; index < sorted.length; index += 1) {
    const gap = Math.abs(differenceInDays(sorted[index - 1].date, sorted[index].date));
    if (gap <= 1) {
      streak += 1;
      continue;
    }
    break;
  }

  return streak;
}

function buildTrendPoints(checkIns: CheckIn[]) {
  return sortByDate(checkIns, "asc")
    .slice(-10)
    .map((checkIn) => ({
      date: checkIn.date,
      sleep: checkIn.sleepScore,
      stress: checkIn.stressScore,
      focus: checkIn.focusScore,
      workload: checkIn.workloadScore,
      movement: checkIn.movementScore
    }));
}

function activeChallengeProgress(store: PulseStore, user: User) {
  const activeChallenges = store.challenges.filter(
    (challenge) =>
      challenge.organizationId === user.organizationId &&
      new Date(challenge.endDate).getTime() >= Date.now()
  );

  return activeChallenges.map((challenge) => {
    const participation = store.challengeParticipations.find(
      (entry) => entry.userId === user.id && entry.challengeId === challenge.id
    ) ?? null;
    const participants = store.challengeParticipations.filter(
      (entry) => entry.challengeId === challenge.id
    );
    const completedParticipants = participants.filter((entry) => entry.completedAt);

    return {
      challenge,
      participation,
      participants: participants.length,
      completionRate: participants.length
        ? Math.round((completedParticipants.length / participants.length) * 100)
        : 0
    };
  });
}

function weekKey(input: string) {
  const date = startOfDay(input);
  const day = date.getDay() || 7;
  date.setDate(date.getDate() + 4 - day);
  const yearStart = new Date(date.getFullYear(), 0, 1);
  return `${date.getFullYear()}-${Math.ceil((((date.getTime() - yearStart.getTime()) / 86400000) + 1) / 7)}`;
}

function baselineCheckIn(userId: string, profile: OnboardingProfile): CheckIn {
  return {
    id: `baseline_${userId}`,
    userId,
    date: new Date().toISOString(),
    sleepScore: profile.baselineSleep,
    stressScore: profile.baselineStress,
    movementScore: profile.baselineMovement,
    focusScore: clamp(Math.round(6 - profile.baselineStress / 1.5), 1, 5),
    workloadScore: clamp(Math.round((profile.baselineStress + 2) / 1.5), 1, 5),
    optionalNote: null,
    createdAt: new Date().toISOString()
  };
}

function createSnapshot(store: PulseStore, userId: string) {
  const checkIns = getCheckInsForUser(store, userId);
  const profile = getProfile(store, userId);
  const effectiveCheckIns = checkIns.length ? checkIns : profile ? [baselineCheckIn(userId, profile)] : [];
  const recommendations = getRecommendationsForUser(store, userId);
  const participations = getParticipationsForUser(store, userId);
  const scores = calculateWellnessScores(effectiveCheckIns, recommendations, participations);
  const latestCheckIn = effectiveCheckIns[0];

  if (!latestCheckIn) {
    return null;
  }

  const snapshot: WellnessSnapshot = {
    id: `snapshot_${crypto.randomUUID()}`,
    userId,
    date: latestCheckIn.date,
    burnoutRiskScore: scores.burnoutRiskScore,
    recoveryScore: scores.recoveryScore,
    engagementScore: scores.engagementScore,
    consistencyScore: scores.consistencyScore,
    createdAt: new Date().toISOString()
  };

  store.wellnessSnapshots = store.wellnessSnapshots.filter(
    (entry) => !(entry.userId === userId && dateKey(entry.date) === dateKey(snapshot.date))
  );
  store.wellnessSnapshots.push(snapshot);
  return snapshot;
}

function refreshRecommendation(store: PulseStore, userId: string) {
  const user = requireUser(store, userId);
  const profile = getProfile(store, userId);
  const checkIns = getCheckInsForUser(store, userId);
  const participations = getParticipationsForUser(store, userId);
  const history = getRecommendationsForUser(store, userId);

  if (!profile) {
    return null;
  }

  const effectiveCheckIns = checkIns.length ? sortByDate(checkIns, "asc") : [baselineCheckIn(userId, profile)];

  store.recommendations = store.recommendations.map((recommendation) => {
    if (recommendation.userId !== userId || recommendation.status !== "ACTIVE") {
      return recommendation;
    }

    return {
      ...recommendation,
      status: "SNOOZED",
      snoozedUntil: addDays(new Date(), 1).toISOString()
    };
  });

  const pack = generateRecommendationPack({
    user,
    profile,
    checkIns: effectiveCheckIns,
    history,
    challengeParticipations: participations
  });
  const recommendation: Recommendation = {
    id: `recommendation_${crypto.randomUUID()}`,
    userId,
    category: pack.primary.category,
    title: pack.primary.title,
    description: pack.primary.description,
    explanation: pack.primary.explanation,
    reasonCode: pack.primary.reasonCode,
    effortLevel: pack.primary.effortLevel,
    priority: pack.primary.priority,
    completionCta: pack.primary.completionCta,
    status: "ACTIVE",
    generatedAt: new Date().toISOString(),
    completedAt: null,
    dismissedAt: null,
    snoozedUntil: null
  };

  store.recommendations.push(recommendation);
  return recommendation;
}

function roleGuard(user: User, allowed: Role[]) {
  if (!allowed.includes(user.role)) {
    throw new Error("Unauthorized");
  }
}

function buildMetricCards(input: {
  participationRate: number;
  checkInCompletionRate: number;
  recommendationCompletionRate: number;
  averageStress: number;
  averageSleep: number;
  weeklyActiveUsers: number;
  burnoutAverage: number;
}) {
  const cards: DashboardMetric[] = [
    {
      label: "Participation",
      value: formatPercent(input.participationRate),
      detail: "Employees with at least one check-in in range",
      tone: input.participationRate >= 70 ? "positive" : "default"
    },
    {
      label: "Check-in completion",
      value: formatPercent(input.checkInCompletionRate),
      detail: "Observed check-ins against expected cadence"
    },
    {
      label: "Recommendation completion",
      value: formatPercent(input.recommendationCompletionRate),
      detail: "Completed wellness actions in the selected window"
    },
    {
      label: "Average stress",
      value: `${input.averageStress.toFixed(1)}/5`,
      detail: "Aggregate, never individual-level",
      tone: input.averageStress < 3 ? "positive" : input.averageStress > 3.6 ? "warning" : "default"
    },
    {
      label: "Average sleep",
      value: `${input.averageSleep.toFixed(1)}/5`,
      detail: "Trend-level sleep quality across submitted check-ins"
    },
    {
      label: "Weekly active users",
      value: `${input.weeklyActiveUsers}`,
      detail: `Average burnout risk ${Math.round(input.burnoutAverage)}/100`
    }
  ];

  return cards;
}

function departmentList(users: User[]) {
  const counts = users.reduce<Record<string, number>>((collection, user) => {
    collection[user.department] = (collection[user.department] ?? 0) + 1;
    return collection;
  }, {});

  return [
    { name: "ALL", count: users.length, isSuppressed: false },
    ...Object.entries(counts)
      .sort((left, right) => left[0].localeCompare(right[0]))
      .map(([name, count]) => ({ name, count, isSuppressed: count < 5 }))
  ];
}

function rangeDays(range: "7d" | "30d" | "90d") {
  return range === "7d" ? 7 : range === "30d" ? 30 : 90;
}

function inRange(date: string, range: "7d" | "30d" | "90d") {
  return differenceInDays(new Date(), date) < rangeDays(range);
}

function aggregateTrends(checkIns: CheckIn[]) {
  const grouped = checkIns.reduce<Record<string, CheckIn[]>>((collection, checkIn) => {
    const key = dateKey(checkIn.date);
    collection[key] = [...(collection[key] ?? []), checkIn];
    return collection;
  }, {});

  return Object.entries(grouped)
    .sort((left, right) => new Date(left[0]).getTime() - new Date(right[0]).getTime())
    .map(([date, items]) => ({
      date,
      stress: Number(average(items.map((item) => item.stressScore)).toFixed(2)),
      sleep: Number(average(items.map((item) => item.sleepScore)).toFixed(2)),
      focus: Number(average(items.map((item) => item.focusScore)).toFixed(2))
    }));
}

function burnoutBuckets(snapshots: WellnessSnapshot[]) {
  const buckets = { Low: 0, Moderate: 0, Elevated: 0 };
  snapshots.forEach((snapshot) => {
    if (snapshot.burnoutRiskScore < 40) {
      buckets.Low += 1;
      return;
    }

    if (snapshot.burnoutRiskScore < 70) {
      buckets.Moderate += 1;
      return;
    }

    buckets.Elevated += 1;
  });

  return Object.entries(buckets).map(([name, value]) => ({ name, value }));
}

function activeChallengeStats(store: PulseStore, scopedUsers: User[]) {
  const scopedUserIds = new Set(scopedUsers.map((user) => user.id));

  return store.challenges
    .filter((challenge) => new Date(challenge.endDate).getTime() >= Date.now())
    .map((challenge) => {
      const scopedParticipations = store.challengeParticipations.filter(
        (participation) =>
          participation.challengeId === challenge.id && scopedUserIds.has(participation.userId)
      );
      const completionRate = scopedParticipations.length
        ? (scopedParticipations.filter((item) => item.completedAt).length / scopedParticipations.length) * 100
        : 0;
      const averageProgress = scopedParticipations.length
        ? (sum(scopedParticipations.map((item) => item.progressValue)) /
            scopedParticipations.length /
            challenge.targetValue) *
          100
        : 0;

      return {
        id: challenge.id,
        title: challenge.title,
        participationRate: scopedUsers.length ? (scopedParticipations.length / scopedUsers.length) * 100 : 0,
        completionRate,
        averageProgress
      };
    });
}

export function getViewer(userId: string) {
  const store = getStore();
  const user = requireUser(store, userId);
  const profile = getProfile(store, userId);
  const privacyPreference = getPrivacyPreference(store, userId);
  const organization = requireOrganization(store, user.organizationId);

  return { user, profile, privacyPreference, organization };
}

export function getEmployeeDashboard(userId: string): EmployeeDashboardData {
  const store = getStore();
  const user = requireUser(store, userId);
  const organization = requireOrganization(store, user.organizationId);
  const profile = getProfile(store, user.id);
  const privacyPreference = getPrivacyPreference(store, user.id);
  const recommendations = getRecommendationsForUser(store, user.id);

  return {
    user,
    organization,
    profile,
    privacyPreference,
    latestSnapshot: getLatestSnapshotForUser(store, user.id),
    currentRecommendation:
      recommendations.find((recommendation) => recommendation.status === "ACTIVE") ?? recommendations[0] ?? null,
    recommendationHistory: recommendations,
    trendPoints: buildTrendPoints(getCheckInsForUser(store, user.id)),
    streakCount: streakCount(getCheckInsForUser(store, user.id)),
    activeChallengeProgress: activeChallengeProgress(store, user),
    recentCheckIns: getCheckInsForUser(store, user.id).slice(0, 7),
    recentCompletedActions: recommendations.filter((recommendation) => recommendation.status === "COMPLETED").slice(0, 4)
  };
}

export function createEmployee(input: {
  name: string;
  email: string;
  department: string;
  workMode: OnboardingProfile["workMode"];
  checkInFrequency: OnboardingProfile["checkInFrequency"];
}) {
  const store = getStore();
  if (store.users.some((user) => user.email.toLowerCase() === input.email.toLowerCase())) {
    throw new Error("An account with that email already exists.");
  }

  const user: User = {
    id: `user_${crypto.randomUUID()}`,
    name: input.name,
    email: input.email,
    role: "EMPLOYEE",
    organizationId: store.organizations[0].id,
    department: input.department,
    title: "Employee",
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString()
  };
  const privacyPreference: PrivacyPreference = {
    id: `privacy_${crypto.randomUUID()}`,
    userId: user.id,
    challengeOptIn: true,
    notesAnalyticsOptIn: true,
    reminderFrequency: "NORMAL",
    dataDeletionRequestedAt: null
  };

  store.users.push(user);
  store.privacyPreferences.push(privacyPreference);
  recordAnalyticsEvent(store, {
    userId: user.id,
    organizationId: user.organizationId,
    eventType: "signed_up",
    metadata: { workMode: input.workMode, checkInFrequency: input.checkInFrequency }
  });

  return user;
}

export function submitOnboarding(
  userId: string,
  input: {
    baselineSleep: number;
    baselineStress: number;
    baselineMovement: number;
    workMode: OnboardingProfile["workMode"];
    challengeOptIn: boolean;
    checkInFrequency: OnboardingProfile["checkInFrequency"];
    preferredNudgeCategories: OnboardingProfile["preferredNudgeCategories"];
  }
) {
  const store = getStore();
  const user = requireUser(store, userId);
  const existingProfile = getProfile(store, userId);
  const profile: OnboardingProfile = existingProfile
    ? {
        ...existingProfile,
        ...input,
        updatedAt: new Date().toISOString()
      }
    : {
        id: `onboarding_${crypto.randomUUID()}`,
        userId,
        ...input,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      };

  store.onboardingProfiles = [
    ...store.onboardingProfiles.filter((entry) => entry.userId !== userId),
    profile
  ];
  store.privacyPreferences = store.privacyPreferences.map((preference) =>
    preference.userId === userId ? { ...preference, challengeOptIn: input.challengeOptIn } : preference
  );

  recordAnalyticsEvent(store, {
    userId,
    organizationId: user.organizationId,
    eventType: "completed_onboarding",
    metadata: { workMode: input.workMode, checkInFrequency: input.checkInFrequency }
  });

  createSnapshot(store, userId);
  refreshRecommendation(store, userId);
  return profile;
}

export function submitCheckIn(
  userId: string,
  input: {
    sleepScore: number;
    stressScore: number;
    movementScore: number;
    focusScore: number;
    workloadScore: number;
    optionalNote?: string | null;
    date?: string;
  }
) {
  const store = getStore();
  const user = requireUser(store, userId);
  const profile = getProfile(store, userId);
  const desiredDate = input.date ? new Date(input.date) : new Date();
  const existingCheckIns = getCheckInsForUser(store, userId);
  const duplicate = existingCheckIns.find((checkIn) => {
    if (profile?.checkInFrequency === "WEEKLY") {
      return weekKey(checkIn.date) === weekKey(desiredDate.toISOString());
    }

    return dateKey(checkIn.date) === dateKey(desiredDate.toISOString());
  });

  if (duplicate) {
    throw new Error("A check-in already exists for this period.");
  }

  const checkIn: CheckIn = {
    id: `checkin_${crypto.randomUUID()}`,
    userId,
    date: desiredDate.toISOString(),
    sleepScore: input.sleepScore,
    stressScore: input.stressScore,
    movementScore: input.movementScore,
    focusScore: input.focusScore,
    workloadScore: input.workloadScore,
    optionalNote: input.optionalNote?.trim() || null,
    createdAt: new Date().toISOString()
  };

  store.checkIns.push(checkIn);
  const recommendation = refreshRecommendation(store, userId);
  recordAnalyticsEvent(store, {
    userId,
    organizationId: user.organizationId,
    eventType: "submitted_checkin",
    metadata: { date: checkIn.date }
  });

  return { checkIn, recommendation, snapshot: createSnapshot(store, userId) };
}

export function updateProfile(userId: string, input: { name: string; department: string }) {
  const store = getStore();
  const user = requireUser(store, userId);
  const nextUser = {
    ...user,
    name: input.name,
    department: input.department,
    updatedAt: new Date().toISOString()
  };
  store.users = store.users.map((entry) => (entry.id === userId ? nextUser : entry));
  return nextUser;
}

export function updatePrivacyPreferences(
  userId: string,
  input: Pick<PrivacyPreference, "challengeOptIn" | "notesAnalyticsOptIn" | "reminderFrequency">
) {
  const store = getStore();
  const nextPreference = {
    ...getPrivacyPreference(store, userId),
    ...input
  };
  store.privacyPreferences = store.privacyPreferences.map((entry) =>
    entry.userId === userId ? nextPreference : entry
  );
  return nextPreference;
}

export function updateRecommendationStatus(
  userId: string,
  recommendationId: string,
  status: RecommendationStatus
) {
  const store = getStore();
  const recommendation = store.recommendations.find(
    (entry) => entry.id === recommendationId && entry.userId === userId
  );

  if (!recommendation) {
    throw new Error("Recommendation not found.");
  }

  recommendation.status = status;
  recommendation.completedAt = status === "COMPLETED" ? new Date().toISOString() : recommendation.completedAt;
  recommendation.dismissedAt = status === "DISMISSED" ? new Date().toISOString() : recommendation.dismissedAt;
  recommendation.snoozedUntil = status === "SNOOZED" ? addDays(new Date(), 1).toISOString() : recommendation.snoozedUntil;

  const user = requireUser(store, userId);
  recordAnalyticsEvent(store, {
    userId,
    organizationId: user.organizationId,
    eventType:
      status === "COMPLETED"
        ? "completed_recommendation"
        : status === "SNOOZED"
          ? "snoozed_recommendation"
          : "dismissed_recommendation",
    metadata: { recommendationId }
  });

  if (status !== "SNOOZED") {
    refreshRecommendation(store, userId);
  }
  createSnapshot(store, userId);

  return recommendation;
}

export function joinChallenge(userId: string, challengeId: string) {
  const store = getStore();
  const user = requireUser(store, userId);
  const existing = store.challengeParticipations.find(
    (entry) => entry.userId === userId && entry.challengeId === challengeId
  );

  if (existing) {
    return existing;
  }

  const participation: ChallengeParticipation = {
    id: `challenge_participation_${crypto.randomUUID()}`,
    challengeId,
    userId,
    progressValue: 0,
    joinedAt: new Date().toISOString(),
    completedAt: null
  };

  store.challengeParticipations.push(participation);
  recordAnalyticsEvent(store, {
    userId,
    organizationId: user.organizationId,
    eventType: "joined_challenge",
    metadata: { challengeId }
  });
  createSnapshot(store, userId);

  return participation;
}

export function leaveChallenge(userId: string, challengeId: string) {
  const store = getStore();
  store.challengeParticipations = store.challengeParticipations.filter(
    (entry) => !(entry.userId === userId && entry.challengeId === challengeId)
  );
}

export function updateChallengeProgress(userId: string, challengeId: string, progressValue: number) {
  const store = getStore();
  const challenge = store.challenges.find((entry) => entry.id === challengeId);
  if (!challenge) {
    throw new Error("Challenge not found.");
  }

  const participation = joinChallenge(userId, challengeId);
  participation.progressValue = clamp(progressValue, 0, challenge.targetValue);
  participation.completedAt = participation.progressValue >= challenge.targetValue ? new Date().toISOString() : null;
  const user = requireUser(store, userId);
  recordAnalyticsEvent(store, {
    userId,
    organizationId: user.organizationId,
    eventType: "completed_challenge_action",
    metadata: { challengeId, progressValue: participation.progressValue }
  });
  createSnapshot(store, userId);

  return participation;
}

export function exportUserData(userId: string) {
  const store = getStore();
  const user = requireUser(store, userId);
  recordAnalyticsEvent(store, {
    userId,
    organizationId: user.organizationId,
    eventType: "requested_data_export",
    metadata: {}
  });

  return {
    user,
    organization: requireOrganization(store, user.organizationId),
    onboardingProfile: getProfile(store, userId),
    privacyPreference: getPrivacyPreference(store, userId),
    checkIns: getCheckInsForUser(store, userId),
    recommendations: getRecommendationsForUser(store, userId),
    wellnessSnapshots: sortByDate(
      store.wellnessSnapshots.filter((entry) => entry.userId === userId),
      "desc"
    ),
    challenges: activeChallengeProgress(store, user),
    analyticsEvents: sortByDate(
      store.analyticsEvents.filter((entry) => entry.userId === userId),
      "desc"
    )
  };
}

export function requestDataDeletion(userId: string) {
  const store = getStore();
  const user = requireUser(store, userId);
  const preference = getPrivacyPreference(store, userId);
  const nextPreference = {
    ...preference,
    dataDeletionRequestedAt: new Date().toISOString()
  };
  store.privacyPreferences = store.privacyPreferences.map((entry) =>
    entry.userId === userId ? nextPreference : entry
  );
  recordAnalyticsEvent(store, {
    userId,
    organizationId: user.organizationId,
    eventType: "requested_data_deletion",
    metadata: {}
  });
  return nextPreference;
}

export function getCheckInHistory(userId: string) {
  return getCheckInsForUser(getStore(), userId);
}

export function getLatestCheckIn(userId: string) {
  return getCheckInsForUser(getStore(), userId)[0] ?? null;
}

export function getCurrentRecommendation(userId: string) {
  const recommendations = getRecommendationsForUser(getStore(), userId);
  return recommendations.find((entry) => entry.status === "ACTIVE") ?? recommendations[0] ?? null;
}

export function getRecommendationHistory(userId: string) {
  return getRecommendationsForUser(getStore(), userId);
}

export function getChallengesForUser(userId: string) {
  const store = getStore();
  const user = requireUser(store, userId);
  return activeChallengeProgress(store, user);
}

export function getAdminOverview(
  userId: string,
  range: "7d" | "30d" | "90d" = "30d",
  department = "ALL"
): AdminOverview {
  const store = getStore();
  const user = requireUser(store, userId);
  roleGuard(user, ["ADMIN", "MANAGER"]);
  const orgUsers = store.users.filter((entry) => entry.organizationId === user.organizationId && entry.role !== "ADMIN");
  const selectedUsers = department === "ALL" ? orgUsers : orgUsers.filter((entry) => entry.department === department);
  const isSuppressed = department !== "ALL" && selectedUsers.length < 5;
  const scopedUsers = isSuppressed || department === "ALL" ? orgUsers : selectedUsers;
  const scopedUserIds = new Set(scopedUsers.map((entry) => entry.id));
  const scopedCheckIns = store.checkIns.filter(
    (entry) => scopedUserIds.has(entry.userId) && inRange(entry.date, range)
  );
  const scopedRecommendations = store.recommendations.filter(
    (entry) => scopedUserIds.has(entry.userId) && inRange(entry.generatedAt, range)
  );
  const latestSnapshots = scopedUsers
    .map((entry) => getLatestSnapshotForUser(store, entry.id))
    .filter((entry): entry is WellnessSnapshot => Boolean(entry));
  const usersWithCheckIns = new Set(scopedCheckIns.map((entry) => entry.userId));
  const participationRate = scopedUsers.length ? (usersWithCheckIns.size / scopedUsers.length) * 100 : 0;
  const expectedCheckIns = scopedUsers.length * rangeDays(range);
  const checkInCompletionRate = expectedCheckIns ? (scopedCheckIns.length / expectedCheckIns) * 100 : 0;
  const recommendationCompletionRate = scopedRecommendations.length
    ? (scopedRecommendations.filter((entry) => entry.status === "COMPLETED").length / scopedRecommendations.length) * 100
    : 0;
  const weeklyActiveUsers = new Set(
    scopedCheckIns.filter((entry) => inRange(entry.date, "7d")).map((entry) => entry.userId)
  ).size;
  const averageStress = scopedCheckIns.length ? average(scopedCheckIns.map((entry) => entry.stressScore)) : 0;
  const averageSleep = scopedCheckIns.length ? average(scopedCheckIns.map((entry) => entry.sleepScore)) : 0;
  const burnoutAverage = latestSnapshots.length ? average(latestSnapshots.map((entry) => entry.burnoutRiskScore)) : 0;
  const notesOptOutRate = scopedUsers.length
    ? (scopedUsers.filter((entry) => !getPrivacyPreference(store, entry.id).notesAnalyticsOptIn).length / scopedUsers.length) * 100
    : 0;
  const challengeOptOutRate = scopedUsers.length
    ? (scopedUsers.filter((entry) => !getPrivacyPreference(store, entry.id).challengeOptIn).length / scopedUsers.length) * 100
    : 0;

  recordAnalyticsEvent(store, {
    userId,
    organizationId: user.organizationId,
    eventType: "viewed_admin_dashboard",
    metadata: { range, department }
  });

  return {
    selectedDepartment: department,
    departments: departmentList(orgUsers),
    isSuppressed,
    suppressionReason: isSuppressed
      ? `Department views are hidden when fewer than 5 employees match the filter. Showing organization-level metrics instead.`
      : null,
    userCount: scopedUsers.length,
    metricCards: buildMetricCards({
      participationRate,
      checkInCompletionRate,
      recommendationCompletionRate,
      averageStress,
      averageSleep,
      weeklyActiveUsers,
      burnoutAverage
    }),
    wellbeingTrends: aggregateTrends(scopedCheckIns),
    burnoutBuckets: burnoutBuckets(latestSnapshots),
    challengeStats: activeChallengeStats(store, scopedUsers),
    privacySummary: {
      dataExportsRequested: store.analyticsEvents.filter(
        (entry) => entry.organizationId === user.organizationId && entry.eventType === "requested_data_export"
      ).length,
      deletionRequests: store.analyticsEvents.filter(
        (entry) => entry.organizationId === user.organizationId && entry.eventType === "requested_data_deletion"
      ).length,
      notesOptOutRate,
      challengeOptOutRate
    }
  };
}

export function getAdminPrivacySummary(userId: string) {
  return getAdminOverview(userId).privacySummary;
}

export function getAdminChallengeStats(userId: string, range: "7d" | "30d" | "90d" = "30d", department = "ALL") {
  return getAdminOverview(userId, range, department).challengeStats;
}


