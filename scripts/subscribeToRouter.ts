import { ContractType, PrismaClient, Protocol } from '@prisma/client';
import { selectMercuryInstance } from '../src/services/mercury';
import { getRouterAddress } from '../src/utils';
import { parseNetworkArg } from './args';

const network = parseNetworkArg(
  process.argv[2],
  'yarn subscribe:router <testnet|mainnet>',
);

(async function () {
  const mercuryInstance = selectMercuryInstance(network);

  const prisma = new PrismaClient();

  const contractId = await getRouterAddress(network);

  const subscriptionExists = await prisma.subscriptions.findFirst({
    where: {
      contractId,
      contractType: ContractType.ROUTER,
      network,
    },
  });

  if (!subscriptionExists) {
    const args = {
      contractId,
    };

    const subscribeResponse = await mercuryInstance
      .subscribeToContractEvents(args)
      .catch((err) => {
        console.error(err);
      });

    console.log(subscribeResponse);

    const subscribeStored = await prisma.subscriptions.create({
      data: {
        contractId,
        protocol: Protocol.SOROSWAP,
        contractType: ContractType.ROUTER,
        network,
      },
    });

    console.log('Subscription stored in db', subscribeStored);
  } else {
    console.log('Already subscribed to router contract', contractId);
  }
})();
