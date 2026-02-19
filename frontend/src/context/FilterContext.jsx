import { createContext, useContext, useReducer, useCallback } from 'react';
import { fetchFilterOptions, queryData, fetchDistribution, fetchAdverseEvents } from '../api';

const FilterContext = createContext(null);

const TABLE_LABELS = {
  ctgov_all: 'CTGOV – All Events',
  label_final: 'FDA Label – Final',
  label_bbw: 'FDA Label – BBW',
  label_wap: 'FDA Label – WAP',
  fc_mutations: 'Fc Antibody Mutations',
};

const DISTRIBUTION_CHARTS = [
  { column: 'record_category', title: 'Record Category' },
  { column: 'general_molecular_category', title: 'General Molecular Category' },
  { column: 'moa_new', title: 'Mechanism of Action' },
  { column: 'target_1', title: 'Targets' },
];

const initialState = {
  table: 'ctgov_all',
  filters: {},
  search: '',
  filterOptions: {},
  results: { data: [], total: 0, page: 1, page_size: 50 },
  distributions: [{}, {}, {}, {}],
  aeData: { categories: [], proportions: [], counts: [] },
  loading: false,
  optionsLoading: false,
  error: null,
  sortBy: null,
  sortDir: 'asc',
};

function reducer(state, action) {
  switch (action.type) {
    case 'SET_TABLE': return { ...state, table: action.payload, filters: {}, search: '', results: initialState.results, distributions: initialState.distributions, aeData: initialState.aeData };
    case 'SET_FILTERS': return { ...state, filters: action.payload };
    case 'SET_SEARCH': return { ...state, search: action.payload };
    case 'SET_FILTER_OPTIONS': return { ...state, filterOptions: action.payload, optionsLoading: false };
    case 'SET_RESULTS': return { ...state, results: action.payload, loading: false };
    case 'SET_DISTRIBUTIONS': return { ...state, distributions: action.payload };
    case 'SET_AE_DATA': return { ...state, aeData: action.payload };
    case 'SET_LOADING': return { ...state, loading: action.payload };
    case 'SET_OPTIONS_LOADING': return { ...state, optionsLoading: action.payload };
    case 'SET_ERROR': return { ...state, error: action.payload, loading: false };
    case 'SET_SORT': return { ...state, sortBy: action.payload.sortBy, sortDir: action.payload.sortDir };
    case 'CLEAR_FILTERS': return { ...state, filters: {}, search: '' };
    default: return state;
  }
}

export function FilterProvider({ children }) {
  const [state, dispatch] = useReducer(reducer, initialState);

  const loadFilterOptions = useCallback(async (table) => {
    dispatch({ type: 'SET_OPTIONS_LOADING', payload: true });
    try {
      const data = await fetchFilterOptions(table);
      dispatch({ type: 'SET_FILTER_OPTIONS', payload: data });
    } catch (e) {
      dispatch({ type: 'SET_ERROR', payload: e.message });
    }
  }, []);

  const applyFilters = useCallback(async (page = 1, sortBy = state.sortBy, sortDir = state.sortDir) => {
    dispatch({ type: 'SET_LOADING', payload: true });
    try {
      const [results, ...dists] = await Promise.all([
        queryData({ table: state.table, filters: state.filters, search: state.search, page, pageSize: 50, sortBy, sortDir }),
        ...DISTRIBUTION_CHARTS.map(c => fetchDistribution(state.table, c.column, state.filters, state.search).catch(() => ({ labels: [], values: [] }))),
      ]);
      dispatch({ type: 'SET_RESULTS', payload: results });
      dispatch({ type: 'SET_DISTRIBUTIONS', payload: dists });
      dispatch({ type: 'SET_SORT', payload: { sortBy, sortDir } });

      fetchAdverseEvents({ table: state.table, groupBy: 'organ_system', filters: state.filters, search: state.search })
        .then(ae => dispatch({ type: 'SET_AE_DATA', payload: ae }))
        .catch(() => {});
    } catch (e) {
      dispatch({ type: 'SET_ERROR', payload: e.message });
    }
  }, [state.table, state.filters, state.search, state.sortBy, state.sortDir]);

  const value = {
    ...state,
    TABLE_LABELS,
    DISTRIBUTION_CHARTS,
    dispatch,
    loadFilterOptions,
    applyFilters,
    setTable: (t) => dispatch({ type: 'SET_TABLE', payload: t }),
    setFilters: (f) => dispatch({ type: 'SET_FILTERS', payload: f }),
    setSearch: (s) => dispatch({ type: 'SET_SEARCH', payload: s }),
    clearFilters: () => dispatch({ type: 'CLEAR_FILTERS' }),
    isCtgov: state.table.startsWith('ctgov'),
  };

  return <FilterContext.Provider value={value}>{children}</FilterContext.Provider>;
}

export function useFilter() {
  const ctx = useContext(FilterContext);
  if (!ctx) throw new Error('useFilter must be inside FilterProvider');
  return ctx;
}
