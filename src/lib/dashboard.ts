import type { Stadium, StadiumCapacityPeriod, Visit } from "@prisma/client";
import { prisma } from "@/lib/prisma";
import {
  removeIrrelevantStadiums,
  repairInvalidWikipediaCapacities,
} from "@/lib/wikipedia-import";
import { enforceSingleVisitPerStadium } from "@/lib/visits";

type StadiumWithRelations = Stadium & {
  capacityPeriods: StadiumCapacityPeriod[];
  visits: Visit[];
};

export type StadiumCard = {
  id: number;
  name: string;
  city: string;
  country: string;
  currentCapacity: number | null;
  hasVisit: boolean;
  firstVisit: Visit | null;
  openedYear: number | null;
  primaryTenant: string | null;
  isInTop100: boolean;
  coordinates: string | null;
  isDemolished: boolean;
  isDangerous: boolean;
};

export type DashboardData = {
  stats: {
    trackedStadiums: number;
    visitedStadiums: number;
    remainingStadiums: number;
    top50Visited: number;
    top50Tracked: number;
    top50CompletionRate: number;
    top100Visited: number;
    top100Tracked: number;
    completionRate: number;
  };
  continentCoverage: Array<{
    continent: string;
    tracked: number;
    visited: number;
    percentage: number;
  }>;
  stadiums: StadiumCard[];
  mapMarkers: Array<{
    id: number;
    name: string;
    city: string;
    country: string;
    latitude: number;
    longitude: number;
    currentCapacity: number | null;
    isVisited: boolean;
    isDemolished: boolean;
    isDangerous: boolean;
    isInTop100: boolean;
    firstVisitDate: Date | null;
    firstVisitEvent: string | null;
  }>;
  visitOptions: VisitOption[];
  stadiumEditOptions: StadiumEditOption[];
  capacityOptions: CapacityOption[];
};

export type VisitOption = {
  id: number;
  name: string;
  firstVisit: {
    id: number;
    visitedOn: string;
    eventName: string;
    note: string | null;
  } | null;
};

export type StadiumEditOption = {
  id: number;
  name: string;
  city: string;
  country: string;
  continent: string | null;
  latitude: number | null;
  longitude: number | null;
  openedYear: number | null;
  isDemolished: boolean;
  isDangerous: boolean;
  primaryTenant: string | null;
  notes: string | null;
};

export type CapacityOption = {
  id: number;
  name: string;
  currentCapacity: number | null;
  currentCapacityPeriodId: number | null;
  periods: Array<{
    id: number;
    capacity: number;
    validFrom: string;
    validTo: string;
    source: string | null;
    note: string | null;
    isCurrent: boolean;
  }>;
};

export function getCurrentCapacity(periods: StadiumCapacityPeriod[]) {
  if (periods.length === 0) {
    return null;
  }

  const now = new Date();
  const active = periods.find((period) => {
    const startsBeforeNow = !period.validFrom || period.validFrom <= now;
    const endsAfterNow = !period.validTo || period.validTo >= now;
    return startsBeforeNow && endsAfterNow;
  });

  if (active) {
    return active.capacity;
  }

  return [...periods]
    .sort((left, right) => {
      const leftTime = left.validFrom?.getTime() ?? 0;
      const rightTime = right.validFrom?.getTime() ?? 0;
      return rightTime - leftTime;
    })
    .at(0)?.capacity ?? null;
}

function getCurrentCapacityPeriod(periods: StadiumCapacityPeriod[]) {
  if (periods.length === 0) {
    return null;
  }

  const now = new Date();
  const active = periods.find((period) => {
    const startsBeforeNow = !period.validFrom || period.validFrom <= now;
    const endsAfterNow = !period.validTo || period.validTo >= now;
    return startsBeforeNow && endsAfterNow;
  });

  if (active) {
    return active;
  }

  return [...periods]
    .sort((left, right) => {
      const leftTime = left.validFrom?.getTime() ?? 0;
      const rightTime = right.validFrom?.getTime() ?? 0;
      return rightTime - leftTime;
    })
    .at(0) ?? null;
}

function sortByCurrentCapacity(stadiums: StadiumWithRelations[]) {
  return [...stadiums].sort((left, right) => {
    const capacityDelta =
      (getCurrentCapacity(right.capacityPeriods) ?? 0) -
      (getCurrentCapacity(left.capacityPeriods) ?? 0);

    if (capacityDelta !== 0) {
      return capacityDelta;
    }

    return left.name.localeCompare(right.name);
  });
}

export async function getDashboardData(): Promise<DashboardData> {
  await repairInvalidWikipediaCapacities();
  await removeIrrelevantStadiums();
  await enforceSingleVisitPerStadium();

  const stadiums = await prisma.stadium.findMany({
    include: {
      capacityPeriods: {
        orderBy: [{ validFrom: "desc" }, { createdAt: "desc" }],
      },
      visits: {
        orderBy: [{ visitedOn: "desc" }, { createdAt: "desc" }],
      },
    },
    orderBy: [{ name: "asc" }],
  });

  const rankedStadiums = sortByCurrentCapacity(stadiums);
  const activeRankedStadiums = rankedStadiums.filter((stadium) => !stadium.isDemolished);
  const top100Ids = new Set(activeRankedStadiums.slice(0, 100).map((stadium) => stadium.id));

  const stadiumCards: StadiumCard[] = stadiums.map((stadium) => ({
    id: stadium.id,
    name: stadium.name,
    city: stadium.city,
    country: stadium.country,
    currentCapacity: getCurrentCapacity(stadium.capacityPeriods),
    hasVisit: stadium.visits.length > 0,
    firstVisit: stadium.visits[0] ?? null,
    openedYear: stadium.openedYear ?? null,
    primaryTenant: stadium.primaryTenant ?? null,
    isInTop100: top100Ids.has(stadium.id),
    isDemolished: stadium.isDemolished,
    isDangerous: stadium.isDangerous,
    coordinates:
      stadium.latitude != null && stadium.longitude != null
        ? `${stadium.latitude.toFixed(3)}, ${stadium.longitude.toFixed(3)}`
        : null,
  }));

  const activeStadiums = stadiums.filter((stadium) => !stadium.isDemolished);
  const visitedStadiumIds = new Set(
    activeStadiums.filter((stadium) => stadium.visits.length > 0).map((stadium) => stadium.id),
  );

  const top100Tracked = activeRankedStadiums.slice(0, 100).length;
  const top100Visited = activeRankedStadiums
    .slice(0, 100)
    .filter((stadium) => visitedStadiumIds.has(stadium.id)).length;
  const top50Tracked = activeRankedStadiums.slice(0, 50).length;
  const top50Visited = activeRankedStadiums
    .slice(0, 50)
    .filter((stadium) => visitedStadiumIds.has(stadium.id)).length;
  const continentOrder = [
    "Europe",
    "Asia",
    "Africa",
    "North America",
    "South America",
    "Oceania",
  ];
  const continentMap = new Map<string, { tracked: number; visited: number }>();

  for (const stadium of activeStadiums) {
    const continent = stadium.continent?.trim() || "Unbekannt";
    const current = continentMap.get(continent) ?? { tracked: 0, visited: 0 };
    current.tracked += 1;

    if (stadium.visits.length > 0) {
      current.visited += 1;
    }

    continentMap.set(continent, current);
  }

  return {
    stats: {
      trackedStadiums: activeStadiums.length,
      visitedStadiums: visitedStadiumIds.size,
      remainingStadiums: Math.max(activeStadiums.length - visitedStadiumIds.size, 0),
      top50Visited,
      top50Tracked,
      top50CompletionRate:
        top50Tracked === 0 ? 0 : Math.round((top50Visited / top50Tracked) * 100),
      top100Visited,
      top100Tracked,
      completionRate:
        top100Tracked === 0 ? 0 : Math.round((top100Visited / top100Tracked) * 100),
    },
    continentCoverage: [...continentMap.entries()]
      .map(([continent, values]) => ({
        continent,
        tracked: values.tracked,
        visited: values.visited,
        percentage:
          values.tracked === 0 ? 0 : Math.round((values.visited / values.tracked) * 100),
      }))
      .sort((left, right) => {
        const orderDelta =
          (continentOrder.indexOf(left.continent) === -1 ? 999 : continentOrder.indexOf(left.continent)) -
          (continentOrder.indexOf(right.continent) === -1 ? 999 : continentOrder.indexOf(right.continent));

        if (orderDelta !== 0) {
          return orderDelta;
        }

        return left.continent.localeCompare(right.continent);
      }),
    stadiums: stadiumCards.sort((left, right) => {
      if (left.isInTop100 !== right.isInTop100) {
        return Number(right.isInTop100) - Number(left.isInTop100);
      }

      return (right.currentCapacity ?? 0) - (left.currentCapacity ?? 0);
    }),
    mapMarkers: stadiums
      .filter((stadium) => stadium.latitude != null && stadium.longitude != null)
      .map((stadium) => ({
        id: stadium.id,
        name: stadium.name,
        city: stadium.city,
        country: stadium.country,
        latitude: stadium.latitude as number,
        longitude: stadium.longitude as number,
        currentCapacity: getCurrentCapacity(stadium.capacityPeriods),
        isVisited: stadium.visits.length > 0,
        isDemolished: stadium.isDemolished,
        isDangerous: stadium.isDangerous,
        isInTop100: top100Ids.has(stadium.id),
        firstVisitDate: stadium.visits[0]?.visitedOn ?? null,
        firstVisitEvent: stadium.visits[0]?.eventName ?? null,
      })),
    visitOptions: stadiums.map((stadium) => ({
      id: stadium.id,
      name: stadium.name,
      firstVisit: stadium.visits[0]
        ? {
            id: stadium.visits[0].id,
            visitedOn: stadium.visits[0].visitedOn.toISOString().slice(0, 10),
            eventName: stadium.visits[0].eventName,
            note: stadium.visits[0].note ?? null,
          }
        : null,
    })),
    stadiumEditOptions: stadiums.map((stadium) => ({
      id: stadium.id,
      name: stadium.name,
      city: stadium.city,
      country: stadium.country,
      continent: stadium.continent ?? null,
      latitude: stadium.latitude ?? null,
      longitude: stadium.longitude ?? null,
      openedYear: stadium.openedYear ?? null,
      isDemolished: stadium.isDemolished,
      isDangerous: stadium.isDangerous,
      primaryTenant: stadium.primaryTenant ?? null,
      notes: stadium.notes ?? null,
    })),
    capacityOptions: stadiums.map((stadium) => {
      const currentPeriod = getCurrentCapacityPeriod(stadium.capacityPeriods);
      const currentCapacity = currentPeriod?.capacity ?? null;

      return {
        id: stadium.id,
        name: stadium.name,
        currentCapacity,
        currentCapacityPeriodId: currentPeriod?.id ?? null,
        periods: stadium.capacityPeriods.map((period) => ({
          id: period.id,
          capacity: period.capacity,
          validFrom: period.validFrom?.toISOString().slice(0, 10) ?? "",
          validTo: period.validTo?.toISOString().slice(0, 10) ?? "",
          source: period.source ?? null,
          note: period.note ?? null,
          isCurrent: currentPeriod?.id === period.id,
        })),
      };
    }),
  };
}
