import { NextResponse } from "next/server";
import { apiError, requireApiUserId } from "@/app/api/helpers";
import { requestDataDeletion } from "@/server/services/pulse-service";

export async function POST() {
  try {
    const userId = await requireApiUserId();
    return NextResponse.json(requestDataDeletion(userId));
  } catch (error) {
    return apiError(error);
  }
}
