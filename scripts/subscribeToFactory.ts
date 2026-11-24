import {
  ContractType,
  PrismaClient,
  Protocol,
  StorageType,
} from '@prisma/client';
import { constants } from '../src/constants';
import { selectMercuryInstance } from '../src/services/mercury';
import { getFactoryAddress } from '../src/utils';
import { parseNetworkArg } from './args';

const network = parseNetworkArg(
  process.argv[2],
  'yarn subscribe:factory <testnet|mainnet>',
);

(async function () {
  const mercuryInstance = selectMercuryInstance(network);

  const prisma = new PrismaClient();

  const keyXdr = constants.instanceStorageKeyXdr;

  const contractId = await getFactoryAddress(network);

  const subscriptionExists = await prisma.subscriptions.findFirst({
    where: {
      contractId,
      keyXdr,
    },
  });

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

    const subscribeStored = await prisma.subscriptions.create({
      data: {
        contractId,
        keyXdr,
        protocol: Protocol.SOROSWAP,
        contractType: ContractType.FACTORY,
        storageType: StorageType.INSTANCE,
        network,
      },
    });

    console.log('Subscription stored in db', subscribeStored);
  } else {
    console.log('Already subscribed to factory contract', contractId);
  }
})();
