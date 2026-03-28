import { useNavigate } from 'react-router-dom';
import { LayoutGrid, Twitter, Github, Linkedin, Mail } from 'lucide-react';

export default function Footer() {
  const navigate = useNavigate();
  const currentYear = new Date().getFullYear();

  return (
    <footer className="relative border-t border-border bg-sidebar/30 backdrop-blur-xl">
      <div className="container mx-auto px-6 py-16">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-12 mb-12">
          {/* Brand Column */}
          <div className="md:col-span-2">
            <div className="flex items-center gap-3 mb-6">
              <div className="w-10 h-10 rounded-xl bg-accent flex items-center justify-center text-white shadow-glow">
                <LayoutGrid size={20} strokeWidth={2.5} />
              </div>
              <span className="font-black tracking-wider text-xl text-foreground uppercase">
                Explorer
              </span>
            </div>

            <p className="text-muted leading-relaxed max-w-md mb-6">
              The first browser workspace that treats the web like your local drive. 
              Organize websites into folders and never lose track of your tools again.
            </p>

            {/* Social Links */}
            <div className="flex items-center gap-4">
              <a
                href="https://twitter.com"
                target="_blank"
                rel="noopener noreferrer"
                className="w-10 h-10 rounded-lg bg-card border border-border flex items-center justify-center text-muted hover:text-foreground hover:border-accent/50 transition-all duration-300"
                aria-label="Twitter"
              >
                <Twitter size={18} />
              </a>
              <a
                href="https://github.com"
                target="_blank"
                rel="noopener noreferrer"
                className="w-10 h-10 rounded-lg bg-card border border-border flex items-center justify-center text-muted hover:text-foreground hover:border-accent/50 transition-all duration-300"
                aria-label="GitHub"
              >
                <Github size={18} />
              </a>
              <a
                href="https://linkedin.com"
                target="_blank"
                rel="noopener noreferrer"
                className="w-10 h-10 rounded-lg bg-card border border-border flex items-center justify-center text-muted hover:text-foreground hover:border-accent/50 transition-all duration-300"
                aria-label="LinkedIn"
              >
                <Linkedin size={18} />
              </a>
              <a
                href="mailto:hello@explorer.app"
                className="w-10 h-10 rounded-lg bg-card border border-border flex items-center justify-center text-muted hover:text-foreground hover:border-accent/50 transition-all duration-300"
                aria-label="Email"
              >
                <Mail size={18} />
              </a>
            </div>
          </div>

          {/* Product Column */}
          <div>
            <h3 className="text-sm font-bold text-foreground uppercase tracking-wider mb-4">
              Product
            </h3>
            <ul className="space-y-3">
              <li>
                <a
                  href="#features"
                  className="text-muted hover:text-foreground transition-colors text-sm"
                >
                  Features
                </a>
              </li>
              <li>
                <a
                  href="#workflow"
                  className="text-muted hover:text-foreground transition-colors text-sm"
                >
                  How It Works
                </a>
              </li>
              <li>
                <a
                  href="#benefits"
                  className="text-muted hover:text-foreground transition-colors text-sm"
                >
                  Benefits
                </a>
              </li>
              <li>
                <button
                  onClick={() => navigate('/auth')}
                  className="text-muted hover:text-foreground transition-colors text-sm text-left"
                >
                  Get Started
                </button>
              </li>
            </ul>
          </div>

          {/* Company Column */}
          <div>
            <h3 className="text-sm font-bold text-foreground uppercase tracking-wider mb-4">
              Company
            </h3>
            <ul className="space-y-3">
              <li>
                <a
                  href="#"
                  className="text-muted hover:text-foreground transition-colors text-sm"
                >
                  About
                </a>
              </li>
              <li>
                <a
                  href="#"
                  className="text-muted hover:text-foreground transition-colors text-sm"
                >
                  Blog
                </a>
              </li>
              <li>
                <a
                  href="#"
                  className="text-muted hover:text-foreground transition-colors text-sm"
                >
                  Privacy
                </a>
              </li>
              <li>
                <a
                  href="#"
                  className="text-muted hover:text-foreground transition-colors text-sm"
                >
                  Terms
                </a>
              </li>
            </ul>
          </div>
        </div>

        {/* Bottom Bar */}
        <div className="pt-8 border-t border-border flex flex-col md:flex-row items-center justify-between gap-4">
          <p className="text-sm text-muted">
            © {currentYear} Explorer. All rights reserved.
          </p>

          <p className="text-sm text-muted">
            Built with ❤️ for organized minds
          </p>
        </div>
      </div>

      {/* Background Gradient */}
      <div className="absolute inset-0 -z-10 bg-gradient-to-t from-background via-transparent to-transparent pointer-events-none" />
    </footer>
  );
}