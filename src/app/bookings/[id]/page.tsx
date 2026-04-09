import Link from "next/link";
import { notFound } from "next/navigation";
import { Calendar, CheckCircle2, MapPin } from "lucide-react";

import { Badge } from "@/components/ui/badge";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { auth0 } from "@/lib/auth0";
import { getPrisma } from "@/lib/db";
import { formatINR } from "@/lib/format-inr";
import { SERVICE_OPTIONS } from "@/lib/services";

import { MockPayButton } from "./mock-pay-button";

function serviceLabel(id: string) {
  return SERVICE_OPTIONS.find((s) => s.id === id)?.label ?? id;
}

type PageProps = { params: Promise<{ id: string }> };

export default async function BookingDetailPage({ params }: PageProps) {
  const { id } = await params;
  const session = await auth0.getSession();
  const userId = session?.user?.sub;
  if (!userId) {
    notFound();
  }

  type BookingWithRelations = {
    id: string;
    status: "PENDING" | "CONFIRMED" | "PAID";
    serviceType: string;
    priceCents: number;
    paidAt: Date | null;
    maid: { name: string };
    slot: { startsAt: Date; endsAt: Date };
  };

  let booking: BookingWithRelations | null = null;

  try {
    const prisma = getPrisma();
    const row = await prisma.booking.findFirst({
      where: { id, auth0UserId: userId },
      include: {
        maid: true,
        slot: true,
      },
    });
    if (row) {
      booking = row;
    }
  } catch {
    booking = null;
  }

  if (!booking) {
    notFound();
  }

  const start = booking.slot.startsAt;
  const end = booking.slot.endsAt;
  const when = `${start.toLocaleString("en-IN", {
    weekday: "long",
    month: "long",
    day: "numeric",
    hour: "numeric",
    minute: "2-digit",
  })} – ${end.toLocaleTimeString("en-IN", {
    hour: "numeric",
    minute: "2-digit",
  })}`;

  const isPaid = booking.status === "PAID";

  return (
    <div className="mx-auto max-w-2xl px-4 py-12 sm:px-6">
      <div className="mb-8">
        <Link
          href="/maids"
          className="text-sm font-medium text-primary hover:underline"
        >
          ← Book another visit
        </Link>
      </div>

      <Card className="overflow-hidden border-border/80 shadow-lg">
        <CardHeader
          className={
            isPaid
              ? "bg-emerald-50 dark:bg-emerald-950/40"
              : "bg-muted/50"
          }
        >
          <div className="flex flex-wrap items-center gap-2">
            {isPaid ? (
              <span className="flex items-center gap-1.5 text-emerald-700 dark:text-emerald-300">
                <CheckCircle2 className="h-5 w-5" aria-hidden />
                <span className="font-semibold">Booking confirmed</span>
              </span>
            ) : (
              <span className="font-semibold">Awaiting payment</span>
            )}
            <Badge variant={isPaid ? "default" : "secondary"}>
              {booking.status}
            </Badge>
          </div>
          <CardTitle className="mt-2 text-2xl">
            {booking.maid.name}
          </CardTitle>
          <CardDescription className="text-base">
            {serviceLabel(booking.serviceType)} · {formatINR(booking.priceCents)}
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6 pt-6">
          <div className="flex gap-3 text-sm">
            <Calendar className="mt-0.5 h-5 w-5 shrink-0 text-muted-foreground" />
            <div>
              <p className="font-medium text-foreground">Scheduled time</p>
              <p className="text-muted-foreground">{when}</p>
            </div>
          </div>
          <div className="flex gap-3 text-sm">
            <MapPin className="mt-0.5 h-5 w-5 shrink-0 text-muted-foreground" />
            <div>
              <p className="font-medium text-foreground">Reference</p>
              <p className="font-mono text-xs text-muted-foreground">
                {booking.id}
              </p>
            </div>
          </div>

          {isPaid && booking.paidAt ? (
            <p className="text-sm text-muted-foreground">
              Paid on{" "}
              {booking.paidAt.toLocaleString("en-IN", {
                dateStyle: "medium",
                timeStyle: "short",
              })}
            </p>
          ) : null}

          <Separator />

          {!isPaid ? (
            <MockPayButton bookingId={booking.id} />
          ) : (
            <p className="text-sm text-muted-foreground">
              You&apos;re all set. We&apos;ll send reminders before the visit.
            </p>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
