import {
  DevStrip,
  Features,
  Footer,
  Hero,
  HowItWorks,
  Nav, 
  NombaTrust,
  TrustStrip
} from "@/components/landing";

export default function LandingPage() {
  return (
    <div className="min-h-screen bg-[var(--color-bg)]">
      <Nav />
      <Hero />
      <TrustStrip />
      <Features />
      <HowItWorks />
      <DevStrip />
      <NombaTrust />
      <Footer />
    </div>
  );
}
