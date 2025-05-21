export function findFirstJson(text: string): string | null {
  const start = text.indexOf('{');
  if (start === -1) return null;
  let depth = 0;
  for (let i = start; i < text.length; i++) {
    const ch = text[i];
    if (ch === '{') depth++;
    if (ch === '}') {
      depth--;
      if (depth === 0) {
        return text.slice(start, i + 1);
      }
    }
  }
  return null;
}

/** Parse JSON safely, returning null on failure. */
export function safeJsonParse<T>(str: string): T | null {
  try {
    return JSON.parse(str) as T;
  } catch {
    return null;
  }
}

export function extractJson(text: string): string | null {
  const blocks = Array.from(text.matchAll(/```(?:json)?\s*\n([\s\S]*?)```/gi)).map(
    (m) => m[1],
  );
  blocks.push(text);
  for (const b of blocks) {
    const candidate = findFirstJson(b);
    if (!candidate) continue;
    if (safeJsonParse(candidate)) return candidate;
  }
  return null;
}

