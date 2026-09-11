import React from "react";
import Navbar from "@/components/base44/Navbar";
import Hero from "@/components/base44/Hero";
import StackSection from "@/components/base44/StackSection";
import BuildTypes from "@/components/base44/BuildTypes";
import DesignSection from "@/components/base44/DesignSection";
import MarketingTools from "@/components/base44/MarketingTools";
import Pricing from "@/components/base44/Pricing";
import FAQ from "@/components/base44/FAQ";
import Footer from "@/components/base44/Footer";

export default function Home() {
  return (
    <div className="min-h-screen bg-black">
      <Navbar />
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