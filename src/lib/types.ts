export type ApiDestination = {
  id: string;
  name: string;
  emoji: string;
  gradient: string;
  bestTime: string;
  budget: string;
  stay: string;
  altitude: string;
  rating: number;
  description: string;
  whyVisit: string[];
  tags: string[];
  businesses?: number;
};

export type ApiRoom = {
  name: string;
  price: string;
  size: string;
  guests: string;
};

export type ApiAmenity = {
  label: string;
  icon: string;
};

export type ApiHost = {
  name: string;
  title: string;
  yearsOnPlatform: number;
  responseTime: string;
};

export type ApiBusiness = {
  id: string;
  name: string;
  type: string;
  location: string;
  description: string;
  rating: number;
  reviews: number;
  price: string;
  originalPrice: string | null;
  image: string;
  tags: string[];
  destination?: { id: string; name: string };
  rooms?: ApiRoom[];
  amenities?: ApiAmenity[];
  host?: ApiHost;
};

export type ApiState = {
  id: string;
  name: string;
  emoji: string;
  gradient: string;
  featured: boolean;
  stays: number;
  destinationCount: number;
  businessCount?: number;
};

export type ApiLead = {
  id: string;
  name: string;
  type: string;
  createdAt: string;
};

export type ApiDashboard = {
  business: { id: string; name: string; type: string; price: number; description: string };
  stats: { profileViews: number; whatsappLeads: number; calls: number };
  recentLeads: ApiLead[];
};
