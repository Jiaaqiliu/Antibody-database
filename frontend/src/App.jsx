import { useEffect, useState } from 'react';
import { FilterProvider } from './context/FilterContext';
import Header from './components/Header';
import SearchBar from './components/SearchBar';
import FilterPanel from './components/FilterPanel';
import FilterBar from './components/FilterBar';
import DistributionDashboard from './components/DistributionDashboard';
import AdverseEventChart from './components/AdverseEventChart';
import ComparativeChart from './components/ComparativeChart';
import CrossDatasetChart from './components/CrossDatasetChart';
import TargetAggregationChart from './components/TargetAggregationChart';
import DataTable from './components/DataTable';
import FutureContentPage from './components/FutureContentPage';

const VALID_PAGES = new Set(['home', 'fc-mutations', 'target-features']);

function getPageFromHash() {
  const rawHash = window.location.hash.replace(/^#\/?/, '');
  return VALID_PAGES.has(rawHash) ? rawHash : 'home';
}

function HomePage() {
  return (
    <main className="max-w-screen-2xl mx-auto px-8 py-8 space-y-7">
      <SearchBar />
      <FilterPanel />
      <FilterBar />
      <DistributionDashboard />
      <div className="grid grid-cols-1 xl:grid-cols-2 gap-7">
        <AdverseEventChart />
        <ComparativeChart />
      </div>
      <div className="grid grid-cols-1 xl:grid-cols-2 gap-7">
        <CrossDatasetChart />
        <TargetAggregationChart />
      </div>
      <DataTable />
    </main>
  );
}

export default function App() {
  const [page, setPage] = useState(getPageFromHash);

  useEffect(() => {
    const handleHashChange = () => setPage(getPageFromHash());
    window.addEventListener('hashchange', handleHashChange);
    return () => window.removeEventListener('hashchange', handleHashChange);
  }, []);

  function handleNavigate(nextPage) {
    const nextHash = nextPage === 'home' ? '' : `#/${nextPage}`;
    if (window.location.hash !== nextHash) {
      window.location.hash = nextHash;
      return;
    }
    setPage(nextPage);
  }

  return (
    <FilterProvider>
      <div className="min-h-screen">
        <Header page={page} onNavigate={handleNavigate} />
        {page === 'home' ? <HomePage /> : <FutureContentPage page={page} />}
        <footer className="max-w-screen-2xl mx-auto px-8 pb-8 pt-4">
          <div className="border-t border-slate-200/60 pt-4 flex items-center justify-between">
            <p className="text-xs text-slate-400">Therapeutic Antibody Commons (TAC)</p>
            <p className="text-xs text-slate-300">Built for mAb safety analysis</p>
          </div>
        </footer>
      </div>
    </FilterProvider>
  );
}
