"use client";

import Link from "next/link";
import { useUser } from "@auth0/nextjs-auth0/client";
import { LogOut, Sparkles } from "lucide-react";

import { Button } from "@/components/ui/button";

export function SiteHeader() {
  const { user, isLoading } = useUser();

  return (
    <header className="sticky top-0 z-40 border-b border-border/80 bg-background/80 backdrop-blur-md">
      <div className="mx-auto flex h-16 max-w-6xl items-center justify-between px-4 sm:px-6">
        <Link href="/" className="flex items-center gap-2 font-semibold tracking-tight">
          <span className="flex h-9 w-9 items-center justify-center rounded-lg bg-primary text-primary-foreground">
            <Sparkles className="h-5 w-5" aria-hidden />
          </span>
          <span className="text-lg">Homely</span>
        </Link>
        <nav className="flex items-center gap-3">
          <Link
            href="/maids"
            className="text-sm font-medium text-muted-foreground transition-colors hover:text-foreground"
          >
            Book services
          </Link>
          {isLoading ? (
            <span className="h-9 w-20 animate-pulse rounded-md bg-muted" aria-hidden />
          ) : user ? (
            <span className="flex items-center gap-2">
              <span className="hidden max-w-[140px] truncate text-sm text-muted-foreground sm:inline">
                {user.name ?? user.email ?? user.sub}
              </span>
              <Button variant="outline" size="sm" asChild>
                <a href="/auth/logout" className="gap-1.5">
                  <LogOut className="h-4 w-4" aria-hidden />
                  Log out
                </a>
              </Button>
            </span>
          ) : (
            <span className="flex items-center gap-2">
              <Button variant="outline" size="sm" asChild>
                <a href="/auth/login">Sign in</a>
              </Button>
              <Button size="sm" asChild>
                <a href="/auth/login?screen_hint=signup">Get started</a>
              </Button>
            </span>
          )}
        </nav>
      </div>
    </header>
  );
}
