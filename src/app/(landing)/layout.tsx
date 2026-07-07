import { Footer, Nav } from "@/components/landing";

export default function LandingLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="min-h-screen bg-[var(--color-bg)]">
      <Nav />
      {children}
      <Footer />
    </div>
  );
}
