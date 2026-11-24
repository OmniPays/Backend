import { adjustAmountByDecimals } from './adjustAmountByDecimals';

describe('adjustAmountByDecimals', () => {
  it('uses seven decimals when none are provided', () => {
    expect(adjustAmountByDecimals(12345678, undefined)).toBe('1.2345678');
  });

  it('formats raw amounts with explicit decimals', () => {
    expect(adjustAmountByDecimals(123456, 4)).toBe('12.3456');
  });

  it('pads amounts that are shorter than the decimals count', () => {
    expect(adjustAmountByDecimals(5, 7)).toBe('0.0000005');
  });

  it('removes trailing zeroes', () => {
    expect(adjustAmountByDecimals(10000000, 7)).toBe('1');
    expect(adjustAmountByDecimals(0, 7)).toBe('0');
  });
});
