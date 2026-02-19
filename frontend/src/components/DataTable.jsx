import { useFilter } from '../context/FilterContext';
import { getExportUrl } from '../api';

const PRIORITY_COLS = [
  'antibody', 'condition', 'organ_system', 'adverse_event_term', 
  'general_molecular_category', 'target_1', 'moa_new', 'record_category',
  'dose_mg', 'dose_mg_kg', 'frequency_days', 'median_duration_days',
  'duration', 'phase', 'n_ab', 'events_ab', 'n_comp', 'events_comp',
  'all_grades%', 'grade_3_4%', 'grade_5%',
  'source'
];

export default function DataTable() {
  const { table, filters, search, results, loading, applyFilters, sortBy, sortDir } = useFilter();
  const { data, total, page, page_size } = results;

  if (loading && data.length === 0) {
    return (
      <div className="bg-white/70 backdrop-blur-sm rounded-2xl shadow-sm shadow-slate-200/50 border border-slate-200/60 p-8">
        <div className="space-y-3">
          <div className="h-4 bg-slate-200/60 rounded-full w-48 animate-pulse" />
          {Array.from({ length: 5 }).map((_, i) => <div key={i} className="h-10 bg-slate-100/60 rounded-xl animate-pulse" />)}
        </div>
      </div>
    );
  }

  if (!data || data.length === 0) {
    return (
      <div className="bg-white/70 backdrop-blur-sm rounded-2xl shadow-sm shadow-slate-200/50 border border-slate-200/60 p-16 text-center">
        <div className="h-14 w-14 rounded-2xl bg-slate-100 flex items-center justify-center mx-auto mb-4">
          <svg className="h-7 w-7 text-slate-300" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M3 10h18M3 14h18m-9-4v8m-7 0h14a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z" /></svg>
        </div>
        <p className="text-sm text-slate-400 font-medium">No results found</p>
        <p className="text-xs text-slate-300 mt-1">Try adjusting your filters</p>
      </div>
    );
  }

  const allCols = Object.keys(data[0]);
  const orderedCols = [...PRIORITY_COLS.filter(c => allCols.includes(c)), ...allCols.filter(c => !PRIORITY_COLS.includes(c))];
  const totalPages = Math.ceil(total / page_size);

  function handleSort(col) {
    const newDir = sortBy === col && sortDir === 'asc' ? 'desc' : 'asc';
    applyFilters(page, col, newDir);
  }

  function handlePage(p) {
    if (p < 1 || p > totalPages) return;
    applyFilters(p, sortBy, sortDir);
  }

  function handleExport() {
    window.open(getExportUrl(table, filters, search), '_blank');
  }

  const pageNums = [];
  const start = Math.max(1, page - 2);
  const end = Math.min(totalPages, page + 2);
  for (let i = start; i <= end; i++) pageNums.push(i);

  return (
    <div className="bg-white/70 backdrop-blur-sm rounded-2xl shadow-sm shadow-slate-200/50 border border-slate-200/60 overflow-hidden">
      <div className="flex items-center justify-between px-6 py-4 border-b border-slate-100/80">
        <div className="flex items-center gap-2.5">
          <div className="h-8 w-8 rounded-lg bg-gradient-to-br from-violet-500 to-purple-500 flex items-center justify-center">
            <svg className="h-4 w-4 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 10h18M3 14h18m-9-4v8m-7 0h14a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z" /></svg>
          </div>
          <h3 className="text-sm font-bold text-slate-700">Results</h3>
          <span className="text-xs bg-slate-100 text-slate-500 font-semibold rounded-full px-2.5 py-0.5">{total.toLocaleString()} rows</span>
        </div>
        <button
          onClick={handleExport}
          className="inline-flex items-center gap-2 text-sm text-indigo-600 hover:text-indigo-800 font-semibold px-3 py-1.5 rounded-lg hover:bg-indigo-50 transition-all duration-200"
        >
          <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" /></svg>
          Export CSV
        </button>
      </div>

      <div className="overflow-x-auto">
        <table className="w-full text-sm">
          <thead>
            <tr className="bg-slate-50/80">
              {orderedCols.map(col => (
                <th
                  key={col}
                  onClick={() => handleSort(col)}
                  className="px-4 py-3 text-left text-[11px] font-bold text-slate-500 uppercase tracking-wider cursor-pointer hover:text-indigo-600 whitespace-nowrap select-none transition-colors group"
                >
                  <span className="inline-flex items-center gap-1">
                    {col.replace(/_/g, ' ')}
                    {sortBy === col ? (
                      <span className="text-indigo-500">{sortDir === 'asc' ? '↑' : '↓'}</span>
                    ) : (
                      <span className="text-slate-300 opacity-0 group-hover:opacity-100 transition-opacity">↕</span>
                    )}
                  </span>
                </th>
              ))}
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100/80">
            {data.map((row, i) => (
              <tr key={i} className="hover:bg-indigo-50/30 transition-colors duration-150">
                {orderedCols.map(col => (
                  <td key={col} className="px-4 py-2.5 text-slate-600 whitespace-nowrap max-w-[200px] truncate font-mono text-xs">
                    {row[col] == null ? <span className="text-slate-300 font-sans italic">null</span> : String(row[col])}
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {totalPages > 1 && (
        <div className="flex items-center justify-between px-6 py-4 border-t border-slate-100/80 bg-slate-50/30">
          <button
            onClick={() => handlePage(page - 1)}
            disabled={page <= 1}
            className="inline-flex items-center gap-1.5 text-sm text-slate-600 hover:text-indigo-600 disabled:text-slate-300 px-3 py-1.5 rounded-lg hover:bg-white disabled:hover:bg-transparent font-medium transition-all"
          >
            <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" /></svg>
            Previous
          </button>
          <div className="flex items-center gap-1">
            {start > 1 && <span className="text-xs text-slate-400 px-2">...</span>}
            {pageNums.map(p => (
              <button
                key={p}
                onClick={() => handlePage(p)}
                className={`h-8 min-w-8 px-2 rounded-lg text-xs font-semibold transition-all ${
                  p === page
                    ? 'bg-indigo-600 text-white shadow-sm shadow-indigo-200'
                    : 'text-slate-500 hover:bg-white hover:text-indigo-600'
                }`}
              >
                {p}
              </button>
            ))}
            {end < totalPages && <span className="text-xs text-slate-400 px-2">...</span>}
          </div>
          <button
            onClick={() => handlePage(page + 1)}
            disabled={page >= totalPages}
            className="inline-flex items-center gap-1.5 text-sm text-slate-600 hover:text-indigo-600 disabled:text-slate-300 px-3 py-1.5 rounded-lg hover:bg-white disabled:hover:bg-transparent font-medium transition-all"
          >
            Next
            <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" /></svg>
          </button>
        </div>
      )}
    </div>
  );
}
