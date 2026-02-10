import DonutChart from './DonutChart';
import { useFilter } from '../context/FilterContext';

export default function DistributionDashboard() {
  const { distributions, DISTRIBUTION_CHARTS, loading } = useFilter();

  if (loading) {
    return (
      <div>
        <div className="flex items-center gap-2.5 mb-4">
          <div className="h-8 w-8 rounded-lg bg-gradient-to-br from-cyan-500 to-blue-500 flex items-center justify-center">
            <svg className="h-4 w-4 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 3.055A9.001 9.001 0 1020.945 13H11V3.055z" /><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20.488 9H15V3.512A9.025 9.025 0 0120.488 9z" /></svg>
          </div>
          <h2 className="text-sm font-bold text-slate-700">Data Distribution</h2>
        </div>
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          {Array.from({ length: 4 }).map((_, i) => (
            <div key={i} className="bg-white/70 backdrop-blur-sm rounded-2xl border border-slate-200/60 p-5 h-72">
              <div className="h-3 w-24 bg-slate-200/80 rounded-full animate-pulse mb-4" />
              <div className="h-[210px] bg-slate-100/60 rounded-2xl animate-pulse" />
            </div>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div>
      <div className="flex items-center gap-2.5 mb-4">
        <div className="h-8 w-8 rounded-lg bg-gradient-to-br from-cyan-500 to-blue-500 flex items-center justify-center">
          <svg className="h-4 w-4 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 3.055A9.001 9.001 0 1020.945 13H11V3.055z" /><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20.488 9H15V3.512A9.025 9.025 0 0120.488 9z" /></svg>
        </div>
        <h2 className="text-sm font-bold text-slate-700">Data Distribution</h2>
      </div>
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {DISTRIBUTION_CHARTS.map((chart, i) => (
          <DonutChart key={chart.column} title={chart.title} data={distributions[i]} />
        ))}
      </div>
    </div>
  );
}
