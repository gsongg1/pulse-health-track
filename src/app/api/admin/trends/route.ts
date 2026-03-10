import { NextResponse } from "next/server";
import { apiError, requireApiUserId } from "@/app/api/helpers";
import { adminFilterSchema } from "@/lib/validation";
import { getAdminOverview } from "@/server/services/pulse-service";

export async function GET(request: Request) {
  try {
    const userId = await requireApiUserId();
    const { searchParams } = new URL(request.url);
    const parsed = adminFilterSchema.parse({
      range: searchParams.get("range") ?? undefined,
      department: searchParams.get("department") ?? undefined
    });
    return NextResponse.json(getAdminOverview(userId, parsed.range, parsed.department).wellbeingTrends);
  } catch (error) {
    return apiError(error);
  }
}
