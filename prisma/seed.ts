import { seedDemoData } from '../src/lib/seed';
import { prisma } from '../src/lib/prisma';

seedDemoData()
  .then((res) => {
    console.log(`Demo data seeded successfully: ${res.total} registrations, ${res.partners} partners.`);
  })
  .catch((err) => {
    console.error('Seeding error:', err);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
