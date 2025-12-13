
import LandingHeader from '@/components/landing/LandingHeader';
import HeroSection from '@/components/landing/HeroSection';
import ValueProps from '@/components/landing/ValueProps';
import HowItWorks from '@/components/landing/HowItWorks';
import Features from '@/components/landing/Features';
import MockupPreview from '@/components/landing/MockupPreview';
import Pricing from '@/components/landing/Pricing';
import Testimonials from '@/components/landing/Testimonials';
import FAQ from '@/components/landing/FAQ';
import CTASection from '@/components/landing/CTASection';
import StickyCTA from '@/components/landing/StickyCTA';
import LandingFooter from '@/components/landing/LandingFooter';

export default function HomePage() {
  return (
    <div className="min-h-screen flex flex-col">
      <LandingHeader />

      <main className="flex-1">
        <HeroSection />
        <ValueProps />
        <HowItWorks />
        <Features />
        <MockupPreview />
        <Pricing />
        {/* <Testimonials /> */}
        <FAQ />
        <CTASection />
      </main>

      <StickyCTA />
      <LandingFooter />
    </div>
  );
}
