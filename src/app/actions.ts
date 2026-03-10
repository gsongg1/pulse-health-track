"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { clearSessionUserId, getSessionUserId, setSessionUserId } from "@/lib/auth/session";
import {
  adminFilterSchema,
  challengeProgressSchema,
  checkInSchema,
  onboardingSchema,
  privacyPreferenceSchema,
  profileUpdateSchema,
  recommendationActionSchema,
  signInSchema,
  signUpSchema
} from "@/lib/validation";
import {
  createEmployee,
  exportUserData,
  getViewer,
  joinChallenge,
  leaveChallenge,
  requestDataDeletion,
  submitCheckIn,
  submitOnboarding,
  updateChallengeProgress,
  updatePrivacyPreferences,
  updateProfile,
  updateRecommendationStatus
} from "@/server/services/pulse-service";

async function requireSessionUser() {
  const userId = await getSessionUserId();
  if (!userId) {
    redirect("/sign-in");
  }

  return userId;
}

function redirectAfterAuth(userId: string) {
  const viewer = getViewer(userId);
  if (viewer.user.role === "ADMIN" || viewer.user.role === "MANAGER") {
    redirect("/admin/dashboard");
  }

  if (!viewer.profile) {
    redirect("/invite");
  }

  redirect("/app/dashboard");
}

export async function signInAction(formData: FormData) {
  const parsed = signInSchema.parse({
    userId: formData.get("userId")
  });

  await setSessionUserId(parsed.userId);
  redirectAfterAuth(parsed.userId);
}

export async function signUpAction(formData: FormData) {
  const parsed = signUpSchema.parse({
    name: formData.get("name"),
    email: formData.get("email"),
    department: formData.get("department"),
    workMode: formData.get("workMode"),
    checkInFrequency: formData.get("checkInFrequency")
  });

  const user = createEmployee(parsed);
  await setSessionUserId(user.id);
  redirect("/invite");
}

export async function signOutAction() {
  await clearSessionUserId();
  redirect("/");
}

export async function submitOnboardingAction(formData: FormData) {
  const userId = await requireSessionUser();
  const parsed = onboardingSchema.parse({
    baselineSleep: formData.get("baselineSleep"),
    baselineStress: formData.get("baselineStress"),
    baselineMovement: formData.get("baselineMovement"),
    workMode: formData.get("workMode"),
    challengeOptIn: formData.get("challengeOptIn"),
    checkInFrequency: formData.get("checkInFrequency"),
    preferredNudgeCategories: formData.getAll("preferredNudgeCategories")
  });

  submitOnboarding(userId, parsed);
  revalidatePath("/invite");
  revalidatePath("/app/dashboard");
  redirect("/app/dashboard");
}

export async function submitCheckInAction(formData: FormData) {
  const userId = await requireSessionUser();
  const parsed = checkInSchema.parse({
    sleepScore: formData.get("sleepScore"),
    stressScore: formData.get("stressScore"),
    movementScore: formData.get("movementScore"),
    focusScore: formData.get("focusScore"),
    workloadScore: formData.get("workloadScore"),
    optionalNote: formData.get("optionalNote"),
    date: formData.get("date")
  });

  submitCheckIn(userId, parsed);
  revalidatePath("/app/dashboard");
  revalidatePath("/app/check-in");
  revalidatePath("/app/recommendations");
  revalidatePath("/app/history");
  redirect("/app/dashboard");
}

export async function completeRecommendationAction(formData: FormData) {
  const userId = await requireSessionUser();
  const parsed = recommendationActionSchema.parse({ id: formData.get("id") });
  updateRecommendationStatus(userId, parsed.id, "COMPLETED");
  revalidatePath("/app/dashboard");
  revalidatePath("/app/recommendations");
  revalidatePath("/app/history");
}

export async function snoozeRecommendationAction(formData: FormData) {
  const userId = await requireSessionUser();
  const parsed = recommendationActionSchema.parse({ id: formData.get("id") });
  updateRecommendationStatus(userId, parsed.id, "SNOOZED");
  revalidatePath("/app/dashboard");
  revalidatePath("/app/recommendations");
}

export async function dismissRecommendationAction(formData: FormData) {
  const userId = await requireSessionUser();
  const parsed = recommendationActionSchema.parse({ id: formData.get("id") });
  updateRecommendationStatus(userId, parsed.id, "DISMISSED");
  revalidatePath("/app/dashboard");
  revalidatePath("/app/recommendations");
  revalidatePath("/app/history");
}

export async function joinChallengeAction(formData: FormData) {
  const userId = await requireSessionUser();
  const parsed = recommendationActionSchema.parse({ id: formData.get("id") });
  joinChallenge(userId, parsed.id);
  revalidatePath("/app/challenges");
  revalidatePath("/app/dashboard");
}

export async function leaveChallengeAction(formData: FormData) {
  const userId = await requireSessionUser();
  const parsed = recommendationActionSchema.parse({ id: formData.get("id") });
  leaveChallenge(userId, parsed.id);
  revalidatePath("/app/challenges");
  revalidatePath("/app/dashboard");
}

export async function updateChallengeProgressAction(formData: FormData) {
  const userId = await requireSessionUser();
  const recommendationInput = recommendationActionSchema.parse({ id: formData.get("id") });
  const progressInput = challengeProgressSchema.parse({ progressValue: formData.get("progressValue") });
  updateChallengeProgress(userId, recommendationInput.id, progressInput.progressValue);
  revalidatePath("/app/challenges");
  revalidatePath("/app/dashboard");
}

export async function updateProfileAction(formData: FormData) {
  const userId = await requireSessionUser();
  const parsed = profileUpdateSchema.parse({
    name: formData.get("name"),
    department: formData.get("department")
  });
  updateProfile(userId, parsed);
  revalidatePath("/app/profile");
  revalidatePath("/app/dashboard");
}

export async function updatePrivacyAction(formData: FormData) {
  const userId = await requireSessionUser();
  const parsed = privacyPreferenceSchema.parse({
    challengeOptIn: formData.get("challengeOptIn"),
    notesAnalyticsOptIn: formData.get("notesAnalyticsOptIn"),
    reminderFrequency: formData.get("reminderFrequency")
  });
  updatePrivacyPreferences(userId, parsed);
  revalidatePath("/app/privacy");
  revalidatePath("/app/dashboard");
}

export async function requestDataExportAction() {
  const userId = await requireSessionUser();
  exportUserData(userId);
  revalidatePath("/app/privacy");
  redirect("/app/privacy?exported=1");
}

export async function requestDataDeletionAction() {
  const userId = await requireSessionUser();
  requestDataDeletion(userId);
  revalidatePath("/app/privacy");
  redirect("/app/privacy?deletion=1");
}
