import Link from "next/link";
import { ArrowRight, CalendarCheck, Shield, Sparkles } from "lucide-react";

import { Button } from "@/components/ui/button";

export default function Home() {
  return (
    <div className="relative overflow-hidden">
      <div
        className="pointer-events-none absolute inset-0 bg-[radial-gradient(ellipse_80%_50%_at_50%_-20%,rgba(13,148,136,0.25),transparent)]"
        aria-hidden
      />
      <main className="relative mx-auto max-w-6xl px-4 pb-24 pt-16 sm:px-6 sm:pt-24">
        <div className="mx-auto max-w-3xl text-center">
          <p className="mb-4 inline-flex items-center gap-2 rounded-full border border-border bg-card px-4 py-1.5 text-sm text-muted-foreground shadow-sm">
            <Sparkles className="h-4 w-4 text-primary" aria-hidden />
            Cleaning, washing & home help—on your schedule
          </p>
          <h1 className="text-balance text-4xl font-bold tracking-tight text-foreground sm:text-5xl md:text-6xl">
            Trusted help for a spotless home
          </h1>
          <p className="mx-auto mt-6 max-w-2xl text-pretty text-lg text-muted-foreground sm:text-xl">
            Compare helpers, see live slots, and book cleaning, laundry, utensils,
            and more—one clear price in rupees, no surprises.
          </p>
          <div className="mt-10 flex flex-col items-center justify-center gap-4 sm:flex-row">
            <Button size="lg" className="min-w-[200px] gap-2" asChild>
              <Link href="/maids">
                Browse helpers
                <ArrowRight className="h-4 w-4" aria-hidden />
              </Link>
            </Button>
            <Button size="lg" variant="outline" asChild>
              <a href="/auth/login">Sign in</a>
            </Button>
          </div>
        </div>

        <div className="mx-auto mt-24 grid max-w-5xl gap-6 sm:grid-cols-3">
          <div className="rounded-2xl border border-border bg-card p-6 shadow-sm">
            <div className="mb-3 flex h-10 w-10 items-center justify-center rounded-lg bg-accent text-accent-foreground">
              <CalendarCheck className="h-5 w-5" aria-hidden />
            </div>
            <h2 className="font-semibold text-foreground">Live slots</h2>
            <p className="mt-2 text-sm text-muted-foreground">
              If you can pick a time, it&apos;s yours—availability updates
              instantly.
            </p>
          </div>
          <div className="rounded-2xl border border-border bg-card p-6 shadow-sm">
            <div className="mb-3 flex h-10 w-10 items-center justify-center rounded-lg bg-accent text-accent-foreground">
              <Shield className="h-5 w-5" aria-hidden />
            </div>
            <h2 className="font-semibold text-foreground">Clear ₹ pricing</h2>
            <p className="mt-2 text-sm text-muted-foreground">
              See the full amount before you confirm—service type and duration
              included.
            </p>
          </div>
          <div className="rounded-2xl border border-border bg-card p-6 shadow-sm">
            <div className="mb-3 flex h-10 w-10 items-center justify-center rounded-lg bg-accent text-accent-foreground">
              <Sparkles className="h-5 w-5" aria-hidden />
            </div>
            <h2 className="font-semibold text-foreground">Simple checkout</h2>
            <p className="mt-2 text-sm text-muted-foreground">
              Review your visit and confirm in one step (demo payment in this
              build).
            </p>
          </div>
        </div>
      </main>
    </div>
  );
}
