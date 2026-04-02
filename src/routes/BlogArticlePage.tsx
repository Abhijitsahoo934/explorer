import { ArrowRight, BookOpen, Sparkles } from 'lucide-react';
import { Navigate, useNavigate, useParams } from 'react-router-dom';
import Navbar from '../components/landing/Navbar';
import Footer from '../components/landing/Footer';
import { Grain } from '../components/ui/Grain';
import { Button } from '../components/ui/Button';
import { Seo } from '../components/system/Seo';
import { getBlogArticle } from '../lib/blogArticles';
import { PUBLIC_ARTICLE_LINKS, PUBLIC_TEMPLATE_LINKS } from '../lib/publicSiteLinks';

export default function BlogArticlePage() {
  const { slug } = useParams();
  const navigate = useNavigate();
  const article = getBlogArticle(slug);

  if (!article) {
    return <Navigate to="/" replace />;
  }

  const faqStructuredData = {
    '@context': 'https://schema.org',
    '@type': 'FAQPage',
    mainEntity: [
      {
        '@type': 'Question',
        name: `What is this article about?`,
        acceptedAnswer: {
          '@type': 'Answer',
          text: article.description,
        },
      },
      {
        '@type': 'Question',
        name: 'Is Explorero a bookmark manager?',
        acceptedAnswer: {
          '@type': 'Answer',
          text: 'No. Explorero is built to organize complete workflows and workspaces, not just save individual links.',
        },
      },
      {
        '@type': 'Question',
        name: 'Who should use Explorero?',
        acceptedAnswer: {
          '@type': 'Answer',
          text: 'Explorero is especially useful for developers, creators, freelancers, founders, and people who work across many browser-based tools.',
        },
      },
    ],
  };

  return (
    <div className="min-h-screen overflow-x-hidden bg-background text-foreground">
      <Seo
        title={article.seoTitle}
        description={article.description}
        canonicalPath={`/blog/${article.slug}`}
        keywords={[
          article.title.toLowerCase(),
          'browser workflow',
          'organize tools',
          'productivity system',
          'workspace os',
          'bookmark alternative',
        ]}
        structuredData={faqStructuredData}
      />
      <Grain />
      <Navbar />

      <main className="relative pt-28">
        <div className="pointer-events-none fixed inset-0 -z-10 overflow-hidden">
          <div className="absolute left-[8%] top-24 h-72 w-72 rounded-full bg-accent/10 blur-[120px]" />
          <div className="absolute bottom-12 right-[10%] h-72 w-72 rounded-full bg-sky-400/10 blur-[140px]" />
        </div>

        <section className="px-6 pb-10 pt-10">
          <div className="container mx-auto max-w-4xl">
            <div className="inline-flex items-center gap-2 rounded-full border border-accent/20 bg-accent/10 px-3 py-1.5 text-[10px] font-black uppercase tracking-[0.22em] text-accent">
              <Sparkles size={12} />
              {article.category}
            </div>

            <h1 className="mt-6 text-4xl font-black leading-[0.96] tracking-tight md:text-6xl">{article.title}</h1>
            <p className="mt-6 text-lg leading-8 text-muted">{article.intro}</p>
          </div>
        </section>

        <section className="px-6 pb-8">
          <div className="container mx-auto max-w-4xl space-y-8">
            {article.sections.map((section) => (
              <article key={section.title} className="rounded-[2rem] border border-border bg-card/70 p-8 shadow-premium backdrop-blur-xl">
                <h2 className="text-2xl font-black tracking-tight">{section.title}</h2>
                <div className="mt-4 space-y-4">
                  {section.paragraphs.map((paragraph) => (
                    <p key={paragraph} className="text-base leading-8 text-muted">
                      {paragraph}
                    </p>
                  ))}
                </div>
                {section.bullets && (
                  <div className="mt-6 space-y-3">
                    {section.bullets.map((bullet) => (
                      <div key={bullet} className="flex items-start gap-3 rounded-2xl border border-border bg-background/60 px-4 py-3">
                        <BookOpen size={16} className="mt-0.5 shrink-0 text-accent" />
                        <p className="text-sm leading-6 text-muted">{bullet}</p>
                      </div>
                    ))}
                  </div>
                )}
              </article>
            ))}
          </div>
        </section>

        <section className="px-6 pb-16 pt-2">
          <div className="container mx-auto max-w-5xl rounded-[2rem] border border-border bg-sidebar/35 p-8 shadow-premium backdrop-blur-xl">
            <h2 className="text-3xl font-black tracking-tight">{article.ctaTitle}</h2>
            <p className="mt-4 max-w-3xl text-base leading-8 text-muted">{article.ctaText}</p>

            <div className="mt-8 flex flex-col gap-3 sm:flex-row">
              <Button
                className="h-12 rounded-2xl px-6 text-[11px] font-black uppercase tracking-widest"
                onClick={() => navigate('/auth')}
              >
                Start free
                <ArrowRight size={14} className="ml-2" />
              </Button>
              <Button
                variant="outline"
                className="h-12 rounded-2xl px-6 text-[11px] font-black uppercase tracking-widest"
                onClick={() => navigate('/about-explorero')}
              >
                About Explorero
              </Button>
            </div>

            <div className="mt-8 grid gap-4 md:grid-cols-3">
              {PUBLIC_TEMPLATE_LINKS.map((link) => (
                <button
                  key={link.path}
                  onClick={() => navigate(link.path)}
                  className="rounded-[1.5rem] border border-border bg-background/70 p-5 text-left transition-all hover:border-accent/30 hover:bg-card"
                >
                  <p className="text-[10px] font-black uppercase tracking-[0.22em] text-muted">Template</p>
                  <h3 className="mt-3 text-xl font-black tracking-tight">{link.title}</h3>
                  <p className="mt-3 text-sm leading-6 text-muted">{link.description}</p>
                </button>
              ))}
            </div>

            <div className="mt-8 rounded-[1.5rem] border border-border bg-card/50 p-5">
              <p className="text-[10px] font-black uppercase tracking-[0.22em] text-muted">Continue reading</p>
              <div className="mt-4 grid gap-3 md:grid-cols-2">
                {PUBLIC_ARTICLE_LINKS.filter((link) => link.path !== `/blog/${article.slug}`).map((link) => (
                  <button
                    key={link.path}
                    onClick={() => navigate(link.path)}
                    className="rounded-2xl border border-border bg-background/70 p-4 text-left transition-all hover:border-accent/30 hover:bg-card"
                  >
                    <h3 className="text-base font-black tracking-tight">{link.title}</h3>
                    <p className="mt-2 text-sm leading-6 text-muted">{link.description}</p>
                  </button>
                ))}
              </div>
            </div>
          </div>
        </section>

        <section className="px-6 pb-16 pt-0">
          <div className="container mx-auto max-w-4xl rounded-[2rem] border border-border bg-card/70 p-8 shadow-premium backdrop-blur-xl">
            <p className="text-[10px] font-black uppercase tracking-[0.24em] text-muted">FAQ</p>
            <h2 className="mt-4 text-3xl font-black tracking-tight">Frequently asked questions</h2>
            <div className="mt-8 space-y-5">
              <div className="rounded-[1.5rem] border border-border bg-background/70 p-5">
                <h3 className="text-lg font-black tracking-tight">Is Explorero a bookmark manager?</h3>
                <p className="mt-3 text-sm leading-7 text-muted">
                  No. Explorero is a workspace operating system designed to keep apps, tools, and workflows structured
                  together, not just saved as isolated links.
                </p>
              </div>
              <div className="rounded-[1.5rem] border border-border bg-background/70 p-5">
                <h3 className="text-lg font-black tracking-tight">Who benefits most from Explorero?</h3>
                <p className="mt-3 text-sm leading-7 text-muted">
                  Developers, creators, freelancers, founders, and heavy browser users benefit the most because their
                  work depends on many connected tools.
                </p>
              </div>
              <div className="rounded-[1.5rem] border border-border bg-background/70 p-5">
                <h3 className="text-lg font-black tracking-tight">Why does workflow structure matter?</h3>
                <p className="mt-3 text-sm leading-7 text-muted">
                  Structure reduces context switching, makes it easier to begin work, and helps people return to the
                  same productive setup without rebuilding it from memory.
                </p>
              </div>
            </div>
          </div>
        </section>
      </main>

      <Footer />
    </div>
  );
}
