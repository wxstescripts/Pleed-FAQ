import { Button } from "@/components/ui/button";
import { Container } from "@/components/ui/container";
import { DiscordIcon } from "@/components/ui/discord-icon";
import { Logo } from "@/components/ui/logo";
import { INVITE_URL } from "@/lib/site";

import { DesktopNav } from "./desktop-nav";
import { HeaderSurface } from "./header-surface";
import { MobileMenu } from "./mobile-menu";
import { DASHBOARD_LINK } from "./nav-config";

/**
 * Global site header (DESIGN.md §2 header model): sticky, in flow, h-header,
 * z-header. A Server Component shell with three small client islands —
 * HeaderSurface (scroll state), DesktopNav (active link) and MobileMenu (Sheet).
 *
 *  - Phones (< 640):        Logo ·························· Menu
 *  - Large phones / small tablets (640–767): Logo ······ Add to Discord · Menu
 *  - Tablet portrait (768–1023): Logo ··· Dashboard · Add to Discord · Menu
 *  - ≥ 1024: Logo · [Features Commands Docs Status] · Dashboard · Add to Discord
 *    (page links truly centred: a 1fr | auto | 1fr grid)
 */
export default function Navbar() {
  return (
    <HeaderSurface>
      <Container className="flex h-full items-center gap-2 lg:grid lg:grid-cols-[minmax(0,1fr)_auto_minmax(0,1fr)] lg:gap-6">
        <div className="flex min-w-0 flex-1 items-center">
          <Logo href="/" />
        </div>

        <DesktopNav />

        <div className="flex shrink-0 items-center justify-end gap-2">
          <Button variant="ghost" href={DASHBOARD_LINK.href} className="hidden md:inline-flex">
            {DASHBOARD_LINK.label}
          </Button>
          <Button variant="discord" href={INVITE_URL} className="hidden sm:inline-flex">
            <DiscordIcon className="size-4" />
            Add to Discord
          </Button>
          <MobileMenu className="lg:hidden" />
        </div>
      </Container>
    </HeaderSurface>
  );
}
