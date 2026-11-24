import { calculateAPY } from './calculateAPY';

describe('calculateAPY', () => {
  it('annualizes the fee income implied by volume and reserves', () => {
    expect(calculateAPY(100, 1000)).toBeCloseTo(10.95);
  });

  it('returns zero when there is no volume', () => {
    expect(calculateAPY(0, 1000)).toBe(0);
  });
});
