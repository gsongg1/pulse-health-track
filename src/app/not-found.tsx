import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";

export default function NotFound() {
  return (
    <div className="flex min-h-screen items-center justify-center px-4 py-16">
      <Card className="max-w-xl">
        <CardContent className="space-y-6 text-center">
          <p className="text-sm uppercase tracking-[0.18em] text-[color:var(--muted)]">Pulse</p>
          <h1 className="text-4xl font-semibold text-ink">This page took a different route.</h1>
          <p className="text-[color:var(--muted)]">
            The page you requested is unavailable or protected. Head back to the dashboard or sign in again.
          </p>
          <div className="flex justify-center gap-3">
            <Link href="/">
              <Button>Go home</Button>
            </Link>
            <Link href="/sign-in">
              <Button variant="outline">Sign in</Button>
            </Link>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
