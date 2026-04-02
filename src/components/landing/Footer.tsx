import { useNavigate } from 'react-router-dom';
import { Mail } from 'lucide-react';
import { BrandLogo } from '../ui/BrandLogo';
import { PUBLIC_ARTICLE_LINKS, PUBLIC_TEMPLATE_LINKS } from '../../lib/publicSiteLinks';

export default function Footer() {
  const navigate = useNavigate();
  const currentYear = new Date().getFullYear();

  return (
    <footer className="relative border-t border-border bg-sidebar/35 backdrop-blur-xl">
      <div className="container mx-auto px-6 py-14">
        <div className="flex flex-col gap-10 md:flex-row md:items-start md:justify-between">
          <div className="max-w-md">
            <div className="mb-5 flex items-center gap-3">
              <BrandLogo className="h-11 w-11" />
              <div>
                <span className="block leading-none text-lg font-black uppercase tracking-tight text-foreground">
                  Explorero
                </span>
                <span className="text-[9px] font-black uppercase tracking-[0.24em] text-muted">
                  Workspace OS
                </span>
              </div>
            </div>

            <p className="leading-7 text-muted">
              A calmer way to organize the apps, tools, and links you actually use on the web.
            </p>
          </div>

          <div className="grid gap-10 sm:grid-cols-4">
            <div>
              <h3 className="mb-4 text-[11px] font-black uppercase tracking-[0.18em] text-foreground">Product</h3>
              <div className="space-y-3">
                <a href="#product-preview" className="block text-sm text-muted transition-colors hover:text-foreground">
                  Product
                </a>
                <a href="#features" className="block text-sm text-muted transition-colors hover:text-foreground">
                  Features
                </a>
                <a href="#use-cases" className="block text-sm text-muted transition-colors hover:text-foreground">
                  Use Cases
                </a>
                <button
                  onClick={() => navigate('/about-explorero')}
                  className="block text-left text-sm text-muted transition-colors hover:text-foreground"
                >
                  About Explorero
                </button>
              </div>
            </div>

            <div>
              <h3 className="mb-4 text-[11px] font-black uppercase tracking-[0.18em] text-foreground">Templates</h3>
              <div className="space-y-3">
                {PUBLIC_TEMPLATE_LINKS.map((link) => (
                  <button
                    key={link.path}
                    onClick={() => navigate(link.path)}
                    className="block text-left text-sm text-muted transition-colors hover:text-foreground"
                  >
                    {link.title}
                  </button>
                ))}
              </div>
            </div>

            <div>
              <h3 className="mb-4 text-[11px] font-black uppercase tracking-[0.18em] text-foreground">Learn</h3>
              <div className="space-y-3">
                {PUBLIC_ARTICLE_LINKS.map((link) => (
                  <button
                    key={link.path}
                    onClick={() => navigate(link.path)}
                    className="block text-left text-sm text-muted transition-colors hover:text-foreground"
                  >
                    {link.title}
                  </button>
                ))}
              </div>
            </div>

            <div>
              <h3 className="mb-4 text-[11px] font-black uppercase tracking-[0.18em] text-foreground">Contact</h3>
              <a
                href="mailto:hello@explorero.tech"
                className="inline-flex items-center gap-2 text-sm text-muted transition-colors hover:text-foreground"
              >
                <Mail size={14} />
                hello@explorero.tech
              </a>
            </div>
          </div>
        </div>

        <div className="mt-10 flex flex-col gap-2 border-t border-border pt-6 md:flex-row md:items-center md:justify-between">
          <p className="text-sm text-muted">&copy; {currentYear} Explorero. All rights reserved.</p>
          <p className="text-sm text-muted">Built for focused, organized work.</p>
        </div>
      </div>
    </footer>
  );
}
