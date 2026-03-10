import { joinChallengeAction, leaveChallengeAction, updateChallengeProgressAction } from "@/app/actions";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ProgressBar } from "@/components/ui/progress";
import type { Challenge, ChallengeParticipation } from "@/lib/types";
import { formatDate } from "@/lib/utils";

export function ChallengeCard({
  challenge,
  participation,
  participants,
  completionRate,
  showAdminStats = false
}: {
  challenge: Challenge;
  participation: ChallengeParticipation | null;
  participants: number;
  completionRate: number;
  showAdminStats?: boolean;
}) {
  const progressPercent = participation ? (participation.progressValue / challenge.targetValue) * 100 : 0;

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between gap-3">
          <CardTitle>{challenge.title}</CardTitle>
          <Badge>{challenge.challengeType.replaceAll("_", " ")}</Badge>
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        <p className="text-sm text-[color:var(--muted)]">{challenge.description}</p>
        <div className="rounded-3xl bg-[#f5f8f4] p-4">
          <div className="flex items-center justify-between text-sm text-[color:var(--muted)]">
            <span>{participation ? `${participation.progressValue}/${challenge.targetValue} complete` : `Target ${challenge.targetValue}`}</span>
            <span>Ends {formatDate(challenge.endDate)}</span>
          </div>
          <ProgressBar className="mt-3" value={progressPercent} />
        </div>
        <div className="flex flex-wrap gap-3 text-sm text-[color:var(--muted)]">
          <span>{participants} participants</span>
          <span>{completionRate}% finished</span>
        </div>
        {showAdminStats ? null : participation ? (
          <div className="flex flex-wrap gap-3">
            <form action={updateChallengeProgressAction} className="flex items-center gap-3">
              <input type="hidden" name="id" value={challenge.id} />
              <input
                className="h-11 w-24 rounded-full border border-[rgba(21,50,39,0.1)] bg-white px-4"
                defaultValue={Math.min(challenge.targetValue, participation.progressValue + 1)}
                max={challenge.targetValue}
                min={0}
                name="progressValue"
                type="number"
              />
              <Button type="submit" variant="secondary">Log progress</Button>
            </form>
            <form action={leaveChallengeAction}>
              <input type="hidden" name="id" value={challenge.id} />
              <Button type="submit" variant="ghost">Leave</Button>
            </form>
          </div>
        ) : (
          <form action={joinChallengeAction}>
            <input type="hidden" name="id" value={challenge.id} />
            <Button type="submit">Join challenge</Button>
          </form>
        )}
      </CardContent>
    </Card>
  );
}
