import Navbar from "@/components/site/navbar";
import Footer from "@/components/site/footer";

/**
 * Shared chrome for every public marketing route (/, /commands, /docs,
 * /status, /privacy, /terms). Rendering the header and footer here means they
 * mount once and persist across client-side navigations.
 *
 * Contract for pages inside this group:
 * - Do NOT render <main>, <Navbar/> or <Footer/> — start with <section>/<div>.
 * - Render exactly one <h1>.
 * - The header is sticky/fixed and `--spacing-header` (4rem) tall; offset
 *   the first section accordingly (e.g. `pt-header` + your own spacing).
 *
 * Contract for src/components/site/** (site-chrome agent): keep default
 * exports `Navbar` (site/navbar.tsx) and `Footer` (site/footer.tsx).
 */
export default function MarketingLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="relative flex min-h-dvh flex-col bg-canvas">
      <a
        href="#main"
        className="fixed top-3 left-3 z-skip -translate-y-[calc(100%+1rem)] rounded-lg border border-line-strong bg-surface-2 px-4 py-2.5 text-sm font-medium text-fg shadow-lg transition-transform duration-200 ease-standard focus-visible:translate-y-0 focus-visible:focus-ring"
      >
        Skip to content
      </a>
      <Navbar />
      <main id="main" tabIndex={-1} className="flex flex-1 flex-col outline-none">
        {children}
      </main>
      <Footer />
    </div>
  );
}
