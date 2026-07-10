import { NextResponse } from "next/server";
import { requireAdminAccess } from "@/lib/auth";
import { getCurrentCapacity } from "@/lib/dashboard";
import { prisma } from "@/lib/prisma";

export const dynamic = "force-dynamic";

export async function GET() {
  try {
    await requireAdminAccess();
  } catch {
    return NextResponse.json({ error: "Nicht autorisiert" }, { status: 401 });
  }

  const stadiums = await prisma.stadium.findMany({
    include: {
      capacityPeriods: {
        orderBy: [{ validFrom: "desc" }, { createdAt: "desc" }],
      },
      visits: {
        orderBy: [{ visitedOn: "asc" }, { createdAt: "asc" }],
      },
    },
    orderBy: [{ name: "asc" }],
  });

  const payload = {
    exportedAt: new Date().toISOString(),
    stadiumCount: stadiums.length,
    stadiums: stadiums.map((stadium) => ({
      id: stadium.id,
      slug: stadium.slug,
      name: stadium.name,
      city: stadium.city,
      country: stadium.country,
      continent: stadium.continent,
      openedYear: stadium.openedYear,
      isDemolished: stadium.isDemolished,
      isDangerous: stadium.isDangerous,
      latitude: stadium.latitude,
      longitude: stadium.longitude,
      primaryTenant: stadium.primaryTenant,
      notes: stadium.notes,
      currentCapacity: getCurrentCapacity(stadium.capacityPeriods),
      capacityPeriods: stadium.capacityPeriods.map((period) => ({
        id: period.id,
        capacity: period.capacity,
        validFrom: period.validFrom?.toISOString() ?? null,
        validTo: period.validTo?.toISOString() ?? null,
        source: period.source,
        note: period.note,
      })),
      firstVisit:
        stadium.visits[0] == null
          ? null
          : {
              id: stadium.visits[0].id,
              visitedOn: stadium.visits[0].visitedOn.toISOString(),
              eventName: stadium.visits[0].eventName,
              note: stadium.visits[0].note,
            },
    })),
  };

  return NextResponse.json(payload, {
    headers: {
      "Content-Disposition": 'attachment; filename="stadiumtracker-export.json"',
    },
  });
}
