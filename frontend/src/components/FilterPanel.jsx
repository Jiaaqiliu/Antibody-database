import { useState } from 'react';
import Select from 'react-select';
import { useFilter } from '../context/FilterContext';

const selectStyles = {
  control: (base, state) => ({
    ...base,
    borderColor: state.isFocused ? '#a5b4fc' : '#e2e8f0',
    backgroundColor: state.isFocused ? '#ffffff' : '#f8fafc',
    minHeight: 38,
    fontSize: '0.8125rem',
    borderRadius: '0.75rem',
    boxShadow: state.isFocused ? '0 0 0 3px rgba(99,102,241,0.1)' : 'none',
    transition: 'all 0.2s ease',
    '&:hover': { borderColor: '#c7d2fe' },
  }),
  multiValue: (base) => ({
    ...base,
    backgroundColor: '#eef2ff',
    borderRadius: '0.5rem',
    border: '1px solid #e0e7ff',
  }),
  multiValueLabel: (base) => ({ ...base, color: '#4338ca', fontSize: '0.75rem', fontWeight: 500 }),
  multiValueRemove: (base) => ({ ...base, color: '#6366f1', '&:hover': { backgroundColor: '#c7d2fe', color: '#4338ca' } }),
  placeholder: (base) => ({ ...base, color: '#94a3b8', fontSize: '0.8125rem' }),
  menu: (base) => ({ ...base, zIndex: 40, borderRadius: '0.75rem', overflow: 'hidden', boxShadow: '0 10px 40px -10px rgba(0,0,0,0.12)', border: '1px solid #e2e8f0' }),
  option: (base, state) => ({
    ...base,
    fontSize: '0.8125rem',
    backgroundColor: state.isFocused ? '#eef2ff' : 'transparent',
    color: state.isFocused ? '#4338ca' : '#475569',
    '&:active': { backgroundColor: '#e0e7ff' },
  }),
  indicatorSeparator: () => ({ display: 'none' }),
  dropdownIndicator: (base) => ({ ...base, color: '#94a3b8', padding: '0 8px' }),
};

function FilterSelect({ label, column, icon }) {
  const { filters, setFilters, filterOptions } = useFilter();
  const options = (filterOptions[column] || []).map(v => ({ value: v, label: String(v) }));
  const selected = (filters[column] || []).map(v => ({ value: v, label: String(v) }));

  function handleChange(vals) {
    const next = { ...filters };
    if (!vals || vals.length === 0) {
      delete next[column];
    } else {
      next[column] = vals.map(v => v.value);
    }
    setFilters(next);
  }

  return (
    <div className="space-y-1.5">
      <label className="flex items-center gap-1.5 text-xs font-semibold text-slate-500 uppercase tracking-wider">
        {icon && <span className="text-sm">{icon}</span>}
        {label}
        {selected.length > 0 && (
          <span className="ml-auto bg-indigo-100 text-indigo-700 text-[10px] font-bold rounded-full px-1.5 py-0.5 leading-none">{selected.length}</span>
        )}
      </label>
      <Select
        isMulti
        isClearable
        options={options}
        value={selected}
        onChange={handleChange}
        styles={selectStyles}
        placeholder={`All ${label.toLowerCase()}...`}
        maxMenuHeight={200}
      />
    </div>
  );
}

export default function FilterPanel() {
  const { isCtgov, optionsLoading } = useFilter();
  const [collapsed, setCollapsed] = useState(false);

  if (optionsLoading) {
    return (
      <div className="bg-white/70 backdrop-blur-sm rounded-2xl shadow-sm shadow-slate-200/50 border border-slate-200/60 p-6">
        <div className="grid grid-cols-2 gap-5">
          {Array.from({ length: 8 }).map((_, i) => (
            <div key={i} className="space-y-2">
              <div className="h-3 w-20 bg-slate-200/80 rounded-full animate-pulse" />
              <div className="h-[38px] bg-slate-100 rounded-xl animate-pulse" />
            </div>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white/70 backdrop-blur-sm rounded-2xl shadow-sm shadow-slate-200/50 border border-slate-200/60 overflow-hidden transition-all duration-300">
      <button
        onClick={() => setCollapsed(!collapsed)}
        className="w-full flex items-center justify-between px-6 py-4 hover:bg-slate-50/50 transition-colors"
      >
        <div className="flex items-center gap-2.5">
          <div className="h-8 w-8 rounded-lg bg-gradient-to-br from-indigo-500 to-purple-500 flex items-center justify-center">
            <svg className="h-4 w-4 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 4a1 1 0 011-1h16a1 1 0 011 1v2.586a1 1 0 01-.293.707l-6.414 6.414a1 1 0 00-.293.707V17l-4 4v-6.586a1 1 0 00-.293-.707L3.293 7.293A1 1 0 013 6.586V4z" />
            </svg>
          </div>
          <span className="text-sm font-semibold text-slate-700">Filters</span>
        </div>
        <svg className={`h-5 w-5 text-slate-400 transition-transform duration-200 ${collapsed ? '' : 'rotate-180'}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
        </svg>
      </button>

      {!collapsed && (
        <div className="px-6 pb-6 animate-fade-in">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            <div className="space-y-4">
              <h3 className="text-[11px] font-bold text-indigo-500/80 uppercase tracking-[0.15em] flex items-center gap-2">
                <span className="h-px flex-1 bg-gradient-to-r from-indigo-200 to-transparent" />
                Molecular
                <span className="h-px flex-1 bg-gradient-to-l from-indigo-200 to-transparent" />
              </h3>
              <FilterSelect label="Molecular Category" column="general_molecular_category" />
              <FilterSelect label="Target Antigen" column="target_1" />
              <FilterSelect label="Format" column="format_general_category" />
              <FilterSelect label="Isotype (Fc)" column="isotype_fc" />
            </div>
            <div className="space-y-4">
              <h3 className="text-[11px] font-bold text-purple-500/80 uppercase tracking-[0.15em] flex items-center gap-2">
                <span className="h-px flex-1 bg-gradient-to-r from-purple-200 to-transparent" />
                Clinical & Study
                <span className="h-px flex-1 bg-gradient-to-l from-purple-200 to-transparent" />
              </h3>
              {isCtgov && <FilterSelect label="Phase" column="phase" />}
              {isCtgov && <FilterSelect label="Event Type" column="event_type" />}
              <FilterSelect label="MOA" column="moa_new" />
              <FilterSelect label="Condition" column="condition" />
              <FilterSelect label="Record Category" column="record_category" />
              <FilterSelect label="Source" column="source" />
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
