const { PrismaClient } = require('@prisma/client');

(async () => {
  const prisma = new PrismaClient();
  try {
    const peliculas = await prisma.pelicula.findMany({ orderBy: { id: 'asc' } });
    console.log(JSON.stringify(peliculas, null, 2));
  } catch (e) {
    console.error('Error listing peliculas:', e);
    process.exit(1);
  } finally {
    await prisma.$disconnect();
  }
})();
