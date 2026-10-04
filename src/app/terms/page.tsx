import Navbar from "@/components/navbar";
import Footer from "@/components/footer";

export default function TermsPage() {
  return (
    <div className="min-h-screen bg-black flex flex-col">
      <Navbar />
      <main className="flex-grow container mx-auto px-4 sm:px-6 lg:px-8 pt-32 pb-16 text-left max-w-3xl">
        <h1 className="text-4xl md:text-5xl font-bold text-white mb-6">Terms of Service</h1>
        <div className="prose prose-invert text-gray-400">
            <p className="mb-4">By inviting Pleed to your Discord server, you agree to these terms...</p>
            <p>More detailed terms are currently being rewritten for the new site.</p>
        </div>
      </main>
      <Footer />
    </div>
  );
}
