import {
  calculateWellnessScores,
  generateRecommendationPack,
  type RecommendationContext
} from "@/lib/recommendation-engine";
import type {
  AnalyticsEvent,
  Challenge,
  ChallengeParticipation,
  CheckIn,
  CheckInFrequency,
  NudgeCategory,
  OnboardingProfile,
  Organization,
  PrivacyPreference,
  PulseStore,
  Recommendation,
  Role,
  User,
  WellnessSnapshot,
  WorkMode
} from "@/lib/types";
import { addDays, clamp, seededValue, slugify, sortByDate, startOfDay } from "@/lib/utils";

interface SeedPattern {
  sleep: number;
  stress: number;
  movement: number;
  focus: number;
  workload: number;
  participationRate: number;
  engagementBias: number;
  challengeBias: number;
  workMode: WorkMode;
  checkInFrequency: CheckInFrequency;
  preferredCategories: NudgeCategory[];
  trajectory: "burnout" | "steady" | "stagnant" | "healthy";
  noteTheme: string[];
}

interface SeedBlueprint {
  name: string;
  email: string;
  role: Role;
  department: string;
  title: string;
  pattern: SeedPattern;
}

const now = startOfDay(new Date());
const organizationId = "org_northstar";

function isoWithHour(input: Date | string, hour: number) {
  const date = new Date(input);
  date.setHours(hour, 0, 0, 0);
  return date.toISOString();
}

function buildId(prefix: string, value: string) {
  return `${prefix}_${slugify(value)}`;
}

function basePattern(overrides: Partial<SeedPattern>): SeedPattern {
  return {
    sleep: 3.4,
    stress: 3,
    movement: 3,
    focus: 3,
    workload: 3.1,
    participationRate: 0.82,
    engagementBias: 0.55,
    challengeBias: 0.5,
    workMode: "HYBRID",
    checkInFrequency: "DAILY",
    preferredCategories: ["FOCUS", "MOVEMENT"],
    trajectory: "steady",
    noteTheme: ["steady workday", "felt manageable"],
    ...overrides
  };
}

function createBlueprints(): SeedBlueprint[] {
  const featured: SeedBlueprint[] = [
    {
      name: "Sophie Chen",
      email: "sophie@northstar.health",
      role: "EMPLOYEE",
      department: "Consulting",
      title: "Benefits Consultant",
      pattern: basePattern({
        sleep: 2.2,
        stress: 4.5,
        movement: 2.4,
        focus: 2.7,
        workload: 4.4,
        participationRate: 0.88,
        engagementBias: 0.28,
        challengeBias: 0.25,
        workMode: "HYBRID",
        preferredCategories: ["RECOVERY", "STRESS_REGULATION"],
        trajectory: "burnout",
        noteTheme: ["back-to-back client work", "need breathing room", "little recovery time"]
      })
    },
    {
      name: "Daniel Ortiz",
      email: "daniel@northstar.health",
      role: "EMPLOYEE",
      department: "Engineering",
      title: "Platform Engineer",
      pattern: basePattern({
        sleep: 3,
        stress: 3.3,
        movement: 1.8,
        focus: 2.2,
        workload: 3.6,
        participationRate: 0.81,
        engagementBias: 0.44,
        challengeBias: 0.32,
        workMode: "REMOTE",
        preferredCategories: ["MOVEMENT", "FOCUS"],
        trajectory: "stagnant",
        noteTheme: ["long desk day", "too many debugging blocks", "little movement"]
      })
    },
    {
      name: "Maya Patel",
      email: "maya@northstar.health",
      role: "MANAGER",
      department: "Operations",
      title: "Team Lead",
      pattern: basePattern({
        sleep: 4.2,
        stress: 2.1,
        movement: 4,
        focus: 4,
        workload: 3.1,
        participationRate: 0.9,
        engagementBias: 0.82,
        challengeBias: 0.88,
        workMode: "HYBRID",
        preferredCategories: ["MOVEMENT", "SOCIAL_WELLBEING"],
        trajectory: "healthy",
        noteTheme: ["balanced day", "protected my schedule", "good team energy"]
      })
    },
    {
      name: "Priya Shah",
      email: "priya@northstar.health",
      role: "ADMIN",
      department: "People Ops",
      title: "HR Admin",
      pattern: basePattern({
        sleep: 3.8,
        stress: 2.7,
        movement: 3.2,
        focus: 3.4,
        workload: 3.2,
        participationRate: 0.72,
        engagementBias: 0.66,
        challengeBias: 0.46,
        workMode: "HYBRID",
        preferredCategories: ["FOCUS", "WORKLOAD_MANAGEMENT"],
        trajectory: "steady",
        noteTheme: ["people operations work", "planning review cycle", "steady admin day"]
      })
    }
  ];

  const departments = ["Engineering", "Care Success", "Operations", "Revenue", "People Ops", "Consulting"];
  const titlesByDepartment: Record<string, string[]> = {
    Engineering: ["Frontend Engineer", "Data Engineer", "QA Engineer", "Product Engineer"],
    "Care Success": ["Care Coordinator", "Member Success Lead", "Program Associate"],
    Operations: ["Operations Analyst", "Workflow Specialist", "Program Manager"],
    Revenue: ["Account Executive", "Customer Strategist", "Partnership Manager"],
    "People Ops": ["People Generalist", "Talent Partner", "Benefits Manager"],
    Consulting: ["Implementation Consultant", "Client Success Consultant", "Strategy Associate"]
  };
  const firstNames = [
    "Avery",
    "Jordan",
    "Noah",
    "Emma",
    "Amir",
    "Leah",
    "Nina",
    "Marcus",
    "Olivia",
    "Sam",
    "Helen",
    "Iris",
    "Omar",
    "Jules",
    "Mina",
    "Carlos",
    "Tara",
    "Ben",
    "Nadia",
    "Evan",
    "Lena",
    "Ravi",
    "Chloe",
    "Kai",
    "Isabel",
    "Theo",
    "Aisha",
    "Jonah"
  ];
  const lastNames = [
    "Brooks",
    "Singh",
    "Reed",
    "Kim",
    "Johnson",
    "Garcia",
    "Martin",
    "Lopez",
    "Walker",
    "Nguyen",
    "Cole",
    "Young",
    "Ramirez",
    "Murphy",
    "Foster",
    "Price",
    "Flores",
    "Ross",
    "Diaz",
    "Cook",
    "Bell",
    "Powell",
    "Kelly",
    "Bailey",
    "Sanders",
    "Ward",
    "Gray",
    "Perry"
  ];

  const generated = firstNames.map((firstName, index) => {
    const lastName = lastNames[index % lastNames.length];
    const department = departments[index % departments.length];
    const title = titlesByDepartment[department][index % titlesByDepartment[department].length];
    const stressBias = 2.4 + seededValue(`${firstName}:${department}:stress`) * 1.8;
    const sleepBias = 2.8 + seededValue(`${firstName}:${department}:sleep`) * 1.4;
    const movementBias = 2.1 + seededValue(`${firstName}:${department}:move`) * 2;
    const focusBias = 2.3 + seededValue(`${firstName}:${department}:focus`) * 1.8;
    const trajectoryRoll = seededValue(`${firstName}:${department}:trajectory`);

    return {
      name: `${firstName} ${lastName}`,
      email: `${firstName.toLowerCase()}.${lastName.toLowerCase()}@northstar.health`,
      role: "EMPLOYEE" as const,
      department,
      title,
      pattern: basePattern({
        sleep: sleepBias,
        stress: stressBias,
        movement: movementBias,
        focus: focusBias,
        workload: 2.7 + seededValue(`${firstName}:${department}:load`) * 1.9,
        participationRate: 0.68 + seededValue(`${firstName}:${department}:participation`) * 0.28,
        engagementBias: 0.32 + seededValue(`${firstName}:${department}:engagement`) * 0.52,
        challengeBias: 0.22 + seededValue(`${firstName}:${department}:challenge`) * 0.6,
        workMode: seededValue(`${firstName}:${department}:mode`) > 0.66 ? "REMOTE" : seededValue(`${firstName}:${department}:mode`) > 0.33 ? "HYBRID" : "ONSITE",
        preferredCategories:
          seededValue(`${firstName}:${department}:pref`) > 0.5
            ? ["MOVEMENT", "FOCUS"]
            : ["RECOVERY", "WORKLOAD_MANAGEMENT"],
        trajectory:
          trajectoryRoll > 0.74 ? "healthy" : trajectoryRoll > 0.46 ? "steady" : trajectoryRoll > 0.22 ? "stagnant" : "burnout",
        noteTheme: [department.toLowerCase(), "full calendar", "steady workload"]
      })
    };
  });

  return [...featured, ...generated];
}

function createOrganization(): Organization {
  return {
    id: organizationId,
    name: "Northstar Health Labs",
    size: 40,
    createdAt: isoWithHour(addDays(now, -120), 9),
    updatedAt: isoWithHour(now, 9)
  };
}

function createUser(blueprint: SeedBlueprint, index: number): User {
  return {
    id: `user_${String(index + 1).padStart(3, "0")}`,
    name: blueprint.name,
    email: blueprint.email,
    role: blueprint.role,
    organizationId,
    department: blueprint.department,
    title: blueprint.title,
    createdAt: isoWithHour(addDays(now, -120 + index), 9),
    updatedAt: isoWithHour(now, 9)
  };
}

function createOnboardingProfile(user: User, pattern: SeedPattern): OnboardingProfile {
  return {
    id: buildId("onboarding", user.id),
    userId: user.id,
    baselineSleep: clamp(Math.round(pattern.sleep), 1, 5),
    baselineStress: clamp(Math.round(pattern.stress), 1, 5),
    baselineMovement: clamp(Math.round(pattern.movement), 1, 5),
    workMode: pattern.workMode,
    preferredNudgeCategories: pattern.preferredCategories,
    challengeOptIn: pattern.challengeBias > 0.3,
    checkInFrequency: pattern.checkInFrequency,
    createdAt: user.createdAt,
    updatedAt: isoWithHour(now, 9)
  };
}

function createPrivacyPreference(user: User, pattern: SeedPattern): PrivacyPreference {
  return {
    id: buildId("privacy", user.id),
    userId: user.id,
    challengeOptIn: pattern.challengeBias > 0.3,
    notesAnalyticsOptIn: pattern.engagementBias > 0.35,
    reminderFrequency: pattern.engagementBias > 0.72 ? "HIGH" : pattern.engagementBias > 0.46 ? "NORMAL" : "LOW",
    dataDeletionRequestedAt: null
  };
}

function scoreForDay(base: number, pattern: SeedPattern, userId: string, dayOffset: number, metric: string) {
  const wave = Math.sin((30 - dayOffset + seededValue(`${userId}:${metric}:wave`) * 10) * 0.42) * 0.55;
  const noise = (seededValue(`${userId}:${metric}:${dayOffset}`) - 0.5) * 1.2;
  let trend = 0;

  if (pattern.trajectory === "burnout") {
    trend = dayOffset < 10 ? 0.45 : dayOffset < 18 ? 0.2 : -0.05;
  }

  if (pattern.trajectory === "healthy") {
    trend = dayOffset < 10 ? -0.25 : -0.05;
  }

  if (pattern.trajectory === "stagnant") {
    trend = metric === "movement" || metric === "focus" ? -0.15 : 0.05;
  }

  return clamp(Math.round(base + wave + noise + trend), 1, 5);
}

function maybeNote(pattern: SeedPattern, userId: string, dayOffset: number) {
  if (seededValue(`${userId}:note:${dayOffset}`) < 0.78) {
    return null;
  }

  const theme = pattern.noteTheme[dayOffset % pattern.noteTheme.length];
  return `Brief note: ${theme}.`; 
}

function buildCheckIns(users: User[], patterns: Map<string, SeedPattern>) {
  const checkIns: CheckIn[] = [];

  users.forEach((user) => {
    const pattern = patterns.get(user.id)!;

    for (let dayOffset = 29; dayOffset >= 0; dayOffset -= 1) {
      const participationRoll = seededValue(`${user.id}:participation:${dayOffset}`);
      if (participationRoll > pattern.participationRate) {
        continue;
      }

      const date = addDays(now, -dayOffset);
      const checkIn: CheckIn = {
        id: buildId("checkin", `${user.id}-${dayOffset}`),
        userId: user.id,
        date: isoWithHour(date, 8),
        sleepScore: scoreForDay(pattern.sleep, pattern, user.id, dayOffset, "sleep"),
        stressScore: scoreForDay(pattern.stress, pattern, user.id, dayOffset, "stress"),
        movementScore: scoreForDay(pattern.movement, pattern, user.id, dayOffset, "movement"),
        focusScore: scoreForDay(pattern.focus, pattern, user.id, dayOffset, "focus"),
        workloadScore: scoreForDay(pattern.workload, pattern, user.id, dayOffset, "workload"),
        optionalNote: maybeNote(pattern, user.id, dayOffset),
        createdAt: isoWithHour(date, 8)
      };

      checkIns.push(checkIn);
    }
  });

  return sortByDate(checkIns, "asc");
}

function buildChallenges(): Challenge[] {
  return [
    {
      id: "challenge_walk",
      organizationId,
      title: "5-day walking streak",
      description: "Log a short walk on five separate workdays.",
      challengeType: "WALKING",
      targetValue: 5,
      startDate: isoWithHour(addDays(now, -4), 9),
      endDate: isoWithHour(addDays(now, 10), 18),
      createdAt: isoWithHour(addDays(now, -8), 9)
    },
    {
      id: "challenge_stretch",
      organizationId,
      title: "Midday stretch challenge",
      description: "Take a stretch reset at least once each day this week.",
      challengeType: "STRETCH",
      targetValue: 7,
      startDate: isoWithHour(addDays(now, -2), 9),
      endDate: isoWithHour(addDays(now, 12), 18),
      createdAt: isoWithHour(addDays(now, -7), 9)
    },
    {
      id: "challenge_shutdown",
      organizationId,
      title: "Digital shutdown reset",
      description: "Practice a workday shutdown routine five times.",
      challengeType: "SHUTDOWN",
      targetValue: 5,
      startDate: isoWithHour(addDays(now, -1), 9),
      endDate: isoWithHour(addDays(now, 13), 18),
      createdAt: isoWithHour(addDays(now, -6), 9)
    }
  ];
}

function buildParticipations(
  users: User[],
  challenges: Challenge[],
  patterns: Map<string, SeedPattern>
): ChallengeParticipation[] {
  const participations: ChallengeParticipation[] = [];

  users.forEach((user) => {
    if (user.role === "ADMIN") {
      return;
    }

    const pattern = patterns.get(user.id)!;

    challenges.forEach((challenge) => {
      const joinRoll = seededValue(`${user.id}:${challenge.id}:join`);
      if (joinRoll > pattern.challengeBias) {
        return;
      }

      const progressBase = seededValue(`${user.id}:${challenge.id}:progress`) * challenge.targetValue;
      const progressBoost = pattern.engagementBias * challenge.targetValue * 0.65;
      const progressValue = clamp(Math.round(progressBase + progressBoost), 0, challenge.targetValue);
      participations.push({
        id: buildId("challenge-participation", `${challenge.id}-${user.id}`),
        challengeId: challenge.id,
        userId: user.id,
        progressValue,
        joinedAt: isoWithHour(addDays(challenge.startDate, 0), 10),
        completedAt: progressValue >= challenge.targetValue ? isoWithHour(addDays(now, -1), 16) : null
      });
    });
  });

  return participations;
}

function recommendationOutcome(pattern: SeedPattern, key: string, isLatest: boolean) {
  if (isLatest) {
    return { status: "ACTIVE" as const, completedAt: null, dismissedAt: null, snoozedUntil: null };
  }

  const roll = seededValue(key) + pattern.engagementBias * 0.25;

  if (roll > 0.82) {
    return {
      status: "COMPLETED" as const,
      completedAt: isoWithHour(addDays(now, -1), 17),
      dismissedAt: null,
      snoozedUntil: null
    };
  }

  if (roll > 0.56) {
    return {
      status: "SNOOZED" as const,
      completedAt: null,
      dismissedAt: null,
      snoozedUntil: isoWithHour(addDays(now, 1), 10)
    };
  }

  return {
    status: "DISMISSED" as const,
    completedAt: null,
    dismissedAt: isoWithHour(addDays(now, -1), 15),
    snoozedUntil: null
  };
}

function buildRecommendationsAndSnapshots(
  users: User[],
  profiles: OnboardingProfile[],
  checkIns: CheckIn[],
  participations: ChallengeParticipation[],
  patterns: Map<string, SeedPattern>
) {
  const recommendations: Recommendation[] = [];
  const snapshots: WellnessSnapshot[] = [];

  users.forEach((user) => {
    const profile = profiles.find((item) => item.userId === user.id) ?? null;
    const userCheckIns = sortByDate(
      checkIns.filter((checkIn) => checkIn.userId === user.id),
      "asc"
    );
    const userParticipations = participations.filter((item) => item.userId === user.id);
    const userPattern = patterns.get(user.id)!;
    const anchors = [
      Math.max(userCheckIns.length - 12, 0),
      Math.max(userCheckIns.length - 8, 0),
      Math.max(userCheckIns.length - 4, 0),
      Math.max(userCheckIns.length - 1, 0)
    ].filter((value, index, list) => list.indexOf(value) === index && userCheckIns[value]);
    const userHistory: Recommendation[] = [];

    anchors.forEach((anchor, index) => {
      const scopedCheckIns = userCheckIns.slice(0, anchor + 1);
      const context: RecommendationContext = {
        user,
        profile,
        checkIns: scopedCheckIns,
        history: userHistory,
        challengeParticipations: userParticipations
      };
      const pack = generateRecommendationPack(context);
      const generatedAt = isoWithHour(scopedCheckIns[scopedCheckIns.length - 1].date, 7);
      const outcome = recommendationOutcome(userPattern, `${user.id}:${anchor}:outcome`, index === anchors.length - 1);
      const recommendation: Recommendation = {
        id: buildId("recommendation", `${user.id}-${index}`),
        userId: user.id,
        category: pack.primary.category,
        title: pack.primary.title,
        description: pack.primary.description,
        explanation: pack.primary.explanation,
        reasonCode: pack.primary.reasonCode,
        effortLevel: pack.primary.effortLevel,
        priority: pack.primary.priority,
        completionCta: pack.primary.completionCta,
        status: outcome.status,
        generatedAt,
        completedAt: outcome.completedAt,
        dismissedAt: outcome.dismissedAt,
        snoozedUntil: outcome.snoozedUntil
      };

      userHistory.push(recommendation);
      recommendations.push(recommendation);
    });

    userCheckIns.forEach((checkIn, index) => {
      const scopedCheckIns = userCheckIns.slice(0, index + 1);
      const scopedRecommendations = userHistory.filter(
        (recommendation) => new Date(recommendation.generatedAt).getTime() <= new Date(checkIn.date).getTime()
      );
      const scores = calculateWellnessScores(scopedCheckIns, scopedRecommendations, userParticipations);

      snapshots.push({
        id: buildId("snapshot", `${user.id}-${index}`),
        userId: user.id,
        date: checkIn.date,
        burnoutRiskScore: scores.burnoutRiskScore,
        recoveryScore: scores.recoveryScore,
        engagementScore: scores.engagementScore,
        consistencyScore: scores.consistencyScore,
        createdAt: checkIn.createdAt
      });
    });
  });

  return { recommendations, snapshots };
}

function buildAnalyticsEvents(
  users: User[],
  checkIns: CheckIn[],
  recommendations: Recommendation[],
  participations: ChallengeParticipation[]
): AnalyticsEvent[] {
  const events: AnalyticsEvent[] = [];

  users.forEach((user) => {
    const userCheckIns = sortByDate(
      checkIns.filter((checkIn) => checkIn.userId === user.id),
      "desc"
    ).slice(0, 6);
    userCheckIns.forEach((checkIn) => {
      events.push({
        id: buildId("event", `${user.id}-${checkIn.id}`),
        userId: user.id,
        organizationId,
        eventType: "submitted_checkin",
        metadata: { date: checkIn.date },
        createdAt: checkIn.createdAt
      });
    });

    recommendations
      .filter((recommendation) => recommendation.userId === user.id)
      .forEach((recommendation) => {
        events.push({
          id: buildId("event", `${user.id}-${recommendation.id}-view`),
          userId: user.id,
          organizationId,
          eventType: "viewed_recommendation",
          metadata: { recommendationId: recommendation.id, category: recommendation.category },
          createdAt: recommendation.generatedAt
        });

        if (recommendation.status === "COMPLETED") {
          events.push({
            id: buildId("event", `${user.id}-${recommendation.id}-complete`),
            userId: user.id,
            organizationId,
            eventType: "completed_recommendation",
            metadata: { recommendationId: recommendation.id },
            createdAt: recommendation.completedAt ?? recommendation.generatedAt
          });
        }

        if (recommendation.status === "DISMISSED") {
          events.push({
            id: buildId("event", `${user.id}-${recommendation.id}-dismiss`),
            userId: user.id,
            organizationId,
            eventType: "dismissed_recommendation",
            metadata: { recommendationId: recommendation.id },
            createdAt: recommendation.dismissedAt ?? recommendation.generatedAt
          });
        }
      });

    participations
      .filter((participation) => participation.userId === user.id)
      .forEach((participation) => {
        events.push({
          id: buildId("event", `${user.id}-${participation.id}-join`),
          userId: user.id,
          organizationId,
          eventType: "joined_challenge",
          metadata: { challengeId: participation.challengeId, progress: participation.progressValue },
          createdAt: participation.joinedAt
        });
      });
  });

  events.push({
    id: "event_admin_dashboard_seed",
    userId: "user_004",
    organizationId,
    eventType: "viewed_admin_dashboard",
    metadata: { seeded: true },
    createdAt: isoWithHour(now, 9)
  });

  return sortByDate(events, "asc");
}

export function buildSeedStore(): PulseStore {
  const organization = createOrganization();
  const blueprints = createBlueprints();
  const users = blueprints.map(createUser);
  const patterns = new Map(users.map((user, index) => [user.id, blueprints[index].pattern]));
  const onboardingProfiles = users.map((user) => createOnboardingProfile(user, patterns.get(user.id)!));
  const privacyPreferences = users.map((user) => createPrivacyPreference(user, patterns.get(user.id)!));
  const checkIns = buildCheckIns(users, patterns);
  const challenges = buildChallenges();
  const challengeParticipations = buildParticipations(users, challenges, patterns);
  const { recommendations, snapshots } = buildRecommendationsAndSnapshots(
    users,
    onboardingProfiles,
    checkIns,
    challengeParticipations,
    patterns
  );
  const analyticsEvents = buildAnalyticsEvents(users, checkIns, recommendations, challengeParticipations);

  return {
    organizations: [organization],
    users,
    onboardingProfiles,
    checkIns,
    wellnessSnapshots: snapshots,
    recommendations,
    challenges,
    challengeParticipations,
    analyticsEvents,
    privacyPreferences
  };
}
