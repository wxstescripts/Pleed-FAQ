import Hero from "@/components/landing/hero";
import Features from "@/components/landing/features";

export default function Home() {
  return (
    <div className="selection:bg-indigo-500/30">
      <Hero />
      <Features />
    </div>
  );
}
