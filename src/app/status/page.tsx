import Navbar from "@/components/navbar";
import Footer from "@/components/footer";

export default function StatusPage() {
  return (
    <div className="min-h-screen bg-black flex flex-col">
      <Navbar />
      <main className="flex-grow container mx-auto px-4 sm:px-6 lg:px-8 pt-32 pb-16 text-center">
        <h1 className="text-4xl md:text-5xl font-bold text-white mb-6">Bot Status</h1>
        <div className="inline-flex items-center justify-center px-4 py-2 bg-emerald-500/10 border border-emerald-500/20 rounded-full">
            <span className="w-2.5 h-2.5 bg-emerald-500 rounded-full mr-3 animate-pulse"></span>
            <span className="text-emerald-400 font-medium">All Systems Operational</span>
        </div>
      </main>
      <Footer />
    </div>
  );
}
