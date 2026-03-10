import { NextResponse } from "next/server";
import { apiError, requireApiUserId } from "@/app/api/helpers";
import { leaveChallenge } from "@/server/services/pulse-service";

export async function POST(_request: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const userId = await requireApiUserId();
    const { id } = await params;
    leaveChallenge(userId, id);
    return NextResponse.json({ ok: true });
  } catch (error) {
    return apiError(error);
  }
}
