import { load } from "cheerio";
import { prisma } from "@/lib/prisma";
import { slugify } from "@/lib/utils";

const WIKIPEDIA_LIST_URL =
  "https://en.wikipedia.org/wiki/List_of_stadiums_by_capacity";
const CAPACITY_SOURCE = "Wikipedia: List of stadiums by capacity";
const MAX_REASONABLE_CAPACITY = 500000;

type WikipediaStadium = {
  name: string;
  capacity: number;
  city: string;
  country: string;
  region: string | null;
  tenants: string | null;
  sports: string | null;
  articleUrl: string;
};

function cleanText(value: string) {
  return value
    .replace(/\[[^\]]*]/g, "")
    .replace(/\bImage\b/g, "")
    .replace(/\s+/g, " ")
    .replace(/\s+,/g, ",")
    .trim();
}

function extractListText(rawText: string) {
  const text = cleanText(rawText);
  return text.length > 0 ? text : null;
}

function parseCapacity(rawText: string) {
  const cleaned = cleanText(rawText);
  const match = cleaned.match(/\d[\d,.\s]*/);

  if (!match) {
    return null;
  }

  const digits = match[0].replace(/[^\d]/g, "");
  const capacity = digits ? Number(digits) : null;

  if (!capacity || capacity > MAX_REASONABLE_CAPACITY) {
    return null;
  }

  return capacity;
}

function buildImportNote({
  sports,
  articleUrl,
}: Pick<WikipediaStadium, "sports" | "articleUrl">) {
  const parts = ["Wikipedia-Import"];

  if (sports) {
    parts.push(`Sportarten: ${sports}`);
  }

  parts.push(articleUrl);
  return parts.join(" • ");
}

function parseWikipediaStadiums(html: string): WikipediaStadium[] {
  const $ = load(html);
  const stadiums = new Map<string, WikipediaStadium>();

  $("table.wikitable tbody tr").each((_, row) => {
    const cells = $(row).children("td");

    if (cells.length < 6) {
      return;
    }

    const nameCell = cells.eq(0);
    const capacityCell = cells.eq(1);
    const cityCell = cells.eq(2);
    const countryCell = cells.eq(3);
    const regionCell = cells.eq(4);
    const tenantsCell = cells.eq(5);
    const sportsCell = cells.eq(6);

    const name = cleanText(nameCell.text());
    const capacity = parseCapacity(capacityCell.text());
    const city = cleanText(cityCell.text());
    const country = cleanText(countryCell.text());

    if (!name || !capacity || !city || !country) {
      return;
    }

    const articleHref = nameCell.find("a").first().attr("href");
    const articleUrl = articleHref
      ? new URL(articleHref, "https://en.wikipedia.org").toString()
      : WIKIPEDIA_LIST_URL;

    const stadium: WikipediaStadium = {
      name,
      capacity,
      city,
      country,
      region: extractListText(regionCell.text()),
      tenants: extractListText(tenantsCell.text()),
      sports: extractListText(sportsCell.text()),
      articleUrl,
    };

    stadiums.set(`${name}::${city}::${country}`, stadium);
  });

  return [...stadiums.values()];
}

async function createUniqueImportedSlug(name: string, city: string, country: string) {
  const baseSlug = slugify(`${name}-${city}-${country}`) || slugify(name) || "stadium";
  let slug = baseSlug;
  let suffix = 2;

  while (await prisma.stadium.findUnique({ where: { slug } })) {
    slug = `${baseSlug}-${suffix}`;
    suffix += 1;
  }

  return slug;
}

export async function importWikipediaStadiumList() {
  await repairInvalidWikipediaCapacities();

  const response = await fetch(WIKIPEDIA_LIST_URL, {
    headers: {
      "User-Agent": "stadiumtracker/1.0 (Wikipedia import for personal stadium tracking)",
    },
    cache: "no-store",
  });

  if (!response.ok) {
    throw new Error(`Wikipedia import failed with status ${response.status}`);
  }

  const html = await response.text();
  const stadiums = parseWikipediaStadiums(html);

  let created = 0;
  let updated = 0;
  let capacitiesCreated = 0;
  let capacitiesUpdated = 0;

  for (const stadium of stadiums) {
    const existing = await prisma.stadium.findFirst({
      where: {
        name: stadium.name,
        city: stadium.city,
        country: stadium.country,
      },
    });

    const importedSlug = slugify(`${stadium.name}-${stadium.city}-${stadium.country}`);

    const stadiumRecord = existing
      ? await prisma.stadium.update({
          where: { id: existing.id },
          data: {
            continent: existing.continent || stadium.region,
            primaryTenant: existing.primaryTenant || stadium.tenants,
            notes: existing.notes || null,
          },
        })
      : await prisma.stadium.create({
          data: {
            slug:
              importedSlug && !(await prisma.stadium.findUnique({ where: { slug: importedSlug } }))
                ? importedSlug
                : await createUniqueImportedSlug(stadium.name, stadium.city, stadium.country),
            name: stadium.name,
            city: stadium.city,
            country: stadium.country,
            continent: stadium.region,
            primaryTenant: stadium.tenants,
          },
        });

    if (existing) {
      updated += 1;
    } else {
      created += 1;
    }

    const existingCapacity = await prisma.stadiumCapacityPeriod.findFirst({
      where: {
        stadiumId: stadiumRecord.id,
        source: CAPACITY_SOURCE,
      },
      orderBy: [{ createdAt: "desc" }],
    });

    const capacityNote = buildImportNote(stadium);

    if (existingCapacity) {
      await prisma.stadiumCapacityPeriod.update({
        where: { id: existingCapacity.id },
        data: {
          capacity: stadium.capacity,
          validFrom: existingCapacity.validFrom ?? new Date("2025-01-01"),
          note: capacityNote,
        },
      });

      capacitiesUpdated += 1;
    } else {
      await prisma.stadiumCapacityPeriod.create({
        data: {
          stadiumId: stadiumRecord.id,
          capacity: stadium.capacity,
          validFrom: new Date("2025-01-01"),
          source: CAPACITY_SOURCE,
          note: capacityNote,
        },
      });

      capacitiesCreated += 1;
    }
  }

  return {
    total: stadiums.length,
    created,
    updated,
    capacitiesCreated,
    capacitiesUpdated,
  };
}

export async function repairInvalidWikipediaCapacities() {
  const deletedRows = await prisma.$executeRawUnsafe(`
    DELETE FROM "StadiumCapacityPeriod"
    WHERE "source" = '${CAPACITY_SOURCE}'
      AND "capacity" > ${MAX_REASONABLE_CAPACITY}
  `);

  return Number(deletedRows);
}
