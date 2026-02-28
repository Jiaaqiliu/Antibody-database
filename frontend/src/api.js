const BASE = '/api';

async function request(url, options = {}) {
  const res = await fetch(BASE + url, {
    headers: { 'Content-Type': 'application/json' },
    ...options,
  });
  if (!res.ok) throw new Error(`API error: ${res.status}`);
  return res.json();
}

export function fetchTables() {
  return request('/tables');
}

export function fetchFilterOptions(table) {
  return request(`/filter-options?table=${table}`);
}

export function queryData({ table, filters, search, page, pageSize, sortBy, sortDir }) {
  return request('/query', {
    method: 'POST',
    body: JSON.stringify({
      table,
      filters: filters || {},
      search: search || null,
      page: page || 1,
      page_size: pageSize || 50,
      sort_by: sortBy || null,
      sort_dir: sortDir || 'asc',
    }),
  });
}

export function fetchDistribution(table, column, filters, search) {
  const params = new URLSearchParams({ table, column });
  if (filters && Object.keys(filters).length) params.set('filters', JSON.stringify(filters));
  if (search) params.set('search', search);
  return request(`/chart/distribution?${params}`);
}

export function fetchAdverseEvents({ table, groupBy, filters, search, topN, gradeCol }) {
  return request('/chart/adverse-events', {
    method: 'POST',
    body: JSON.stringify({
      table,
      group_by: groupBy || 'organ_system',
      filters: filters || {},
      search: search || null,
      top_n: topN || 25,
      grade_col: gradeCol || 'all_grades%',
    }),
  });
}

export function fetchComparative({ table, antibody, nctId, groupBy, filters, topN }) {
  return request('/chart/comparative', {
    method: 'POST',
    body: JSON.stringify({
      table,
      antibody,
      nct_id: nctId || null,
      group_by: groupBy || 'organ_system',
      filters: filters || {},
      top_n: topN || 15,
    }),
  });
}

export function fetchStudies(table, antibody) {
  return request(`/studies?table=${table}&antibody=${encodeURIComponent(antibody)}`);
}

export function getExportUrl(table, filters, search) {
  const params = new URLSearchParams({ table });
  if (filters && Object.keys(filters).length) params.set('filters', JSON.stringify(filters));
  if (search) params.set('search', search);
  return `${BASE}/export?${params}`;
}

export function fetchCrossDataset({ antibody, groupBy, filters, topN }) {
  return request('/chart/cross-dataset', {
    method: 'POST',
    body: JSON.stringify({
      antibody,
      group_by: groupBy || 'organ_system',
      filters: filters || {},
      top_n: topN || 15,
    }),
  });
}

export function fetchTargetAggregation({ table, target, groupBy, filters, topN }) {
  return request('/chart/target-aggregation', {
    method: 'POST',
    body: JSON.stringify({
      table,
      target,
      group_by: groupBy || 'organ_system',
      filters: filters || {},
      top_n: topN || 15,
    }),
  });
}

export function fetchOverlappingAntibodies() {
  return request('/overlapping-antibodies');
}

export function fetchTargets(table) {
  return request(`/targets?table=${table}`);
}

export function fetchAntibodiesWithComparator(table) {
  return request(`/antibodies-with-comparator?table=${table}`);
}
