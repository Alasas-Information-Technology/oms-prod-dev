import { LandingNav } from "@/components/landing/LandingNav";
import { HeroSection } from "@/components/landing/HeroSection";
import { FlexisIntro } from "@/components/landing/FlexisIntro";
import { FlexisExperience } from "@/components/landing/FlexisExperience";
import { PlatformOverview } from "@/components/landing/PlatformOverview";
import { Capabilities } from "@/components/landing/Capabilities";
import { ProcessJourney } from "@/components/landing/ProcessJourney";
import { WhyDiez } from "@/components/landing/WhyDiez";
import { SecuritySection } from "@/components/landing/SecuritySection";
import { TechShowcase } from "@/components/landing/TechShowcase";
import { IndustriesSection } from "@/components/landing/IndustriesSection";
import { ImplementationJourney } from "@/components/landing/ImplementationJourney";
import { FinalCTA } from "@/components/landing/FinalCTA";
import { LandingFooter } from "@/components/landing/LandingFooter";
import { EnvironmentSwitcher } from "@/components/landing/EnvironmentSwitcher";

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
        
        <IndustriesSection />
        
        <ImplementationJourney />
        
        <FinalCTA />
      </main>

      <LandingFooter />
      <EnvironmentSwitcher />
    </div>
  );
}
