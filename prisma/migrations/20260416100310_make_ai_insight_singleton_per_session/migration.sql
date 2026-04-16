DELETE FROM "ai_insights" a
USING "ai_insights" b
WHERE a."sessionId" = b."sessionId"
  AND (
    a."createdAt" < b."createdAt"
    OR (a."createdAt" = b."createdAt" AND a."id" < b."id")
  );

CREATE UNIQUE INDEX "ai_insights_sessionId_key" ON "ai_insights"("sessionId");
