import { useState, useEffect } from 'react';
import Select from 'react-select';
import Plot from 'react-plotly.js';
import { fetchTargetAggregation, fetchTargets } from '../api';
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
  menu: (base) => ({ ...base, zIndex: 9999, borderRadius: '0.75rem', boxShadow: '0 10px 40px -10px rgba(0,0,0,0.12)', border: '1px solid #e2e8f0' }),
  menuPortal: (base) => ({ ...base, zIndex: 9999 }),
  option: (base, state) => ({ ...base, fontSize: '0.8125rem', backgroundColor: state.isFocused ? '#eef2ff' : 'transparent', color: state.isFocused ? '#4338ca' : '#475569' }),
  indicatorSeparator: () => ({ display: 'none' }),
};

export default function TargetAggregationChart() {
  const { table, filters } = useFilter();
  const [targets, setTargets] = useState([]);
  const [selectedTarget, setSelectedTarget] = useState(null);
  const [groupBy, setGroupBy] = useState('organ_system');
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    fetchTargets(table).then(r => {
      setTargets(r.targets.filter(t => t).map(t => ({ value: t, label: t })));
    }).catch(() => setTargets([]));
    setSelectedTarget(null);
    setData(null);
  }, [table]);

  async function loadAggregation() {
    if (!selectedTarget) return;
    setLoading(true);
    try {
      setData(await fetchTargetAggregation({ table, target: selectedTarget.value, groupBy, filters }));
    } catch {
      setData(null);
    }
    setLoading(false);
  }

  const hasData = data && data.data && data.data.length > 0;

  return (
    <div className="bg-white/70 backdrop-blur-sm rounded-2xl shadow-sm shadow-slate-200/50 border border-slate-200/60 overflow-hidden">
      <div className="px-6 py-4 border-b border-slate-100/80">
        <div className="flex items-center gap-2.5 mb-4">
          <div className="h-8 w-8 rounded-lg bg-gradient-to-br from-cyan-500 to-blue-500 flex items-center justify-center">
            <svg className="h-4 w-4 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 0a6 6 0 1012 0 6 6 0 00-12 0zm6 0a3 3 0 110-6 3 3 0 010 6z" /><circle cx="12" cy="12" r="1" fill="currentColor" /></svg>
          </div>
          <div>
            <h3 className="text-sm font-bold text-slate-700">Target Aggregation Analysis</h3>
            <p className="text-[10px] text-slate-400">View AE distribution across all antibodies for a target</p>
          </div>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-4 gap-3">
          <div className="md:col-span-2">
            <label className="block text-[11px] font-semibold text-slate-500 uppercase tracking-wider mb-1.5">
              Target <span className="text-slate-400 normal-case">({targets.length} targets)</span>
            </label>
            <Select
              options={targets}
              value={selectedTarget}
              onChange={setSelectedTarget}
              isClearable
              placeholder="Select target (e.g., TNF-alpha)..."
              styles={miniSelectStyles}
              maxMenuHeight={200}
              menuPlacement="auto"
              menuPortalTarget={document.body}
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
              onClick={loadAggregation}
              disabled={!selectedTarget || loading}
              className="w-full bg-gradient-to-r from-cyan-600 to-blue-600 hover:from-cyan-500 hover:to-blue-500 disabled:from-slate-200 disabled:to-slate-200 disabled:text-slate-400 text-white px-4 py-2 rounded-xl text-sm font-semibold shadow-sm shadow-cyan-200/50 hover:shadow-md disabled:shadow-none transition-all duration-200 active:scale-[0.98]"
            >
              {loading ? 'Loading...' : 'Analyze'}
            </button>
          </div>
        </div>
      </div>
      <div className="p-6">
        {loading ? (
          <div className="h-72 flex items-center justify-center">
            <div className="animate-spin h-8 w-8 border-[3px] border-cyan-200 border-t-cyan-600 rounded-full" />
          </div>
        ) : !hasData ? (
          <div className="h-72 flex items-center justify-center">
            <div className="text-center">
              <div className="h-12 w-12 rounded-2xl bg-slate-100 flex items-center justify-center mx-auto mb-3">
                <svg className="h-6 w-6 text-slate-300" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 12h6m-6 0a6 6 0 1012 0 6 6 0 00-12 0zm6 0a3 3 0 110-6 3 3 0 010 6z" /></svg>
              </div>
              <p className="text-sm text-slate-400 font-medium">Select a target to view aggregated AE data</p>
            </div>
          </div>
        ) : (
          <div>
            <Plot
              data={[
                {
                  type: 'box',
                  y: data.data.flatMap(d => d.antibodies.map(ab => d.category)),
                  x: data.data.flatMap(d => d.antibodies.map(ab => ab.proportion)),
                  orientation: 'h',
                  boxpoints: 'all',
                  jitter: 0.3,
                  pointpos: 0,
                  marker: { 
                    color: 'rgba(6, 182, 212, 0.6)', 
                    size: 6,
                    line: { width: 1, color: 'rgba(6, 182, 212, 0.8)' }
                  },
                  line: { color: 'rgba(6, 182, 212, 1)', width: 2 },
                  fillcolor: 'rgba(6, 182, 212, 0.3)',
                  hovertemplate: '%{y}<br>Proportion: %{x:.2f}%<extra></extra>',
                  hoverlabel: { bgcolor: '#0891b2', font: { family: 'Inter', color: '#fff' }, bordercolor: 'transparent' },
                },
              ]}
              layout={{
                margin: { t: 8, b: 40, l: 280, r: 24 },
                xaxis: { title: { text: 'Proportion (%)', font: { size: 11, color: '#94a3b8', family: 'Inter' } }, tickfont: { size: 11, color: '#94a3b8', family: 'Inter' }, gridcolor: '#f1f5f9', zeroline: false },
                yaxis: { tickfont: { size: 11, color: '#475569', family: 'Inter' }, automargin: true, categoryorder: 'total ascending' },
                paper_bgcolor: 'transparent',
                plot_bgcolor: 'transparent',
                font: { family: 'Inter, sans-serif' },
                height: Math.max(400, data.data.length * 50),
                showlegend: false,
              }}
              config={{ displayModeBar: false, responsive: true }}
              style={{ width: '100%' }}
              useResizeHandler
            />
            <div className="mt-4 border-t border-slate-100 pt-4">
              <h4 className="text-xs font-semibold text-slate-500 uppercase tracking-wider mb-3">
                Antibodies for {data.target} (by {groupBy === 'organ_system' ? 'Organ System' : 'AE Term'})
              </h4>
              <div className="max-h-64 overflow-y-auto space-y-2">
                {data.data.slice(0, 10).map((d) => (
                  <div key={d.category} className="bg-slate-50 rounded-lg p-3">
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-sm font-medium text-slate-700">{d.category}</span>
                      <span className="text-xs text-slate-500">
                        {d.count} antibodies • Mean: {d.mean}% • Range: {d.min}% - {d.max}%
                      </span>
                    </div>
                    <div className="flex flex-wrap gap-1.5">
                      {d.antibodies.slice(0, 8).map((ab) => (
                        <span
                          key={ab.antibody}
                          className="inline-flex items-center px-2 py-0.5 rounded text-xs bg-white border border-slate-200 text-slate-600"
                        >
                          {ab.antibody}
                          <span className="ml-1 text-cyan-600 font-medium">{ab.proportion}%</span>
                        </span>
                      ))}
                      {d.antibodies.length > 8 && (
                        <span className="inline-flex items-center px-2 py-0.5 rounded text-xs bg-slate-100 text-slate-500">
                          +{d.antibodies.length - 8} more
                        </span>
                      )}
                    </div>
                  </div>
                ))}
                {data.data.length > 10 && (
                  <div className="text-center text-xs text-slate-400 py-2">
                    Showing top 10 categories • {data.data.length - 10} more available
                  </div>
                )}
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
