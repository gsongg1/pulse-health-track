import type { ReactNode } from "react";
import {
  ClipboardCheck,
  History,
  LayoutDashboard,
  Lightbulb,
  Shield,
  Trophy,
  UserRound
} from "lucide-react";
import { redirect } from "next/navigation";
import { AppShell } from "@/components/layout/app-shell";
import { requireViewer } from "@/lib/auth/require-viewer";
import { canAccessEmployeeApp } from "@/lib/permissions";

export default async function EmployeeLayout({ children }: { children: ReactNode }) {
  const viewer = await requireViewer();

  if (!canAccessEmployeeApp(viewer.user.role)) {
    redirect("/unauthorized");
  }

  if (!viewer.profile && viewer.user.role === "EMPLOYEE") {
    redirect("/invite");
  }

  return (
    <AppShell
      navItems={[
        { href: "/app/dashboard", label: "Dashboard", icon: LayoutDashboard },
        { href: "/app/check-in", label: "Check-in", icon: ClipboardCheck },
        { href: "/app/recommendations", label: "Recommendations", icon: Lightbulb },
        { href: "/app/history", label: "History", icon: History },
        { href: "/app/challenges", label: "Challenges", icon: Trophy },
        { href: "/app/profile", label: "Profile", icon: UserRound },
        { href: "/app/privacy", label: "Privacy", icon: Shield }
      ]}
      organizationName={viewer.organization.name}
      roleLabel="Employee workspace"
      user={viewer.user}
    >
      {children}
    </AppShell>
  );
}
