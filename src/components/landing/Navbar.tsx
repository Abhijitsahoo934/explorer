import { useNavigate } from 'react-router-dom';
import { LayoutGrid } from 'lucide-react';

export default function Navbar() {
  const navigate = useNavigate();

  return (
    <nav className="fixed top-0 w-full z-50 border-b border-border bg-background/50 backdrop-blur-xl transition-all duration-300">
      <div className="container mx-auto px-6 h-16 flex items-center justify-between">
        {/* Logo */}
        <div
          className="flex items-center gap-3 cursor-pointer group"
          onClick={() => navigate('/')}
        >
          <div className="w-8 h-8 rounded-xl bg-accent flex items-center justify-center text-white shadow-glow group-hover:shadow-glow-lg transition-all duration-300">
            <LayoutGrid size={16} strokeWidth={2.5} />
          </div>
          <span className="font-black tracking-wider text-sm text-foreground uppercase">
            Explorer
          </span>
        </div>

        {/* Navigation Links */}
        <div className="hidden md:flex items-center gap-8 text-xs font-bold tracking-wider uppercase text-muted">
          <a href="#features" className="hover:text-foreground transition-colors">
            Features
          </a>
          <a href="#workflow" className="hover:text-foreground transition-colors">
            Workflow
          </a>
          <a href="#benefits" className="hover:text-foreground transition-colors">
            Benefits
          </a>
        </div>

        {/* Auth Buttons */}
        <div className="flex items-center gap-4">
          <button
            onClick={() => navigate('/auth')}
            className="hidden md:block text-xs tracking-wider uppercase font-bold text-muted hover:text-foreground transition-colors"
          >
            Sign In
          </button>

          <button
            onClick={() => navigate('/auth')}
            className="h-10 px-6 text-xs font-black uppercase tracking-wider bg-accent text-white hover:bg-accent-hover hover:scale-105 transition-all duration-300 rounded-xl shadow-glow"
          >
            Get Started
          </button>
        </div>
      </div>
    </nav>
  );
}