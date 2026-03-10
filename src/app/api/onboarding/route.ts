import { NextResponse } from "next/server";
import { apiError, requireApiUserId } from "@/app/api/helpers";
import { onboardingSchema } from "@/lib/validation";
import { getViewer, submitOnboarding } from "@/server/services/pulse-service";

export async function GET() {
  try {
    const userId = await requireApiUserId();
    return NextResponse.json(getViewer(userId).profile);
  } catch (error) {
    return apiError(error);
  }
}

export async function POST(request: Request) {
  try {
    const userId = await requireApiUserId();
    const body = await request.json();
    const parsed = onboardingSchema.parse(body);
    return NextResponse.json(submitOnboarding(userId, parsed));
  } catch (error) {
    return apiError(error);
  }
}
