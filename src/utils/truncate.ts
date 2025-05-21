export function truncateJson<T>(value: T, maxLen = 1000): T {
  const seen = new WeakSet();
  const visit = (v: any): any => {
    if (typeof v === 'string') {
      return v.length > maxLen ? v.slice(0, maxLen) + '...' : v;
    }
    if (Array.isArray(v)) return v.map(visit);
    if (v && typeof v === 'object') {
      if (seen.has(v)) return v;
      seen.add(v);
      const out: any = {};
      for (const [k, val] of Object.entries(v)) {
        out[k] = visit(val);
      }
      return out;
    }
    return v;
  };
  return visit(value);
}
