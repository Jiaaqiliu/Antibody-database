import { useState, useEffect } from 'react';
import Select from 'react-select';
import Plot from 'react-plotly.js';
import { fetchComparative, fetchStudies, fetchAntibodiesWithComparator } from '../api';
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
  const { table, isCtgov } = useFilter();
  const [antibody, setAntibody] = useState(null);
  const [nctId, setNctId] = useState(null);
  const [studies, setStudies] = useState([]);
  const [groupBy, setGroupBy] = useState('organ_system');
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(false);
  const [antibodyOptions, setAntibodyOptions] = useState([]);

  useEffect(() => {
    fetchAntibodiesWithComparator(table).then(r => {
      setAntibodyOptions(r.antibodies.map(a => ({ value: a, label: a })));
    }).catch(() => setAntibodyOptions([]));
    setAntibody(null); setNctId(null); setData(null); setStudies([]);
  }, [table]);

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
            <svg className="h-4 w-4 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 6l3 1m0 0l-3 9a5.002 5.002 0 006.001 0M6 7l3 9M6 7l6-2m6 2l3-1m-3 1l-3 9a5.002 5.002 0 006.001 0M18 7l3 9m-3-9l-6-2m0-2v2m0 16V5m0 16H9m3 0h3" /></svg>
          </div>
          <div>
            <h3 className="text-sm font-bold text-slate-700">Comparative Arm Analysis</h3>
            <p className="text-[10px] text-slate-400">Treatment vs Comparator arm comparison</p>
          </div>
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
          <div>
            <Plot
              data={[
                {
                  type: 'bar', name: 'Treatment Arm', y: data.ab_arm.categories, x: data.ab_arm.proportions, orientation: 'h',
                  marker: { color: 'rgba(99, 102, 241, 0.8)', line: { width: 0 } },
                  hovertemplate: '%{y}<br>Treatment: %{x:.2f}%<extra></extra>',
                  hoverlabel: { bgcolor: '#4338ca', font: { family: 'Inter', color: '#fff' }, bordercolor: 'transparent' },
                },
                {
                  type: 'bar', name: 'Comparator', y: data.comp_arm.categories, x: data.comp_arm.proportions, orientation: 'h',
                  marker: { color: 'rgba(245, 158, 11, 0.8)', line: { width: 0 } },
                  hovertemplate: '%{y}<br>Comparator: %{x:.2f}%<extra></extra>',
                  hoverlabel: { bgcolor: '#d97706', font: { family: 'Inter', color: '#fff' }, bordercolor: 'transparent' },
                },
              ]}
              layout={{
                barmode: 'group',
                margin: { t: 8, b: 40, l: 280, r: 24 },
                xaxis: { title: { text: 'Proportion (%)', font: { size: 11, color: '#94a3b8', family: 'Inter' } }, tickfont: { size: 11, color: '#94a3b8', family: 'Inter' }, gridcolor: '#f1f5f9', zeroline: false },
                yaxis: { tickfont: { size: 11, color: '#475569', family: 'Inter' }, automargin: true, categoryorder: 'total ascending' },
                legend: { orientation: 'h', y: 1.08, font: { size: 12, family: 'Inter', color: '#64748b' } },
                paper_bgcolor: 'transparent', plot_bgcolor: 'transparent',
                font: { family: 'Inter, sans-serif' },
                height: 400, bargap: 0.25, bargroupgap: 0.1,
              }}
              config={{ displayModeBar: false, responsive: true }}
              style={{ width: '100%' }}
              useResizeHandler
            />
            {data.relative_risk && data.relative_risk.values.some(v => v !== null) && (
              <div className="mt-4 border-t border-slate-100 pt-4">
                <h4 className="text-xs font-semibold text-slate-500 uppercase tracking-wider mb-2">
                  {isCtgov ? 'Relative Risk (95% CI)' : 'Pooled Relative Risk'} - Sorted by RR
                </h4>
                <div className="max-h-48 overflow-y-auto">
                  <table className="w-full text-xs">
                    <thead className="sticky top-0 bg-slate-50">
                      <tr>
                        <th className="text-left py-1.5 px-2 font-semibold text-slate-600">Category</th>
                        <th className="text-right py-1.5 px-2 font-semibold text-slate-600">{isCtgov ? 'RR' : 'Pooled RR'}</th>
                        <th className="text-right py-1.5 px-2 font-semibold text-slate-600">{isCtgov ? '95% CI' : '-'}</th>
                        <th className="text-center py-1.5 px-2 font-semibold text-slate-600">Significance</th>
                      </tr>
                    </thead>
                    <tbody>
                      {data.ab_arm.categories
                        .map((cat, i) => ({ cat, i, rr: data.relative_risk.values[i] }))
                        .filter(item => item.rr !== null)
                        .sort((a, b) => (b.rr || 0) - (a.rr || 0))
                        .map(({ cat, i, rr }) => {
                          const ciL = data.relative_risk.ci_lower[i];
                          const ciU = data.relative_risk.ci_upper[i];
                          const isSignificant = ciL && ciU && (ciL > 1 || ciU < 1);
                          return (
                            <tr key={cat} className="border-t border-slate-100 hover:bg-slate-50">
                              <td className="py-1.5 px-2 text-slate-700">{cat}</td>
                              <td className={`py-1.5 px-2 text-right font-medium ${rr > 1 ? 'text-rose-600' : rr < 1 ? 'text-emerald-600' : 'text-slate-600'}`}>{rr}</td>
                              <td className="py-1.5 px-2 text-right text-slate-500">{ciL && ciU ? `${ciL} - ${ciU}` : '-'}</td>
                              <td className="py-1.5 px-2 text-center">
                                {isSignificant ? (
                                  <span className={`inline-flex items-center px-1.5 py-0.5 rounded text-[10px] font-medium ${rr > 1 ? 'bg-rose-100 text-rose-700' : 'bg-emerald-100 text-emerald-700'}`}>
                                    {rr > 1 ? '↑ Risk' : '↓ Risk'}
                                  </span>
                                ) : (
                                  <span className="text-slate-400">-</span>
                                )}
                              </td>
                            </tr>
                          );
                        })}
                    </tbody>
                  </table>
                </div>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
