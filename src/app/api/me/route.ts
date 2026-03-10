import { NextResponse } from "next/server";
import { apiError, requireApiUserId } from "@/app/api/helpers";
import { profileUpdateSchema } from "@/lib/validation";
import { getViewer, updateProfile } from "@/server/services/pulse-service";

export async function GET() {
  try {
    const userId = await requireApiUserId();
    return NextResponse.json(getViewer(userId));
  } catch (error) {
    return apiError(error);
  }
}

export async function PATCH(request: Request) {
  try {
    const userId = await requireApiUserId();
    const body = await request.json();
    const parsed = profileUpdateSchema.parse(body);
    return NextResponse.json(updateProfile(userId, parsed));
  } catch (error) {
    return apiError(error);
  }
}
