import Navbar from "@/components/site/navbar";
import Footer from "@/components/site/footer";

/**
 * Shared chrome for every public marketing route (/, /commands, /docs,
 * /status, /privacy, /terms). Rendering the header and footer here means they
 * mount once and persist across client-side navigations.
 *
 * Contract for pages inside this group:
 * - Do NOT render <main>, <Navbar/> or <Footer/> — start with <Section>.
 * - Render exactly one <h1>.
 * - The header is `position: sticky; top: 0`, IN FLOW and `h-header` (4rem)
 *   tall. Pages add NO offset: the first <Section> uses its normal
 *   py-section. Only a hero whose background should run up behind the
 *   header uses <Section behindHeader> (DESIGN.md §2).
 * - Anchor offsets are global (html scroll-padding-top); never add
 *   scroll-mt-* / scroll-margin.
 *
 * Contract for src/components/site/** (site-chrome agent): keep default
 * exports `Navbar` (site/navbar.tsx) and `Footer` (site/footer.tsx); the
 * <header> is `sticky top-0 z-header h-header` (transparent at the top is
 * fine, then bg-canvas/80 + backdrop-blur + border-b once scrolled).
 */
export default function MarketingLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="relative flex min-h-dvh flex-col bg-canvas">
      <a
        href="#main"
        className="fixed top-3 left-3 z-skip inline-flex min-h-11 -translate-y-[calc(100%+1rem)] items-center rounded-lg border border-line-strong bg-surface-2 px-4 py-2.5 type-label text-fg shadow-lg transition-transform duration-200 ease-standard focus-visible:translate-y-0 focus-visible:focus-ring"
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
