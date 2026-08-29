import Link from "next/link";
import { ProspectForm } from "@/components/ProspectForm";
import { createProspect } from "@/app/actions";

export default function NewProspectPage() {
  return (
    <div className="mx-auto w-full max-w-3xl px-6 py-10">
      <Link href="/" className="text-sm text-zinc-500 hover:underline">
        &larr; Back to prospects
      </Link>
      <h1 className="mt-2 text-2xl font-semibold">Add prospect</h1>
      <div className="mt-6">
        <ProspectForm action={createProspect} submitLabel="Add prospect" />
      </div>
    </div>
  );
}
