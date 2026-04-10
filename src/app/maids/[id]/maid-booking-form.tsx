"use client";

import { useRouter } from "next/navigation";
import { useMemo, useState } from "react";
import { Loader2 } from "lucide-react";

import { createPendingBooking } from "@/lib/actions/booking";
import {
  MOCK_DURATION_OPTIONS,
  type MockDurationHours,
} from "@/lib/mock-duration-slots";
import { formatINR } from "@/lib/format-inr";
import { priceForBooking, SERVICE_OPTIONS } from "@/lib/services";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

type MaidBookingFormProps = Readonly<{
  maidId: string;
  hourlyRateCents: number;
}>;

function delay(ms: number) {
  return new Promise<void>((resolve) => {
    setTimeout(resolve, ms);
  });
}

export function MaidBookingForm({ maidId, hourlyRateCents }: MaidBookingFormProps) {
  const router = useRouter();
  const [durationHours, setDurationHours] = useState<MockDurationHours>(2);
  const [serviceType, setServiceType] = useState<string>(
    SERVICE_OPTIONS[0]?.id ?? "standard",
  );
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const estimatedPaise = useMemo(() => {
    const start = new Date();
    start.setDate(start.getDate() + 1);
    start.setHours(9, 0, 0, 0);
    const end = new Date(start.getTime() + durationHours * 60 * 60 * 1000);
    return priceForBooking(hourlyRateCents, start, end, serviceType);
  }, [durationHours, hourlyRateCents, serviceType]);

  async function handleBookService() {
    setError(null);
    setLoading(true);
    await delay(5000);
    const result = await createPendingBooking({
      maidId,
      serviceType,
      durationHours,
    });
    setLoading(false);
    if (result.ok) {
      router.push(
        `/bookings/success?bookingId=${encodeURIComponent(result.bookingId)}`,
      );
      return;
    }
    setError(result.error);
  }

  return (
    <div className="space-y-6">
      <fieldset className="space-y-3">
        <legend className="text-sm font-medium leading-none text-foreground">
          How long do you need?
        </legend>
        <div className="grid gap-2 sm:grid-cols-3">
          {MOCK_DURATION_OPTIONS.map((opt) => {
            const id = `duration-${opt.hours}`;
            const selected = durationHours === opt.hours;
            return (
              <label
                key={opt.hours}
                htmlFor={id}
                className={cn(
                  "flex cursor-pointer flex-col rounded-xl border-2 p-3 text-left transition-colors sm:p-4",
                  selected
                    ? "border-primary bg-primary/5 ring-1 ring-primary/20"
                    : "border-border hover:border-muted-foreground/35",
                )}
              >
                <input
                  id={id}
                  type="radio"
                  name="duration"
                  className="sr-only"
                  checked={selected}
                  onChange={() => {
                    setDurationHours(opt.hours);
                  }}
                />
                <span className="font-semibold text-foreground">{opt.label}</span>
                <span className="mt-1 text-xs text-muted-foreground">
                  {opt.description}
                </span>
              </label>
            );
          })}
        </div>
      </fieldset>

      <div className="space-y-2">
        <Label htmlFor="service">Service</Label>
        <Select value={serviceType} onValueChange={setServiceType}>
          <SelectTrigger id="service" className="w-full">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            {SERVICE_OPTIONS.map((s) => (
              <SelectItem key={s.id} value={s.id}>
                {s.label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
        <p className="text-xs text-muted-foreground">
          {SERVICE_OPTIONS.find((s) => s.id === serviceType)?.description}
        </p>
      </div>

      <p className="rounded-lg border border-border bg-muted/40 px-3 py-2 text-sm text-muted-foreground">
        Estimated total:{" "}
        <span className="font-semibold text-foreground">
          {formatINR(estimatedPaise)}
        </span>{" "}
        (demo pricing for the slot length and service type)
      </p>

      {error ? (
        <p className="text-sm text-destructive" role="alert">
          {error}
        </p>
      ) : null}

      <Button
        type="button"
        className="w-full"
        disabled={loading}
        onClick={handleBookService}
      >
        {loading ? (
          <>
            <Loader2 className="mr-2 h-4 w-4 animate-spin" aria-hidden />
            Booking your service…
          </>
        ) : (
          "Book service"
        )}
      </Button>
      {loading ? (
        <p className="text-center text-xs text-muted-foreground">
          Please wait—this takes about five seconds.
        </p>
      ) : null}
    </div>
  );
}
