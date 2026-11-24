export const configLoader = () => {
  return {
    apiKey: process.env.API_KEY,
    backendURL: process.env.BACKEND_URL,
    port: Number(process.env.PORT ?? 4000),
    corsOrigins: process.env.CORS_ORIGINS,
    redis: {
      host: process.env.REDIS_HOST,
      port: Number(process.env.REDIS_PORT ?? 6379),
    },
    mercury: {
      testnetBackendEndpoint: process.env.MERCURY_TESTNET_BACKEND_ENDPOINT,
      testnetGraphqlEndpoint: process.env.MERCURY_TESTNET_GRAPHQL_ENDPOINT,
      mainnetBackendEndpoint: process.env.MERCURY_BACKEND_ENDPOINT,
      mainnetGraphqlEndpoint: process.env.MERCURY_GRAPHQL_ENDPOINT,
      email: process.env.MERCURY_EMAIL,
      password: process.env.MERCURY_PASSWORD,
    },
  };
};
