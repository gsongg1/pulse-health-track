import { NextResponse } from "next/server";
import { apiError, requireApiUserId } from "@/app/api/helpers";
import { challengeProgressSchema } from "@/lib/validation";
import { updateChallengeProgress } from "@/server/services/pulse-service";

export async function POST(request: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const userId = await requireApiUserId();
    const { id } = await params;
    const body = await request.json();
    const parsed = challengeProgressSchema.parse(body);
    return NextResponse.json(updateChallengeProgress(userId, id, parsed.progressValue));
  } catch (error) {
    return apiError(error);
  }
}
