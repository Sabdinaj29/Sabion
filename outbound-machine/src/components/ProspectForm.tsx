"use client";

import { useActionState } from "react";
import { useFormStatus } from "react-dom";
import { STAGES } from "@/lib/stages";
import type { FormState } from "@/app/actions";
import type { Prospect } from "@/generated/prisma/client";

function toDateInputValue(date: Date | null | undefined): string {
  if (!date) return "";
  return date.toISOString().slice(0, 10);
}

function SubmitButton({ label }: { label: string }) {
  const { pending } = useFormStatus();
  return (
    <button
      type="submit"
      disabled={pending}
      className="rounded-md bg-zinc-900 px-4 py-2 text-sm font-medium text-white hover:bg-zinc-700 disabled:opacity-50 dark:bg-zinc-100 dark:text-zinc-900 dark:hover:bg-zinc-300"
    >
      {pending ? "Saving..." : label}
    </button>
  );
}

export function ProspectForm({
  prospect,
  action,
  submitLabel,
}: {
  prospect?: Prospect;
  action: (state: FormState, formData: FormData) => Promise<FormState>;
  submitLabel: string;
}) {
  const [state, formAction] = useActionState<FormState, FormData>(action, null);

  return (
    <form action={formAction} className="flex flex-col gap-5 max-w-2xl">
      {state?.error && (
        <p className="rounded-md bg-red-50 px-3 py-2 text-sm text-red-700 dark:bg-red-950 dark:text-red-300">
          {state.error}
        </p>
      )}

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
        <Field label="Company name" name="companyName" required defaultValue={prospect?.companyName} />
        <Field label="Sector" name="sector" required defaultValue={prospect?.sector} />
        <Field label="Origin country" name="originCountry" required defaultValue={prospect?.originCountry} />
        <Field label="Target market" name="targetMarket" required defaultValue={prospect?.targetMarket} />
      </div>

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
        <Field label="Contact name" name="contactName" defaultValue={prospect?.contactName ?? undefined} />
        <Field label="Contact email" name="contactEmail" type="email" defaultValue={prospect?.contactEmail ?? undefined} />
        <Field label="Contact role" name="contactRole" defaultValue={prospect?.contactRole ?? undefined} />
        <Field label="Source" name="source" defaultValue={prospect?.source ?? undefined} />
      </div>

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
        <label className="flex flex-col gap-1 text-sm">
          <span className="font-medium text-zinc-700 dark:text-zinc-300">Stage</span>
          <select
            name="stage"
            defaultValue={prospect?.stage ?? "Sourced"}
            className="rounded-md border border-zinc-300 px-3 py-2 text-sm dark:border-zinc-700 dark:bg-zinc-900"
          >
            {STAGES.map((stage) => (
              <option key={stage} value={stage}>
                {stage}
              </option>
            ))}
          </select>
        </label>
        <Field
          label="Next follow-up date"
          name="nextFollowUpDate"
          type="date"
          defaultValue={toDateInputValue(prospect?.nextFollowUpDate)}
        />
      </div>

      <label className="flex flex-col gap-1 text-sm">
        <span className="font-medium text-zinc-700 dark:text-zinc-300">Notes</span>
        <textarea
          name="notes"
          rows={4}
          defaultValue={prospect?.notes ?? undefined}
          className="rounded-md border border-zinc-300 px-3 py-2 text-sm dark:border-zinc-700 dark:bg-zinc-900"
        />
      </label>

      <div>
        <SubmitButton label={submitLabel} />
      </div>
    </form>
  );
}

function Field({
  label,
  name,
  required,
  type = "text",
  defaultValue,
}: {
  label: string;
  name: string;
  required?: boolean;
  type?: string;
  defaultValue?: string;
}) {
  return (
    <label className="flex flex-col gap-1 text-sm">
      <span className="font-medium text-zinc-700 dark:text-zinc-300">
        {label}
        {required && <span className="text-red-500"> *</span>}
      </span>
      <input
        type={type}
        name={name}
        required={required}
        defaultValue={defaultValue}
        className="rounded-md border border-zinc-300 px-3 py-2 text-sm dark:border-zinc-700 dark:bg-zinc-900"
      />
    </label>
  );
}
