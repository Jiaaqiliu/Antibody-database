import { useState, useEffect } from 'react';
import Plot from 'react-plotly.js';
import { fetchAdverseEvents } from '../api';
import { useFilter } from '../context/FilterContext';

export default function AdverseEventChart() {
  const { table, filters, search, aeData } = useFilter();
  const [groupBy, setGroupBy] = useState('organ_system');
  const [localData, setLocalData] = useState(aeData);
  const [loading, setLoading] = useState(false);

  useEffect(() => { setLocalData(aeData); }, [aeData]);

  async function handleToggle(newGroup) {
    setGroupBy(newGroup);
    setLoading(true);
    try {
      const data = await fetchAdverseEvents({ table, groupBy: newGroup, filters, search });
      setLocalData(data);
    } catch {
      setLocalData({ categories: [], proportions: [], counts: [] });
    }
    setLoading(false);
  }

  const hasData = localData.categories && localData.categories.length > 0;

  return (
    <div className="bg-white/70 backdrop-blur-sm rounded-2xl shadow-sm shadow-slate-200/50 border border-slate-200/60 overflow-hidden">
      <div className="flex items-center justify-between px-6 py-4 border-b border-slate-100/80">
        <div className="flex items-center gap-2.5">
          <div className="h-8 w-8 rounded-lg bg-gradient-to-br from-rose-500 to-orange-500 flex items-center justify-center">
            <svg className="h-4 w-4 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" /></svg>
          </div>
          <h3 className="text-sm font-bold text-slate-700">Adverse Event Proportions</h3>
        </div>
        <div className="flex bg-slate-100/80 rounded-xl p-1 gap-0.5">
          {[['organ_system', 'Organ System'], ['adverse_event_term', 'AE Term']].map(([key, label]) => (
            <button
              key={key}
              onClick={() => handleToggle(key)}
              className={`px-3.5 py-1.5 text-xs font-semibold rounded-lg transition-all duration-200 ${
                groupBy === key
                  ? 'bg-white text-indigo-600 shadow-sm'
                  : 'text-slate-500 hover:text-slate-700'
              }`}
            >
              {label}
            </button>
          ))}
        </div>
      </div>
      <div className="p-6">
        {loading ? (
          <div className="h-[450px] flex items-center justify-center">
            <div className="flex flex-col items-center gap-3">
              <div className="animate-spin h-8 w-8 border-[3px] border-indigo-200 border-t-indigo-600 rounded-full" />
              <span className="text-xs text-slate-400 font-medium">Loading data...</span>
            </div>
          </div>
        ) : !hasData ? (
          <div className="h-[450px] flex items-center justify-center">
            <div className="text-center">
              <div className="h-12 w-12 rounded-2xl bg-slate-100 flex items-center justify-center mx-auto mb-3">
                <svg className="h-6 w-6 text-slate-300" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M20 13V6a2 2 0 00-2-2H6a2 2 0 00-2 2v7m16 0v5a2 2 0 01-2 2H6a2 2 0 01-2-2v-5m16 0h-2.586a1 1 0 00-.707.293l-2.414 2.414a1 1 0 01-.707.293h-3.172a1 1 0 01-.707-.293l-2.414-2.414A1 1 0 006.586 13H4" /></svg>
              </div>
              <p className="text-sm text-slate-400 font-medium">No adverse event data available</p>
            </div>
          </div>
        ) : (
          <Plot
            data={[{
              type: 'bar',
              orientation: 'h',
              y: [...localData.categories].reverse(),
              x: [...localData.proportions].reverse(),
              marker: {
                color: [...localData.proportions].reverse().map((_, i, arr) => {
                  const ratio = i / Math.max(arr.length - 1, 1);
                  return `rgba(99, 102, 241, ${0.35 + ratio * 0.65})`;
                }),
                line: { width: 0 },
              },
              hovertemplate: '<b>%{y}</b><br>Proportion: %{x:.1f}%<extra></extra>',
              hoverlabel: { bgcolor: '#1e293b', font: { family: 'Inter, sans-serif', color: '#fff', size: 12 }, bordercolor: 'transparent' },
            }]}
            layout={{
              margin: { t: 8, b: 40, l: 280, r: 24 },
              xaxis: {
                title: { text: 'Proportion (%)', font: { size: 11, color: '#94a3b8', family: 'Inter, sans-serif' } },
                tickfont: { size: 11, color: '#94a3b8', family: 'Inter, sans-serif' },
                gridcolor: '#f1f5f9',
                gridwidth: 1,
                zeroline: false,
              },
              yaxis: {
                tickfont: { size: 11, color: '#475569', family: 'Inter, sans-serif' },
                automargin: true,
              },
              paper_bgcolor: 'transparent',
              plot_bgcolor: 'transparent',
              font: { family: 'Inter, sans-serif' },
              height: 500,
              bargap: 0.3,
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
