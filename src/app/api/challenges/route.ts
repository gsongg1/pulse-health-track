import { NextResponse } from "next/server";
import { apiError, requireApiUserId } from "@/app/api/helpers";
import { getChallengesForUser } from "@/server/services/pulse-service";

export async function GET() {
  try {
    const userId = await requireApiUserId();
    return NextResponse.json(getChallengesForUser(userId));
  } catch (error) {
    return apiError(error);
  }
}
