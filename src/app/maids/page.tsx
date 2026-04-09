import Image from "next/image";
import Link from "next/link";
import { Star } from "lucide-react";

import { Badge } from "@/components/ui/badge";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { formatINR } from "@/lib/format-inr";
import { getPrisma } from "@/lib/db";
import { listMockMaids } from "@/lib/mock-maids";

const DEFAULT_RATING = 4.9;
const DEFAULT_REVIEW_COUNT = 48;

type MaidCard = {
  id: string;
  name: string;
  bio: string;
  photoUrl: string;
  hourlyRateCents: number;
  serviceTypes: string[];
  rating: number;
  reviewCount: number;
};

export default async function MaidsPage() {
  let dbMaids: Awaited<
    ReturnType<ReturnType<typeof getPrisma>["maid"]["findMany"]>
  > = [];
  try {
    const prisma = getPrisma();
    dbMaids = await prisma.maid.findMany({
      orderBy: { name: "asc" },
    });
  } catch {
    dbMaids = [];
  }

  const maids: MaidCard[] =
    dbMaids.length > 0
      ? dbMaids.map((m) => ({
          id: m.id,
          name: m.name,
          bio: m.bio,
          photoUrl: m.photoUrl,
          hourlyRateCents: m.hourlyRateCents,
          serviceTypes: m.serviceTypes,
          rating: DEFAULT_RATING,
          reviewCount: DEFAULT_REVIEW_COUNT,
        }))
      : listMockMaids().map((m) => ({
          id: m.id,
          name: m.name,
          bio: m.bio,
          photoUrl: m.photoUrl,
          hourlyRateCents: m.hourlyRateCents,
          serviceTypes: m.serviceTypes,
          rating: m.rating,
          reviewCount: m.reviewCount,
        }));

  return (
    <div className="mx-auto max-w-6xl px-4 py-12 sm:px-6">
      <div className="mb-10 max-w-2xl">
        <h1 className="text-3xl font-bold tracking-tight sm:text-4xl">
          Choose your helper
        </h1>
        <p className="mt-3 text-muted-foreground">
          Cleaning, washing, utensils, and more—hourly rates in ₹ and skills
          listed on each profile. Open one to see slots and book.
        </p>
      </div>

      {maids.length === 0 ? (
        <div className="rounded-xl border border-dashed border-border bg-muted/30 p-12 text-center">
          <p className="font-medium text-foreground">No helpers yet</p>
          <p className="mt-2 text-sm text-muted-foreground">
            Run{" "}
            <code className="rounded bg-muted px-1.5 py-0.5 text-xs">
              npx prisma migrate deploy
            </code>{" "}
            and{" "}
            <code className="rounded bg-muted px-1.5 py-0.5 text-xs">
              npm run db:seed
            </code>{" "}
            with a valid{" "}
            <code className="rounded bg-muted px-1.5 py-0.5 text-xs">
              DATABASE_URL
            </code>
            , or add entries to{" "}
            <code className="rounded bg-muted px-1.5 py-0.5 text-xs">
              src/data/maids.json
            </code>.
          </p>
        </div>
      ) : (
        <ul className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {maids.map((maid) => (
            <li key={maid.id}>
              <Card className="h-full overflow-hidden transition-shadow hover:shadow-md">
                <div className="relative aspect-[4/3] w-full bg-muted">
                  <Image
                    src={maid.photoUrl}
                    alt={`${maid.name} — ${maid.serviceTypes[0] ?? "home services"}`}
                    fill
                    className="object-cover"
                    sizes="(max-width: 768px) 100vw, 33vw"
                  />
                  <div
                    className="pointer-events-none absolute inset-0 bg-gradient-to-t from-black/35 via-transparent to-transparent"
                    aria-hidden
                  />
                </div>
                <CardHeader className="pb-2">
                  <div className="flex items-start justify-between gap-2">
                    <CardTitle className="text-xl">{maid.name}</CardTitle>
                    <span className="flex shrink-0 items-center gap-0.5 text-sm text-amber-600 dark:text-amber-400">
                      <Star className="h-4 w-4 fill-current" aria-hidden />
                      {maid.rating.toFixed(1)}
                      <span className="text-xs font-normal text-muted-foreground">
                        ({maid.reviewCount})
                      </span>
                    </span>
                  </div>
                  <CardDescription className="line-clamp-2">
                    {maid.bio}
                  </CardDescription>
                </CardHeader>
                <CardContent className="pb-2">
                  <div className="flex flex-wrap gap-1.5">
                    {maid.serviceTypes.slice(0, 3).map((t) => (
                      <Badge key={t} variant="secondary">
                        {t}
                      </Badge>
                    ))}
                  </div>
                  <p className="mt-4 text-2xl font-semibold tabular-nums">
                    {formatINR(maid.hourlyRateCents)}
                    <span className="text-sm font-normal text-muted-foreground">
                      {" "}
                      / hr
                    </span>
                  </p>
                </CardContent>
                <CardFooter className="pt-0">
                  <Link
                    href={`/maids/${maid.id}`}
                    className="text-sm font-medium text-primary hover:underline"
                  >
                    Check slots & book →
                  </Link>
                </CardFooter>
              </Card>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
