import { useFilter } from '../context/FilterContext';

export default function FilterBar() {
  const { filters, search, applyFilters, clearFilters, loading, results, severityMode, setSeverityMode, isCtgov } = useFilter();
  const activeCount = Object.values(filters).filter(v => v && v.length > 0).length + (search ? 1 : 0);

  function handleSeverityChange(mode) {
    setSeverityMode(mode);
  }

  return (
    <div className="flex flex-col gap-4 xl:flex-row xl:items-center xl:justify-between">
      <div className="flex flex-wrap items-center gap-3">
        <button
          onClick={() => applyFilters(1)}
          disabled={loading}
          className="group relative inline-flex items-center gap-2.5 bg-gradient-to-r from-indigo-600 to-indigo-500 hover:from-indigo-500 hover:to-indigo-600 disabled:from-slate-300 disabled:to-slate-300 text-white px-6 py-2.5 rounded-xl text-sm font-semibold shadow-md shadow-indigo-200/50 hover:shadow-lg hover:shadow-indigo-300/50 disabled:shadow-none transition-all duration-200 active:scale-[0.98]"
        >
          {loading ? (
            <svg className="animate-spin h-4 w-4" viewBox="0 0 24 24"><circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" /><path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" /></svg>
          ) : (
            <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" /></svg>
          )}
          Apply Filters
        </button>
        <button
          onClick={clearFilters}
          className="text-sm text-slate-500 hover:text-indigo-600 px-4 py-2.5 rounded-xl hover:bg-indigo-50/50 font-medium transition-all duration-200"
        >
          Clear All
        </button>
        {activeCount > 0 && (
          <div className="flex items-center gap-1.5 bg-indigo-50 border border-indigo-100 rounded-full px-3 py-1">
            <div className="h-1.5 w-1.5 rounded-full bg-indigo-500 animate-pulse" />
            <span className="text-xs font-semibold text-indigo-600">{activeCount} active</span>
          </div>
        )}
        <div className="flex items-center gap-2 rounded-2xl border border-slate-200/80 bg-white/75 px-2 py-2 shadow-sm shadow-slate-200/40">
          <div className="px-2">
            <p className="text-[10px] font-bold uppercase tracking-[0.18em] text-slate-400">AE Mode</p>
            <p className="text-xs text-slate-500">{isCtgov ? 'CTGOV: all events vs serious' : 'FDA: all grades vs grade 3+'}</p>
          </div>
          <div className="flex rounded-xl bg-slate-100/90 p-1 gap-1">
            {[
              ['all', isCtgov ? 'All Events' : 'All Grades'],
              ['serious_or_grade3_plus', isCtgov ? 'Serious' : 'Grade 3+'],
            ].map(([key, label]) => (
              <button
                key={key}
                type="button"
                onClick={() => handleSeverityChange(key)}
                className={`rounded-lg px-3 py-1.5 text-xs font-semibold transition-all duration-200 ${
                  severityMode === key
                    ? 'bg-white text-slate-900 shadow-sm'
                    : 'text-slate-500 hover:text-slate-700'
                }`}
              >
                {label}
              </button>
            ))}
          </div>
        </div>
      </div>
      {results.total > 0 && (
        <div className="text-sm text-slate-500 font-medium">
          <span className="text-slate-800 font-bold">{results.total.toLocaleString()}</span> results found
        </div>
      )}
    </div>
  );
}
