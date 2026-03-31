import type { Stadium, StadiumCapacityPeriod, Visit } from "@prisma/client";
import { prisma } from "@/lib/prisma";
import {
  removeIrrelevantStadiums,
  repairInvalidWikipediaCapacities,
} from "@/lib/wikipedia-import";

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
  visitCount: number;
  latestVisit: Visit | null;
  openedYear: number | null;
  primaryTenant: string | null;
  isInTop100: boolean;
  coordinates: string | null;
};

export type DashboardData = {
  stats: {
    trackedStadiums: number;
    visitedStadiums: number;
    top100Visited: number;
    top100Tracked: number;
    completionRate: number;
    totalVisits: number;
  };
  stadiums: StadiumCard[];
  visitOptions: Array<{ id: number; name: string }>;
};

function getCurrentCapacity(periods: StadiumCapacityPeriod[]) {
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
  const top100Ids = new Set(rankedStadiums.slice(0, 100).map((stadium) => stadium.id));

  const stadiumCards: StadiumCard[] = stadiums.map((stadium) => ({
    id: stadium.id,
    name: stadium.name,
    city: stadium.city,
    country: stadium.country,
    currentCapacity: getCurrentCapacity(stadium.capacityPeriods),
    visitCount: stadium.visits.length,
    latestVisit: stadium.visits[0] ?? null,
    openedYear: stadium.openedYear ?? null,
    primaryTenant: stadium.primaryTenant ?? null,
    isInTop100: top100Ids.has(stadium.id),
    coordinates:
      stadium.latitude != null && stadium.longitude != null
        ? `${stadium.latitude.toFixed(3)}, ${stadium.longitude.toFixed(3)}`
        : null,
  }));

  const visitedStadiumIds = new Set(
    stadiums.filter((stadium) => stadium.visits.length > 0).map((stadium) => stadium.id),
  );

  const top100Tracked = rankedStadiums.slice(0, 100).length;
  const top100Visited = rankedStadiums
    .slice(0, 100)
    .filter((stadium) => visitedStadiumIds.has(stadium.id)).length;

  return {
    stats: {
      trackedStadiums: stadiums.length,
      visitedStadiums: visitedStadiumIds.size,
      top100Visited,
      top100Tracked,
      completionRate:
        top100Tracked === 0 ? 0 : Math.round((top100Visited / top100Tracked) * 100),
      totalVisits: stadiums.reduce((sum, stadium) => sum + stadium.visits.length, 0),
    },
    stadiums: stadiumCards.sort((left, right) => {
      if (left.isInTop100 !== right.isInTop100) {
        return Number(right.isInTop100) - Number(left.isInTop100);
      }

      return (right.currentCapacity ?? 0) - (left.currentCapacity ?? 0);
    }),
    visitOptions: stadiums.map((stadium) => ({
      id: stadium.id,
      name: stadium.name,
    })),
  };
}
