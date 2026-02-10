import Hero from '@/components/marketing/sections/Hero';
import Features from '@/components/marketing/sections/Features';
import Comparison from '@/components/marketing/sections/Comparison';
import PricingPreview from '@/components/marketing/sections/PricingPreview';
import FinalCTA from '@/components/marketing/sections/FinalCTA';

export default function LandingPage() {
  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-900 via-blue-900/20 to-gray-900">
      <Hero />
      <Features />
      <Comparison />
      <PricingPreview />
      <FinalCTA />
    </div>
  );
}
