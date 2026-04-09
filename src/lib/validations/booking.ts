import { z } from "zod";

const serviceIds = [
  "standard",
  "deep",
  "laundry",
  "dishes",
  "move_out",
] as const;

export const createBookingSchema = z.object({
  maidId: z.string().min(1),
  slotId: z.string().min(1),
  serviceType: z.enum(serviceIds),
});

export const mockPaySchema = z.object({
  bookingId: z.string().min(1),
});
