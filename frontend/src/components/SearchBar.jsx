import { useState, useEffect, useRef } from 'react';
import { useFilter } from '../context/FilterContext';

export default function SearchBar() {
  const { search, setSearch, filterOptions } = useFilter();
  const [local, setLocal] = useState(search);
  const [suggestions, setSuggestions] = useState([]);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const timer = useRef(null);
  const wrapperRef = useRef(null);

  useEffect(() => { setLocal(search); }, [search]);

  useEffect(() => {
    function handleClick(e) {
      if (wrapperRef.current && !wrapperRef.current.contains(e.target)) setShowSuggestions(false);
    }
    document.addEventListener('mousedown', handleClick);
    return () => document.removeEventListener('mousedown', handleClick);
  }, []);

  function handleChange(val) {
    setLocal(val);
    clearTimeout(timer.current);
    timer.current = setTimeout(() => setSearch(val), 300);

    if (val.length >= 2 && filterOptions.antibody) {
      const matches = filterOptions.antibody.filter(a => a && a.toLowerCase().includes(val.toLowerCase())).slice(0, 10);
      setSuggestions(matches);
      setShowSuggestions(matches.length > 0);
    } else {
      setShowSuggestions(false);
    }
  }

  function selectSuggestion(val) {
    setLocal(val);
    setSearch(val);
    setShowSuggestions(false);
  }

  return (
    <div ref={wrapperRef} className="relative group">
      <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
        <svg className="h-5 w-5 text-slate-400 group-focus-within:text-indigo-500 transition-colors" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
        </svg>
      </div>
      <input
        type="text"
        value={local}
        onChange={(e) => handleChange(e.target.value)}
        placeholder="Search antibody / molecule name..."
        className="w-full bg-white/80 backdrop-blur-sm border border-slate-200/80 rounded-2xl pl-12 pr-4 py-3.5 text-sm text-slate-700 placeholder-slate-400 shadow-sm shadow-slate-200/50 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-300 focus:bg-white focus:shadow-md focus:shadow-indigo-100/50 transition-all duration-200"
      />
      {showSuggestions && (
        <ul className="absolute z-50 w-full bg-white/95 backdrop-blur-xl border border-slate-200/80 rounded-2xl mt-2 shadow-xl shadow-slate-200/50 max-h-64 overflow-y-auto py-2 animate-slide-down">
          {suggestions.map((s) => (
            <li key={s} onClick={() => selectSuggestion(s)} className="px-4 py-2.5 text-sm text-slate-700 hover:bg-indigo-50 hover:text-indigo-700 cursor-pointer transition-colors mx-2 rounded-lg">
              <span className="font-medium">{s}</span>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
