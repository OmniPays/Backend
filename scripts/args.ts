import { Network } from '@prisma/client';

export function parseNetworkArg(
  arg: string | undefined,
  usage: string,
): Network {
  const value = arg?.toLowerCase();

  if (value !== 'testnet' && value !== 'mainnet') {
    console.error(`Invalid or missing network. Usage: ${usage}`);
    process.exit(1);
  }

  return value === 'mainnet' ? Network.MAINNET : Network.TESTNET;
}

export function requireArg(
  arg: string | undefined,
  name: string,
  usage: string,
): string {
  const value = arg?.trim();

  if (!value) {
    console.error(`Missing ${name}. Usage: ${usage}`);
    process.exit(1);
  }

  return value;
}
