import Link from "next/link";
import { redirect } from "next/navigation";
import { Calendar, CheckCircle2, Sparkles } from "lucide-react";

import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { auth0 } from "@/lib/auth0";
import { getPrisma } from "@/lib/db";
import { formatINR } from "@/lib/format-inr";
import { SERVICE_OPTIONS } from "@/lib/services";

function serviceLabel(id: string) {
  return SERVICE_OPTIONS.find((s) => s.id === id)?.label ?? id;
}

type PageProps = Readonly<{
  searchParams: Promise<{ bookingId?: string }>;
}>;

export default async function BookingSuccessPage({ searchParams }: PageProps) {
  const { bookingId } = await searchParams;
  if (!bookingId) {
    redirect("/maids");
  }

  const session = await auth0.getSession();
  const userId = session?.user?.sub;
  if (!userId) {
    const returnTo = `/bookings/success?bookingId=${encodeURIComponent(bookingId)}`;
    redirect(`/auth/login?${new URLSearchParams({ returnTo }).toString()}`);
  }

  let maidName = "";
  let serviceType = "";
  let priceCents = 0;
  let when = "";

  try {
    const prisma = getPrisma();
    const row = await prisma.booking.findFirst({
      where: { id: bookingId, auth0UserId: userId },
      include: { maid: true, slot: true },
    });
    if (!row) {
      redirect("/maids");
    }
    maidName = row.maid.name;
    serviceType = row.serviceType;
    priceCents = row.priceCents;
    const start = row.slot.startsAt;
    const end = row.slot.endsAt;
    when = `${start.toLocaleString("en-IN", {
      weekday: "long",
      month: "long",
      day: "numeric",
      hour: "numeric",
      minute: "2-digit",
    })} – ${end.toLocaleTimeString("en-IN", {
      hour: "numeric",
      minute: "2-digit",
    })}`;
  } catch {
    redirect("/maids");
  }

  return (
    <div className="mx-auto max-w-lg px-4 py-16 sm:px-6">
      <Card className="overflow-hidden border-border/80 shadow-lg">
        <CardHeader className="bg-emerald-50 text-center dark:bg-emerald-950/40">
          <div className="mx-auto mb-3 flex h-16 w-16 items-center justify-center rounded-full bg-emerald-100 dark:bg-emerald-900/50">
            <CheckCircle2
              className="h-10 w-10 text-emerald-600 dark:text-emerald-400"
              aria-hidden
            />
          </div>
          <CardTitle className="text-2xl text-emerald-900 dark:text-emerald-100">
            Booking successful
          </CardTitle>
          <CardDescription className="text-base text-emerald-800/90 dark:text-emerald-200/90">
            Your service has been reserved. We&apos;ll confirm details before the
            visit.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-5 pt-6">
          <div className="flex gap-3 rounded-xl border border-border bg-muted/30 px-4 py-3 text-sm">
            <Sparkles className="mt-0.5 h-5 w-5 shrink-0 text-primary" />
            <div>
              <p className="font-medium text-foreground">
                {serviceLabel(serviceType)}
              </p>
              <p className="text-muted-foreground">{maidName}</p>
              <p className="mt-1 font-semibold text-foreground">
                {formatINR(priceCents)}
              </p>
            </div>
          </div>
          <div className="flex gap-3 text-sm">
            <Calendar className="mt-0.5 h-5 w-5 shrink-0 text-muted-foreground" />
            <div>
              <p className="font-medium text-foreground">Scheduled time</p>
              <p className="text-muted-foreground">{when}</p>
            </div>
          </div>
          <div className="flex flex-col gap-3 pt-2 sm:flex-row">
            <Button className="flex-1" asChild>
              <Link href={`/bookings/${bookingId}`}>View booking details</Link>
            </Button>
            <Button variant="outline" className="flex-1" asChild>
              <Link href="/maids">Book another visit</Link>
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
