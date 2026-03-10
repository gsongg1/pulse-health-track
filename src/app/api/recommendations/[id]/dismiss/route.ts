import { NextResponse } from "next/server";
import { apiError, requireApiUserId } from "@/app/api/helpers";
import { updateRecommendationStatus } from "@/server/services/pulse-service";

export async function POST(_request: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const userId = await requireApiUserId();
    const { id } = await params;
    return NextResponse.json(updateRecommendationStatus(userId, id, "DISMISSED"));
  } catch (error) {
    return apiError(error);
  }
}
