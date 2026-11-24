import { Network, PrismaClient } from '@prisma/client';
import {
  constants,
  mainnetPhoenixContracts,
  testnetPhoenixContracts,
} from '../src/constants';
import { selectMercuryInstance } from '../src/services/mercury';
import { parseNetworkArg, requireArg } from './args';

const usage = 'yarn subscribe:phoenix <testnet|mainnet> <keyXdr>';
const network = parseNetworkArg(process.argv[2], usage);
const keyXdr = requireArg(process.argv[3], 'keyXdr', usage);

(async function () {
  const mercuryInstance = selectMercuryInstance(network);

  const prisma = new PrismaClient();

  const contractId =
    network == Network.MAINNET
      ? mainnetPhoenixContracts.factory
      : testnetPhoenixContracts.factory;
  console.log('Contract ID:', contractId);

  console.log('Key XDR:', keyXdr);

  const subscriptionExists = await prisma.subscriptions.findFirst({
    where: {
      contractId,
      keyXdr,
      protocol: 'PHOENIX',
      contractType: 'FACTORY',
      network,
    },
  });

  // console.log('Subscription exists:', subscriptionExists);

  if (!subscriptionExists) {
    const args = {
      contractId,
      keyXdr,
      durability: 'persistent',
    };

    const subscribeResponse = await mercuryInstance
      .subscribeToLedgerEntries(args)
      .catch((err) => {
        console.error(err);
      });

    console.log(subscribeResponse);

    let storageType;
    if (keyXdr === constants.instanceStorageKeyXdr) {
      storageType = 'INSTANCE';
    } else {
      storageType = 'PERSISTENT';
    }

    const subscribeStored = await prisma.subscriptions.create({
      data: {
        contractId,
        keyXdr,
        protocol: 'PHOENIX',
        contractType: 'FACTORY',
        storageType,
        network,
      },
    });

    console.log('Subscription stored in db', subscribeStored);
  } else {
    console.log('Already subscribed to factory contract', contractId);
  }
})();
