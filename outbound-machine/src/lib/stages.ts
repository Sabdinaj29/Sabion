export const STAGES = [
  "Sourced",
  "Contacted",
  "Replied",
  "Meeting",
  "Proposal",
  "Closed Won",
  "Closed Lost",
] as const;

export type Stage = (typeof STAGES)[number];

export function isStage(value: string): value is Stage {
  return (STAGES as readonly string[]).includes(value);
}
