import type { ReactNode } from "react";
import { AppShell } from "@/components/app/app-shell";
import { getNotifications, getTenantProfile } from "@/lib/settle/api";

export default async function DashboardLayout({ children }: { children: ReactNode }) {
  const [tenant, notifications] = await Promise.all([
    getTenantProfile(),
    getNotifications(),
  ]);

  const unreadCount = notifications.filter((n) => !n.is_read).length;

  return (
    <AppShell tenant={tenant} unreadCount={unreadCount}>
      {children}
    </AppShell>
  );
}
