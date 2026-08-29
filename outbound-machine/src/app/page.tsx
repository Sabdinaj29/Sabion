import Link from "next/link";
import { prisma } from "@/lib/prisma";
import { STAGES } from "@/lib/stages";

function formatDate(date: Date | null): string {
  if (!date) return "—";
  return date.toLocaleDateString(undefined, { year: "numeric", month: "short", day: "numeric" });
}

function isOverdue(date: Date | null): boolean {
  if (!date) return false;
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  return date < today;
}

const STAGE_BADGE_STYLES: Record<string, string> = {
  Sourced: "bg-zinc-100 text-zinc-700 dark:bg-zinc-800 dark:text-zinc-300",
  Contacted: "bg-blue-100 text-blue-700 dark:bg-blue-950 dark:text-blue-300",
  Replied: "bg-purple-100 text-purple-700 dark:bg-purple-950 dark:text-purple-300",
  Meeting: "bg-amber-100 text-amber-700 dark:bg-amber-950 dark:text-amber-300",
  Proposal: "bg-orange-100 text-orange-700 dark:bg-orange-950 dark:text-orange-300",
  "Closed Won": "bg-green-100 text-green-700 dark:bg-green-950 dark:text-green-300",
  "Closed Lost": "bg-red-100 text-red-700 dark:bg-red-950 dark:text-red-300",
};

export default async function ProspectsPage(props: PageProps<"/">) {
  const searchParams = await props.searchParams;
  const stage = typeof searchParams.stage === "string" ? searchParams.stage : "";
  const sector = typeof searchParams.sector === "string" ? searchParams.sector : "";

  const [prospects, sectors] = await Promise.all([
    prisma.prospect.findMany({
      where: {
        ...(stage ? { stage } : {}),
        ...(sector ? { sector } : {}),
      },
      orderBy: { updatedAt: "desc" },
    }),
    prisma.prospect.findMany({
      select: { sector: true },
      distinct: ["sector"],
      orderBy: { sector: "asc" },
    }),
  ]);

  return (
    <div className="mx-auto w-full max-w-6xl px-6 py-10">
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-semibold">Prospects</h1>
          <p className="text-sm text-zinc-500">
            {prospects.length} prospect{prospects.length === 1 ? "" : "s"}
          </p>
        </div>
        <Link
          href="/prospects/new"
          className="rounded-md bg-zinc-900 px-4 py-2 text-sm font-medium text-white hover:bg-zinc-700 dark:bg-zinc-100 dark:text-zinc-900 dark:hover:bg-zinc-300"
        >
          + Add prospect
        </Link>
      </div>

      <form className="mt-6 flex flex-wrap items-end gap-3" method="get">
        <label className="flex flex-col gap-1 text-sm">
          <span className="font-medium text-zinc-700 dark:text-zinc-300">Stage</span>
          <select
            name="stage"
            defaultValue={stage}
            className="rounded-md border border-zinc-300 px-3 py-2 text-sm dark:border-zinc-700 dark:bg-zinc-900"
          >
            <option value="">All stages</option>
            {STAGES.map((s) => (
              <option key={s} value={s}>
                {s}
              </option>
            ))}
          </select>
        </label>

        <label className="flex flex-col gap-1 text-sm">
          <span className="font-medium text-zinc-700 dark:text-zinc-300">Sector</span>
          <select
            name="sector"
            defaultValue={sector}
            className="rounded-md border border-zinc-300 px-3 py-2 text-sm dark:border-zinc-700 dark:bg-zinc-900"
          >
            <option value="">All sectors</option>
            {sectors.map(({ sector: s }) => (
              <option key={s} value={s}>
                {s}
              </option>
            ))}
          </select>
        </label>

        <button
          type="submit"
          className="rounded-md border border-zinc-300 px-4 py-2 text-sm font-medium hover:bg-zinc-50 dark:border-zinc-700 dark:hover:bg-zinc-900"
        >
          Filter
        </button>
        {(stage || sector) && (
          <Link href="/" className="text-sm text-zinc-500 hover:underline">
            Clear filters
          </Link>
        )}
      </form>

      <div className="mt-6 overflow-x-auto rounded-lg border border-zinc-200 dark:border-zinc-800">
        <table className="w-full min-w-[900px] text-left text-sm">
          <thead className="bg-zinc-50 text-xs uppercase text-zinc-500 dark:bg-zinc-900 dark:text-zinc-400">
            <tr>
              <th className="px-4 py-3">Company</th>
              <th className="px-4 py-3">Sector</th>
              <th className="px-4 py-3">Origin</th>
              <th className="px-4 py-3">Target market</th>
              <th className="px-4 py-3">Contact</th>
              <th className="px-4 py-3">Stage</th>
              <th className="px-4 py-3">Next follow-up</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-zinc-200 dark:divide-zinc-800">
            {prospects.map((p) => (
              <tr key={p.id} className="hover:bg-zinc-50 dark:hover:bg-zinc-900">
                <td className="px-4 py-3 font-medium">
                  <Link href={`/prospects/${p.id}`} className="hover:underline">
                    {p.companyName}
                  </Link>
                </td>
                <td className="px-4 py-3 text-zinc-600 dark:text-zinc-400">{p.sector}</td>
                <td className="px-4 py-3 text-zinc-600 dark:text-zinc-400">{p.originCountry}</td>
                <td className="px-4 py-3 text-zinc-600 dark:text-zinc-400">{p.targetMarket}</td>
                <td className="px-4 py-3 text-zinc-600 dark:text-zinc-400">
                  {p.contactName || "—"}
                </td>
                <td className="px-4 py-3">
                  <span
                    className={`rounded-full px-2.5 py-1 text-xs font-medium ${
                      STAGE_BADGE_STYLES[p.stage] ?? "bg-zinc-100 text-zinc-700"
                    }`}
                  >
                    {p.stage}
                  </span>
                </td>
                <td
                  className={`px-4 py-3 ${
                    isOverdue(p.nextFollowUpDate)
                      ? "font-medium text-red-600 dark:text-red-400"
                      : "text-zinc-600 dark:text-zinc-400"
                  }`}
                >
                  {formatDate(p.nextFollowUpDate)}
                  {isOverdue(p.nextFollowUpDate) && " (overdue)"}
                </td>
              </tr>
            ))}
            {prospects.length === 0 && (
              <tr>
                <td colSpan={7} className="px-4 py-10 text-center text-zinc-500">
                  No prospects match these filters.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
