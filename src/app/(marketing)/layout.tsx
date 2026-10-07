import Navbar from "@/components/site/navbar";
import Footer from "@/components/site/footer";

/**
 * Shared chrome for every public marketing route (/, /commands, /docs,
 * /status, /privacy, /terms). Rendering the header and footer here means they
 * mount once and persist across client-side navigations.
 *
 * Pages inside this group must NOT render their own <main>, <Navbar/> or
 * <Footer/> — start with a <section>/<div> and exactly one <h1>.
 */
export default function MarketingLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex min-h-dvh flex-col bg-black">
      <a
        href="#main"
        className="sr-only focus:not-sr-only focus:fixed focus:top-3 focus:left-3 focus:z-[100] focus:rounded-md focus:bg-white focus:px-4 focus:py-2 focus:text-black"
      >
        Skip to content
      </a>
      <Navbar />
      <main id="main" tabIndex={-1} className="flex-1 outline-none">
        {children}
      </main>
      <Footer />
    </div>
  );
}
