import { NextResponse } from "next/server";
import { apiError, requireApiUserId } from "@/app/api/helpers";
import { joinChallenge } from "@/server/services/pulse-service";

export async function POST(_request: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const userId = await requireApiUserId();
    const { id } = await params;
    return NextResponse.json(joinChallenge(userId, id));
  } catch (error) {
    return apiError(error);
  }
}
