import { isAddress, shortenAddress } from './addressParsers';

const address = 'A'.repeat(56);

describe('address parsers', () => {
  it('accepts uppercase 56-character contract addresses', () => {
    expect(isAddress(address)).toBe(address);
    expect(isAddress('a'.repeat(56))).toBe(false);
    expect(isAddress('ABC')).toBe(false);
  });

  it('shortens valid addresses and rejects invalid ones', () => {
    expect(shortenAddress(address)).toBe(`${'AAAA'}...${'AAAA'}`);
    expect(shortenAddress('')).toBe('');
    expect(() => shortenAddress('ABC')).toThrow(
      "Invalid 'address' parameter 'ABC'.",
    );
  });
});
