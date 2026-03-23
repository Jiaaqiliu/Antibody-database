const PAGE_COPY = {
  'fc-mutations': {
    eyebrow: 'Future Workspace',
    title: 'FC Mutation Intelligence Hub',
    description: 'This page reserves a dedicated space for Fc mutation annotations, engineering patterns, and cross-antibody comparison once the team finalizes the next content package.',
    highlights: [
      'Separate home-page analytics from future Fc engineering content.',
      'Prepare room for curated tables, mutation summaries, and comparison views.',
      'Keep navigation visible so the next implementation phase has a stable landing page.',
    ],
    accent: 'from-cyan-500/20 via-sky-500/10 to-transparent',
    border: 'border-cyan-200/60',
    chip: 'bg-cyan-500/10 text-cyan-700 border-cyan-200/70',
  },
  'target-features': {
    eyebrow: 'Future Workspace',
    title: 'Target Feature Analysis',
    description: 'This page is reserved for downstream target-level analysis, including harmonized feature views, target class framing, and follow-on methodology notes discussed in the meeting.',
    highlights: [
      'Create a stable destination for target-centric visualizations.',
      'Decouple exploratory future work from the production safety dashboard.',
      'Give the next agent a clear extension point for additional research modules.',
    ],
    accent: 'from-amber-500/20 via-orange-500/10 to-transparent',
    border: 'border-amber-200/60',
    chip: 'bg-amber-500/10 text-amber-700 border-amber-200/70',
  },
};

export default function FutureContentPage({ page }) {
  const content = PAGE_COPY[page] || PAGE_COPY['fc-mutations'];

  return (
    <main className="max-w-screen-2xl mx-auto px-8 py-8">
      <section className="relative overflow-hidden rounded-[2rem] border border-slate-200/70 bg-white/80 p-8 shadow-xl shadow-slate-200/50 backdrop-blur-sm sm:p-10">
        <div className={`absolute inset-x-0 top-0 h-40 bg-gradient-to-br ${content.accent}`} />
        <div className="relative space-y-8">
          <div className="space-y-4">
            <span className={`inline-flex items-center rounded-full border px-3 py-1 text-[11px] font-bold uppercase tracking-[0.2em] ${content.chip}`}>
              {content.eyebrow}
            </span>
            <div className="max-w-4xl space-y-3">
              <h2 className="text-3xl font-bold tracking-tight text-slate-900 sm:text-4xl">{content.title}</h2>
              <p className="max-w-3xl text-sm leading-7 text-slate-600 sm:text-base">{content.description}</p>
            </div>
          </div>

          <div className="grid gap-5 lg:grid-cols-[1.35fr_0.85fr]">
            <div className={`rounded-[1.5rem] border ${content.border} bg-white/85 p-6 shadow-sm shadow-slate-200/50`}>
              <h3 className="text-sm font-bold uppercase tracking-[0.18em] text-slate-500">Planned Focus</h3>
              <div className="mt-4 space-y-3">
                {content.highlights.map((item) => (
                  <div key={item} className="flex gap-3 rounded-2xl bg-slate-50/80 p-4">
                    <span className="mt-1 h-2.5 w-2.5 rounded-full bg-slate-900" />
                    <p className="text-sm leading-6 text-slate-600">{item}</p>
                  </div>
                ))}
              </div>
            </div>

            <div className="rounded-[1.5rem] border border-dashed border-slate-300 bg-slate-50/80 p-6">
              <h3 className="text-sm font-bold uppercase tracking-[0.18em] text-slate-500">Current Status</h3>
              <div className="mt-4 space-y-4 text-sm text-slate-600">
                <p>The homepage remains the active production dashboard for CT.gov and FDA label safety analysis.</p>
                <p>This page now acts as a stable placeholder, so future implementation can ship here without overloading the main dashboard.</p>
                <div className="rounded-2xl bg-white p-4 shadow-sm shadow-slate-200/60">
                  <p className="font-semibold text-slate-800">Next implementation hook</p>
                  <p className="mt-1 text-sm leading-6 text-slate-600">Replace this placeholder card set with the agreed data views once Ian finalizes the additional content package and display requirements.</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>
    </main>
  );
}
