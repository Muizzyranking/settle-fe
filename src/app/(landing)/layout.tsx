import { cookies } from "next/headers";
import { Footer, Nav } from "@/components/landing";

export default async function LandingLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const cookieStore = await cookies();
  const isAuthenticated = cookieStore.has("settle_access_token");
  return (
    <div className="min-h-screen bg-[var(--color-bg)]">
      <Nav isAuthenticated={isAuthenticated} />
      {children}
      <Footer />
    </div>
  );
}
