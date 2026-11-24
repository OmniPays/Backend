DELETE FROM "Subscriptions" a
USING "Subscriptions" b
WHERE a."id" > b."id"
  AND a."contractId" = b."contractId"
  AND a."keyXdr" IS NOT DISTINCT FROM b."keyXdr"
  AND a."network" = b."network"
  AND a."protocol" IS NOT DISTINCT FROM b."protocol"
  AND a."contractType" IS NOT DISTINCT FROM b."contractType"
  AND a."storageType" IS NOT DISTINCT FROM b."storageType";

DROP INDEX IF EXISTS "Subscriptions_contractId_keyXdr_key";

CREATE UNIQUE INDEX IF NOT EXISTS "Subscriptions_contractId_keyXdr_network_key"
  ON "Subscriptions"("contractId", "keyXdr", "network");

CREATE UNIQUE INDEX IF NOT EXISTS "Subscriptions_contractId_network_keyXdr_not_null_key"
  ON "Subscriptions"("contractId", COALESCE("keyXdr", ''), "network");

DELETE FROM "EventSubscriptions" a
USING "EventSubscriptions" b
WHERE a."id" > b."id"
  AND a."contractId" = b."contractId"
  AND a."network" = b."network"
  AND a."maxSingleSize" IS NOT DISTINCT FROM b."maxSingleSize"
  AND a."topic1" IS NOT DISTINCT FROM b."topic1"
  AND a."topic2" IS NOT DISTINCT FROM b."topic2"
  AND a."topic3" IS NOT DISTINCT FROM b."topic3"
  AND a."topic4" IS NOT DISTINCT FROM b."topic4";

DROP INDEX IF EXISTS "EventSubscriptions_contractId_maxSingleSize_key";

CREATE UNIQUE INDEX IF NOT EXISTS "EventSubscriptions_contractId_maxSingleSize_network_key"
  ON "EventSubscriptions"("contractId", "maxSingleSize", "network");

CREATE UNIQUE INDEX IF NOT EXISTS "EventSubscriptions_contractId_maxSingleSize_not_null_key"
  ON "EventSubscriptions"("contractId", COALESCE("maxSingleSize", ''), "network");

CREATE UNIQUE INDEX IF NOT EXISTS "EventSubscriptions_contractId_topics_network_key"
  ON "EventSubscriptions"("contractId", "topic1", "topic2", "topic3", "topic4", "network");

CREATE UNIQUE INDEX IF NOT EXISTS "EventSubscriptions_contractId_topics_not_null_key"
  ON "EventSubscriptions"(
    "contractId",
    COALESCE("topic1", ''),
    COALESCE("topic2", ''),
    COALESCE("topic3", ''),
    COALESCE("topic4", ''),
    "network"
  );
