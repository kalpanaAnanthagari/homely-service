import "dotenv/config";
import { PrismaPg } from "@prisma/adapter-pg";
import { PrismaClient } from "../src/generated/prisma/client";

const connectionString = process.env.DATABASE_URL;
if (!connectionString) {
  throw new Error("DATABASE_URL is required for seeding");
}

const adapter = new PrismaPg({ connectionString });
const prisma = new PrismaClient({ adapter });

const MAIDS = [
  {
    name: "Priya Menon",
    bio: "8+ years in Bengaluru homes—deep cleans and eco-friendly supplies on request.",
    photoUrl:
      "https://images.unsplash.com/photo-1581578731548-c64695cc6952?auto=format&fit=crop&w=1200&q=85",
    hourlyRateCents: 35000,
    serviceTypes: ["Home cleaning", "Deep clean", "Move-out help"],
  },
  {
    name: "Arjun Kapoor",
    bio: "Reliable weekly upkeep, laundry, and deep cleans for busy families.",
    photoUrl:
      "https://images.unsplash.com/photo-1556909172-54557c7e4c29?auto=format&fit=crop&w=1200&q=85",
    hourlyRateCents: 32000,
    serviceTypes: ["Home cleaning", "Laundry & washing", "Organising"],
  },
  {
    name: "Kavitha Nair",
    bio: "Kitchens and baths—tiles, sinks, and fixtures brought back to shine.",
    photoUrl:
      "https://images.unsplash.com/photo-1578500494198-246f612d84b6?auto=format&fit=crop&w=1200&q=85",
    hourlyRateCents: 38000,
    serviceTypes: ["Deep clean", "Utensils", "Post-renovation"],
  },
];

function addHours(d: Date, h: number) {
  const next = new Date(d);
  next.setHours(next.getHours() + h);
  return next;
}

function buildWeekdaySlots(): { startsAt: Date; endsAt: Date }[] {
  const now = new Date();
  const out: { startsAt: Date; endsAt: Date }[] = [];
  for (let offset = 1; offset <= 21; offset++) {
    const day = new Date(now);
    day.setDate(day.getDate() + offset);
    day.setHours(0, 0, 0, 0);
    const dow = day.getDay();
    if (dow === 0 || dow === 6) {
      continue;
    }
    for (const hour of [9, 13]) {
      const startsAt = new Date(day);
      startsAt.setHours(hour, 0, 0, 0);
      if (startsAt <= now) {
        continue;
      }
      out.push({ startsAt, endsAt: addHours(startsAt, 2) });
    }
  }
  return out;
}

async function main() {
  await prisma.booking.deleteMany();
  await prisma.timeSlot.deleteMany();
  await prisma.maid.deleteMany();

  const slotTemplates = buildWeekdaySlots();

  for (const m of MAIDS) {
    const maid = await prisma.maid.create({ data: m });
    for (const slot of slotTemplates) {
      await prisma.timeSlot.create({
        data: {
          maidId: maid.id,
          startsAt: slot.startsAt,
          endsAt: slot.endsAt,
        },
      });
    }
  }

  console.log("Seed complete: maids and time slots created.");
}

main()
  .then(() => prisma.$disconnect())
  .catch(async (e) => {
    console.error(e);
    await prisma.$disconnect();
    process.exit(1);
  });
