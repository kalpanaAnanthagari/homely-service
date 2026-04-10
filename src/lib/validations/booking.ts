import { z } from "zod";

const serviceIds = [
  "standard",
  "deep",
  "laundry",
  "dishes",
  "move_out",
] as const;

export const createBookingDurationSchema = z.object({
  maidId: z.string().min(1),
  serviceType: z.enum(serviceIds),
  durationHours: z.union([z.literal(1), z.literal(2), z.literal(4)]),
});

export const mockPaySchema = z.object({
  bookingId: z.string().min(1),
});
