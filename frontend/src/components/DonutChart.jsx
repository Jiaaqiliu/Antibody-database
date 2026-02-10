import { useState } from 'react';
import Plot from 'react-plotly.js';
import ChartModal from './ChartModal';

const COLORS = ['#6366f1', '#8b5cf6', '#06b6d4', '#10b981', '#f59e0b', '#ef4444', '#ec4899', '#0ea5e9', '#14b8a6', '#f97316', '#84cc16', '#a855f7', '#22d3ee', '#fb923c', '#4ade80', '#e879f9'];

function consolidate(labels, values, maxSlices = 10) {
  if (!labels || labels.length <= maxSlices) return { labels, values };
  const top = labels.slice(0, maxSlices - 1);
  const topVals = values.slice(0, maxSlices - 1);
  const otherSum = values.slice(maxSlices - 1).reduce((a, b) => a + b, 0);
  return { labels: [...top, 'Other'], values: [...topVals, otherSum] };
}

export default function DonutChart({ title, data }) {
  const [expanded, setExpanded] = useState(false);
  const hasData = data && data.labels && data.labels.length > 0;
  const display = hasData ? consolidate(data.labels, data.values) : { labels: ['No data'], values: [1] };

  const plotData = [{
    type: 'pie',
    hole: 0.55,
    labels: display.labels,
    values: display.values,
    marker: {
      colors: hasData ? COLORS : ['#f1f5f9'],
      line: { color: '#ffffff', width: 2 },
    },
    textinfo: hasData ? 'percent' : 'none',
    hovertemplate: hasData ? '<b>%{label}</b><br>Count: %{value:,}<br>Share: %{percent}<extra></extra>' : '',
    textfont: { size: 10, color: '#475569', family: 'Inter, sans-serif' },
    hoverlabel: { bgcolor: '#1e293b', font: { family: 'Inter, sans-serif', color: '#fff', size: 12 }, bordercolor: 'transparent' },
    pull: 0.02,
    sort: false,
  }];

  const baseLayout = {
    showlegend: false,
    margin: { t: 8, b: 8, l: 8, r: 8 },
    paper_bgcolor: 'transparent',
    plot_bgcolor: 'transparent',
    font: { family: 'Inter, sans-serif' },
  };

  return (
    <>
      <div className="group bg-white/70 backdrop-blur-sm rounded-2xl shadow-sm shadow-slate-200/50 border border-slate-200/60 p-5 flex flex-col hover:shadow-md hover:shadow-indigo-100/30 hover:border-indigo-200/60 transition-all duration-300">
        <div className="flex items-center justify-between mb-3">
          <h4 className="text-xs font-bold text-slate-600 uppercase tracking-wider">{title}</h4>
          {hasData && (
            <button onClick={() => setExpanded(true)} className="opacity-0 group-hover:opacity-100 text-[11px] text-indigo-500 hover:text-indigo-700 font-semibold px-2 py-1 rounded-lg hover:bg-indigo-50 transition-all duration-200">
              Expand ↗
            </button>
          )}
        </div>
        <div className="flex-1 min-h-0">
          <Plot data={plotData} layout={baseLayout} config={{ displayModeBar: false, responsive: true }} style={{ width: '100%', height: '210px' }} useResizeHandler />
        </div>
        {hasData && (
          <div className="mt-2 text-center">
            <span className="text-[11px] text-slate-400">{data.labels.length} categories</span>
          </div>
        )}
      </div>

      {expanded && (
        <ChartModal title={title} onClose={() => setExpanded(false)}>
          <Plot
            data={plotData}
            layout={{ ...baseLayout, showlegend: true, legend: { orientation: 'h', y: -0.15, font: { size: 11, family: 'Inter, sans-serif' } }, margin: { t: 8, b: 80, l: 8, r: 8 } }}
            config={{ displayModeBar: false, responsive: true }}
            style={{ width: '100%', height: '420px' }}
            useResizeHandler
          />
          {hasData && (
            <div className="mt-6 max-h-64 overflow-y-auto rounded-xl border border-slate-100">
              <table className="w-full text-sm">
                <thead className="sticky top-0 bg-slate-50/90 backdrop-blur-sm">
                  <tr className="text-left">
                    <th className="py-2.5 px-4 text-xs font-semibold text-slate-500 uppercase tracking-wider">Category</th>
                    <th className="py-2.5 px-4 text-right text-xs font-semibold text-slate-500 uppercase tracking-wider">Count</th>
                    <th className="py-2.5 px-4 text-right text-xs font-semibold text-slate-500 uppercase tracking-wider">Share</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-50">
                  {data.labels.map((l, i) => {
                    const total = data.values.reduce((a, b) => a + b, 0);
                    const pct = total > 0 ? ((data.values[i] / total) * 100).toFixed(1) : 0;
                    return (
                      <tr key={l} className="hover:bg-indigo-50/30 transition-colors">
                        <td className="py-2 px-4 text-slate-700 flex items-center gap-2">
                          <span className="h-2.5 w-2.5 rounded-full shrink-0" style={{ backgroundColor: COLORS[i % COLORS.length] }} />
                          {l}
                        </td>
                        <td className="py-2 px-4 text-right text-slate-600 font-medium tabular-nums">{data.values[i].toLocaleString()}</td>
                        <td className="py-2 px-4 text-right text-slate-400 tabular-nums">{pct}%</td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          )}
        </ChartModal>
      )}
    </>
  );
}
