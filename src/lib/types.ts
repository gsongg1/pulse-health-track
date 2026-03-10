export type Role = "EMPLOYEE" | "ADMIN" | "MANAGER";
export type WorkMode = "REMOTE" | "HYBRID" | "ONSITE";
export type CheckInFrequency = "DAILY" | "WEEKLY";
export type NudgeCategory =
  | "MOVEMENT"
  | "RECOVERY"
  | "FOCUS"
  | "SLEEP_HYGIENE"
  | "STRESS_REGULATION"
  | "WORKLOAD_MANAGEMENT"
  | "SOCIAL_WELLBEING"
  | "SUPPORT_RESOURCES";
export type EffortLevel = "LOW" | "MEDIUM" | "HIGH";
export type RecommendationStatus = "ACTIVE" | "COMPLETED" | "SNOOZED" | "DISMISSED";
export type ChallengeType = "WALKING" | "HYDRATION" | "STRETCH" | "SHUTDOWN" | "MINDFUL_MINUTE";
export type ReminderFrequency = "LOW" | "NORMAL" | "HIGH";
export type AnalyticsEventType =
  | "signed_up"
  | "completed_onboarding"
  | "submitted_checkin"
  | "viewed_recommendation"
  | "completed_recommendation"
  | "snoozed_recommendation"
  | "dismissed_recommendation"
  | "joined_challenge"
  | "completed_challenge_action"
  | "viewed_admin_dashboard"
  | "requested_data_export"
  | "requested_data_deletion";

export interface Organization {
  id: string;
  name: string;
  size: number;
  createdAt: string;
  updatedAt: string;
}

export interface User {
  id: string;
  name: string;
  email: string;
  role: Role;
  organizationId: string;
  department: string;
  title: string;
  createdAt: string;
  updatedAt: string;
}

export interface OnboardingProfile {
  id: string;
  userId: string;
  baselineSleep: number;
  baselineStress: number;
  baselineMovement: number;
  workMode: WorkMode;
  preferredNudgeCategories: NudgeCategory[];
  challengeOptIn: boolean;
  checkInFrequency: CheckInFrequency;
  createdAt: string;
  updatedAt: string;
}

export interface CheckIn {
  id: string;
  userId: string;
  date: string;
  sleepScore: number;
  stressScore: number;
  movementScore: number;
  focusScore: number;
  workloadScore: number;
  optionalNote: string | null;
  createdAt: string;
}

export interface WellnessSnapshot {
  id: string;
  userId: string;
  date: string;
  burnoutRiskScore: number;
  recoveryScore: number;
  engagementScore: number;
  consistencyScore: number;
  createdAt: string;
}

export interface Recommendation {
  id: string;
  userId: string;
  category: NudgeCategory;
  title: string;
  description: string;
  explanation: string;
  reasonCode: string;
  effortLevel: EffortLevel;
  priority: number;
  completionCta: string;
  status: RecommendationStatus;
  generatedAt: string;
  completedAt: string | null;
  dismissedAt: string | null;
  snoozedUntil: string | null;
}

export interface Challenge {
  id: string;
  organizationId: string;
  title: string;
  description: string;
  challengeType: ChallengeType;
  targetValue: number;
  startDate: string;
  endDate: string;
  createdAt: string;
}

export interface ChallengeParticipation {
  id: string;
  challengeId: string;
  userId: string;
  progressValue: number;
  joinedAt: string;
  completedAt: string | null;
}

export interface AnalyticsEvent {
  id: string;
  userId: string | null;
  organizationId: string | null;
  eventType: AnalyticsEventType;
  metadata: Record<string, unknown>;
  createdAt: string;
}

export interface PrivacyPreference {
  id: string;
  userId: string;
  challengeOptIn: boolean;
  notesAnalyticsOptIn: boolean;
  reminderFrequency: ReminderFrequency;
  dataDeletionRequestedAt: string | null;
}

export interface WellnessScores {
  burnoutRiskScore: number;
  recoveryScore: number;
  engagementScore: number;
  consistencyScore: number;
}

export interface TrendPoint {
  date: string;
  sleep: number;
  stress: number;
  focus: number;
  workload: number;
  movement: number;
}

export interface DashboardMetric {
  label: string;
  value: string;
  detail: string;
  tone?: "default" | "positive" | "warning";
}

export interface AdminOverview {
  selectedDepartment: string;
  departments: Array<{ name: string; count: number; isSuppressed: boolean }>;
  isSuppressed: boolean;
  suppressionReason: string | null;
  userCount: number;
  metricCards: DashboardMetric[];
  wellbeingTrends: Array<{ date: string; stress: number; sleep: number; focus: number }>;
  burnoutBuckets: Array<{ name: string; value: number }>;
  challengeStats: Array<{
    id: string;
    title: string;
    participationRate: number;
    completionRate: number;
    averageProgress: number;
  }>;
  privacySummary: {
    dataExportsRequested: number;
    deletionRequests: number;
    notesOptOutRate: number;
    challengeOptOutRate: number;
  };
}

export interface EmployeeDashboardData {
  user: User;
  organization: Organization;
  profile: OnboardingProfile | null;
  privacyPreference: PrivacyPreference;
  latestSnapshot: WellnessSnapshot | null;
  currentRecommendation: Recommendation | null;
  recommendationHistory: Recommendation[];
  trendPoints: TrendPoint[];
  streakCount: number;
  activeChallengeProgress: Array<{
    challenge: Challenge;
    participation: ChallengeParticipation | null;
    participants: number;
    completionRate: number;
  }>;
  recentCheckIns: CheckIn[];
  recentCompletedActions: Recommendation[];
}

export interface PulseStore {
  organizations: Organization[];
  users: User[];
  onboardingProfiles: OnboardingProfile[];
  checkIns: CheckIn[];
  wellnessSnapshots: WellnessSnapshot[];
  recommendations: Recommendation[];
  challenges: Challenge[];
  challengeParticipations: ChallengeParticipation[];
  analyticsEvents: AnalyticsEvent[];
  privacyPreferences: PrivacyPreference[];
}
