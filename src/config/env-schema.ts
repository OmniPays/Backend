import * as Joi from 'joi';

const httpEndpoint = () =>
  Joi.string()
    .uri({ scheme: ['http', 'https'] })
    .required();

export const envSchema = Joi.object({
  NODE_ENV: Joi.string()
    .valid('development', 'test', 'production')
    .default('development'),
  API_KEY: Joi.string().trim().min(1).required(),
  POSTGRES_URL: Joi.string()
    .uri({ scheme: ['postgres', 'postgresql'] })
    .required(),
  PORT: Joi.number().integer().min(1).max(65535).default(4000),
  BACKEND_URL: httpEndpoint(),
  CORS_ORIGINS: Joi.string().allow('').optional(),
  REDIS_HOST: Joi.string().trim().min(1).required(),
  REDIS_PORT: Joi.number().integer().min(1).max(65535).default(6379),
  MERCURY_TESTNET_BACKEND_ENDPOINT: httpEndpoint(),
  MERCURY_TESTNET_GRAPHQL_ENDPOINT: httpEndpoint(),
  MERCURY_BACKEND_ENDPOINT: httpEndpoint(),
  MERCURY_GRAPHQL_ENDPOINT: httpEndpoint(),
  MERCURY_EMAIL: Joi.string().email().required(),
  MERCURY_PASSWORD: Joi.string().min(1).required(),
});
