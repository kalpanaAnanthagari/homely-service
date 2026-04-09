export type ServiceOption = {
  id: string;
  label: string;
  description: string;
  multiplier: number;
};

export const SERVICE_OPTIONS: ServiceOption[] = [
  {
    id: "standard",
    label: "Home cleaning",
    description:
      "Regular jhadoo–pochha, dusting, and basic kitchen–bath wipe-down.",
    multiplier: 1,
  },
  {
    id: "deep",
    label: "Deep cleaning",
    description:
      "Floors, corners, bathrooms, and kitchen—thorough scrub and shine.",
    multiplier: 1.5,
  },
  {
    id: "laundry",
    label: "Laundry & washing",
    description:
      "Clothes washing, drying, and folding (machine or hand, as agreed).",
    multiplier: 1.2,
  },
  {
    id: "dishes",
    label: "Utensils & dishwashing",
    description:
      "Bartan, sink, and counter—washed, dried, and kitchen left tidy.",
    multiplier: 1.1,
  },
  {
    id: "move_out",
    label: "Full flat / move-out",
    description:
      "Empty-home deep clean for handover, inspection, or before shifting.",
    multiplier: 2,
  },
];

export function slotDurationHours(startsAt: Date, endsAt: Date): number {
  const ms = endsAt.getTime() - startsAt.getTime();
  return ms / (1000 * 60 * 60);
}

export function priceForBooking(
  hourlyRateCents: number,
  startsAt: Date,
  endsAt: Date,
  serviceId: string,
): number {
  const option = SERVICE_OPTIONS.find((s) => s.id === serviceId);
  const mult = option?.multiplier ?? 1;
  const hours = slotDurationHours(startsAt, endsAt);
  return Math.round(hourlyRateCents * hours * mult);
}
