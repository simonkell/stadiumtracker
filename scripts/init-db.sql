PRAGMA foreign_keys = ON;

CREATE TABLE IF NOT EXISTS "Stadium" (
  "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
  "slug" TEXT NOT NULL,
  "name" TEXT NOT NULL,
  "city" TEXT NOT NULL,
  "country" TEXT NOT NULL,
  "continent" TEXT,
  "latitude" REAL,
  "longitude" REAL,
  "openedYear" INTEGER,
  "demolishedYear" INTEGER,
  "isDemolished" BOOLEAN NOT NULL DEFAULT false,
  "isDangerous" BOOLEAN NOT NULL DEFAULT false,
  "primaryTenant" TEXT,
  "notes" TEXT,
  "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updatedAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE UNIQUE INDEX IF NOT EXISTS "Stadium_slug_key" ON "Stadium"("slug");
CREATE INDEX IF NOT EXISTS "Stadium_country_city_idx" ON "Stadium"("country", "city");
CREATE INDEX IF NOT EXISTS "Stadium_name_idx" ON "Stadium"("name");

ALTER TABLE "Stadium" ADD COLUMN IF NOT EXISTS "demolishedYear" INTEGER;
ALTER TABLE "Stadium" ADD COLUMN IF NOT EXISTS "isDemolished" BOOLEAN NOT NULL DEFAULT false;
ALTER TABLE "Stadium" ADD COLUMN IF NOT EXISTS "isDangerous" BOOLEAN NOT NULL DEFAULT false;

CREATE TABLE IF NOT EXISTS "StadiumCapacityPeriod" (
  "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
  "stadiumId" INTEGER NOT NULL,
  "capacity" INTEGER NOT NULL,
  "validFrom" DATETIME,
  "validTo" DATETIME,
  "source" TEXT,
  "note" TEXT,
  "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT "StadiumCapacityPeriod_stadiumId_fkey"
    FOREIGN KEY ("stadiumId") REFERENCES "Stadium" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

CREATE INDEX IF NOT EXISTS "StadiumCapacityPeriod_stadiumId_validFrom_idx"
  ON "StadiumCapacityPeriod"("stadiumId", "validFrom");

CREATE TABLE IF NOT EXISTS "Visit" (
  "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
  "stadiumId" INTEGER NOT NULL,
  "visitedOn" DATETIME NOT NULL,
  "eventName" TEXT NOT NULL,
  "note" TEXT,
  "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT "Visit_stadiumId_fkey"
    FOREIGN KEY ("stadiumId") REFERENCES "Stadium" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

CREATE INDEX IF NOT EXISTS "Visit_stadiumId_visitedOn_idx"
  ON "Visit"("stadiumId", "visitedOn");
