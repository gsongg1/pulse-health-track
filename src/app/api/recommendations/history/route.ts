import { NextResponse } from "next/server";
import { apiError, requireApiUserId } from "@/app/api/helpers";
import { getRecommendationHistory } from "@/server/services/pulse-service";

export async function GET() {
  try {
    const userId = await requireApiUserId();
    return NextResponse.json(getRecommendationHistory(userId));
  } catch (error) {
    return apiError(error);
  }
}
