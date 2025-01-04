import React from "react";
import { Hero } from "@/components/landing/Hero";
import { Features } from "@/components/landing/Features";
import { CTA } from "@/components/landing/CTA";
import { Header } from "@/components/landing/Header";

const Home = () => {
  return (
    <main className="min-h-screen bg-background">
      <Header />
      <Hero />
      <Features />
      <CTA />
    </main>
  );
};

export default Home;