import { Logger } from '@nestjs/common';
import {
  ContractType,
  Network,
  PrismaClient,
  Protocol,
  StorageType,
} from '@prisma/client';
import { selectMercuryInstance } from 'src/services/mercury';
import {
  constants,
  factoryAddresses,
  mainnetPhoenixContracts,
} from '../constants';
import { getFactoryAddress } from '../utils';
import { GET_ALL_LEDGER_ENTRY_SUBSCRIPTIONS } from '../utils/queries';

export async function populateDatabase(
  network: Network,
  soroswapPairAddresses: string[],
) {
  Logger.log('Updating database...', `MERCURY ${network}`);

  const mercuryInstance = selectMercuryInstance(network);
  const prisma = new PrismaClient();

  try {
    const ledgerEntrySubscriptions = await mercuryInstance
      .getCustomQuery({ request: GET_ALL_LEDGER_ENTRY_SUBSCRIPTIONS })
      .catch((error) => {
        Logger.error('Error getting ledger entry subscriptions', error);
        return null;
      });

    if (!ledgerEntrySubscriptions?.data) {
      Logger.log('Database up to date!', `MERCURY ${network}`);
      return;
    }

    const counters: { [x: string]: number } = {
      soroswapFactoryInstance: 0,
      soroswapFactoryPersistent: 0,
      phoenixFactoryInstance: 0,
      phoenixFactoryConfig: 0,
      phoenixFactoryLpVec: 0,
      phoenixFactoryInitialized: 0,
      pairStorage: 0,
      others: 0,
      removedPairs: 0,
    };

    const removedPairs = await prisma.subscriptions.deleteMany({
      where: {
        network,
        protocol: Protocol.SOROSWAP,
        contractType: ContractType.PAIR,
        contractId: {
          notIn: soroswapPairAddresses,
        },
      },
    });

    counters.removedPairs = removedPairs.count;

    const soroswapFactoryAddress = getFactoryAddress(network);
    const phoenixFactoryAddresses =
      network === Network.MAINNET
        ? [mainnetPhoenixContracts.factory].filter(Boolean)
        : factoryAddresses.phoenix;
    const edges =
      ledgerEntrySubscriptions.data.allLedgerEntrySubscriptions?.edges ?? [];

    for (const sub of edges) {
      const { keyXdr, contractId } = sub.node;

      let protocol: Protocol = undefined;
      let contractType: ContractType = undefined;
      let storageType: StorageType = undefined;

      const isSoroswapFactory = soroswapFactoryAddress === contractId;
      const isPhoenixFactory = phoenixFactoryAddresses.includes(contractId);
      const isInstanceStorage = keyXdr === constants.instanceStorageKeyXdr;
      const isPairStorage =
        !isSoroswapFactory && !isPhoenixFactory && isInstanceStorage;

      if (isSoroswapFactory) {
        protocol = Protocol.SOROSWAP;
        contractType = ContractType.FACTORY;
        storageType = isInstanceStorage
          ? StorageType.INSTANCE
          : StorageType.PERSISTENT;
        if (isInstanceStorage) {
          counters.soroswapFactoryInstance++;
        } else {
          counters.soroswapFactoryPersistent++;
        }
      }

      if (isPhoenixFactory) {
        protocol = Protocol.PHOENIX;
        contractType = ContractType.FACTORY;
        storageType = isInstanceStorage
          ? StorageType.INSTANCE
          : StorageType.PERSISTENT;
        if (isInstanceStorage) {
          counters.phoenixFactoryInstance++;
        } else if (keyXdr === constants.phoenixConfigKeyXdr) {
          counters.phoenixFactoryConfig++;
        } else if (keyXdr === constants.phoenixLpVecKeyXdr) {
          counters.phoenixFactoryLpVec++;
        } else if (keyXdr === constants.phoenixInitializedKeyXdr) {
          counters.phoenixFactoryInitialized++;
        }
      }

      if (isPairStorage) {
        protocol = Protocol.SOROSWAP;
        contractType = ContractType.PAIR;
        storageType = StorageType.INSTANCE;
        counters.pairStorage++;
      }

      if (!isSoroswapFactory && !isPhoenixFactory && !isPairStorage) {
        counters.others++;
        continue;
      }

      const shouldAdd =
        isSoroswapFactory ||
        isPhoenixFactory ||
        (isPairStorage && soroswapPairAddresses.includes(contractId));

      if (!shouldAdd) {
        continue;
      }

      await prisma.subscriptions.upsert({
        where: {
          contractId_keyXdr_network: {
            contractId,
            keyXdr,
            network,
          },
        },
        update: {
          protocol,
          contractType,
          storageType,
        },
        create: {
          contractId,
          keyXdr,
          network,
          protocol,
          contractType,
          storageType,
        },
      });
    }

    Logger.log('Database up to date!', `MERCURY ${network}`);
    console.log({ counters });
  } finally {
    await prisma.$disconnect();
  }
}
