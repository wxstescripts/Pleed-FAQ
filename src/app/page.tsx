import Navbar from "@/components/navbar";
import Hero from "@/components/hero";
import Features from "@/components/features";
import Footer from "@/components/footer";

export default function Home() {
  return (
    <main className="min-h-screen bg-black selection:bg-indigo-500/30">
      <Navbar />
      <Hero />
      <Features />
      <Footer />
    </main>
  );
}
