import type { AccountScope, BusinessAccount, Destination } from "@prisma/client";

export function serializeScope(s: AccountScope & { destination?: Destination }) {
  return {
    id: s.id,
    category: s.category,
    type: s.type,
    status: s.status,
    rejectionReason: s.rejectionReason,
    createdAt: s.createdAt,
    reviewedAt: s.reviewedAt,
    destinationId: s.destinationId,
    destinationName: s.destination?.name,
  };
}

export function serializeAccount(
  a: BusinessAccount & { scopes?: (AccountScope & { destination?: Destination })[] }
) {
  return {
    id: a.id,
    email: a.email,
    contactName: a.contactName,
    businessName: a.businessName,
    phone: a.phone,
    createdAt: a.createdAt,
    scopes: a.scopes?.map(serializeScope) ?? [],
  };
}
