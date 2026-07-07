import {
  DevStrip,
  Features,
  Hero,
  HowItWorks,
  NombaTrust,
  TrustStrip,
} from "@/components/landing";

export default function LandingPage() {
  return (
    <>
      <Hero />
      <TrustStrip />
      <Features />
      <HowItWorks />
      <DevStrip />
      <NombaTrust />
    </>
  );
}
