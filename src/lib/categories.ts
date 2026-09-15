export const CATEGORY_TYPES: Record<string, string[]> = {
  Stay: ["Hotel", "Resort", "Homestay", "Budget"],
  Package: ["Day Trip", "Multi-day", "Trek", "Honeymoon"],
  Experience: ["Adventure", "Cultural", "Food", "Wellness"],
  Transport: ["Taxi", "Bus", "Bike Rental", "Airport Transfer"],
};

export const CATEGORIES = Object.keys(CATEGORY_TYPES);

export function isValidCategoryType(category: string, type: string): boolean {
  return CATEGORY_TYPES[category]?.includes(type) ?? false;
}
