This is a [Next.js](https://nextjs.org) project bootstrapped with [`create-next-app`](https://nextjs.org/docs/app/api-reference/cli/create-next-app).

## Auth0 (sign-in)

Copy `.env.example` to `.env` and fill in Auth0 values. The app uses `@auth0/nextjs-auth0`; the OAuth callback path is **`/auth/callback`**.

If Auth0 shows **“Callback URL mismatch”**, open [Auth0 Dashboard](https://manage.auth0.com) → **Applications** → your app → **Settings** and ensure these entries exist **exactly** (same scheme, host, and port as `APP_BASE_URL` in `.env`):

| Field | Local dev example |
| --- | --- |
| Allowed Callback URLs | `http://localhost:3000/auth/callback` |
| Allowed Logout URLs | `http://localhost:3000` |
| Allowed Web Origins | `http://localhost:3000` |

Use a **Regular Web Application** application type. If you browse the app at `http://127.0.0.1:3000` instead of `localhost`, set `APP_BASE_URL` to that origin and register the same three URLs with `127.0.0.1` instead of `localhost`.

## Getting Started

First, run the development server:

```bash
npm run dev
# or
yarn dev
# or
pnpm dev
# or
bun dev
```

Open [http://localhost:3000](http://localhost:3000) with your browser to see the result.

You can start editing the page by modifying `app/page.tsx`. The page auto-updates as you edit the file.

This project uses [`next/font`](https://nextjs.org/docs/app/building-your-application/optimizing/fonts) to automatically optimize and load [Geist](https://vercel.com/font), a new font family for Vercel.

## Learn More

To learn more about Next.js, take a look at the following resources:

- [Next.js Documentation](https://nextjs.org/docs) - learn about Next.js features and API.
- [Learn Next.js](https://nextjs.org/learn) - an interactive Next.js tutorial.

You can check out [the Next.js GitHub repository](https://github.com/vercel/next.js) - your feedback and contributions are welcome!

## Deploy on Vercel

Use the default **Build Command** `npm run build` (do not run `prisma migrate deploy` in the build unless your database is reachable from Vercel’s build environment and you intend migrations on every deploy). Run migrations once from your machine or CI: `npm run db:deploy` with `DATABASE_URL` set.

In the Vercel project **Settings → Environment Variables**, add everything from `.env.example` for **Production** (and Preview if needed): `DATABASE_URL`, Auth0 vars, `APP_BASE_URL` set to your production site URL (e.g. `https://your-app.vercel.app`), and a strong `AUTH0_SECRET`. In Auth0, register callback and logout URLs for that production origin.

Node **20+** is required (`package.json` `engines`).
