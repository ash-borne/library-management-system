-- Written by hand so the rows already in the database are kept.

-- Book: rename copies to totalCopies (keeps the existing values)
ALTER TABLE "Book" RENAME COLUMN "copies" TO "totalCopies";

-- Book: publishedYear becomes optional
ALTER TABLE "Book" ALTER COLUMN "publishedYear" DROP NOT NULL;

-- Book: add isbn. Existing rows get a placeholder, which the seed script
-- then replaces with the real ISBN.
ALTER TABLE "Book" ADD COLUMN "isbn" TEXT;
UPDATE "Book" SET "isbn" = 'PENDING-' || "id" WHERE "isbn" IS NULL;
ALTER TABLE "Book" ALTER COLUMN "isbn" SET NOT NULL;
CREATE UNIQUE INDEX "Book_isbn_key" ON "Book"("isbn");

-- User: add password (a bcrypt hash). Existing rows get an empty value that
-- can never match a hash, so those accounts cannot log in until the seed
-- script sets a real hash.
ALTER TABLE "User" ADD COLUMN "password" TEXT;
UPDATE "User" SET "password" = '' WHERE "password" IS NULL;
ALTER TABLE "User" ALTER COLUMN "password" SET NOT NULL;
