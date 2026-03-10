import type {
  CheckIn,
  ChallengeParticipation,
  EffortLevel,
  NudgeCategory,
  OnboardingProfile,
  Recommendation,
  User,
  WellnessScores
} from "@/lib/types";

export interface RecommendationContext {
  user: User;
  profile: OnboardingProfile | null;
  checkIns: CheckIn[];
  history: Recommendation[];
  challengeParticipations?: ChallengeParticipation[];
  now?: Date;
}

export interface RecommendationCandidate {
  category: NudgeCategory;
  title: string;
  description: string;
  explanation: string;
  reasonCode: string;
  priority: number;
  effortLevel: EffortLevel;
  completionCta: string;
}

export interface RecommendationPack {
  primary: RecommendationCandidate;
  secondary: RecommendationCandidate[];
  scores: WellnessScores;
}

export type RecommendationRule = (context: RecommendationContext) => RecommendationCandidate[];
