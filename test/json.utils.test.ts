import { extractJson } from '../src/utils/json';

describe('extractJson', () => {
  const cases = [
    { input: 'prefix {"a":1} suffix', expected: '{"a":1}' },
    { input: 'no json here', expected: null },
    { input: '{"a": {"b":2}} trailing', expected: '{"a": {"b":2}}' },
    { input: '```json\n{"c":3}\n```', expected: '{"c":3}' },
  ] as const;

  it.each(cases)('extracts JSON from %p', ({ input, expected }) => {
    expect(extractJson(input)).toBe(expected);
  });
});

