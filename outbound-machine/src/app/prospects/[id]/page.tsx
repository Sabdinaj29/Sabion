import Link from "next/link";
import { notFound } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { ProspectForm } from "@/components/ProspectForm";
import { updateProspect } from "@/app/actions";

export default async function ProspectDetailPage(props: PageProps<"/prospects/[id]">) {
  const { id } = await props.params;
  const prospectId = Number(id);
  if (!Number.isInteger(prospectId)) notFound();

  const prospect = await prisma.prospect.findUnique({ where: { id: prospectId } });
  if (!prospect) notFound();

  const boundUpdate = updateProspect.bind(null, prospect.id);

  return (
    <div className="mx-auto w-full max-w-3xl px-6 py-10">
      <Link href="/" className="text-sm text-zinc-500 hover:underline">
        &larr; Back to prospects
      </Link>
      <h1 className="mt-2 text-2xl font-semibold">{prospect.companyName}</h1>
      <p className="text-sm text-zinc-500">
        Added {prospect.createdAt.toLocaleDateString()} &middot; Last updated{" "}
        {prospect.updatedAt.toLocaleDateString()}
      </p>
      <div className="mt-6">
        <ProspectForm prospect={prospect} action={boundUpdate} submitLabel="Save changes" />
      </div>
    </div>
  );
}
