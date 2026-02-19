import { useEffect } from 'react';
import { useFilter } from '../context/FilterContext';

export default function Header() {
  const { table, setTable, loadFilterOptions, applyFilters, TABLE_LABELS } = useFilter();

  useEffect(() => {
    loadFilterOptions(table);
    applyFilters(1, null, 'asc');
  }, [table]);

  return (
    <header className="relative overflow-hidden bg-gradient-to-r from-slate-900 via-indigo-950 to-slate-900">
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top_right,rgba(99,102,241,0.15),transparent_60%)]" />
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_bottom_left,rgba(168,85,247,0.1),transparent_60%)]" />
      <div className="relative max-w-screen-2xl mx-auto px-8 py-6 flex items-center justify-between">
        <div className="flex items-center gap-4">
          <div className="h-10 w-10 rounded-xl bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center shadow-lg shadow-indigo-500/25">
            <svg className="h-5 w-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M19.5 14.25v-2.625a3.375 3.375 0 00-3.375-3.375h-1.5A1.125 1.125 0 0113.5 7.125v-1.5a3.375 3.375 0 00-3.375-3.375H8.25m5.231 13.481L15 17.25m-4.5-15H5.625c-.621 0-1.125.504-1.125 1.125v16.5c0 .621.504 1.125 1.125 1.125h12.75c.621 0 1.125-.504 1.125-1.125V11.25a9 9 0 00-9-9zm3.75 11.625a2.625 2.625 0 11-5.25 0 2.625 2.625 0 015.25 0z" />
            </svg>
          </div>
          <div>
            <h1 className="text-xl font-bold text-white tracking-tight">Therapeutic Antibody Commons</h1>
            <p className="text-xs text-indigo-300/80 font-medium tracking-wide">TAC · Monoclonal antibody safety & clinical development data</p>
          </div>
        </div>
        <div className="flex items-center gap-3">
          <span className="text-xs font-medium text-indigo-300/70 uppercase tracking-widest">Dataset</span>
          <div className="relative">
            <select
              value={table}
              onChange={(e) => setTable(e.target.value)}
              className="appearance-none bg-white/10 backdrop-blur-sm border border-white/20 rounded-lg px-4 py-2 pr-9 text-sm text-white font-medium focus:outline-none focus:ring-2 focus:ring-indigo-400/50 focus:border-indigo-400/50 cursor-pointer transition-all hover:bg-white/15"
            >
              {Object.entries(TABLE_LABELS).map(([key, label]) => (
                <option key={key} value={key} className="text-slate-800 bg-white">{label}</option>
              ))}
            </select>
            <svg className="absolute right-2.5 top-1/2 -translate-y-1/2 h-4 w-4 text-indigo-300 pointer-events-none" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
            </svg>
          </div>
        </div>
      </div>
    </header>
  );
}
