import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

const slugify = (s: string) =>
  s
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/(^-|-$)/g, "");

const states = [
  { slug: "uttarakhand", name: "Uttarakhand", emoji: "🏔️", gradient: "from-emerald-700 to-green-900", featured: true, order: 0 },
  { slug: "himachal", name: "Himachal", emoji: "🍎", gradient: "from-slate-700 to-slate-900", featured: false, order: 1 },
  { slug: "rajasthan", name: "Rajasthan", emoji: "🏜️", gradient: "from-orange-700 to-red-800", featured: false, order: 2 },
  { slug: "kerala", name: "Kerala", emoji: "🌴", gradient: "from-green-700 to-emerald-800", featured: false, order: 3 },
  { slug: "goa", name: "Goa", emoji: "🏖️", gradient: "from-blue-600 to-cyan-700", featured: false, order: 4 },
  { slug: "ladakh", name: "Ladakh", emoji: "🏔️", gradient: "from-zinc-200 to-slate-400", featured: false, order: 5 },
  { slug: "sikkim", name: "Sikkim", emoji: "🛕", gradient: "from-emerald-800 to-teal-900", featured: false, order: 6 },
  { slug: "meghalaya", name: "Meghalaya", emoji: "🌧️", gradient: "from-green-800 to-slate-800", featured: false, order: 7 },
] as const;

const destinations = [
  { id: "ranikhet", name: "Ranikhet", emoji: "🏔️", gradient: "from-emerald-800 via-green-700 to-stone-700", bestTime: "Mar-Jun, Sep-Nov", budget: "₹5k-15k", stay: "2-4 days", altitude: "1829m", rating: 4.8, description: "Ranikhet is a serene hill station cradled in the Kumaon Himalayas, famed for its meadows, colonial charm, and panoramic views of Nanda Devi. Unlike crowded hill stations, it offers quiet pine forests, ancient temples, and a 9-hole golf course at one of Asia's highest altitudes.", whyVisit: ["Uninterrupted Himalayan panorama", "Less crowded than Nainital/Mussoorie", "Colonial heritage & Kumaon culture", "Perfect for slow travel & workations"], tags: ["Mountains", "Culture"] },
  { id: "rishikesh", name: "Rishikesh", emoji: "🕉️", gradient: "from-orange-700 via-amber-600 to-stone-600", bestTime: "Oct-Apr", budget: "₹3k-12k", stay: "3-5 days", altitude: "372m", rating: 4.7, description: "Yoga capital of the world, set on the banks of the Ganges at the foothills of the Himalayas.", whyVisit: ["World-renowned yoga & meditation ashrams", "White-water rafting on the Ganges", "Iconic suspension bridges & riverside cafes", "Spiritual aarti ceremonies at sunset"], tags: ["Culture", "Adventure"] },
  { id: "mussoorie", name: "Mussoorie", emoji: "🌲", gradient: "from-slate-700 via-slate-600 to-emerald-800", bestTime: "Mar-Jun, Sep-Nov", budget: "₹6k-20k", stay: "2-3 days", altitude: "2005m", rating: 4.5, description: "The Queen of Hills, a colonial-era hill station with sweeping views of the Doon valley and snow-capped peaks.", whyVisit: ["Iconic Mall Road & Camel's Back Road", "Kempty Falls & Gun Hill views", "Easy weekend access from Delhi", "Charming colonial architecture"], tags: ["Mountains", "Cities"] },
  { id: "nainital", name: "Nainital", emoji: "🏞️", gradient: "from-blue-800 via-cyan-700 to-teal-700", bestTime: "Mar-Jun", budget: "₹5k-18k", stay: "2-3 days", altitude: "2084m", rating: 4.6, description: "A picturesque lake district built around the eye-shaped Naini Lake, ringed by forested hills.", whyVisit: ["Boating on Naini Lake", "Snow View Point cable car", "Vibrant Mall Road markets", "Nearby Sattal & Bhimtal lakes"], tags: ["Mountains", "Beaches"] },
  { id: "auli", name: "Auli", emoji: "⛷️", gradient: "from-zinc-100 via-slate-200 to-blue-300", bestTime: "Dec-Mar, Jun-Sep", budget: "₹8k-25k", stay: "3-4 days", altitude: "3049m", rating: 4.9, description: "India's premier skiing destination, with vast snow meadows and one of the world's longest cable car rides.", whyVisit: ["Skiing on Himalayan slopes", "Panoramic views of Nanda Devi", "Auli ropeway experience", "Chenab Lake trek nearby"], tags: ["Mountains", "Adventure"] },
  { id: "jimcorbett", name: "Jim Corbett", emoji: "🐅", gradient: "from-green-900 via-lime-800 to-yellow-800", bestTime: "Nov-Jun", budget: "₹7k-22k", stay: "2-3 days", altitude: "400m", rating: 4.7, description: "India's oldest national park and tiger reserve, teeming with wildlife across dense sal forests and grasslands.", whyVisit: ["Jeep & elephant safaris", "Best tiger-spotting odds in India", "Riverside jungle lodges", "Birdwatching (600+ species)"], tags: ["Adventure"] },
  { id: "kausani", name: "Kausani", emoji: "🌄", gradient: "from-rose-800 via-orange-700 to-amber-600", bestTime: "Mar-Jun, Sep-Nov", budget: "₹4k-12k", stay: "2-3 days", altitude: "1890m", rating: 4.8, description: "Known as the 'Switzerland of India' by Gandhi, offering a 300km uninterrupted panorama of the Himalayan range.", whyVisit: ["Widest Himalayan panorama in Kumaon", "Anasakti Ashram (Gandhi's stay)", "Tea gardens & pine forests", "Quiet, uncrowded viewpoints"], tags: ["Mountains"] },
  { id: "almora", name: "Almora", emoji: "🛕", gradient: "from-stone-700 via-orange-800 to-red-900", bestTime: "Mar-Jun", budget: "₹4k-10k", stay: "1-2 days", altitude: "1638m", rating: 4.4, description: "The cultural capital of Kumaon, a ridge-top town known for its temples, handicrafts, and old-world bazaars.", whyVisit: ["Ancient temples & Kasar Devi", "Traditional Kumaoni handicrafts", "Bright Corner sunset viewpoint", "Local Bal Mithai sweets"], tags: ["Culture"] },
  { id: "chopta", name: "Chopta", emoji: "🏕️", gradient: "from-emerald-900 via-green-800 to-teal-900", bestTime: "Apr-Jun, Sep-Nov", budget: "₹3k-8k", stay: "2-3 days", altitude: "2680m", rating: 4.9, description: "A tiny meadow village dubbed 'Mini Switzerland', the base camp for the Tungnath and Chandrashila treks.", whyVisit: ["Base for Tungnath, world's highest Shiva temple", "Chandrashila summit sunrise trek", "Rhododendron forests", "Minimal crowds, maximum views"], tags: ["Adventure", "Mountains"] },
  { id: "dehradun", name: "Dehradun", emoji: "🏙️", gradient: "from-slate-800 via-stone-700 to-zinc-700", bestTime: "Oct-Mar", budget: "₹4k-14k", stay: "1-2 days", altitude: "640m", rating: 4.3, description: "The capital of Uttarakhand, a leafy valley city and gateway to the state's hill stations.", whyVisit: ["Gateway to Mussoorie & Rishikesh", "Reputed institutes (IMA, FRI)", "Robber's Cave & Sahastradhara", "Well-connected by rail & air"], tags: ["Cities"] },
  { id: "mukteshwar", name: "Mukteshwar", emoji: "🍎", gradient: "from-green-800 via-emerald-700 to-lime-700", bestTime: "Mar-Jun", budget: "₹5k-15k", stay: "2-3 days", altitude: "2286m", rating: 4.7, description: "A quiet orchard town on a ridge, popular for rock climbing, apple orchards, and boutique stays.", whyVisit: ["Rock climbing & rappelling", "Apple & apricot orchards", "Chauli Ki Jali cliffside temple", "Boutique cafe culture"], tags: ["Mountains", "Food"] },
  { id: "lansdowne", name: "Lansdowne", emoji: "🌿", gradient: "from-green-900 via-emerald-800 to-stone-800", bestTime: "Mar-Jun, Sep-Nov", budget: "₹4k-12k", stay: "2-3 days", altitude: "1706m", rating: 4.6, description: "A quiet Garhwal Rifles cantonment town, kept pristine and largely free of commercial tourism.", whyVisit: ["Peaceful, traffic-free walks", "Colonial-era churches & buildings", "Tip-n-Top viewpoint", "War memorial museum"], tags: ["Mountains"] },
  { id: "binsar", name: "Binsar", emoji: "🦅", gradient: "from-slate-900 via-green-900 to-emerald-900", bestTime: "Oct-Mar", budget: "₹6k-18k", stay: "2-3 days", altitude: "2420m", rating: 4.8, description: "A wildlife sanctuary and dense oak forest offering 360-degree Himalayan views from Zero Point.", whyVisit: ["Binsar Wildlife Sanctuary", "Zero Point panoramic viewpoint", "Rich birdlife & leopard sightings", "Forest rest-house stays"], tags: ["Mountains"] },
  { id: "haldwani", name: "Haldwani", emoji: "🚂", gradient: "from-zinc-700 via-stone-600 to-orange-800", bestTime: "Oct-Mar", budget: "₹3k-8k", stay: "1 day", altitude: "424m", rating: 4.2, description: "The main gateway to Kumaon, a bustling transit hub and market town at the base of the hills.", whyVisit: ["Rail & road gateway to Kumaon", "Bustling local markets", "Convenient overnight halt", "Nearby Gaula river"], tags: ["Cities"] },
  { id: "kanatal", name: "Kanatal", emoji: "🏔️", gradient: "from-blue-900 via-slate-800 to-green-900", bestTime: "Apr-Jun, Dec-Feb", budget: "₹5k-14k", stay: "2-3 days", altitude: "2590m", rating: 4.7, description: "An offbeat alternative to Mussoorie, with deodar forests, camping grounds, and views of Surkanda Devi.", whyVisit: ["Offbeat, near Mussoorie", "Camping under deodar forests", "Surkanda Devi trek", "Quiet apple orchards"], tags: ["Mountains", "Adventure"] },
] as const;

const businessTemplates = [
  { name: "Himalayan Resort", type: "Resort", tags: ["Free WiFi", "Mountain View", "Breakfast"], image: "from-emerald-900 to-stone-800", price: 4500, originalPrice: 6200, rating: 4.7, reviews: 342 },
  { name: "Pine Retreat Homestay", type: "Homestay", tags: ["Homestay", "Organic Food", "Pet Friendly"], image: "from-green-800 to-amber-900", price: 2800, originalPrice: null, rating: 4.9, reviews: 128 },
  { name: "West View Hotel", type: "Hotel", tags: ["Central", "Restaurant", "Parking"], image: "from-slate-700 to-slate-900", price: 3200, originalPrice: null, rating: 4.5, reviews: 256 },
  { name: "Boutique Roost", type: "Resort", tags: ["Boutique", "Spa", "Sunset View"], image: "from-orange-900 to-stone-800", price: 7500, originalPrice: 9000, rating: 4.8, reviews: 89 },
  { name: "Guest House", type: "Budget", tags: ["Budget", "Clean", "Parking"], image: "from-stone-700 to-zinc-800", price: 2200, originalPrice: null, rating: 4.6, reviews: 412 },
  { name: "Oak Grove Cottages", type: "Homestay", tags: ["Cottage", "Fireplace", "BBQ"], image: "from-amber-900 to-green-900", price: 5800, originalPrice: null, rating: 4.7, reviews: 76 },
];

const roomTemplates = [
  { name: "Deluxe Valley View", size: "280 sq ft", guests: "2 guests" },
  { name: "Super Deluxe Himalayan", size: "350 sq ft", guests: "3 guests" },
];

const amenityTemplates = [
  { label: "Mountain View", icon: "Mountain" },
  { label: "Free WiFi", icon: "Wifi" },
  { label: "Breakfast included", icon: "Utensils" },
  { label: "Parking", icon: "ParkingSquare" },
  { label: "Bonfire", icon: "Flame" },
  { label: "Pet Friendly", icon: "PawPrint" },
];

const hostNames = [
  { name: "Col. Rawat (Retd.)", title: "Superhost" },
  { name: "Mrs. Bisht", title: "Superhost" },
  { name: "Mr. Pant", title: "Host" },
];

async function main() {
  console.log("Clearing existing data...");
  await prisma.lead.deleteMany();
  await prisma.room.deleteMany();
  await prisma.amenity.deleteMany();
  await prisma.host.deleteMany();
  await prisma.business.deleteMany();
  await prisma.destination.deleteMany();
  await prisma.state.deleteMany();

  console.log("Seeding states...");
  const stateRecords: Record<string, string> = {};
  for (const s of states) {
    const rec = await prisma.state.create({ data: s });
    stateRecords[s.slug] = rec.id;
  }

  console.log("Seeding destinations & businesses...");
  let order = 0;
  for (const d of destinations) {
    const dest = await prisma.destination.create({
      data: {
        slug: d.id,
        name: d.name,
        emoji: d.emoji,
        gradient: d.gradient,
        bestTime: d.bestTime,
        budget: d.budget,
        stay: d.stay,
        altitude: d.altitude,
        rating: d.rating,
        description: d.description,
        whyVisit: JSON.stringify(d.whyVisit),
        tags: JSON.stringify(d.tags),
        order: order++,
        stateId: stateRecords["uttarakhand"],
      },
    });

    // Ranikhet gets the full original 6-business roster; every other
    // destination gets 2 dummy stays so the app never looks empty.
    const count = d.id === "ranikhet" ? businessTemplates.length : 2;
    for (let i = 0; i < count; i++) {
      const t = businessTemplates[i % businessTemplates.length];
      const biz = await prisma.business.create({
        data: {
          slug: slugify(`${d.id}-${t.name}-${i}`),
          name: i === 0 && d.id !== "ranikhet" ? `${t.name} - ${d.name}` : t.name,
          type: t.type,
          location: `${d.name}, Uttarakhand`,
          description: `Family-run ${t.type.toLowerCase()} near ${d.name} with warm Kumaoni hospitality, home-style meals, and easy access to the main viewpoints.`,
          rating: t.rating,
          reviews: t.reviews,
          price: t.price,
          originalPrice: t.originalPrice ?? undefined,
          image: t.image,
          tags: JSON.stringify(t.tags),
          order: i,
          views: 600 + Math.floor(Math.random() * 1200),
          destinationId: dest.id,
        },
      });

      for (const r of roomTemplates) {
        await prisma.room.create({
          data: {
            name: r.name,
            price: t.price + (r.name.includes("Super") ? 1700 : 0),
            size: r.size,
            guests: r.guests,
            businessId: biz.id,
          },
        });
      }

      for (const a of amenityTemplates) {
        await prisma.amenity.create({
          data: { label: a.label, icon: a.icon, businessId: biz.id },
        });
      }

      const host = hostNames[i % hostNames.length];
      await prisma.host.create({
        data: {
          name: host.name,
          title: host.title,
          yearsOnPlatform: 3 + (i % 10),
          responseTime: "Response in 1 hour",
          businessId: biz.id,
        },
      });
    }
  }

  console.log("Seeding sample leads for dashboard...");
  const sampleGuests = ["Aarav M.", "Sarah L.", "Rohan K.", "Priya S.", "Vikram J.", "Neha R."];
  const allBusinesses = await prisma.business.findMany({ orderBy: { order: "asc" } });
  for (const biz of allBusinesses.slice(0, 5)) {
    const leadCount = 2 + Math.floor(Math.random() * 4);
    for (let i = 0; i < leadCount; i++) {
      const daysAgo = Math.floor(Math.random() * 30);
      await prisma.lead.create({
        data: {
          guestName: sampleGuests[Math.floor(Math.random() * sampleGuests.length)],
          channel: Math.random() > 0.4 ? "WhatsApp" : "Call",
          businessId: biz.id,
          createdAt: new Date(Date.now() - daysAgo * 24 * 60 * 60 * 1000),
        },
      });
    }
  }

  console.log("Seed complete.");
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
