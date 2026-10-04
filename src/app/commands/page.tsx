import Navbar from "@/components/navbar";
import Footer from "@/components/footer";

export default function CommandsPage() {
  return (
    <div className="min-h-screen bg-black flex flex-col">
      <Navbar />
      <main className="flex-grow container mx-auto px-4 sm:px-6 lg:px-8 pt-32 pb-16 text-center">
        <h1 className="text-4xl md:text-5xl font-bold text-white mb-6">Commands List</h1>
        <p className="text-gray-400 text-lg">We are currently migrating our command documentation. Check back soon!</p>
      </main>
      <Footer />
    </div>
  );
}
