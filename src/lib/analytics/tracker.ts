import type { AnalyticsEventType, PulseStore } from "@/lib/types";

interface EventInput {
  userId: string | null;
  organizationId: string | null;
  eventType: AnalyticsEventType;
  metadata?: Record<string, unknown>;
}

export function recordAnalyticsEvent(store: PulseStore, input: EventInput) {
  store.analyticsEvents.push({
    id: `event_${crypto.randomUUID()}`,
    userId: input.userId,
    organizationId: input.organizationId,
    eventType: input.eventType,
    metadata: input.metadata ?? {},
    createdAt: new Date().toISOString()
  });
}
