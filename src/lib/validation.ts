import { z } from "zod";

const scoreField = z.coerce.number().int().min(1).max(5);

export const signInSchema = z.object({
  userId: z.string().min(1, "Choose a demo account.")
});

export const signUpSchema = z.object({
  name: z.string().min(2).max(80),
  email: z.string().email(),
  department: z.string().min(2).max(80),
  workMode: z.enum(["REMOTE", "HYBRID", "ONSITE"]),
  checkInFrequency: z.enum(["DAILY", "WEEKLY"])
});

export const onboardingSchema = z.object({
  baselineSleep: scoreField,
  baselineStress: scoreField,
  baselineMovement: scoreField,
  workMode: z.enum(["REMOTE", "HYBRID", "ONSITE"]),
  challengeOptIn: z.coerce.boolean(),
  checkInFrequency: z.enum(["DAILY", "WEEKLY"]),
  preferredNudgeCategories: z
    .array(
      z.enum([
        "MOVEMENT",
        "RECOVERY",
        "FOCUS",
        "SLEEP_HYGIENE",
        "STRESS_REGULATION",
        "WORKLOAD_MANAGEMENT",
        "SOCIAL_WELLBEING",
        "SUPPORT_RESOURCES"
      ])
    )
    .min(1)
    .max(4)
});

export const checkInSchema = z.object({
  sleepScore: scoreField,
  stressScore: scoreField,
  movementScore: scoreField,
  focusScore: scoreField,
  workloadScore: scoreField,
  optionalNote: z.string().trim().max(280).optional().or(z.literal("")),
  date: z.string().optional()
});

export const privacyPreferenceSchema = z.object({
  challengeOptIn: z.coerce.boolean(),
  notesAnalyticsOptIn: z.coerce.boolean(),
  reminderFrequency: z.enum(["LOW", "NORMAL", "HIGH"])
});

export const challengeProgressSchema = z.object({
  progressValue: z.coerce.number().min(0).max(100)
});

export const recommendationActionSchema = z.object({
  id: z.string().min(1)
});

export const profileUpdateSchema = z.object({
  name: z.string().min(2).max(80),
  department: z.string().min(2).max(80)
});

export const adminFilterSchema = z.object({
  range: z.enum(["7d", "30d", "90d"]).default("30d"),
  department: z.string().default("ALL")
});
