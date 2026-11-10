# Library Management System

A NestJS and Prisma backend for a library's book catalog, using a PostgreSQL database. This part of the project is the data layer: the schema, the migration and the seed data.

## Setup

This project uses **Prisma 7** with the `@prisma/adapter-pg` driver adapter. The versions are pinned in `api/package.json`.

1. Go into the API folder and install the packages:
   ```
   cd api
   npm install
   ```
2. Copy `.env.example` to `.env` and replace the placeholder with your PostgreSQL connection string. Never commit `.env`.
3. Create the tables and generate the client:
   ```
   npx prisma migrate dev --name init
   npx prisma generate
   ```
4. Add the sample data (5 genres, 15 books and 2 users):
   ```
   npx prisma db seed
   ```
5. Start the API:
   ```
   npm run start:dev
   ```

## Project layout

| File | Purpose |
| --- | --- |
| `api/prisma/schema.prisma` | The `Role` enum and the `User`, `Genre`, `Book` and `Review` models |
| `api/prisma/seed.ts` | Inserts the sample genres, books and users |
| `api/prisma.config.ts` | Prisma 7 config: schema path, migrations folder, seed command, database URL |
| `api/src/prisma/prisma.service.ts` | `PrismaService`, which extends `PrismaClient` and connects in `onModuleInit()` |
| `api/src/prisma/prisma.module.ts` | Global module that makes `PrismaService` injectable everywhere |
| `api/.env.example` | The `DATABASE_URL` placeholder |

The generated client is written to `api/src/generated`, which is not committed (see `api/.gitignore`). Run `npx prisma generate` again after cloning the repository.

## Schema Decisions

### Why Book references Genre instead of embedding it

A `Book` stores a `genreId` foreign key with a `@relation` to the `Genre` model, rather than copying the genre's data inside every book.

- **One place for genre data.** Each genre is stored once, so renaming "Fantasy" is one update and every book shows the new name.
- **No duplicates or typos.** Embedded copies could drift apart ("Sci-Fi" in one book, "Science Fiction" in another). With a foreign key, every book points to the same row.
- **PostgreSQL is relational.** Relationships between tables are expressed through foreign keys, and the database enforces them: a book cannot be created with a `genreId` that does not exist.
- **Easy, fast queries.** Finding all books in a genre is a lookup on an indexed column (`@@index([genreId])`), and Prisma can load a book with its genre using `include: { genre: true }`.

### Other decisions

- **`Role` enum (PATRON, LIBRARIAN):** only these two values are allowed, so a typo like "LIBARIAN" is rejected by the database. New users default to `PATRON`.
- **Unique fields:** user email, genre name, and the pair (title, author) are unique, which also lets the seed script be run more than once safely.
- **`Review` model (stretch task):** links a user to a book with a rating and comment. Each user can review a book once, and reviews are deleted if their book or user is deleted.
- **Deleting a genre is restricted:** a genre that still has books cannot be deleted, so no book is ever left without a genre.

### Prisma vs a document database

One thing that felt different is that Prisma makes me define the structure first. In a document database I would probably have embedded the genre inside each book by default. With Prisma I had to choose a relationship, write it in the schema and migrate it, and then I got a fully typed client in return.