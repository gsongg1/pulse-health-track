import { NextResponse } from "next/server";
import { apiError, requireApiUserId } from "@/app/api/helpers";
import { checkInSchema } from "@/lib/validation";
import { getCheckInHistory, submitCheckIn } from "@/server/services/pulse-service";

export async function GET() {
  try {
    const userId = await requireApiUserId();
    return NextResponse.json(getCheckInHistory(userId));
  } catch (error) {
    return apiError(error);
  }
}

export async function POST(request: Request) {
  try {
    const userId = await requireApiUserId();
    const body = await request.json();
    const parsed = checkInSchema.parse(body);
    return NextResponse.json(submitCheckIn(userId, parsed));
  } catch (error) {
    return apiError(error);
  }
}
