import { useFilter } from '../context/FilterContext';

export default function FilterBar() {
  const { filters, search, applyFilters, clearFilters, loading, results } = useFilter();
  const activeCount = Object.values(filters).filter(v => v && v.length > 0).length + (search ? 1 : 0);

  return (
    <div className="flex items-center justify-between">
      <div className="flex items-center gap-3">
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
      </div>
      {results.total > 0 && (
        <div className="text-sm text-slate-500 font-medium">
          <span className="text-slate-800 font-bold">{results.total.toLocaleString()}</span> results found
        </div>
      )}
    </div>
  );
}
