
import { Header } from "@/components/landing/Header";
import { Hero } from "@/components/landing/Hero";
import { Features } from "@/components/landing/Features";
import { CTA } from "@/components/landing/CTA";

const isPreviewEnvironment = () => {
  const hostname = window.location.hostname;
  return hostname.includes('preview--') && hostname.endsWith('.lovable.app');
};

export default function Landing() {
  console.log("Rendering Landing page");
  
  if (isPreviewEnvironment()) {
    return (
      <div className="min-h-screen w-full flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-4xl font-bold mb-4">Mode Preview</h1>
          <p className="text-lg text-gray-600">Cette page est en mode preview</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen w-full overflow-x-hidden">
      <Header />
      <Hero />
      <Features />
      <CTA />
    </div>
  );
}
