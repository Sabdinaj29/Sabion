import { readFileSync } from "node:fs";
import { resolve } from "node:path";
import { parse } from "csv-parse/sync";
import { PrismaBetterSqlite3 } from "@prisma/adapter-better-sqlite3";
import { PrismaClient } from "../src/generated/prisma/client";
import { isStage } from "../src/lib/stages";

try {
  process.loadEnvFile(resolve(".env"));
} catch {
  // .env is optional; DATABASE_URL may already be set in the environment
}

const adapter = new PrismaBetterSqlite3({
  url: process.env.DATABASE_URL ?? "file:./prisma/dev.db",
});
const prisma = new PrismaClient({ adapter });

type CsvRow = {
  company_name: string;
  sector: string;
  origin_country: string;
  target_market: string;
  contact_name?: string;
  contact_email?: string;
  contact_role?: string;
  source?: string;
  stage?: string;
  next_follow_up_date?: string;
  notes?: string;
};

function parseDate(value: string | undefined): Date | undefined {
  if (!value || value.trim() === "") return undefined;
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) {
    throw new Error(`Invalid date "${value}"`);
  }
  return date;
}

async function main() {
  const csvPath = resolve(process.argv[2] ?? "prisma/seed-data/leads.csv");
  const raw = readFileSync(csvPath, "utf-8");

  const rows: CsvRow[] = parse(raw, {
    columns: true,
    skip_empty_lines: true,
    trim: true,
  });

  let created = 0;
  let skipped = 0;

  for (const [index, row] of rows.entries()) {
    const line = index + 2; // +1 for header, +1 for 1-indexing

    if (!row.company_name || !row.sector || !row.origin_country || !row.target_market) {
      console.warn(
        `Row ${line}: skipped, missing one of company_name/sector/origin_country/target_market`
      );
      skipped++;
      continue;
    }

    const stage = row.stage?.trim() || "Sourced";
    if (!isStage(stage)) {
      console.warn(`Row ${line}: skipped, unknown stage "${stage}"`);
      skipped++;
      continue;
    }

    await prisma.prospect.create({
      data: {
        companyName: row.company_name,
        sector: row.sector,
        originCountry: row.origin_country,
        targetMarket: row.target_market,
        contactName: row.contact_name || undefined,
        contactEmail: row.contact_email || undefined,
        contactRole: row.contact_role || undefined,
        source: row.source || undefined,
        stage,
        nextFollowUpDate: parseDate(row.next_follow_up_date),
        notes: row.notes || undefined,
      },
    });
    created++;
  }

  console.log(`Seed complete: ${created} created, ${skipped} skipped.`);
}

main()
  .catch((error) => {
    console.error(error);
    process.exitCode = 1;
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
