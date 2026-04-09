-- Rename Clerk user id column to Auth0 `sub` (stable user identifier)
ALTER TABLE "Booking" RENAME COLUMN "clerkUserId" TO "auth0UserId";
