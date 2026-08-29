"use server";

import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";
import { prisma } from "@/lib/prisma";
import { isStage } from "@/lib/stages";

export type FormState = {
  error?: string;
} | null;

function readString(formData: FormData, key: string): string {
  return String(formData.get(key) ?? "").trim();
}

function readOptionalString(formData: FormData, key: string): string | null {
  const value = readString(formData, key);
  return value === "" ? null : value;
}

function readDate(formData: FormData, key: string): Date | null {
  const value = readString(formData, key);
  if (value === "") return null;
  const date = new Date(value);
  return Number.isNaN(date.getTime()) ? null : date;
}

function buildProspectData(formData: FormData) {
  const companyName = readString(formData, "companyName");
  const sector = readString(formData, "sector");
  const originCountry = readString(formData, "originCountry");
  const targetMarket = readString(formData, "targetMarket");
  const stage = readString(formData, "stage") || "Sourced";

  if (!companyName || !sector || !originCountry || !targetMarket) {
    throw new Error(
      "Company name, sector, origin country, and target market are required."
    );
  }
  if (!isStage(stage)) {
    throw new Error(`Unknown stage "${stage}".`);
  }

  return {
    companyName,
    sector,
    originCountry,
    targetMarket,
    stage,
    contactName: readOptionalString(formData, "contactName"),
    contactEmail: readOptionalString(formData, "contactEmail"),
    contactRole: readOptionalString(formData, "contactRole"),
    source: readOptionalString(formData, "source"),
    nextFollowUpDate: readDate(formData, "nextFollowUpDate"),
    notes: readOptionalString(formData, "notes"),
  };
}

export async function createProspect(
  _prevState: FormState,
  formData: FormData
): Promise<FormState> {
  let id: number;
  try {
    const data = buildProspectData(formData);
    const prospect = await prisma.prospect.create({ data });
    id = prospect.id;
  } catch (error) {
    return { error: error instanceof Error ? error.message : "Failed to create prospect." };
  }

  revalidatePath("/");
  redirect(`/prospects/${id}`);
}

export async function updateProspect(
  id: number,
  _prevState: FormState,
  formData: FormData
): Promise<FormState> {
  try {
    const data = buildProspectData(formData);
    await prisma.prospect.update({ where: { id }, data });
  } catch (error) {
    return { error: error instanceof Error ? error.message : "Failed to update prospect." };
  }

  revalidatePath("/");
  revalidatePath(`/prospects/${id}`);
  redirect(`/prospects/${id}`);
}
