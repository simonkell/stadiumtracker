"use server";

import { revalidatePath } from "next/cache";
import { prisma } from "@/lib/prisma";
import { slugify } from "@/lib/utils";
import {
  importWikipediaStadiumList,
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

export async function createStadium(formData: FormData) {
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

  await prisma.stadium.create({
    data: {
      slug,
      name,
      city,
      country,
      continent: formData.get("continent")?.toString().trim() || null,
      latitude: latitude ? Number(latitude) : null,
      longitude: longitude ? Number(longitude) : null,
      openedYear: openedYear ? Number(openedYear) : null,
      primaryTenant: formData.get("primaryTenant")?.toString().trim() || null,
      notes: formData.get("notes")?.toString().trim() || null,
    },
  });

  revalidatePath("/");
}

export async function addCapacityPeriod(formData: FormData) {
  const stadiumId = Number(formData.get("stadiumId"));
  const capacity = Number(formData.get("capacity"));

  if (!stadiumId || !capacity) {
    return;
  }

  const validFrom = formData.get("validFrom")?.toString().trim();
  const validTo = formData.get("validTo")?.toString().trim();

  await prisma.stadiumCapacityPeriod.create({
    data: {
      stadiumId,
      capacity,
      validFrom: validFrom ? new Date(validFrom) : null,
      validTo: validTo ? new Date(validTo) : null,
      source: formData.get("source")?.toString().trim() || null,
      note: formData.get("note")?.toString().trim() || null,
    },
  });

  revalidatePath("/");
}

export async function addVisit(formData: FormData) {
  const stadiumId = Number(formData.get("stadiumId"));
  const visitedOn = formData.get("visitedOn")?.toString().trim();
  const eventName = formData.get("eventName")?.toString().trim();

  if (!stadiumId || !visitedOn || !eventName) {
    return;
  }

  await prisma.visit.create({
    data: {
      stadiumId,
      visitedOn: new Date(visitedOn),
      eventName,
      note: formData.get("note")?.toString().trim() || null,
    },
  });

  revalidatePath("/");
}

export async function importStadiumsFromWikipedia() {
  await importWikipediaStadiumList();
  revalidatePath("/");
}

export async function repairWikipediaImportData() {
  await repairInvalidWikipediaCapacities();
  revalidatePath("/");
}
