import { useNavigate } from 'react-router-dom';
import { LayoutGrid, Mail } from 'lucide-react';

export default function Footer() {
  const navigate = useNavigate();
  const currentYear = new Date().getFullYear();

  return (
    <footer className="relative border-t border-border bg-sidebar/35 backdrop-blur-xl">
      <div className="container mx-auto px-6 py-14">
        <div className="flex flex-col gap-10 md:flex-row md:items-start md:justify-between">
          <div className="max-w-md">
            <div className="flex items-center gap-3 mb-5">
              <div className="w-11 h-11 rounded-2xl bg-[var(--surface-strong)] border border-border flex items-center justify-center text-foreground shadow-sm">
                <LayoutGrid size={18} strokeWidth={2.5} />
              </div>
              <div>
                <span className="font-black tracking-tight text-lg text-foreground uppercase block leading-none">Explorer</span>
                <span className="text-[9px] uppercase tracking-[0.24em] text-muted font-black">Workspace OS</span>
              </div>
            </div>

            <p className="text-muted leading-7">
              A calmer way to organize the apps, tools, and links you actually use on the web.
            </p>
          </div>

          <div className="grid gap-10 sm:grid-cols-3">
            <div>
              <h3 className="text-[11px] font-black uppercase tracking-[0.18em] text-foreground mb-4">Product</h3>
              <div className="space-y-3">
                <a href="#product-preview" className="block text-sm text-muted hover:text-foreground transition-colors">Product</a>
                <a href="#features" className="block text-sm text-muted hover:text-foreground transition-colors">Features</a>
                <a href="#use-cases" className="block text-sm text-muted hover:text-foreground transition-colors">Use Cases</a>
              </div>
            </div>

            <div>
              <h3 className="text-[11px] font-black uppercase tracking-[0.18em] text-foreground mb-4">Company</h3>
              <div className="space-y-3">
                <button onClick={() => navigate('/auth')} className="block text-left text-sm text-muted hover:text-foreground transition-colors">
                  Sign In
                </button>
                <button onClick={() => navigate('/auth')} className="block text-left text-sm text-muted hover:text-foreground transition-colors">
                  Start Workspace
                </button>
              </div>
            </div>

            <div>
              <h3 className="text-[11px] font-black uppercase tracking-[0.18em] text-foreground mb-4">Contact</h3>
              <a
                href="mailto:hello@explorero.tech"
                className="inline-flex items-center gap-2 text-sm text-muted hover:text-foreground transition-colors"
              >
                <Mail size={14} />
                hello@explorero.tech
              </a>
            </div>
          </div>
        </div>

        <div className="mt-10 pt-6 border-t border-border flex flex-col gap-2 md:flex-row md:items-center md:justify-between">
          <p className="text-sm text-muted">© {currentYear} Explorer. All rights reserved.</p>
          <p className="text-sm text-muted">Built for focused, organized work.</p>
        </div>
      </div>
    </footer>
  );
}
