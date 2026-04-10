import Image from "next/image";
import Link from "next/link";
import { notFound } from "next/navigation";
import { ArrowLeft, Star } from "lucide-react";

import { Badge } from "@/components/ui/badge";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { getPrisma } from "@/lib/db";
import { findMockMaidById } from "@/lib/mock-maids";

import { MaidBookingForm } from "./maid-booking-form";

const DEFAULT_RATING = 4.9;
const DEFAULT_REVIEW_COUNT = 48;

type PageProps = Readonly<{ params: Promise<{ id: string }> }>;

export default async function MaidDetailPage({ params }: PageProps) {
  const { id } = await params;

  let maid = null as null | {
    id: string;
    name: string;
    bio: string;
    photoUrl: string;
    serviceTypes: string[];
    rating: number;
    reviewCount: number;
    hourlyRateCents: number;
  };

  try {
    const prisma = getPrisma();
    const fromDb = await prisma.maid.findUnique({ where: { id } });
    if (fromDb) {
      maid = {
        ...fromDb,
        rating: DEFAULT_RATING,
        reviewCount: DEFAULT_REVIEW_COUNT,
        hourlyRateCents: fromDb.hourlyRateCents,
      };
    }
  } catch {
    maid = null;
  }

  if (!maid) {
    const mock = findMockMaidById(id);
    if (mock) {
      maid = {
        id: mock.id,
        name: mock.name,
        bio: mock.bio,
        photoUrl: mock.photoUrl,
        serviceTypes: mock.serviceTypes,
        rating: mock.rating,
        reviewCount: mock.reviewCount,
        hourlyRateCents: mock.hourlyRateCents,
      };
    }
  }

  if (!maid) {
    notFound();
  }

  return (
    <div className="mx-auto max-w-6xl px-4 py-10 sm:px-6">
      <Link
        href="/maids"
        className="mb-8 inline-flex items-center gap-2 text-sm font-medium text-muted-foreground hover:text-foreground"
      >
        <ArrowLeft className="h-4 w-4" aria-hidden />
        All helpers
      </Link>

      <div className="grid gap-10 lg:grid-cols-2">
        <div>
          <div className="relative aspect-[4/3] overflow-hidden rounded-2xl bg-muted shadow-lg">
            <Image
              src={maid.photoUrl}
              alt={`${maid.name} — ${maid.serviceTypes[0] ?? "home services"}`}
              fill
              className="object-cover"
              priority
              sizes="(max-width: 1024px) 100vw, 50vw"
            />
          </div>
          <div className="mt-6">
            <div className="flex flex-wrap items-center gap-3">
              <h1 className="text-3xl font-bold tracking-tight">{maid.name}</h1>
              <span className="flex items-center gap-0.5 text-sm text-amber-600 dark:text-amber-400">
                <Star className="h-4 w-4 fill-current" aria-hidden />
                {maid.rating.toFixed(1)} ({maid.reviewCount} reviews)
              </span>
            </div>
            <p className="mt-4 text-muted-foreground leading-relaxed">
              {maid.bio}
            </p>
            <div className="mt-4 flex flex-wrap gap-2">
              {maid.serviceTypes.map((t) => (
                <Badge key={t} variant="secondary">
                  {t}
                </Badge>
              ))}
            </div>
          </div>
        </div>

        <div>
          <Card className="border-border/80 shadow-md">
            <CardHeader>
              <CardTitle>Book a visit</CardTitle>
              <CardDescription>
                Choose how long you need (demo slots), pick a service, then book.
                Your visit is saved when booking completes.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <MaidBookingForm
                maidId={maid.id}
                hourlyRateCents={maid.hourlyRateCents}
              />
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
