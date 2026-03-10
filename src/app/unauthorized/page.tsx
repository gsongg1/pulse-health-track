import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";

export default function UnauthorizedPage() {
  return (
    <div className="flex min-h-screen items-center justify-center px-4 py-16">
      <Card className="max-w-xl">
        <CardContent className="space-y-6 text-center">
          <p className="text-sm uppercase tracking-[0.18em] text-[color:var(--muted)]">Access limited</p>
          <h1 className="text-4xl font-semibold text-ink">This view is protected by role and privacy rules.</h1>
          <p className="text-[color:var(--muted)]">
            Pulse keeps employer insights aggregate-only and restricts views based on your current role.
          </p>
          <div className="flex justify-center gap-3">
            <Link href="/app/dashboard">
              <Button>Employee dashboard</Button>
            </Link>
            <Link href="/admin/dashboard">
              <Button variant="outline">Admin dashboard</Button>
            </Link>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
