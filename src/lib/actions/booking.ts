"use server";

import { type Prisma } from "@/generated/prisma/client";

import { getPrisma } from "@/lib/db";
import { auth0 } from "@/lib/auth0";
import { findMockMaidById } from "@/lib/mock-maids";
import { priceForBooking } from "@/lib/services";
import {
  createBookingDurationSchema,
  mockPaySchema,
} from "@/lib/validations/booking";

export type CreateBookingResult =
  | { ok: true; bookingId: string }
  | { ok: false; error: string };

function tomorrowDemoStart(): Date {
  const d = new Date();
  d.setDate(d.getDate() + 1);
  d.setHours(9, 0, 0, 0);
  d.setMilliseconds(d.getMilliseconds() + Math.floor(Math.random() * 1_000_000_000));
  return d;
}

async function ensureMaidForBooking(tx: Prisma.TransactionClient, maidId: string) {
  const existing = await tx.maid.findUnique({ where: { id: maidId } });
  if (existing) {
    return existing;
  }
  const mock = findMockMaidById(maidId);
  if (!mock) {
    throw new Error("NOT_FOUND");
  }
  return tx.maid.create({
    data: {
      id: mock.id,
      name: mock.name,
      bio: mock.bio,
      photoUrl: mock.photoUrl,
      hourlyRateCents: mock.hourlyRateCents,
      serviceTypes: mock.serviceTypes,
    },
  });
}

export async function createPendingBooking(
  input: unknown,
): Promise<CreateBookingResult> {
  const session = await auth0.getSession();
  const userId = session?.user?.sub;
  if (!userId) {
    return { ok: false, error: "You must be signed in to book." };
  }

  const parsed = createBookingDurationSchema.safeParse(input);
  if (!parsed.success) {
    return { ok: false, error: "Invalid booking details." };
  }

  const { maidId, serviceType, durationHours } = parsed.data;
  const prisma = getPrisma();

  try {
    const booking = await prisma.$transaction(async (tx) => {
      const maid = await ensureMaidForBooking(tx, maidId);

      const startsAt = tomorrowDemoStart();
      const endsAt = new Date(
        startsAt.getTime() + durationHours * 60 * 60 * 1000,
      );

      const priceCents = priceForBooking(
        maid.hourlyRateCents,
        startsAt,
        endsAt,
        serviceType,
      );

      const slot = await tx.timeSlot.create({
        data: {
          maidId: maid.id,
          startsAt,
          endsAt,
        },
      });

      return tx.booking.create({
        data: {
          auth0UserId: userId,
          maidId: maid.id,
          slotId: slot.id,
          status: "PENDING",
          serviceType,
          priceCents,
        },
      });
    });

    return { ok: true, bookingId: booking.id };
  } catch (e) {
    if (e instanceof Error && e.message === "NOT_FOUND") {
      return {
        ok: false,
        error: "That helper is not available. Please choose another.",
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
        error: "Could not reserve that slot. Please try again.",
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
