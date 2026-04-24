import re

path = 'd:/coding/projects/apporganizer/browser-explorer/src/routes/Dashboard.tsx'
with open(path, 'r', encoding='utf-8') as f:
    text = f.read()

# 1. Remove the progress bar
text = re.sub(
    r'<div className=\"pointer-events-none absolute inset-x-0 top-0 z-20 h-1\.5 bg-background/70\">.*?</div>',
    '',
    text,
    flags=re.DOTALL
)

# 2. Remove the background blur balloons
text = re.sub(
    r'<div className=\"absolute inset-0 pointer-events-none\">\s*<div className=\"absolute -top-16 left-20 w-56 h-56 rounded-full bg-accent/15 blur-\[120px\]\" />\s*<div className=\"absolute bottom-0 right-0 w-64 h-64 rounded-full bg-sky-400/10 blur-\[140px\]\" />\s*</div>',
    '',
    text,
    flags=re.DOTALL
)

# 3. Main layout wrappers
text = text.replace(
    '<div className=\"relative z-10 flex-1 min-h-0 overflow-y-auto p-2.5 sm:p-6 md:p-8 custom-scrollbar overscroll-contain\">',
    '<div className=\"relative z-10 flex-1 min-h-0 flex flex-col\">\n                <div className=\"flex-1 min-h-0 overflow-y-auto lg:overflow-hidden p-2.5 sm:p-6 md:p-8 custom-scrollbar overscroll-contain flex flex-col\">\n'
)

text = text.replace(
    '<div className=\"flex flex-col gap-2.5 sm:gap-3 lg:grid lg:grid-cols-[280px_minmax(0,1fr)] lg:gap-6\">',
    '<div className=\"flex flex-col gap-2.5 sm:gap-3 lg:grid lg:grid-cols-[280px_minmax(0,1fr)] lg:gap-6 flex-1 min-h-0\">'
)

text = text.replace(
    '<div className=\"relative min-h-0 max-h-[10.4rem] overflow-hidden rounded-[1.25rem] border border-border/70 bg-card/45 p-2 shadow-sm sm:max-h-50 lg:max-h-[60vh]\">',
    '<div className=\"relative min-h-0 max-h-[10.4rem] overflow-hidden rounded-[1.25rem] border border-border/70 bg-card/45 p-2 shadow-sm sm:max-h-50 lg:h-full lg:max-h-none lg:flex lg:flex-col lg:flex-1\">'
)

text = text.replace(
    '<div className=\"flex h-full snap-x snap-mandatory gap-2.5 overflow-x-auto overflow-y-hidden px-1 pb-1.5 custom-scrollbar overscroll-contain touch-pan-x lg:block lg:space-y-3 lg:overflow-y-auto lg:overflow-x-hidden lg:pr-1 lg:touch-auto\">',
    '<div className=\"flex h-full snap-x snap-mandatory gap-2.5 overflow-x-auto overflow-y-hidden px-1 pb-1.5 custom-scrollbar overscroll-contain touch-pan-x lg:block lg:space-y-3 lg:overflow-y-auto lg:overflow-x-hidden lg:pr-2 lg:pb-6 lg:touch-auto\">'
)

text = text.replace(
    '{selectedTemplateId === template.id && <span className=\"h-2 w-2 rounded-full bg-accent shrink-0\" />}',
    ''
)

text = text.replace(
    '<SpotlightCard id=\"onboarding-template-details\" className=\"relative flex-1 min-h-0 overflow-visible border-border bg-background/70 p-3 custom-scrollbar overscroll-contain md:p-5 lg:p-7\">',
    '<div id=\"onboarding-template-details\" className=\"relative flex-1 min-h-0 flex flex-col overflow-hidden border border-border/80 bg-card/60 lg:rounded-[1.5rem] shadow-sm\">\n                  <div className=\"flex-1 min-h-0 overflow-y-auto p-4 custom-scrollbar lg:p-7 lg:pr-8 overscroll-contain\">'
)
text = text.replace(
    '''                  <div className="pointer-events-none absolute inset-x-0 top-0 h-8 bg-linear-to-b from-background/90 to-transparent" />
                  <div className="pointer-events-none absolute inset-x-0 bottom-0 h-10 bg-linear-to-t from-background/95 to-transparent" />
                </SpotlightCard>''',
    '''                  <div className="pointer-events-none absolute inset-x-0 top-0 h-4 bg-linear-to-b from-card/80 to-transparent" />
                  <div className="pointer-events-none absolute inset-x-0 bottom-0 h-6 bg-linear-to-t from-card/80 to-transparent" />
                </div>
                </div>'''
)

text = text.replace(
    '<div key={folder.name} className=\"rounded-[1.125rem] border border-border bg-card/70 p-3.5\">',
    '<div key={folder.name} className=\"flex flex-col rounded-[1rem] border border-border/80 bg-background/50 p-3.5 shadow-sm min-h-0\">'
)
text = text.replace(
    '<div className=\"mt-3 space-y-2\">',
    '<div className=\"mt-3 space-y-1.5 flex-1 content-start\">'
)
text = text.replace(
    '<div key={app.name} className=\"flex items-center justify-between rounded-xl bg-background/70 px-3 py-2\">',
    '<div key={app.name} className=\"flex items-center justify-between rounded-lg border border-border/40 bg-card/50 px-2.5 py-1.5\">'
)
text = text.replace(
    '<span className=\"text-sm text-foreground font-medium\">{app.name}</span>',
    '<span className=\"text-xs text-foreground font-medium truncate pr-2\">{app.name}</span>'
)
text = text.replace(
    '<span className=\"text-[10px] uppercase tracking-widest text-muted font-black\">ready</span>',
    '<span className=\"shrink-0 text-[10px] uppercase tracking-widest text-muted font-bold\">ready</span>'
)

text = text.replace(
    '                <div className=\"relative z-30 shrink-0 border-t border-border/80 bg-card/98 px-3 py-3.5 backdrop-blur-3xl sm:px-6 md:px-8 pb-[calc(0.75rem+env(safe-area-inset-bottom))] shadow-lg shadow-black/10\">',
    '              </div>\n\n                <div className=\"relative z-30 shrink-0 border-t border-border/50 bg-background/80 px-4 py-4 backdrop-blur-2xl sm:px-6 md:px-8 lg:px-10 pb-[calc(1rem+env(safe-area-inset-bottom))] lg:py-5 shadow-[0_-16px_40px_-24px_rgba(0,0,0,0.2)]\">'
)

text = text.replace(
    '<p className=\"text-[10px] uppercase tracking-[0.2em] text-accent font-black\">Ready to install</p>',
    '<p className=\"inline-flex items-center gap-2 rounded-full border border-accent/20 bg-accent/10 px-3 py-1.5 text-[10px] uppercase tracking-[0.22em] font-black text-accent\"><Sparkles size={12} /> Ready to install</p>'
)

text = text.replace(
    '<div className=\"grid gap-2.5 sm:grid-cols-2\">',
    '<div className=\"flex flex-wrap items-center gap-3 w-full sm:w-auto shrink-0 mt-3 sm:mt-0\">'
)

text = text.replace(
    '<motion.div\n                    initial={{ opacity: 0, y: 4 }}\n                    animate={{ opacity: 1, y: 0 }}\n                    transition={{ duration: 0.3, ease: MOTION_EASE_OUT }}\n                    className=\"space-y-4\"\n                  >',
    '<motion.div\n                    initial={{ opacity: 0, y: 4 }}\n                    animate={{ opacity: 1, y: 0 }}\n                    transition={{ duration: 0.3, ease: MOTION_EASE_OUT }}\n                    className=\"flex flex-col sm:flex-row sm:items-center sm:justify-between w-full\"\n                  >'
)

text = text.replace(
    '<Button\n                        className=\"w-full h-12 rounded-2xl text-[11px] uppercase tracking-widest font-black bg-linear-to-r from-accent via-accent to-sky-500 hover:from-accent/90 hover:via-accent/90 hover:to-sky-500/90 text-white shadow-md hover:shadow-lg transition-all active:scale-95\"\n',
    '<Button\n                        className=\"flex-1 sm:flex-none sm:w-[220px] lg:w-[260px] h-12 rounded-2xl text-[11px] uppercase tracking-widest font-black bg-accent hover:bg-accent/90 text-white shadow-[0_8px_20px_-8px_rgba(var(--accent),0.6)] hover:shadow-[0_12px_24px_-8px_rgba(var(--accent),0.8)] transition-all active:scale-95 border border-white/10\"\n'
)

text = text.replace(
    '<Button\n                        variant=\"ghost\"\n                        className=\"w-full h-12 rounded-2xl text-[11px] uppercase tracking-widest font-black hover:bg-card-hover active:scale-95\"\n',
    '<Button\n                        variant=\"ghost\"\n                        className=\"flex-1 sm:flex-none sm:w-[150px] lg:w-[180px] h-12 rounded-2xl border border-border/80 bg-card/50 text-[11px] uppercase tracking-widest font-black text-foreground hover:bg-card hover:border-border transition-all active:scale-95 shadow-[0_2px_8px_rgba(0,0,0,0.04)]\"\n'
)

with open(path, 'w', encoding='utf-8') as f:
    f.write(text)
