import { Capabilities } from "@/components/landing/Capabilities";
import { EnvironmentSwitcher } from "@/components/landing/EnvironmentSwitcher";
import { FinalCTA } from "@/components/landing/FinalCTA";
import { FlexisExperience } from "@/components/landing/FlexisExperience";
import { FlexisIntro } from "@/components/landing/FlexisIntro";
import { HeroSection } from "@/components/landing/HeroSection";
import { ImplementationJourney } from "@/components/landing/ImplementationJourney";
import { LandingFooter } from "@/components/landing/LandingFooter";
import { LandingNav } from "@/components/landing/LandingNav";
import { PlatformOverview } from "@/components/landing/PlatformOverview";
import { ProcessJourney } from "@/components/landing/ProcessJourney";
import { SecuritySection } from "@/components/landing/SecuritySection";
import { TechShowcase } from "@/components/landing/TechShowcase";
import { WhyDiez } from "@/components/landing/WhyDiez";

export default function LandingPage() {
  return (
    <div className="min-h-screen flex flex-col font-sans selection:bg-primary/20">
      <LandingNav />

      <main className="flex-1 flex flex-col">
        <HeroSection />

        <FlexisIntro />
        <FlexisExperience />

        <PlatformOverview />

        <Capabilities />

        <ProcessJourney />

        <WhyDiez />

        <SecuritySection />

        <TechShowcase />

        {/* <IndustriesSection /> */}

        <ImplementationJourney />

        <FinalCTA />
      </main>

      <LandingFooter />
      <EnvironmentSwitcher />
    </div>
  );
}
