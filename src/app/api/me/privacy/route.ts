import { NextResponse } from "next/server";
import { apiError, requireApiUserId } from "@/app/api/helpers";
import { privacyPreferenceSchema } from "@/lib/validation";
import { getViewer, updatePrivacyPreferences } from "@/server/services/pulse-service";

export async function GET() {
  try {
    const userId = await requireApiUserId();
    return NextResponse.json(getViewer(userId).privacyPreference);
  } catch (error) {
    return apiError(error);
  }
}

export async function PATCH(request: Request) {
  try {
    const userId = await requireApiUserId();
    const body = await request.json();
    const parsed = privacyPreferenceSchema.parse(body);
    return NextResponse.json(updatePrivacyPreferences(userId, parsed));
  } catch (error) {
    return apiError(error);
  }
}
