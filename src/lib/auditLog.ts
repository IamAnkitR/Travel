import { prisma } from "@/lib/prisma";

const TRACKED_FIELDS = [
  "name",
  "type",
  "category",
  "location",
  "description",
  "price",
  "originalPrice",
  "destinationId",
] as const;

type Trackable = Record<(typeof TRACKED_FIELDS)[number], unknown>;

/** Diffs `before` vs `after` on a fixed set of fields and writes one AuditLog row per change. */
export async function logAdminBusinessEdit(businessId: string, before: Trackable, after: Partial<Trackable>) {
  const entries = TRACKED_FIELDS.filter((field) => after[field] !== undefined && after[field] !== before[field]).map((field) => ({
    businessId,
    actor: "admin",
    field,
    oldValue: before[field] == null ? null : String(before[field]),
    newValue: after[field] == null ? null : String(after[field]),
  }));

  if (entries.length === 0) return;
  await prisma.auditLog.createMany({ data: entries });
}
