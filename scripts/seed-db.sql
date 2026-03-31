INSERT OR IGNORE INTO "Stadium" (
  "slug", "name", "city", "country", "continent", "latitude", "longitude", "openedYear", "primaryTenant", "notes"
) VALUES
  ('rungrado-1st-of-may-stadium', 'Rungrado 1st of May Stadium', 'Pyongyang', 'North Korea', 'Asia', 39.0495, 125.7752, 1989, 'North Korea national football team', 'Seeded sample stadium.'),
  ('narendra-modi-stadium', 'Narendra Modi Stadium', 'Ahmedabad', 'India', 'Asia', 23.0910, 72.5970, 2020, 'India cricket team', 'Seeded sample stadium.'),
  ('michigan-stadium', 'Michigan Stadium', 'Ann Arbor', 'United States', 'North America', 42.2658, -83.7487, 1927, 'Michigan Wolverines', 'Seeded sample stadium.'),
  ('beaver-stadium', 'Beaver Stadium', 'State College', 'United States', 'North America', 40.8122, -77.8561, 1960, 'Penn State Nittany Lions', 'Seeded sample stadium.'),
  ('camp-nou', 'Camp Nou', 'Barcelona', 'Spain', 'Europe', 41.3809, 2.1228, 1957, 'FC Barcelona', 'Seeded sample stadium.'),
  ('fnb-stadium', 'FNB Stadium', 'Johannesburg', 'South Africa', 'Africa', -26.2347, 27.9826, 1989, 'South Africa national football team', 'Seeded sample stadium.');

INSERT OR IGNORE INTO "StadiumCapacityPeriod" (
  "stadiumId", "capacity", "validFrom", "source", "note"
)
SELECT "id", 114000, '2025-01-01', 'Seed data', 'Aktueller Seed-Datensatz'
FROM "Stadium"
WHERE "slug" = 'rungrado-1st-of-may-stadium';

INSERT OR IGNORE INTO "StadiumCapacityPeriod" (
  "stadiumId", "capacity", "validFrom", "source", "note"
)
SELECT "id", 132000, '2025-01-01', 'Seed data', 'Aktueller Seed-Datensatz'
FROM "Stadium"
WHERE "slug" = 'narendra-modi-stadium';

INSERT OR IGNORE INTO "StadiumCapacityPeriod" (
  "stadiumId", "capacity", "validFrom", "source", "note"
)
SELECT "id", 107601, '2025-01-01', 'Seed data', 'Aktueller Seed-Datensatz'
FROM "Stadium"
WHERE "slug" = 'michigan-stadium';

INSERT OR IGNORE INTO "StadiumCapacityPeriod" (
  "stadiumId", "capacity", "validFrom", "source", "note"
)
SELECT "id", 106572, '2025-01-01', 'Seed data', 'Aktueller Seed-Datensatz'
FROM "Stadium"
WHERE "slug" = 'beaver-stadium';

INSERT OR IGNORE INTO "StadiumCapacityPeriod" (
  "stadiumId", "capacity", "validFrom", "source", "note"
)
SELECT "id", 99354, '2025-01-01', 'Seed data', 'Aktueller Seed-Datensatz'
FROM "Stadium"
WHERE "slug" = 'camp-nou';

INSERT OR IGNORE INTO "StadiumCapacityPeriod" (
  "stadiumId", "capacity", "validFrom", "source", "note"
)
SELECT "id", 94736, '2025-01-01', 'Seed data', 'Aktueller Seed-Datensatz'
FROM "Stadium"
WHERE "slug" = 'fnb-stadium';

INSERT OR IGNORE INTO "Visit" (
  "stadiumId", "visitedOn", "eventName", "note"
)
SELECT "id", '2019-03-07', 'FC Barcelona vs. Real Sociedad', 'Beispielbesuch aus dem Seed.'
FROM "Stadium"
WHERE "slug" = 'camp-nou';
