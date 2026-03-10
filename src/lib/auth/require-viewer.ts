import { redirect } from "next/navigation";
import { getSessionUserId } from "@/lib/auth/session";
import { getViewer } from "@/server/services/pulse-service";

export async function requireViewer() {
  const userId = await getSessionUserId();
  if (!userId) {
    redirect("/sign-in");
  }

  return getViewer(userId);
}

export async function requireSessionId() {
  const userId = await getSessionUserId();
  if (!userId) {
    redirect("/sign-in");
  }

  return userId;
}
