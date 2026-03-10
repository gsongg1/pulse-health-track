import { ChallengeCard } from "@/components/challenges/challenge-card";
import { Badge } from "@/components/ui/badge";
import { requireSessionId } from "@/lib/auth/require-viewer";
import { getChallengesForUser } from "@/server/services/pulse-service";

export default async function ChallengesPage() {
  const userId = await requireSessionId();
  const challenges = getChallengesForUser(userId);

  return (
    <div className="space-y-6">
      <section className="rounded-[32px] border border-[rgba(21,50,39,0.08)] bg-white/85 px-6 py-8 shadow-card">
        <Badge>Optional motivation</Badge>
        <h1 className="mt-4 text-4xl font-semibold text-ink">Team challenges that stay low-pressure</h1>
        <p className="mt-3 max-w-2xl text-[color:var(--muted)]">
          Challenges are designed to encourage small healthy routines, not public scorekeeping. Participation can stay anonymized or alias-based.
        </p>
      </section>
      <div className="grid gap-6 lg:grid-cols-2 xl:grid-cols-3">
        {challenges.map((entry) => (
          <ChallengeCard
            challenge={entry.challenge}
            completionRate={entry.completionRate}
            key={entry.challenge.id}
            participants={entry.participants}
            participation={entry.participation}
          />
        ))}
      </div>
    </div>
  );
}
