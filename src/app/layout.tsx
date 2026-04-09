import type { Metadata } from "next";
import { Auth0Provider } from "@auth0/nextjs-auth0/client";

import { SiteHeader } from "@/components/site-header";
import { auth0 } from "@/lib/auth0";

import "./globals.css";

export const metadata: Metadata = {
  title: "Homely — Cleaning, washing & home help",
  description:
    "Book trusted help for home cleaning, laundry, utensils, and more—instant slots and clear ₹ pricing across India.",
};

export default async function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const session = await auth0.getSession();

  return (
    <html lang="en-IN" className="h-full antialiased">
      <body className="min-h-full flex flex-col bg-background font-sans">
        <Auth0Provider user={session?.user}>
          <SiteHeader />
          <div className="flex-1">{children}</div>
        </Auth0Provider>
      </body>
    </html>
  );
}
