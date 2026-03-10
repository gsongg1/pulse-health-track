import Link from "next/link";
import { ArrowRight, ShieldCheck, Sparkles, Users } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { getStore } from "@/server/repositories/demo-repository";

export default function HomePage() {
  const store = getStore();
  const employeeCount = store.users.filter((user) => user.role !== "ADMIN").length;

  return (
    <main className="px-4 py-6 sm:px-6 lg:px-8">
      <section className="mx-auto max-w-7xl rounded-[36px] border border-[rgba(21,50,39,0.08)] bg-[image:var(--tw-gradient-stops)] from-white via-white/95 to-[#f0f6f1] px-6 py-12 shadow-soft sm:px-10 lg:px-14">
        <div className="grid gap-8 lg:grid-cols-[1.2fr_0.8fr] lg:items-center">
          <div className="space-y-6">
            <p className="text-sm uppercase tracking-[0.2em] text-[color:var(--muted)]">Pulse preventive health platform</p>
            <h1 className="max-w-3xl text-5xl font-semibold tracking-tight text-ink sm:text-6xl">
              Private check-ins, practical nudges, and carefully bounded team insight.
            </h1>
            <p className="max-w-2xl text-lg text-[color:var(--muted)]">
              Pulse gives employees a calm place to reflect on sleep, stress, movement, focus, and workload. Recommendations stay personal, while organization views are limited to anonymized patterns meant for planning and support, not employee evaluation.
            </p>
            <div className="flex flex-wrap gap-3">
              <Link href="/sign-in">
                <Button size="lg">
                  Explore demo
                  <ArrowRight className="ml-2 h-4 w-4" />
                </Button>
              </Link>
              <Link href="/sign-up">
                <Button size="lg" variant="outline">Create test employee</Button>
              </Link>
            </div>
          </div>
          <Card className="overflow-hidden rounded-[32px] border-none bg-[#143126] text-white">
            <CardContent className="space-y-6 p-8">
              <div className="flex items-center gap-3">
                <ShieldCheck className="h-10 w-10 text-[#9fd7c1]" />
                <div>
                  <p className="text-sm uppercase tracking-[0.18em] text-white/70">Privacy model</p>
                  <p className="text-2xl font-semibold">Team trends without personal monitoring</p>
                </div>
              </div>
              <div className="grid gap-4 sm:grid-cols-2">
                <div className="rounded-[28px] bg-white/10 p-5">
                  <p className="text-sm text-white/70">Seeded participants</p>
                  <p className="mt-2 text-3xl font-semibold">{employeeCount}</p>
                </div>
                <div className="rounded-[28px] bg-white/10 p-5">
                  <p className="text-sm text-white/70">Active challenges</p>
                  <p className="mt-2 text-3xl font-semibold">{store.challenges.length}</p>
                </div>
              </div>
              <div className="space-y-3 rounded-[28px] bg-white/10 p-5 text-sm text-white/80">
                <div className="flex items-center gap-3">
                  <Sparkles className="h-4 w-4 text-[#f5d7ae]" />
                  Recommendations stay deterministic and explainable in MVP.
                </div>
                <div className="flex items-center gap-3">
                  <Users className="h-4 w-4 text-[#f5d7ae]" />
                  Organization views suppress small groups and avoid person-level timelines.
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </section>
    </main>
  );
}
