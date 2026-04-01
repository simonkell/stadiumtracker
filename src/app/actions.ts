"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { populateCoordinatesIfMissing, populateMissingCoordinates } from "@/lib/geocoding";
import { prisma } from "@/lib/prisma";
import { slugify } from "@/lib/utils";
import { loginWithPassword, logoutAdmin, requireAdminAccess } from "@/lib/auth";
import { enforceSingleVisitPerStadium } from "@/lib/visits";
import {
  importWikipediaStadiumList,
  removeIrrelevantStadiums,
  repairInvalidWikipediaCapacities,
} from "@/lib/wikipedia-import";

async function createUniqueSlug(name: string) {
  const baseSlug = slugify(name) || "stadium";
  let slug = baseSlug;
  let suffix = 2;

  while (await prisma.stadium.findUnique({ where: { slug } })) {
    slug = `${baseSlug}-${suffix}`;
    suffix += 1;
  }

  return slug;
}

function toCheckedValue(formData: FormData, key: string) {
  return formData.get(key)?.toString() === "on";
}

function getPreviousDay(date: Date) {
  const previousDay = new Date(date);
  previousDay.setDate(previousDay.getDate() - 1);
  return previousDay;
}

async function alignCapacityPeriods(stadiumId: number, periodId: number) {
  const periods = await prisma.stadiumCapacityPeriod.findMany({
    where: { stadiumId },
    orderBy: [{ validFrom: "asc" }, { createdAt: "asc" }, { id: "asc" }],
  });

  const currentIndex = periods.findIndex((period) => period.id === periodId);

  if (currentIndex === -1) {
    return;
  }

  const currentPeriod = periods[currentIndex];

  if (!currentPeriod.validFrom) {
    return;
  }

  const previousDay = getPreviousDay(currentPeriod.validFrom);
  const updates: Array<ReturnType<typeof prisma.stadiumCapacityPeriod.update>> = [];

  for (let index = currentIndex - 1; index >= 0; index -= 1) {
    const candidate = periods[index];
    const overlapsCurrent =
      !candidate.validTo || candidate.validTo.getTime() >= currentPeriod.validFrom.getTime();

    if (overlapsCurrent) {
      updates.push(
        prisma.stadiumCapacityPeriod.update({
          where: { id: candidate.id },
          data: { validTo: previousDay },
        }),
      );
      break;
    }
  }

  const nextPeriod = periods
    .slice(currentIndex + 1)
    .find(
      (period) =>
        period.validFrom && period.validFrom.getTime() > currentPeriod.validFrom!.getTime(),
    );

  if (nextPeriod?.validFrom) {
    const currentShouldEndOn = getPreviousDay(nextPeriod.validFrom);
    const shouldUpdateCurrent =
      !currentPeriod.validTo || currentPeriod.validTo.getTime() > currentShouldEndOn.getTime();

    if (shouldUpdateCurrent) {
      updates.push(
        prisma.stadiumCapacityPeriod.update({
          where: { id: currentPeriod.id },
          data: { validTo: currentShouldEndOn },
        }),
      );
    }
  }

  if (updates.length > 0) {
    await prisma.$transaction(updates);
  }
}

export async function createStadium(formData: FormData) {
  await requireAdminAccess();

  const name = formData.get("name")?.toString().trim();
  const city = formData.get("city")?.toString().trim();
  const country = formData.get("country")?.toString().trim();

  if (!name || !city || !country) {
    return;
  }

  const slug = await createUniqueSlug(name);
  const latitude = formData.get("latitude")?.toString().trim();
  const longitude = formData.get("longitude")?.toString().trim();
  const openedYear = formData.get("openedYear")?.toString().trim();

  const stadium = await prisma.stadium.create({
    data: {
      slug,
      name,
      city,
      country,
      continent: formData.get("continent")?.toString().trim() || null,
      latitude: latitude ? Number(latitude) : null,
      longitude: longitude ? Number(longitude) : null,
      openedYear: openedYear ? Number(openedYear) : null,
      isDemolished: toCheckedValue(formData, "isDemolished"),
      isDangerous: toCheckedValue(formData, "isDangerous"),
      primaryTenant: formData.get("primaryTenant")?.toString().trim() || null,
      notes: formData.get("notes")?.toString().trim() || null,
    },
  });

  await populateCoordinatesIfMissing(stadium.id);

  revalidatePath("/");
}

export async function updateStadium(formData: FormData) {
  await requireAdminAccess();

  const stadiumId = Number(formData.get("stadiumId"));
  const name = formData.get("name")?.toString().trim();
  const city = formData.get("city")?.toString().trim();
  const country = formData.get("country")?.toString().trim();

  if (!stadiumId || !name || !city || !country) {
    return;
  }

  const latitude = formData.get("latitude")?.toString().trim();
  const longitude = formData.get("longitude")?.toString().trim();
  const openedYear = formData.get("openedYear")?.toString().trim();

  await prisma.stadium.update({
    where: { id: stadiumId },
    data: {
      name,
      city,
      country,
      continent: formData.get("continent")?.toString().trim() || null,
      latitude: latitude ? Number(latitude) : null,
      longitude: longitude ? Number(longitude) : null,
      openedYear: openedYear ? Number(openedYear) : null,
      isDemolished: toCheckedValue(formData, "isDemolished"),
      isDangerous: toCheckedValue(formData, "isDangerous"),
      primaryTenant: formData.get("primaryTenant")?.toString().trim() || null,
      notes: formData.get("notes")?.toString().trim() || null,
    },
  });

  await populateCoordinatesIfMissing(stadiumId);

  revalidatePath("/");
}

export async function deleteStadium(formData: FormData) {
  await requireAdminAccess();

  const stadiumId = Number(formData.get("stadiumId"));

  if (!stadiumId) {
    return;
  }

  await prisma.stadium.delete({
    where: { id: stadiumId },
  });

  revalidatePath("/");
}

export async function addCapacityPeriod(formData: FormData) {
  await requireAdminAccess();

  const stadiumId = Number(formData.get("stadiumId"));
  const capacity = Number(formData.get("capacity"));

  if (!stadiumId || !capacity) {
    return;
  }

  const validFrom = formData.get("validFrom")?.toString().trim();
  const validTo = formData.get("validTo")?.toString().trim();

  const period = await prisma.stadiumCapacityPeriod.create({
    data: {
      stadiumId,
      capacity,
      validFrom: validFrom ? new Date(validFrom) : null,
      validTo: validTo ? new Date(validTo) : null,
      source: formData.get("source")?.toString().trim() || null,
      note: formData.get("note")?.toString().trim() || null,
    },
  });

  await alignCapacityPeriods(stadiumId, period.id);

  revalidatePath("/");
}

export async function updateCapacityPeriod(formData: FormData) {
  await requireAdminAccess();

  const capacityPeriodId = Number(formData.get("capacityPeriodId"));
  const capacity = Number(formData.get("capacity"));

  if (!capacityPeriodId || !capacity) {
    return;
  }

  const validFrom = formData.get("validFrom")?.toString().trim();
  const validTo = formData.get("validTo")?.toString().trim();

  const updatedPeriod = await prisma.stadiumCapacityPeriod.update({
    where: { id: capacityPeriodId },
    data: {
      capacity,
      validFrom: validFrom ? new Date(validFrom) : null,
      validTo: validTo ? new Date(validTo) : null,
      source: formData.get("source")?.toString().trim() || null,
      note: formData.get("note")?.toString().trim() || null,
    },
  });

  await alignCapacityPeriods(updatedPeriod.stadiumId, updatedPeriod.id);

  revalidatePath("/");
}

export async function deleteCapacityPeriod(formData: FormData) {
  await requireAdminAccess();

  const capacityPeriodId = Number(formData.get("capacityPeriodId"));

  if (!capacityPeriodId) {
    return;
  }

  await prisma.stadiumCapacityPeriod.delete({
    where: { id: capacityPeriodId },
  });

  revalidatePath("/");
}

export async function addVisit(formData: FormData) {
  await requireAdminAccess();
  await enforceSingleVisitPerStadium();

  const stadiumId = Number(formData.get("stadiumId"));
  const visitedOn = formData.get("visitedOn")?.toString().trim();
  const eventName = formData.get("eventName")?.toString().trim();

  if (!stadiumId || !visitedOn || !eventName) {
    return;
  }

  const submittedVisitDate = new Date(visitedOn);
  const submittedNote = formData.get("note")?.toString().trim() || null;

  const existingVisit = await prisma.visit.findFirst({
    where: { stadiumId },
    orderBy: [{ visitedOn: "asc" }, { createdAt: "asc" }, { id: "asc" }],
  });

  if (!existingVisit) {
    await prisma.visit.create({
      data: {
        stadiumId,
        visitedOn: submittedVisitDate,
        eventName,
        note: submittedNote,
      },
    });
  } else if (submittedVisitDate.getTime() <= existingVisit.visitedOn.getTime()) {
    await prisma.visit.update({
      where: { id: existingVisit.id },
      data: {
        visitedOn: submittedVisitDate,
        eventName,
        note: submittedNote,
      },
    });
  }

  revalidatePath("/");
}

export async function updateVisit(formData: FormData) {
  await requireAdminAccess();
  await enforceSingleVisitPerStadium();

  const visitId = Number(formData.get("visitId"));
  const visitedOn = formData.get("visitedOn")?.toString().trim();
  const eventName = formData.get("eventName")?.toString().trim();

  if (!visitId || !visitedOn || !eventName) {
    return;
  }

  await prisma.visit.update({
    where: { id: visitId },
    data: {
      visitedOn: new Date(visitedOn),
      eventName,
      note: formData.get("note")?.toString().trim() || null,
    },
  });

  await enforceSingleVisitPerStadium();
  revalidatePath("/");
}

export async function deleteVisit(formData: FormData) {
  await requireAdminAccess();

  const visitId = Number(formData.get("visitId"));

  if (!visitId) {
    return;
  }

  await prisma.visit.delete({
    where: { id: visitId },
  });

  revalidatePath("/");
}

export async function importStadiumsFromWikipedia() {
  await requireAdminAccess();
  await importWikipediaStadiumList();
  revalidatePath("/");
}

export async function repairWikipediaImportData() {
  await requireAdminAccess();
  await repairInvalidWikipediaCapacities();
  await removeIrrelevantStadiums();
  revalidatePath("/");
}

export async function fillMissingCoordinates() {
  await requireAdminAccess();
  await populateMissingCoordinates();
  revalidatePath("/");
}

export async function unlockAdminAccess(formData: FormData) {
  const password = formData.get("password")?.toString() ?? "";
  const success = await loginWithPassword(password);

  redirect(success ? "/" : "/?auth=failed");
}

export async function lockAdminAccess() {
  await logoutAdmin();
  redirect("/");
}
