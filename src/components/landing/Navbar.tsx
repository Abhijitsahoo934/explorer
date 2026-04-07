import { useNavigate } from 'react-router-dom';
import { ArrowRight, Menu, X } from 'lucide-react';
import { useState } from 'react';
import { BrandLogo } from '../ui/BrandLogo';

export default function Navbar() {
  const navigate = useNavigate();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const goTo = (path: string) => {
    setMobileMenuOpen(false);
    navigate(path);
  };

  return (
    <nav className="fixed top-0 w-full z-50 border-b border-border/70 bg-background/72 backdrop-blur-2xl transition-all duration-300">
      <div className="h-px w-full bg-linear-to-r from-accent/0 via-accent/40 via-sky-400/60 to-emerald-400/0" />
      <div className="container mx-auto flex h-18 items-center justify-between px-4 sm:px-6">
        {/* Logo */}
        <div
          className="flex items-center gap-3 cursor-pointer group"
          onClick={() => goTo('/')}
        >
          <div className="rounded-2xl bg-linear-to-br from-accent/12 via-sky-400/12 to-emerald-400/12 p-1.5 border border-accent/15 shadow-sm transition-all duration-300 group-hover:-translate-y-0.5">
            <BrandLogo className="h-9 w-9" />
          </div>
          <div>
            <span className="font-black tracking-tight text-base text-foreground uppercase block leading-none">
              Explorero
            </span>
            <span className="text-[9px] uppercase tracking-[0.24em] text-muted font-black">
              Browser Workspace
            </span>
          </div>
        </div>

        {/* Navigation Links */}
        <div className="hidden md:flex items-center gap-8 text-[11px] font-black tracking-[0.16em] uppercase text-muted">
          <a href="#product-preview" className="hover:text-foreground transition-colors">
            Product
          </a>
          <a href="#features" className="hover:text-foreground transition-colors">
            Features
          </a>
          <a href="#use-cases" className="hover:text-foreground transition-colors">
            Use Cases
          </a>
          <button onClick={() => goTo('/learn')} className="hover:text-foreground transition-colors">
            Learn
          </button>
          <button onClick={() => goTo('/about-explorero')} className="hover:text-foreground transition-colors">
            About
          </button>
        </div>

        {/* Auth Buttons */}
        <div className="flex items-center gap-3">
          <button
            type="button"
            onClick={() => setMobileMenuOpen((value) => !value)}
            className="inline-flex h-11 w-11 items-center justify-center rounded-2xl border border-border bg-card/50 text-foreground transition-all hover:bg-card-hover md:hidden"
            aria-label="Toggle navigation"
          >
            {mobileMenuOpen ? <X size={18} /> : <Menu size={18} />}
          </button>

          <button
            onClick={() => goTo('/auth')}
            className="hidden md:block h-11 px-4 text-[11px] tracking-[0.16em] uppercase font-black text-muted hover:text-foreground transition-colors rounded-xl"
          >
            Sign In
          </button>

          <button
            onClick={() => goTo('/auth')}
            className="hidden h-11 px-5 text-[11px] font-black uppercase tracking-[0.16em] bg-linear-to-r from-accent via-sky-500 to-indigo-500 text-white hover:brightness-110 transition-all duration-300 rounded-2xl shadow-[0_16px_34px_-22px_rgba(11,102,255,0.6)] sm:inline-flex items-center gap-2"
          >
            Open Workspace
            <ArrowRight size={14} />
          </button>
        </div>
      </div>

      {mobileMenuOpen && (
        <div className="border-t border-border/70 bg-linear-to-b from-background/96 to-accent/4 px-4 py-4 backdrop-blur-2xl md:hidden">
          <div className="flex flex-col gap-2 text-[11px] font-black uppercase tracking-[0.16em] text-muted">
            <a href="#product-preview" onClick={() => setMobileMenuOpen(false)} className="rounded-xl px-3 py-3 transition-colors hover:bg-card-hover hover:text-foreground">
              Product
            </a>
            <a href="#features" onClick={() => setMobileMenuOpen(false)} className="rounded-xl px-3 py-3 transition-colors hover:bg-card-hover hover:text-foreground">
              Features
            </a>
            <a href="#use-cases" onClick={() => setMobileMenuOpen(false)} className="rounded-xl px-3 py-3 transition-colors hover:bg-card-hover hover:text-foreground">
              Use Cases
            </a>
            <button onClick={() => goTo('/learn')} className="rounded-xl px-3 py-3 text-left transition-colors hover:bg-card-hover hover:text-foreground">
              Learn
            </button>
            <button onClick={() => goTo('/about-explorero')} className="rounded-xl px-3 py-3 text-left transition-colors hover:bg-card-hover hover:text-foreground">
              About
            </button>
            <button onClick={() => goTo('/auth')} className="mt-2 inline-flex items-center justify-center gap-2 rounded-2xl bg-linear-to-r from-accent via-sky-500 to-indigo-500 px-5 py-3 text-[11px] font-black uppercase tracking-[0.16em] text-white shadow-[0_16px_34px_-22px_rgba(11,102,255,0.6)] transition-all duration-300 hover:brightness-110">
              Open Workspace
              <ArrowRight size={14} />
            </button>
          </div>
        </div>
      )}
    </nav>
  );
}
