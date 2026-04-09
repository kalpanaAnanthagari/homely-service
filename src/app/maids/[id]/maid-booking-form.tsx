"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import { Loader2 } from "lucide-react";

import { createPendingBooking } from "@/lib/actions/booking";
import { SERVICE_OPTIONS } from "@/lib/services";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

type SlotOption = {
  id: string;
  startsAt: string;
  endsAt: string;
  label: string;
};

type MaidBookingFormProps = Readonly<{
  maidId: string;
  slots: SlotOption[];
}>;

function delay(ms: number) {
  return new Promise<void>((resolve) => {
    setTimeout(resolve, ms);
  });
}

export function MaidBookingForm({ maidId, slots }: MaidBookingFormProps) {
  const router = useRouter();
  const [slotId, setSlotId] = useState<string>(slots[0]?.id ?? "");
  const [serviceType, setServiceType] = useState<string>(
    SERVICE_OPTIONS[0]?.id ?? "standard",
  );
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  async function handleBookService() {
    setError(null);
    setLoading(true);
    await delay(5000);
    const result = await createPendingBooking({
      maidId,
      slotId,
      serviceType,
    });
    setLoading(false);
    if (result.ok) {
      router.push(`/bookings/success?bookingId=${encodeURIComponent(result.bookingId)}`);
      return;
    }
    setError(result.error);
  }

  if (slots.length === 0) {
    return (
      <p className="rounded-lg border border-dashed border-border bg-muted/40 px-4 py-8 text-center text-sm text-muted-foreground">
        No open slots right now. Check back soon or choose another helper.
      </p>
    );
  }

  return (
    <div className="space-y-6">
      <div className="space-y-2">
        <Label htmlFor="slot">Available time</Label>
        <Select value={slotId} onValueChange={setSlotId}>
          <SelectTrigger id="slot" className="w-full">
            <SelectValue placeholder="Select a slot" />
          </SelectTrigger>
          <SelectContent>
            {slots.map((s) => (
              <SelectItem key={s.id} value={s.id}>
                {s.label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

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

      {error ? (
        <p className="text-sm text-destructive" role="alert">
          {error}
        </p>
      ) : null}

      <Button
        type="button"
        className="w-full"
        disabled={loading || !slotId}
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
