import { useNavigate } from 'react-router-dom';
import { LayoutGrid, ArrowRight } from 'lucide-react';

export default function Navbar() {
  const navigate = useNavigate();

  return (
    <nav className="fixed top-0 w-full z-50 border-b border-border/70 bg-background/70 backdrop-blur-2xl transition-all duration-300">
      <div className="container mx-auto px-6 h-18 flex items-center justify-between">
        {/* Logo */}
        <div
          className="flex items-center gap-3 cursor-pointer group"
          onClick={() => navigate('/')}
        >
          <div className="w-11 h-11 rounded-2xl bg-[var(--surface-strong)] border border-border flex items-center justify-center text-foreground shadow-sm group-hover:-translate-y-0.5 transition-all duration-300">
            <LayoutGrid size={18} strokeWidth={2.5} />
          </div>
          <div>
            <span className="font-black tracking-tight text-base text-foreground uppercase block leading-none">
              Explorer
            </span>
            <span className="text-[9px] uppercase tracking-[0.24em] text-muted font-black">
              Workspace OS
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
        </div>

        {/* Auth Buttons */}
        <div className="flex items-center gap-3">
          <button
            onClick={() => navigate('/auth')}
            className="hidden md:block h-11 px-4 text-[11px] tracking-[0.16em] uppercase font-black text-muted hover:text-foreground transition-colors rounded-xl"
          >
            Sign In
          </button>

          <button
            onClick={() => navigate('/auth')}
            className="h-11 px-5 text-[11px] font-black uppercase tracking-[0.16em] bg-foreground text-background hover:opacity-90 transition-all duration-300 rounded-2xl shadow-sm inline-flex items-center gap-2"
          >
            Start Workspace
            <ArrowRight size={14} />
          </button>
        </div>
      </div>
    </nav>
  );
}
