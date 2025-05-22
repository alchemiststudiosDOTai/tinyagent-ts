import { extractJson } from '../src/utils/json';

describe('extractJson', () => {
  const cases = [
    { input: 'prefix {"a":1} suffix', expected: '{"a":1}' },
    { input: 'no json here', expected: null },
    { input: '{"a": {"b":2}} trailing', expected: '{"a": {"b":2}}' },
    { input: '```json\n{"c":3}\n```', expected: '{"c":3}' },
    {
      input: '```json\n{"a":1}\n```\ntext\n```json\n{"b":2}\n```',
      expected: '{"a":1}',
    },
    { input: '{} just braces {"x":1}', expected: '{}' },
    { input: '{"a": } {"b":2}', expected: '{"b":2}' },
  ] as const;

  it.each(cases)('extracts JSON from %p', ({ input, expected }) => {
    expect(extractJson(input)).toBe(expected);
  });
});

