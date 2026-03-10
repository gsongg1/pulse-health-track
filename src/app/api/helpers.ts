import { NextResponse } from "next/server";
import { getSessionUserId } from "@/lib/auth/session";

export async function requireApiUserId() {
  const userId = await getSessionUserId();
  if (!userId) {
    throw new Error("Unauthorized");
  }

  return userId;
}

export function apiError(error: unknown) {
  const message = error instanceof Error ? error.message : "Unexpected error";
  const status = message === "Unauthorized" ? 401 : message === "Recommendation not found." ? 404 : 400;
  return NextResponse.json({ error: message }, { status });
}
