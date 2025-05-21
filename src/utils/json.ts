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

function findJsonBlocks(text: string): string[] {
  const blocks: string[] = [];
  for (let i = 0; i < text.length; i++) {
    if (text[i] !== '{') continue;
    let depth = 0;
    for (let j = i; j < text.length; j++) {
      if (text[j] === '{') depth++;
      if (text[j] === '}') {
        depth--;
        if (depth === 0) {
          blocks.push(text.slice(i, j + 1));
          i = j;
          break;
        }
      }
    }
  }
  return blocks;
}

export function extractJson(text: string): string | null {
  const chunks = Array.from(
    text.matchAll(/```(?:json)?\s*\n([\s\S]*?)```/gi)
  ).map((m) => m[1]);
  chunks.push(text);
  for (const chunk of chunks) {
    const blocks = findJsonBlocks(chunk);
    for (const candidate of blocks) {
      if (safeJsonParse(candidate)) return candidate;
    }
  }
  return null;
}
