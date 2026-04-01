import { useEffect, useRef } from 'react';
import Lenis from '@studio-freight/lenis';
import { gsap } from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import Navbar from '../components/landing/Navbar';
import Hero from '../components/landing/Hero';
import ProductPreview from '../components/landing/ProductPreview';
import ProblemSection from '../components/landing/sections/ProblemSection';
import SolutionReveal from '../components/landing/sections/SolutionReveal';
import FeaturesGrid from '../components/landing/sections/FeaturesGrid';
import UseCases from '../components/landing/sections/UseCases';
import WorkflowSteps from '../components/landing/sections/WorkflowSteps';
import BenefitsSection from '../components/landing/sections/BenefitsSection';
import FinalCTA from '../components/landing/sections/FinalCTA';
import Footer from '../components/landing/Footer';

gsap.registerPlugin(ScrollTrigger);

export default function Landing() {
  const lenisRef = useRef<Lenis | null>(null);

  useEffect(() => {
    // Initialize Lenis smooth scroll
    const lenis = new Lenis({
      duration: 1.2,
      easing: (t) => Math.min(1, 1.001 - Math.pow(2, -10 * t)),
      orientation: 'vertical',
      gestureOrientation: 'vertical',
      smoothWheel: true,
      wheelMultiplier: 1,
      touchMultiplier: 2,
      infinite: false,
    });

    lenisRef.current = lenis;

    // Sync Lenis with GSAP ScrollTrigger
    lenis.on('scroll', ScrollTrigger.update);

    const updateTicker = (time: number) => {
      lenis.raf(time * 1000);
    };

    gsap.ticker.add(updateTicker);

    gsap.ticker.lagSmoothing(0);

    // Cleanup
    return () => {
      lenis.destroy();
      gsap.ticker.remove(updateTicker);
      ScrollTrigger.getAll().forEach((trigger) => trigger.kill());
    };
  }, []);

  return (
    <div className="min-h-screen bg-background text-foreground overflow-x-hidden">
      {/* Fixed Navbar */}
      <Navbar />

      {/* Main Content - Proper document flow */}
      <main className="relative">
        {/* Hero Section */}
        <section id="hero" className="relative min-h-screen">
          <Hero />
        </section>

        {/* Product Preview */}
        <section id="product-preview" className="relative">
          <ProductPreview />
        </section>

        {/* Problem Section */}
        <section id="problem" className="relative">
          <ProblemSection />
        </section>

        {/* Solution Reveal */}
        <section id="solution" className="relative">
          <SolutionReveal />
        </section>

        {/* Features Grid */}
        <section id="features" className="relative">
          <FeaturesGrid />
        </section>

        {/* Use Cases */}
        <section id="use-cases" className="relative">
          <UseCases />
        </section>

        {/* Workflow Steps */}
        <section id="workflow" className="relative">
          <WorkflowSteps />
        </section>

        {/* Benefits */}
        <section id="benefits" className="relative">
          <BenefitsSection />
        </section>

        {/* Final CTA */}
        <section id="cta" className="relative">
          <FinalCTA />
        </section>

        {/* Footer */}
        <Footer />
      </main>

      {/* Background Elements - Fixed, non-interfering */}
      <div className="fixed inset-0 -z-10 overflow-hidden pointer-events-none">
        {/* Gradient Orbs */}
        <div className="absolute top-0 left-1/4 w-[32rem] h-[32rem] bg-gradient-to-br from-accent/18 to-sky-400/12 rounded-full blur-3xl opacity-25" />
        <div className="absolute bottom-1/4 right-1/4 w-[30rem] h-[30rem] bg-gradient-to-br from-sky-400/14 to-accent/12 rounded-full blur-3xl opacity-20" />
        
        {/* Subtle Grid */}
        <div 
          className="absolute inset-0 opacity-[0.02]"
          style={{
            backgroundImage: `linear-gradient(var(--border) 1px, transparent 1px),
                             linear-gradient(90deg, var(--border) 1px, transparent 1px)`,
            backgroundSize: '50px 50px',
          }}
        />
      </div>
    </div>
  );
}
