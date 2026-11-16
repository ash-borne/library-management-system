import 'dotenv/config';
import { PrismaPg } from '@prisma/adapter-pg';
import { PrismaClient, Role } from '../src/generated/prisma/client';

// Prisma 7 needs a driver adapter to connect
const adapter = new PrismaPg({ connectionString: process.env.DATABASE_URL });
const prisma = new PrismaClient({ adapter });

const genres = ['Fiction', 'Science', 'History', 'Technology', 'Fantasy'];

// [title, author, publishedYear, genre]
const books: [string, string, number, string][] = [
  ['Things Fall Apart', 'Chinua Achebe', 1958, 'Fiction'],
  ['Weep Not, Child', "Ngugi wa Thiong'o", 1964, 'Fiction'],
  ['Petals of Blood', "Ngugi wa Thiong'o", 1977, 'Fiction'],
  ['A Brief History of Time', 'Stephen Hawking', 1988, 'Science'],
  ['The Selfish Gene', 'Richard Dawkins', 1976, 'Science'],
  ['Cosmos', 'Carl Sagan', 1980, 'Science'],
  ['Guns, Germs, and Steel', 'Jared Diamond', 1997, 'History'],
  ['Sapiens', 'Yuval Noah Harari', 2011, 'History'],
  ['Long Walk to Freedom', 'Nelson Mandela', 1994, 'History'],
  ['The Pragmatic Programmer', 'Andrew Hunt and David Thomas', 1999, 'Technology'],
  ['Clean Code', 'Robert C. Martin', 2008, 'Technology'],
  ['Designing Data-Intensive Applications', 'Martin Kleppmann', 2017, 'Technology'],
  ['The Hobbit', 'J.R.R. Tolkien', 1937, 'Fantasy'],
  ['A Wizard of Earthsea', 'Ursula K. Le Guin', 1968, 'Fantasy'],
  ['The Name of the Wind', 'Patrick Rothfuss', 2007, 'Fantasy'],
];

async function main() {
  // Genres first, because every book needs a genreId
  for (const name of genres) {
    await prisma.genre.upsert({ where: { name }, update: {}, create: { name } });
  }
  const savedGenres = await prisma.genre.findMany();
  const genreIds = new Map(savedGenres.map((genre) => [genre.name, genre.id]));

  // skipDuplicates lets the seed be run more than once
  await prisma.book.createMany({
    data: books.map(([title, author, publishedYear, genre]) => ({
      title,
      author,
      publishedYear,
      copies: 3,
      genreId: genreIds.get(genre)!,
    })),
    skipDuplicates: true,
  });

  await prisma.user.upsert({
    where: { email: 'librarian@example.com' },
    update: {},
    create: { email: 'librarian@example.com', name: 'Head Librarian', role: Role.LIBRARIAN },
  });
  await prisma.user.upsert({
    where: { email: 'patron@example.com' },
    update: {},
    create: { email: 'patron@example.com', name: 'Sample Patron', role: Role.PATRON },
  });

  console.log(`Seeded ${genres.length} genres and ${books.length} books.`);
}

main()
  .catch((error) => {
    console.error(error);
    process.exit(1);
  })
  .finally(() => prisma.$disconnect());