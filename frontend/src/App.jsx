import { FilterProvider } from './context/FilterContext';
import Header from './components/Header';
import SearchBar from './components/SearchBar';
import FilterPanel from './components/FilterPanel';
import FilterBar from './components/FilterBar';
import DistributionDashboard from './components/DistributionDashboard';
import AdverseEventChart from './components/AdverseEventChart';
import ComparativeChart from './components/ComparativeChart';
import DataTable from './components/DataTable';

export default function App() {
  return (
    <FilterProvider>
      <div className="min-h-screen">
        <Header />
        <main className="max-w-screen-2xl mx-auto px-8 py-8 space-y-7">
          <SearchBar />
          <FilterPanel />
          <FilterBar />
          <DistributionDashboard />
          <div className="grid grid-cols-1 xl:grid-cols-2 gap-7">
            <AdverseEventChart />
            <ComparativeChart />
          </div>
          <DataTable />
        </main>
        <footer className="max-w-screen-2xl mx-auto px-8 pb-8 pt-4">
          <div className="border-t border-slate-200/60 pt-4 flex items-center justify-between">
            <p className="text-xs text-slate-400">Antibody Database Explorer</p>
            <p className="text-xs text-slate-300">Built for mAb safety analysis</p>
          </div>
        </footer>
      </div>
    </FilterProvider>
  );
}
