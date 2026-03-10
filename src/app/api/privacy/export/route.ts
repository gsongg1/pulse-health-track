import { NextResponse } from "next/server";
import { apiError, requireApiUserId } from "@/app/api/helpers";
import { exportUserData } from "@/server/services/pulse-service";

export async function POST() {
  try {
    const userId = await requireApiUserId();
    return NextResponse.json(exportUserData(userId));
  } catch (error) {
    return apiError(error);
  }
}
