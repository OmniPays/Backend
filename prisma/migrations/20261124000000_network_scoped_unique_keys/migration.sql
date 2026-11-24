DELETE FROM "Subscriptions" a
USING "Subscriptions" b
WHERE a."id" > b."id"
  AND a."contractId" = b."contractId"
  AND COALESCE(a."keyXdr", '') = COALESCE(b."keyXdr", '')
  AND a."network" = b."network";

DROP INDEX IF EXISTS "Subscriptions_contractId_keyXdr_key";

CREATE UNIQUE INDEX IF NOT EXISTS "Subscriptions_contractId_network_keyXdr_not_null_key"
  ON "Subscriptions"("contractId", COALESCE("keyXdr", ''), "network");

DELETE FROM "EventSubscriptions" a
USING "EventSubscriptions" b
WHERE a."id" > b."id"
  AND a."contractId" = b."contractId"
  AND COALESCE(a."maxSingleSize", '') = COALESCE(b."maxSingleSize", '')
  AND a."network" = b."network";

DELETE FROM "EventSubscriptions" a
USING "EventSubscriptions" b
WHERE a."id" > b."id"
  AND a."contractId" = b."contractId"
  AND COALESCE(a."topic1", '') = COALESCE(b."topic1", '')
  AND COALESCE(a."topic2", '') = COALESCE(b."topic2", '')
  AND COALESCE(a."topic3", '') = COALESCE(b."topic3", '')
  AND COALESCE(a."topic4", '') = COALESCE(b."topic4", '')
  AND a."network" = b."network";

DROP INDEX IF EXISTS "EventSubscriptions_contractId_maxSingleSize_key";

CREATE UNIQUE INDEX IF NOT EXISTS "EventSubscriptions_contractId_maxSingleSize_not_null_key"
  ON "EventSubscriptions"("contractId", COALESCE("maxSingleSize", ''), "network");

CREATE UNIQUE INDEX IF NOT EXISTS "EventSubscriptions_contractId_topics_not_null_key"
  ON "EventSubscriptions"(
    "contractId",
    COALESCE("topic1", ''),
    COALESCE("topic2", ''),
    COALESCE("topic3", ''),
    COALESCE("topic4", ''),
    "network"
  );
