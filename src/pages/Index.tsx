import { Hero } from "@/components/landing/Hero";
import { Features } from "@/components/landing/Features";
import { CTA } from "@/components/landing/CTA";

const Index = () => {
  return (
    <main className="min-h-screen bg-cream">
      <Hero />
      <Features />
      <CTA />
    </main>
  );
};

export default Index;