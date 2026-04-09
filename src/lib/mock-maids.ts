import { z } from "zod";

import maidsJson from "@/data/maids.json";

const maidSchema = z.object({
  id: z.string().min(1),
  name: z.string().min(1),
  bio: z.string().min(1),
  photoUrl: z.url(),
  hourlyRateCents: z.number().int().positive(),
  serviceTypes: z.array(z.string().min(1)).min(1),
  rating: z.number().min(0).max(5),
  reviewCount: z.number().int().nonnegative(),
});

const listSchema = z.array(maidSchema);

export type MockMaid = z.infer<typeof maidSchema>;

function loadMockMaids(): MockMaid[] {
  const parsed = listSchema.safeParse(maidsJson);
  if (!parsed.success) {
    return [];
  }
  return parsed.data;
}

const cache = loadMockMaids();

export function listMockMaids(): MockMaid[] {
  return cache;
}

export function findMockMaidById(id: string): MockMaid | undefined {
  return cache.find((m) => m.id === id);
}
