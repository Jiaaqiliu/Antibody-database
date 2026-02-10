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
  menu: (base) => ({ ...base, zIndex: 40, borderRadius: '0.75rem', boxShadow: '0 10px 40px -10px rgba(0,0,0,0.12)', border: '1px solid #e2e8f0' }),
  option: (base, state) => ({ ...base, fontSize: '0.8125rem', backgroundColor: state.isFocused ? '#eef2ff' : 'transparent', color: state.isFocused ? '#4338ca' : '#475569' }),
  indicatorSeparator: () => ({ display: 'none' }),
};

export default function TargetAggregationChart() {
  const { table } = useFilter();
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
      setData(await fetchTargetAggregation({ table, target: selectedTarget.value, groupBy }));
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
            <svg className="h-4 w-4 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" /></svg>
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
                <svg className="h-6 w-6 text-slate-300" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" /></svg>
              </div>
              <p className="text-sm text-slate-400 font-medium">Select a target to view aggregated AE data</p>
            </div>
          </div>
        ) : (
          <div>
            <Plot
              data={[
                {
                  type: 'bar',
                  name: 'Mean',
                  y: data.data.map(d => d.category),
                  x: data.data.map(d => d.mean),
                  orientation: 'h',
                  marker: { color: 'rgba(6, 182, 212, 0.8)', line: { width: 0 } },
                  error_x: {
                    type: 'data',
                    symmetric: false,
                    array: data.data.map(d => d.max - d.mean),
                    arrayminus: data.data.map(d => d.mean - d.min),
                    color: '#94a3b8',
                    thickness: 1.5,
                    width: 4,
                  },
                  hovertemplate: '%{y}<br>Mean: %{x:.2f}%<br>Range: %{customdata[0]:.2f}% - %{customdata[1]:.2f}%<br>Antibodies: %{customdata[2]}<extra></extra>',
                  customdata: data.data.map(d => [d.min, d.max, d.count]),
                  hoverlabel: { bgcolor: '#0891b2', font: { family: 'Inter', color: '#fff' }, bordercolor: 'transparent' },
                },
              ]}
              layout={{
                margin: { t: 8, b: 40, l: 280, r: 24 },
                xaxis: { title: { text: 'Proportion (%)', font: { size: 11, color: '#94a3b8', family: 'Inter' } }, tickfont: { size: 11, color: '#94a3b8', family: 'Inter' }, gridcolor: '#f1f5f9', zeroline: false },
                yaxis: { tickfont: { size: 11, color: '#475569', family: 'Inter' }, automargin: true },
                paper_bgcolor: 'transparent',
                plot_bgcolor: 'transparent',
                font: { family: 'Inter, sans-serif' },
                height: 400,
                bargap: 0.3,
                showlegend: false,
              }}
              config={{ displayModeBar: false, responsive: true }}
              style={{ width: '100%' }}
              useResizeHandler
            />
            <div className="mt-3 px-2 py-2 bg-slate-50 rounded-lg">
              <p className="text-xs text-slate-500">
                <span className="font-medium text-slate-600">Target: {data.target}</span>
                <span className="mx-2">•</span>
                Bars show mean AE proportion with error bars indicating min-max range across antibodies
              </p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
