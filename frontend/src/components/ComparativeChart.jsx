import { useState, useEffect } from 'react';
import Select from 'react-select';
import Plot from 'react-plotly.js';
import { fetchComparative, fetchStudies } from '../api';
import { useFilter } from '../context/FilterContext';

const miniSelectStyles = {
  control: (base, state) => ({
    ...base,
    borderColor: state.isFocused ? '#a5b4fc' : '#e2e8f0',
    backgroundColor: state.isFocused ? '#ffffff' : '#f8fafc',
    minHeight: 38,
    fontSize: '0.8125rem',
    borderRadius: '0.75rem',
    boxShadow: state.isFocused ? '0 0 0 3px rgba(99,102,241,0.1)' : 'none',
    '&:hover': { borderColor: '#c7d2fe' },
  }),
  placeholder: (base) => ({ ...base, color: '#94a3b8', fontSize: '0.8125rem' }),
  menu: (base) => ({ ...base, zIndex: 40, borderRadius: '0.75rem', boxShadow: '0 10px 40px -10px rgba(0,0,0,0.12)', border: '1px solid #e2e8f0' }),
  option: (base, state) => ({ ...base, fontSize: '0.8125rem', backgroundColor: state.isFocused ? '#eef2ff' : 'transparent', color: state.isFocused ? '#4338ca' : '#475569' }),
  indicatorSeparator: () => ({ display: 'none' }),
};

export default function ComparativeChart() {
  const { table, filterOptions, isCtgov } = useFilter();
  const [antibody, setAntibody] = useState(null);
  const [nctId, setNctId] = useState(null);
  const [studies, setStudies] = useState([]);
  const [groupBy, setGroupBy] = useState('organ_system');
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(false);

  const antibodyOptions = (filterOptions.antibody || []).map(a => ({ value: a, label: a }));

  useEffect(() => { setAntibody(null); setNctId(null); setData(null); setStudies([]); }, [table]);

  useEffect(() => {
    if (!antibody || !isCtgov) return;
    fetchStudies(table, antibody.value).then(r => {
      setStudies(r.studies.map(s => ({ value: s, label: s })));
      setNctId(null);
    }).catch(() => setStudies([]));
  }, [antibody, table, isCtgov]);

  async function loadComparative() {
    if (!antibody) return;
    setLoading(true);
    try {
      setData(await fetchComparative({ table, antibody: antibody.value, nctId: nctId?.value, groupBy }));
    } catch {
      setData(null);
    }
    setLoading(false);
  }

  const hasData = data && data.ab_arm && data.ab_arm.categories.length > 0;

  return (
    <div className="bg-white/70 backdrop-blur-sm rounded-2xl shadow-sm shadow-slate-200/50 border border-slate-200/60 overflow-hidden">
      <div className="px-6 py-4 border-b border-slate-100/80">
        <div className="flex items-center gap-2.5 mb-4">
          <div className="h-8 w-8 rounded-lg bg-gradient-to-br from-emerald-500 to-teal-500 flex items-center justify-center">
            <svg className="h-4 w-4 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19V6l12-3v13M9 19c0 1.105-1.343 2-3 2s-3-.895-3-2 1.343-2 3-2 3 .895 3 2zm12-3c0 1.105-1.343 2-3 2s-3-.895-3-2 1.343-2 3-2 3 .895 3 2zM9 10l12-3" /></svg>
          </div>
          <h3 className="text-sm font-bold text-slate-700">Comparative Arm Analysis</h3>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-4 gap-3">
          <div>
            <label className="block text-[11px] font-semibold text-slate-500 uppercase tracking-wider mb-1.5">Antibody</label>
            <Select options={antibodyOptions} value={antibody} onChange={setAntibody} isClearable placeholder="Select..." styles={miniSelectStyles} maxMenuHeight={200} />
          </div>
          {isCtgov && (
            <div>
              <label className="block text-[11px] font-semibold text-slate-500 uppercase tracking-wider mb-1.5">Study (NCT ID)</label>
              <Select options={studies} value={nctId} onChange={setNctId} isClearable placeholder="All studies..." styles={miniSelectStyles} maxMenuHeight={200} />
            </div>
          )}
          <div>
            <label className="block text-[11px] font-semibold text-slate-500 uppercase tracking-wider mb-1.5">Group by</label>
            <select value={groupBy} onChange={(e) => setGroupBy(e.target.value)} className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-[7px] text-[0.8125rem] text-slate-700 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-300">
              <option value="organ_system">Organ System</option>
              <option value="adverse_event_term">AE Term</option>
            </select>
          </div>
          <div className="flex items-end">
            <button
              onClick={loadComparative}
              disabled={!antibody || loading}
              className="w-full bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 disabled:from-slate-200 disabled:to-slate-200 disabled:text-slate-400 text-white px-4 py-2 rounded-xl text-sm font-semibold shadow-sm shadow-emerald-200/50 hover:shadow-md disabled:shadow-none transition-all duration-200 active:scale-[0.98]"
            >
              {loading ? 'Loading...' : 'Compare'}
            </button>
          </div>
        </div>
      </div>
      <div className="p-6">
        {loading ? (
          <div className="h-72 flex items-center justify-center">
            <div className="animate-spin h-8 w-8 border-[3px] border-emerald-200 border-t-emerald-600 rounded-full" />
          </div>
        ) : !hasData ? (
          <div className="h-72 flex items-center justify-center">
            <div className="text-center">
              <div className="h-12 w-12 rounded-2xl bg-slate-100 flex items-center justify-center mx-auto mb-3">
                <svg className="h-6 w-6 text-slate-300" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M8 7h12m0 0l-4-4m4 4l-4 4m0 6H4m0 0l4 4m-4-4l4-4" /></svg>
              </div>
              <p className="text-sm text-slate-400 font-medium">Select an antibody to compare arms</p>
            </div>
          </div>
        ) : (
          <Plot
            data={[
              {
                type: 'bar', name: 'Treatment Arm', y: data.ab_arm.categories, x: data.ab_arm.proportions, orientation: 'h',
                marker: { color: 'rgba(99, 102, 241, 0.8)', line: { width: 0 } },
                hoverlabel: { bgcolor: '#4338ca', font: { family: 'Inter', color: '#fff' }, bordercolor: 'transparent' },
              },
              {
                type: 'bar', name: 'Comparator', y: data.comp_arm.categories, x: data.comp_arm.proportions, orientation: 'h',
                marker: { color: 'rgba(245, 158, 11, 0.8)', line: { width: 0 } },
                hoverlabel: { bgcolor: '#d97706', font: { family: 'Inter', color: '#fff' }, bordercolor: 'transparent' },
              },
            ]}
            layout={{
              barmode: 'group',
              margin: { t: 8, b: 40, l: 280, r: 24 },
              xaxis: { title: { text: 'Proportion (%)', font: { size: 11, color: '#94a3b8', family: 'Inter' } }, tickfont: { size: 11, color: '#94a3b8', family: 'Inter' }, gridcolor: '#f1f5f9', zeroline: false },
              yaxis: { tickfont: { size: 11, color: '#475569', family: 'Inter' }, automargin: true },
              legend: { orientation: 'h', y: 1.08, font: { size: 12, family: 'Inter', color: '#64748b' } },
              paper_bgcolor: 'transparent', plot_bgcolor: 'transparent',
              font: { family: 'Inter, sans-serif' },
              height: 450, bargap: 0.25, bargroupgap: 0.1,
            }}
            config={{ displayModeBar: false, responsive: true }}
            style={{ width: '100%' }}
            useResizeHandler
          />
        )}
      </div>
    </div>
  );
}
