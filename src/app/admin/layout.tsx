import type { ReactNode } from "react";
import { BarChart3, LayoutDashboard, Shield, Trophy } from "lucide-react";
import { redirect } from "next/navigation";
import { AppShell } from "@/components/layout/app-shell";
import { requireViewer } from "@/lib/auth/require-viewer";
import { canAccessAdminApp } from "@/lib/permissions";

export default async function AdminLayout({ children }: { children: ReactNode }) {
  const viewer = await requireViewer();

  if (!canAccessAdminApp(viewer.user.role)) {
    redirect("/unauthorized");
  }

  return (
    <AppShell
      navItems={[
        { href: "/admin/dashboard", label: "Overview", icon: LayoutDashboard },
        { href: "/admin/challenges", label: "Challenges", icon: Trophy },
        { href: "/admin/insights", label: "Insights", icon: BarChart3 },
        { href: "/admin/privacy", label: "Privacy", icon: Shield }
      ]}
      organizationName={viewer.organization.name}
      roleLabel="Admin workspace"
      user={viewer.user}
    >
      {children}
    </AppShell>
  );
}
