import type { ReactNode } from "react";
import type { Route } from "next";
import Link from "next/link";
import type { LucideIcon } from "lucide-react";
import { Bell, ShieldCheck } from "lucide-react";
import { signOutAction } from "@/app/actions";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import type { User } from "@/lib/types";

interface NavItem {
  href: Route;
  label: string;
  icon: LucideIcon;
}

export function AppShell({
  user,
  organizationName,
  navItems,
  roleLabel,
  children
}: {
  user: User;
  organizationName: string;
  navItems: NavItem[];
  roleLabel: string;
  children: ReactNode;
}) {
  return (
    <div className="min-h-screen px-4 py-6 sm:px-6 lg:px-8">
      <div className="mx-auto grid max-w-7xl gap-6 lg:grid-cols-[280px_minmax(0,1fr)]">
        <aside className="glass-card pulse-grid rounded-[32px] border border-[rgba(21,50,39,0.08)] p-6 shadow-soft">
          <div className="rounded-[28px] bg-white/90 p-5 shadow-card">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm uppercase tracking-[0.18em] text-[color:var(--muted)]">Pulse</p>
                <h1 className="mt-2 text-2xl font-semibold text-ink">Preventive health that feels calm.</h1>
              </div>
              <ShieldCheck className="h-10 w-10 text-moss" />
            </div>
            <div className="mt-6 space-y-2">
              <Badge>{roleLabel}</Badge>
              <p className="text-sm text-[color:var(--muted)]">{organizationName}</p>
              <p className="text-lg font-semibold text-ink">{user.name}</p>
              <p className="text-sm text-[color:var(--muted)]">{user.title}</p>
            </div>
          </div>
          <nav className="mt-6 space-y-2">
            {navItems.map((item) => {
              const Icon = item.icon;
              return (
                <Link
                  className="flex items-center gap-3 rounded-full border border-transparent bg-white/70 px-4 py-3 text-sm text-ink transition hover:border-[rgba(21,50,39,0.08)] hover:bg-white"
                  href={item.href}
                  key={item.href}
                >
                  <Icon className="h-4 w-4 text-moss" />
                  <span>{item.label}</span>
                </Link>
              );
            })}
          </nav>
          <div className="mt-6 rounded-[28px] bg-[#143126] p-5 text-white">
            <div className="flex items-center gap-3">
              <Bell className="h-5 w-5 text-[#9fd7c1]" />
              <p className="text-sm font-medium">Trust-first by default</p>
            </div>
            <p className="mt-3 text-sm text-white/80">
              Admin views stay aggregate-only, and team segments under five people are automatically suppressed.
            </p>
          </div>
          <form action={signOutAction} className="mt-6">
            <Button className="w-full" type="submit" variant="outline">Sign out</Button>
          </form>
        </aside>
        <main className="space-y-6">{children}</main>
      </div>
    </div>
  );
}
