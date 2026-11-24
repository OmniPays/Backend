import { Network } from '@prisma/client';
import { Mercury } from 'mercury-sdk';
import { configLoader } from '../config/config-loader';

let testnetInstance: Mercury | undefined;
let mainnetInstance: Mercury | undefined;

function createInstance(network: Network): Mercury {
  const { mercury } = configLoader();
  const credentials = {
    email: mercury.email,
    password: mercury.password,
  };

  if (network === Network.TESTNET) {
    return new Mercury({
      backendEndpoint: mercury.testnetBackendEndpoint,
      graphqlEndpoint: mercury.testnetGraphqlEndpoint,
      ...credentials,
    });
  }

  return new Mercury({
    backendEndpoint: mercury.mainnetBackendEndpoint,
    graphqlEndpoint: mercury.mainnetGraphqlEndpoint,
    ...credentials,
  });
}

export const selectMercuryInstance = (network: Network): Mercury => {
  if (network === Network.TESTNET) {
    testnetInstance ??= createInstance(network);
    return testnetInstance;
  }

  mainnetInstance ??= createInstance(network);
  return mainnetInstance;
};
