import { routerEventsFormatter } from './routerEventsFormatter';

const txInfoByTx = {
  txHash: 'hash',
  ledgerByLedger: { closeTime: 1000 },
};

describe('routerEventsFormatter', () => {
  it('formats add events with adjusted token amounts', () => {
    const result = routerEventsFormatter({
      edges: [
        {
          node: {
            topic2: 'add',
            data: {
              token_a: 'AAA',
              token_b: 'BBB',
              amount_a: 10000000,
              amount_b: 20000000,
              to: 'account',
            },
            txInfoByTx,
          },
        },
      ],
    });

    expect(result).toHaveLength(1);
    expect(result[0]).toMatchObject({
      event: 'add',
      amountA: '1',
      amountB: '2',
      account: 'account',
      timestamp: 1000000,
    });
  });

  it('returns an empty array when there are no events', () => {
    expect(routerEventsFormatter(null)).toEqual([]);
  });
});
