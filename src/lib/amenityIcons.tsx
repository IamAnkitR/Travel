import { Flame, Mountain, ParkingSquare, PawPrint, Utensils, Wifi, Sparkles } from "lucide-react";

export const AMENITY_ICONS: Record<string, React.ComponentType<{ className?: string }>> = {
  Mountain,
  Wifi,
  Utensils,
  ParkingSquare,
  Flame,
  PawPrint,
};

export function AmenityIcon({ icon, className }: { icon: string; className?: string }) {
  const Icon = AMENITY_ICONS[icon] ?? Sparkles;
  return <Icon className={className} />;
}
