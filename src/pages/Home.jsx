import React from "react";
import Navbar from "@/components/landing/Navbar";
import Hero from "@/components/landing/Hero";
import StackSection from "@/components/landing/StackSection";
import BuildTypes from "@/components/landing/BuildTypes";
import DesignSection from "@/components/landing/DesignSection";
import MarketingTools from "@/components/landing/MarketingTools";
import Pricing from "@/components/landing/Pricing";
import FAQ from "@/components/landing/FAQ";
import Footer from "@/components/landing/Footer";

export default function Home() {
  return (
    <div className="min-h-screen bg-black">
      <Navbar />
      <div className="pt-20 px-4">
        <div className="max-w-6xl mx-auto">
          <div className="rounded-xl border border-amber-400/30 bg-amber-400/10 px-4 py-3 text-center text-sm text-amber-200">
            This app is under construction — in no way, shape, or form is the pay option supposed to work right now. Enjoy the full free demo.
          </div>
        </div>
      </div>
      <main>
        <Hero />
        <div id="stack" className="scroll-mt-20">
          <StackSection />
        </div>
        <div id="build" className="scroll-mt-20">
          <BuildTypes />
        </div>
        <div id="design" className="scroll-mt-20">
          <DesignSection />
        </div>
        <div id="marketing" className="scroll-mt-20">
          <MarketingTools />
        </div>
        <div id="pricing" className="scroll-mt-20">
          <Pricing />
        </div>
        <div id="faq" className="scroll-mt-20">
          <FAQ />
        </div>
      </main>
      <Footer />
    </div>
  );
}