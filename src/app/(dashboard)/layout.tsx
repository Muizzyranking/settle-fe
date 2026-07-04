import type { ReactNode } from "react";
import { AppShell } from "@/components/app/app-shell";
import { getTenantProfile } from "@/lib/settle/api";

export default async function DashboardLayout({ children }: { children: ReactNode }) {
  const tenant = await getTenantProfile();

  return <AppShell tenant={tenant}>{children}</AppShell>;
}
