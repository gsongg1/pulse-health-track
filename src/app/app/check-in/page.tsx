import { submitCheckInAction } from "@/app/actions";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { requireSessionId } from "@/lib/auth/require-viewer";
import { formatDateTime } from "@/lib/utils";
import { getLatestCheckIn } from "@/server/services/pulse-service";

const fields = [
  ["sleepScore", "Sleep quality"],
  ["stressScore", "Stress"],
  ["movementScore", "Movement"],
  ["focusScore", "Focus"],
  ["workloadScore", "Workload intensity"]
] as const;

export default async function CheckInPage() {
  const userId = await requireSessionId();
  const latestCheckIn = getLatestCheckIn(userId);

  return (
    <div className="grid gap-6 xl:grid-cols-[0.9fr_1.1fr]">
      <Card className="bg-[#143126] text-white">
        <CardContent className="space-y-6 p-8">
          <Badge className="w-fit bg-white/10 text-white">Under 30 seconds</Badge>
          <h1 className="text-4xl font-semibold">Daily pulse check-in</h1>
          <p className="text-white/80">
            A quick reflection helps Pulse adjust effort level, spot early pressure patterns, and keep recommendations grounded in your recent reality.
          </p>
          {latestCheckIn ? (
            <div className="rounded-[28px] bg-white/10 p-5 text-sm text-white/80">
              <p className="font-medium text-white">Last submission</p>
              <p className="mt-2">{formatDateTime(latestCheckIn.createdAt)}</p>
              <p className="mt-3">Sleep {latestCheckIn.sleepScore}/5 · Stress {latestCheckIn.stressScore}/5 · Focus {latestCheckIn.focusScore}/5</p>
            </div>
          ) : null}
        </CardContent>
      </Card>
      <Card>
        <CardHeader>
          <CardTitle className="text-3xl">How are things feeling today?</CardTitle>
        </CardHeader>
        <CardContent>
          <form action={submitCheckInAction} className="grid gap-6">
            <div className="grid gap-5 sm:grid-cols-2 xl:grid-cols-3">
              {fields.map(([name, label]) => (
                <label className="space-y-2" key={name}>
                  <span className="text-sm font-medium text-ink">{label}</span>
                  <select className="h-12 w-full rounded-2xl border border-[rgba(21,50,39,0.1)] bg-white px-4" defaultValue="3" name={name}>
                    {[1, 2, 3, 4, 5].map((value) => (
                      <option key={value} value={value}>{value}</option>
                    ))}
                  </select>
                </label>
              ))}
            </div>
            <label className="space-y-2">
              <span className="text-sm font-medium text-ink">Optional note</span>
              <textarea className="min-h-32 w-full rounded-[24px] border border-[rgba(21,50,39,0.1)] bg-white px-4 py-3" name="optionalNote" placeholder="Anything worth noting for yourself today? This stays out of admin dashboards." />
            </label>
            <Button size="lg" type="submit">Submit check-in</Button>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
