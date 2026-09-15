import type { BusinessAccount, Destination } from "@prisma/client";

export const BUSINESS_TYPES = ["Hotel", "Resort", "Homestay", "Budget"] as const;

export function serializeAccount(
  a: BusinessAccount & { requestedDestination?: Destination }
) {
  return {
    id: a.id,
    email: a.email,
    contactName: a.contactName,
    businessName: a.businessName,
    phone: a.phone,
    status: a.status,
    rejectionReason: a.rejectionReason,
    createdAt: a.createdAt,
    reviewedAt: a.reviewedAt,
    requestedDestinationId: a.requestedDestinationId,
    requestedDestinationName: a.requestedDestination?.name,
    requestedType: a.requestedType,
  };
}
