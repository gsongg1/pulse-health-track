import { PrismaClient } from "@prisma/client";
import { buildSeedStore } from "../src/lib/demo-data";

const prisma = new PrismaClient();

async function main() {
  const store = buildSeedStore();
  const organization = store.organizations[0];

  await prisma.challengeParticipation.deleteMany();
  await prisma.recommendation.deleteMany();
  await prisma.wellnessSnapshot.deleteMany();
  await prisma.checkIn.deleteMany();
  await prisma.analyticsEvent.deleteMany();
  await prisma.privacyPreference.deleteMany();
  await prisma.onboardingProfile.deleteMany();
  await prisma.challenge.deleteMany();
  await prisma.user.deleteMany();
  await prisma.organization.deleteMany();

  await prisma.organization.create({
    data: {
      id: organization.id,
      name: organization.name,
      size: organization.size,
      createdAt: new Date(organization.createdAt),
      updatedAt: new Date(organization.updatedAt)
    }
  });

  for (const user of store.users) {
    await prisma.user.create({
      data: {
        id: user.id,
        name: user.name,
        email: user.email,
        role: user.role,
        organizationId: user.organizationId,
        department: user.department,
        title: user.title,
        createdAt: new Date(user.createdAt),
        updatedAt: new Date(user.updatedAt)
      }
    });
  }

  for (const profile of store.onboardingProfiles) {
    await prisma.onboardingProfile.create({
      data: {
        id: profile.id,
        userId: profile.userId,
        baselineSleep: profile.baselineSleep,
        baselineStress: profile.baselineStress,
        baselineMovement: profile.baselineMovement,
        workMode: profile.workMode,
        preferredNudgeCategories: profile.preferredNudgeCategories as any,
        challengeOptIn: profile.challengeOptIn,
        checkInFrequency: profile.checkInFrequency,
        createdAt: new Date(profile.createdAt),
        updatedAt: new Date(profile.updatedAt)
      }
    });
  }

  for (const preference of store.privacyPreferences) {
    await prisma.privacyPreference.create({
      data: {
        id: preference.id,
        userId: preference.userId,
        challengeOptIn: preference.challengeOptIn,
        notesAnalyticsOptIn: preference.notesAnalyticsOptIn,
        reminderFrequency: preference.reminderFrequency,
        dataDeletionRequestedAt: preference.dataDeletionRequestedAt ? new Date(preference.dataDeletionRequestedAt) : null
      }
    });
  }

  for (const challenge of store.challenges) {
    await prisma.challenge.create({
      data: {
        id: challenge.id,
        organizationId: challenge.organizationId,
        title: challenge.title,
        description: challenge.description,
        challengeType: challenge.challengeType,
        targetValue: challenge.targetValue,
        startDate: new Date(challenge.startDate),
        endDate: new Date(challenge.endDate),
        createdAt: new Date(challenge.createdAt)
      }
    });
  }

  for (const checkIn of store.checkIns) {
    await prisma.checkIn.create({
      data: {
        id: checkIn.id,
        userId: checkIn.userId,
        date: new Date(checkIn.date),
        sleepScore: checkIn.sleepScore,
        stressScore: checkIn.stressScore,
        movementScore: checkIn.movementScore,
        focusScore: checkIn.focusScore,
        workloadScore: checkIn.workloadScore,
        optionalNote: checkIn.optionalNote,
        createdAt: new Date(checkIn.createdAt)
      }
    });
  }

  for (const snapshot of store.wellnessSnapshots) {
    await prisma.wellnessSnapshot.create({
      data: {
        id: snapshot.id,
        userId: snapshot.userId,
        date: new Date(snapshot.date),
        burnoutRiskScore: snapshot.burnoutRiskScore,
        recoveryScore: snapshot.recoveryScore,
        engagementScore: snapshot.engagementScore,
        consistencyScore: snapshot.consistencyScore,
        createdAt: new Date(snapshot.createdAt)
      }
    });
  }

  for (const recommendation of store.recommendations) {
    await prisma.recommendation.create({
      data: {
        id: recommendation.id,
        userId: recommendation.userId,
        category: recommendation.category,
        title: recommendation.title,
        description: recommendation.description,
        explanation: recommendation.explanation,
        reasonCode: recommendation.reasonCode,
        effortLevel: recommendation.effortLevel,
        status: recommendation.status,
        priority: recommendation.priority,
        completionCta: recommendation.completionCta,
        generatedAt: new Date(recommendation.generatedAt),
        completedAt: recommendation.completedAt ? new Date(recommendation.completedAt) : null,
        dismissedAt: recommendation.dismissedAt ? new Date(recommendation.dismissedAt) : null,
        snoozedUntil: recommendation.snoozedUntil ? new Date(recommendation.snoozedUntil) : null
      }
    });
  }

  for (const participation of store.challengeParticipations) {
    await prisma.challengeParticipation.create({
      data: {
        id: participation.id,
        challengeId: participation.challengeId,
        userId: participation.userId,
        progressValue: participation.progressValue,
        joinedAt: new Date(participation.joinedAt),
        completedAt: participation.completedAt ? new Date(participation.completedAt) : null
      }
    });
  }

  for (const event of store.analyticsEvents) {
    await prisma.analyticsEvent.create({
      data: {
        id: event.id,
        userId: event.userId,
        organizationId: event.organizationId,
        eventType: event.eventType,
        metadata: event.metadata as any,
        createdAt: new Date(event.createdAt)
      }
    });
  }
}

main()
  .then(async () => {
    await prisma.$disconnect();
  })
  .catch(async (error) => {
    console.error(error);
    await prisma.$disconnect();
    process.exit(1);
  });



