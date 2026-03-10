import { buildSeedStore } from "@/lib/demo-data";
import type { PulseStore } from "@/lib/types";

declare global {
  var __pulseStore: PulseStore | undefined;
}

export function getStore() {
  if (!global.__pulseStore) {
    global.__pulseStore = buildSeedStore();
  }

  return global.__pulseStore;
}

export function resetStore() {
  global.__pulseStore = buildSeedStore();
  return global.__pulseStore;
}
