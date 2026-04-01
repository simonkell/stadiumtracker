import { prisma } from "@/lib/prisma";

const NOMINATIM_BASE_URL =
  process.env.NOMINATIM_BASE_URL?.trim() || "https://nominatim.openstreetmap.org/search";
const NOMINATIM_EMAIL = process.env.NOMINATIM_EMAIL?.trim() || "";
const APP_USER_AGENT =
  process.env.NOMINATIM_USER_AGENT?.trim() || "stadiumtracker/0.1 (+https://github.com/simonkell/stadiumtracker)";
const REQUEST_DELAY_MS = 1100;

type NominatimResult = {
  lat: string;
  lon: string;
  class?: string;
  type?: string;
  category?: string;
  display_name?: string;
  name?: string;
  importance?: number;
};

function sleep(ms: number) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

function normalize(value: string) {
  return value.toLocaleLowerCase("de-DE");
}

function buildQueryParts(stadium: { name: string; city: string; country: string }) {
  return [
    `${stadium.name}, ${stadium.city}, ${stadium.country}`,
    `${stadium.name} stadium, ${stadium.city}, ${stadium.country}`,
    `${stadium.name} arena, ${stadium.city}, ${stadium.country}`,
  ];
}

function scoreCandidate(
  candidate: NominatimResult,
  stadium: { name: string; city: string; country: string },
) {
  let score = candidate.importance ?? 0;
  const haystack = normalize(
    [candidate.name, candidate.display_name, candidate.type, candidate.class, candidate.category]
      .filter(Boolean)
      .join(" "),
  );
  const stadiumName = normalize(stadium.name);
  const city = normalize(stadium.city);
  const country = normalize(stadium.country);

  if (haystack.includes(stadiumName)) score += 5;
  if (haystack.includes(city)) score += 2;
  if (haystack.includes(country)) score += 1;
  if (candidate.type === "stadium") score += 8;
  if (candidate.type === "sports_centre") score += 4;
  if (candidate.class === "leisure") score += 3;
  if (candidate.category === "leisure") score += 2;

  return score;
}

async function searchNominatim(query: string) {
  const params = new URLSearchParams({
    q: query,
    format: "jsonv2",
    limit: "5",
    addressdetails: "1",
  });

  if (NOMINATIM_EMAIL) {
    params.set("email", NOMINATIM_EMAIL);
  }

  const response = await fetch(`${NOMINATIM_BASE_URL}?${params.toString()}`, {
    headers: {
      "User-Agent": APP_USER_AGENT,
      "Accept-Language": "de,en",
    },
    cache: "no-store",
  });

  if (!response.ok) {
    throw new Error(`Nominatim request failed with ${response.status}`);
  }

  return (await response.json()) as NominatimResult[];
}

export async function lookupCoordinatesForStadium(stadium: {
  name: string;
  city: string;
  country: string;
}) {
  let candidates: NominatimResult[] = [];

  for (const query of buildQueryParts(stadium)) {
    const results = await searchNominatim(query);
    candidates = [...candidates, ...results];

    if (results.some((result) => result.type === "stadium" || result.class === "leisure")) {
      break;
    }
  }

  const bestMatch = [...candidates].sort(
    (left, right) => scoreCandidate(right, stadium) - scoreCandidate(left, stadium),
  )[0];

  if (!bestMatch?.lat || !bestMatch?.lon) {
    return null;
  }

  const latitude = Number(bestMatch.lat);
  const longitude = Number(bestMatch.lon);

  if (Number.isNaN(latitude) || Number.isNaN(longitude)) {
    return null;
  }

  return { latitude, longitude };
}

export async function populateCoordinatesIfMissing(stadiumId: number) {
  const stadium = await prisma.stadium.findUnique({
    where: { id: stadiumId },
    select: {
      id: true,
      name: true,
      city: true,
      country: true,
      latitude: true,
      longitude: true,
    },
  });

  if (!stadium || stadium.latitude != null || stadium.longitude != null) {
    return false;
  }

  const coordinates = await lookupCoordinatesForStadium(stadium);

  if (!coordinates) {
    return false;
  }

  await prisma.stadium.update({
    where: { id: stadium.id },
    data: {
      latitude: coordinates.latitude,
      longitude: coordinates.longitude,
    },
  });

  return true;
}

export async function populateMissingCoordinates() {
  const stadiums = await prisma.stadium.findMany({
    where: {
      latitude: null,
      longitude: null,
    },
    select: {
      id: true,
    },
    orderBy: [{ name: "asc" }],
  });

  let updatedCount = 0;

  for (const stadium of stadiums) {
    const updated = await populateCoordinatesIfMissing(stadium.id);

    if (updated) {
      updatedCount += 1;
    }

    await sleep(REQUEST_DELAY_MS);
  }

  return {
    checked: stadiums.length,
    updated: updatedCount,
  };
}
