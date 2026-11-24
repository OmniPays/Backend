import { getContractEventsByDayParser } from './getContractEventsByDayParser';

describe('getContractEventsByDayParser', () => {
  it('groups events by UTC day without changing their order', () => {
    const events = [
      { id: 1, closeTime: new Date('2024-03-11T10:00:00Z') },
      { id: 2, closeTime: new Date('2024-03-11T22:00:00Z') },
      { id: 3, closeTime: new Date('2024-03-12T08:00:00Z') },
    ];

    const result = getContractEventsByDayParser(events);

    expect(result.map((day) => day.date)).toEqual(['2024-03-11', '2024-03-12']);
    expect(result[0].events.map((event) => event.id)).toEqual([1, 2]);
  });

  it('returns an empty list when there are no events', () => {
    expect(getContractEventsByDayParser([])).toEqual([]);
  });
});
