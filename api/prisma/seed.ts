import 'dotenv/config';
import { PrismaPg } from '@prisma/adapter-pg';
import * as bcrypt from 'bcrypt';
import { PrismaClient, Role } from '../src/generated/prisma/client';

// Prisma 7 needs a driver adapter to connect
const adapter = new PrismaPg({ connectionString: process.env.DATABASE_URL });
const prisma = new PrismaClient({ adapter });

const genres = ['Fiction', 'Science', 'History', 'Technology', 'Fantasy'];

// [title, author, isbn, publishedYear, genre]
const books: [string, string, string, number, string][] = [
  ['Things Fall Apart', 'Chinua Achebe', '9780385474542', 1958, 'Fiction'],
  ['Weep Not, Child', "Ngugi wa Thiong'o", '9780143106692', 1964, 'Fiction'],
  ['Petals of Blood', "Ngugi wa Thiong'o", '9780143039174', 1977, 'Fiction'],
  ['A Brief History of Time', 'Stephen Hawking', '9780553380163', 1988, 'Science'],
  ['The Selfish Gene', 'Richard Dawkins', '9780198788607', 1976, 'Science'],
  ['Cosmos', 'Carl Sagan', '9780345539434', 1980, 'Science'],
  ['Guns, Germs, and Steel', 'Jared Diamond', '9780393317558', 1997, 'History'],
  ['Sapiens', 'Yuval Noah Harari', '9780062316097', 2011, 'History'],
  ['Long Walk to Freedom', 'Nelson Mandela', '9780316548182', 1994, 'History'],
  ['The Pragmatic Programmer', 'Andrew Hunt and David Thomas', '9780201616224', 1999, 'Technology'],
  ['Clean Code', 'Robert C. Martin', '9780132350884', 2008, 'Technology'],
  ['Designing Data-Intensive Applications', 'Martin Kleppmann', '9781449373320', 2017, 'Technology'],
  ['The Hobbit', 'J.R.R. Tolkien', '9780547928227', 1937, 'Fantasy'],
  ['A Wizard of Earthsea', 'Ursula K. Le Guin', '9780547773742', 1968, 'Fantasy'],
  ['The Name of the Wind', 'Patrick Rothfuss', '9780756404741', 2007, 'Fantasy'],
];

async function main() {
  // Sample accounts share one password, set in .env (see .env.example)
  const plainPassword = process.env.SEED_USER_PASSWORD;
  if (!plainPassword) {
    throw new Error('Set SEED_USER_PASSWORD in .env before seeding.');
  }
  const password = await bcrypt.hash(plainPassword, 10);

  // Genres first, because every book needs a genreId
  for (const name of genres) {
    await prisma.genre.upsert({ where: { name }, update: {}, create: { name } });
  }
  const savedGenres = await prisma.genre.findMany();
  const genreIds = new Map(savedGenres.map((genre) => [genre.name, genre.id]));

  // upsert lets the seed be run more than once, and fills in new columns
  for (const [title, author, isbn, publishedYear, genre] of books) {
    const genreId = genreIds.get(genre)!;
    await prisma.book.upsert({
      where: { title_author: { title, author } },
      update: { isbn, publishedYear, genreId },
      create: { title, author, isbn, publishedYear, totalCopies: 3, genreId },
    });
  }

  const users = [
    { email: 'librarian@example.com', name: 'Head Librarian', role: Role.LIBRARIAN },
    { email: 'patron@example.com', name: 'Sample Patron', role: Role.PATRON },
  ];
  for (const user of users) {
    await prisma.user.upsert({
      where: { email: user.email },
      update: { password, role: user.role },
      create: { ...user, password },
    });
  }

  console.log(`Seeded ${genres.length} genres, ${books.length} books and ${users.length} users.`);
}

main()
  .catch((error) => {
    console.error(error);
    process.exit(1);
  })
  .finally(() => prisma.$disconnect());
