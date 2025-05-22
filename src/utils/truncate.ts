export function truncateJson(value: unknown, maxLen = 3000): string {
  const text = typeof value === 'string' ? value : JSON.stringify(value);
  return text.length > maxLen ? '<too large to show>' : text;
}
