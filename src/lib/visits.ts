import { prisma } from "@/lib/prisma";

export async function enforceSingleVisitPerStadium() {
  const visits = await prisma.visit.findMany({
    orderBy: [
      { stadiumId: "asc" },
      { visitedOn: "asc" },
      { createdAt: "asc" },
      { id: "asc" },
    ],
    select: {
      id: true,
      stadiumId: true,
    },
  });

  const seenStadiumIds = new Set<number>();
  const duplicateVisitIds: number[] = [];

  for (const visit of visits) {
    if (seenStadiumIds.has(visit.stadiumId)) {
      duplicateVisitIds.push(visit.id);
      continue;
    }

    seenStadiumIds.add(visit.stadiumId);
  }

  if (duplicateVisitIds.length === 0) {
    return 0;
  }

  const result = await prisma.visit.deleteMany({
    where: {
      id: {
        in: duplicateVisitIds,
      },
    },
  });

  return result.count;
}
