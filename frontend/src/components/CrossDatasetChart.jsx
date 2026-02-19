import { useState, useEffect } from 'react';
import Select from 'react-select';
import Plot from 'react-plotly.js';
import { fetchCrossDataset, fetchOverlappingAntibodies } from '../api';

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

export default function CrossDatasetChart() {
  const [antibodies, setAntibodies] = useState([]);
  const [selectedAntibody, setSelectedAntibody] = useState(null);
  const [groupBy, setGroupBy] = useState('organ_system');
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    fetchOverlappingAntibodies().then(r => {
      setAntibodies(r.antibodies.map(a => ({ value: a, label: a })));
    }).catch(() => setAntibodies([]));
  }, []);

  async function loadComparison() {
    if (!selectedAntibody) return;
    setLoading(true);
    try {
      setData(await fetchCrossDataset({ antibody: selectedAntibody.value, groupBy }));
    } catch {
      setData(null);
    }
    setLoading(false);
  }

  const hasData = data && data.categories && data.categories.length > 0;

  return (
    <div className="bg-white/70 backdrop-blur-sm rounded-2xl shadow-sm shadow-slate-200/50 border border-slate-200/60 overflow-hidden">
      <div className="px-6 py-4 border-b border-slate-100/80">
        <div className="flex items-center gap-2.5 mb-4">
          <div className="h-8 w-8 rounded-lg bg-gradient-to-br from-violet-500 to-purple-500 flex items-center justify-center">
            <svg className="h-4 w-4 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" /></svg>
          </div>
          <div>
            <h3 className="text-sm font-bold text-slate-700">Cross-Dataset Comparison</h3>
            <p className="text-[10px] text-slate-400">Compare CTGOV vs FDA Label for the same antibody</p>
          </div>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-4 gap-3">
          <div className="md:col-span-2">
            <label className="block text-[11px] font-semibold text-slate-500 uppercase tracking-wider mb-1.5">
              Antibody <span className="text-slate-400 normal-case">({antibodies.length} in both datasets)</span>
            </label>
            <Select
              options={antibodies}
              value={selectedAntibody}
              onChange={setSelectedAntibody}
              isClearable
              placeholder="Select antibody..."
              styles={miniSelectStyles}
              maxMenuHeight={200}
            />
          </div>
          <div>
            <label className="block text-[11px] font-semibold text-slate-500 uppercase tracking-wider mb-1.5">Group by</label>
            <select
              value={groupBy}
              onChange={(e) => setGroupBy(e.target.value)}
              className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-[7px] text-[0.8125rem] text-slate-700 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-300"
            >
              <option value="organ_system">Organ System</option>
              <option value="adverse_event_term">AE Term</option>
            </select>
          </div>
          <div className="flex items-end">
            <button
              onClick={loadComparison}
              disabled={!selectedAntibody || loading}
              className="w-full bg-gradient-to-r from-violet-600 to-purple-600 hover:from-violet-500 hover:to-purple-500 disabled:from-slate-200 disabled:to-slate-200 disabled:text-slate-400 text-white px-4 py-2 rounded-xl text-sm font-semibold shadow-sm shadow-violet-200/50 hover:shadow-md disabled:shadow-none transition-all duration-200 active:scale-[0.98]"
            >
              {loading ? 'Loading...' : 'Compare'}
            </button>
          </div>
        </div>
      </div>
      <div className="p-6">
        {loading ? (
          <div className="h-72 flex items-center justify-center">
            <div className="animate-spin h-8 w-8 border-[3px] border-violet-200 border-t-violet-600 rounded-full" />
          </div>
        ) : !hasData ? (
          <div className="h-72 flex items-center justify-center">
            <div className="text-center">
              <div className="h-12 w-12 rounded-2xl bg-slate-100 flex items-center justify-center mx-auto mb-3">
                <svg className="h-6 w-6 text-slate-300" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" /></svg>
              </div>
              <p className="text-sm text-slate-400 font-medium">Select an antibody to compare across datasets</p>
            </div>
          </div>
        ) : (
          <div>
            <Plot
              data={[
                {
                  type: 'bar',
                  name: 'CTGOV (Clinical Trials)',
                  y: data.categories,
                  x: data.ctgov.values.map(v => v ?? 0),
                  orientation: 'h',
                  marker: { color: 'rgba(59, 130, 246, 0.8)', line: { width: 0 } },
                  hovertemplate: '%{y}<br>CTGOV: %{x:.2f}%<extra></extra>',
                  hoverlabel: { bgcolor: '#2563eb', font: { family: 'Inter', color: '#fff' }, bordercolor: 'transparent' },
                },
                {
                  type: 'bar',
                  name: 'FDA Label',
                  y: data.categories,
                  x: data.label.values.map(v => v ?? 0),
                  orientation: 'h',
                  marker: { color: 'rgba(168, 85, 247, 0.8)', line: { width: 0 } },
                  hovertemplate: '%{y}<br>FDA Label: %{x:.2f}%<extra></extra>',
                  hoverlabel: { bgcolor: '#9333ea', font: { family: 'Inter', color: '#fff' }, bordercolor: 'transparent' },
                },
              ]}
              layout={{
                barmode: 'group',
                margin: { t: 8, b: 40, l: 280, r: 24 },
                xaxis: { title: { text: 'Proportion (%)', font: { size: 11, color: '#94a3b8', family: 'Inter' } }, tickfont: { size: 11, color: '#94a3b8', family: 'Inter' }, gridcolor: '#f1f5f9', zeroline: false },
                yaxis: { tickfont: { size: 11, color: '#475569', family: 'Inter' }, automargin: true, categoryorder: 'total ascending' },
                legend: { orientation: 'h', y: 1.08, font: { size: 12, family: 'Inter', color: '#64748b' } },
                paper_bgcolor: 'transparent',
                plot_bgcolor: 'transparent',
                font: { family: 'Inter, sans-serif' },
                height: 400,
                bargap: 0.25,
                bargroupgap: 0.1,
              }}
              config={{ displayModeBar: false, responsive: true }}
              style={{ width: '100%' }}
              useResizeHandler
            />
            <div className="mt-3 flex items-center gap-4 text-xs text-slate-500">
              <div className="flex items-center gap-1.5">
                <span className="h-2 w-2 rounded-full bg-blue-500"></span>
                <span>CTGOV: Clinical trial adverse event data</span>
              </div>
              <div className="flex items-center gap-1.5">
                <span className="h-2 w-2 rounded-full bg-purple-500"></span>
                <span>FDA Label: Drug label safety information</span>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
