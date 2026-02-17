// One-off: point Map.imageUrl from verrückt.webp to verruckt.webp (umlaut breaks on Supabase). Run: npx tsx prisma/update-verruckt-image-url.ts
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  const oldPath = '/images/maps/verrückt.webp';
  const newPath = '/images/maps/verruckt.webp';

  const result = await prisma.map.updateMany({
    where: { imageUrl: oldPath },
    data: { imageUrl: newPath },
  });

  console.log(`Updated ${result.count} Map row(s) from ${oldPath} to ${newPath}.`);
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(() => prisma.$disconnect());
