import { findFirstJson } from '../src/utils/json';

describe('findFirstJson', () => {
  const cases = [
    { input: 'prefix {"a":1} suffix', expected: '{"a":1}' },
    { input: 'no json here', expected: null },
    { input: '{"a": {"b":2}} trailing', expected: '{"a": {"b":2}}' },
  ] as const;

  it.each(cases)('extracts JSON from %p', ({ input, expected }) => {
    expect(findFirstJson(input)).toBe(expected);
  });
});

