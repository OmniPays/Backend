import { getEntriesByDayParser } from './getEntriesByDayParser';

const timestamp = (day: number, hour: number) =>
  new Date(2024, 2, day, hour).getTime() / 1000;

describe('getEntriesByDayParser', () => {
  it('groups entries by local day and keeps the latest entry', () => {
    const entries = [
      { timestamp: timestamp(11, 9), reserve0: '100' },
      { timestamp: timestamp(11, 18), reserve0: '200' },
      { timestamp: timestamp(12, 10), reserve0: '300' },
    ];

    const result = getEntriesByDayParser(entries);

    expect(result).toHaveLength(2);
    expect(result[0].date).toBe('2024-03-11');
    expect(result[0].lastEntry.reserve0).toBe('200');
    expect(result[0].allEntries).toHaveLength(2);
    expect(result[1].lastEntry.reserve0).toBe('300');
  });

  it('replaces missing timestamps with the creation fallback', () => {
    const result = getEntriesByDayParser([
      { timestamp: null, reserve0: '100' },
    ]);

    expect(typeof result[0].lastEntry.timestamp).toBe('number');
  });
});
