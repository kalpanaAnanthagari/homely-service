"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";

import { completeMockPayment } from "@/lib/actions/booking";
import { Button } from "@/components/ui/button";

type MockPayButtonProps = {
  bookingId: string;
};

export function MockPayButton({ bookingId }: MockPayButtonProps) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function onPay() {
    setError(null);
    setLoading(true);
    const result = await completeMockPayment({ bookingId });
    setLoading(false);
    if (result.ok) {
      router.refresh();
      return;
    }
    setError(result.error);
  }

  return (
    <div className="space-y-3">
      {error ? (
        <p className="text-sm text-destructive" role="alert">
          {error}
        </p>
      ) : null}
      <Button
        type="button"
        size="lg"
        className="w-full sm:w-auto"
        disabled={loading}
        onClick={onPay}
      >
        {loading ? "Processing…" : "Confirm & pay (demo)"}
      </Button>
      <p className="text-xs text-muted-foreground">
        This build simulates payment—no real charges. In production you&apos;d
        use UPI, cards, or a provider like Razorpay here.
      </p>
    </div>
  );
}
