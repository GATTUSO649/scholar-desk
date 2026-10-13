import { Link } from "@tanstack/react-router";
import { Button } from "@/components/ui/button";
import { Logo } from "@/components/Logo";
import { useUser } from "@/lib/auth";

export function SiteHeader() {
  const { user } = useUser();
  return (
    <header className="absolute inset-x-0 top-0 z-20">
      <div className="mx-auto flex max-w-6xl items-center justify-between px-5 py-5">
        <Logo light />
        <nav className="hidden items-center gap-7 text-sm text-ink-foreground/80 md:flex">
          <a href="#how" className="hover:text-ink-foreground">How it works</a>
          <a href="#services" className="hover:text-ink-foreground">Services</a>
          <a href="#pricing" className="hover:text-ink-foreground">Pricing</a>
          <a href="#faq" className="hover:text-ink-foreground">FAQ</a>
          <a href="#contact" className="hover:text-ink-foreground">Contact</a>
        </nav>
        <div className="flex items-center gap-2">
          {user ? (
            <Button asChild variant="hero" size="sm">
              <Link to="/dashboard">My dashboard</Link>
            </Button>
          ) : (
            <>
              <Button asChild variant="heroOutline" size="sm" className="hidden sm:inline-flex">
                <Link to="/auth" search={{ mode: "login" }}>Student login</Link>
              </Button>
              <Button asChild variant="hero" size="sm">
                <Link to="/auth" search={{ mode: "register" }}>Register</Link>
              </Button>
            </>
          )}
        </div>
      </div>
    </header>
  );
}
