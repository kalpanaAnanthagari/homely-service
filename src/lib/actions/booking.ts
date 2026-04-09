"use server";

import { getPrisma } from "@/lib/db";
import { auth0 } from "@/lib/auth0";
import { priceForBooking } from "@/lib/services";
import {
  createBookingSchema,
  mockPaySchema,
} from "@/lib/validations/booking";

export type CreateBookingResult =
  | { ok: true; bookingId: string }
  | { ok: false; error: string };

export async function createPendingBooking(
  input: unknown,
): Promise<CreateBookingResult> {
  const session = await auth0.getSession();
  const userId = session?.user?.sub;
  if (!userId) {
    return { ok: false, error: "You must be signed in to book." };
  }

  const parsed = createBookingSchema.safeParse(input);
  if (!parsed.success) {
    return { ok: false, error: "Invalid booking details." };
  }

  const { maidId, slotId, serviceType } = parsed.data;
  const prisma = getPrisma();

  try {
    const booking = await prisma.$transaction(async (tx) => {
      const slot = await tx.timeSlot.findFirst({
        where: {
          id: slotId,
          maidId,
          booking: null,
          startsAt: { gt: new Date() },
        },
        include: { maid: true },
      });

      if (!slot) {
        throw new Error("UNAVAILABLE");
      }

      const priceCents = priceForBooking(
        slot.maid.hourlyRateCents,
        slot.startsAt,
        slot.endsAt,
        serviceType,
      );

      return tx.booking.create({
        data: {
          auth0UserId: userId,
          maidId,
          slotId,
          status: "PENDING",
          serviceType,
          priceCents,
        },
      });
    });

    return { ok: true, bookingId: booking.id };
  } catch (e) {
    if (e instanceof Error && e.message === "UNAVAILABLE") {
      return {
        ok: false,
        error:
          "That time is no longer available. Please pick another slot.",
      };
    }
    if (
      typeof e === "object" &&
      e !== null &&
      "code" in e &&
      (e as { code: string }).code === "P2002"
    ) {
      return {
        ok: false,
        error: "That slot was just booked. Please choose another time.",
      };
    }
    return {
      ok: false,
      error: "Could not complete booking. Please try again.",
    };
  }
}

export type MockPayResult = { ok: true } | { ok: false; error: string };

export async function completeMockPayment(
  input: unknown,
): Promise<MockPayResult> {
  const session = await auth0.getSession();
  const userId = session?.user?.sub;
  if (!userId) {
    return { ok: false, error: "You must be signed in." };
  }

  const parsed = mockPaySchema.safeParse(input);
  if (!parsed.success) {
    return { ok: false, error: "Invalid request." };
  }

  const { bookingId } = parsed.data;
  const prisma = getPrisma();

  const updated = await prisma.booking.updateMany({
    where: {
      id: bookingId,
      auth0UserId: userId,
      status: "PENDING",
    },
    data: {
      status: "PAID",
      paidAt: new Date(),
    },
  });

  if (updated.count === 0) {
    return {
      ok: false,
      error: "Booking not found or already paid.",
    };
  }

  return { ok: true };
}
