import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

async function main() {
  console.log('🌱 Iniciando seed de la base de datos...');

  // Limpiar datos existentes (opcional)
  console.log('🧹 Limpiando datos antiguos (TRUNCATE)...');
  await prisma.$executeRawUnsafe('TRUNCATE TABLE "listas", "calificaciones", "peliculas", "usuarios" RESTART IDENTITY CASCADE');

  // ==========================================
  // CREAR USUARIOS DE PRUEBA
  // ==========================================
  console.log('👤 Creando usuarios...');

  const password = await bcrypt.hash('password123', 10);

  const usuario1 = await prisma.usuario.create({
    data: {
      email: 'juan@test.com',
      username: 'juanperez',
      password: password,
    },
  });

  const usuario2 = await prisma.usuario.create({
    data: {
      email: 'maria@test.com',
      username: 'mariagarcia',
      password: password,
    },
  });

  const usuario3 = await prisma.usuario.create({
    data: {
      email: 'admin@cinex.com',
      username: 'admin',
      password: password,
    },
  });

  console.log(`✅ ${3} usuarios creados`);

  // ==========================================
  // CREAR PELÍCULAS DE PRUEBA
  // ==========================================
  console.log('🎬 Creando películas...');

  const pelicula1 = await prisma.pelicula.create({
    data: {
      titulo: 'The Shawshank Redemption',
      año: 1994,
      genero: 'Drama',
      director: 'Frank Darabont',
      sinopsis:
        'Dos hombres encarcelados se unen durante varios años, encontrando consuelo y eventual redención a través de actos de decencia común.',
      imagenUrl: 'https://image.tmdb.org/t/p/w500/q6y0Go1tsGEsmtFryDOJo3dEmqu.jpg',
      tmdbId: 278,
    },
  });

  const pelicula2 = await prisma.pelicula.create({
    data: {
      titulo: 'The Godfather',
      año: 1972,
      genero: 'Crime',
      director: 'Francis Ford Coppola',
      sinopsis:
        'El envejecido patriarca de una dinastía del crimen organizado transfiere el control de su imperio clandestino a su reacio hijo.',
      imagenUrl: 'https://image.tmdb.org/t/p/w500/3bhkrj58Vtu7enYsRolD1fZdja1.jpg',
      tmdbId: 238,
    },
  });

  const pelicula3 = await prisma.pelicula.create({
    data: {
      titulo: 'The Dark Knight',
      año: 2008,
      genero: 'Action',
      director: 'Christopher Nolan',
      sinopsis:
        'Cuando el amenazante Joker siembra caos y desastre en Gotham, Batman debe aceptar una de las pruebas psicológicas y físicas más grandes.',
      imagenUrl: 'https://image.tmdb.org/t/p/w500/qJ2tW6WMUDux911r6m7haRef0WH.jpg',
      tmdbId: 155,
    },
  });

  const pelicula4 = await prisma.pelicula.create({
    data: {
      titulo: 'Pulp Fiction',
      año: 1994,
      genero: 'Crime',
      director: 'Quentin Tarantino',
      sinopsis:
        'Las vidas de dos mafiosos, un boxeador, la esposa de un gánster y dos bandidos se entrelazan en cuatro historias de violencia y redención.',
      imagenUrl: 'https://image.tmdb.org/t/p/w500/d5iIlFn5s0ImszYzBPb8JPIfbXD.jpg',
      tmdbId: 680,
    },
  });

  const pelicula5 = await prisma.pelicula.create({
    data: {
      titulo: 'Forrest Gump',
      año: 1994,
      genero: 'Drama',
      director: 'Robert Zemeckis',
      sinopsis:
        'Las presidencias de Kennedy y Johnson, Vietnam, Watergate y otros eventos históricos se desarrollan desde la perspectiva de un hombre de Alabama.',
      imagenUrl: 'https://image.tmdb.org/t/p/w500/arw2vcBveWOVZr6pxd9XTd1TdQa.jpg',
      tmdbId: 13,
    },
  });

  const pelicula6 = await prisma.pelicula.create({
    data: {
      titulo: 'Inception',
      año: 2010,
      genero: 'Science Fiction',
      director: 'Christopher Nolan',
      sinopsis:
        'Un ladrón que roba secretos corporativos mediante tecnología de sueños compartidos recibe la tarea inversa de plantar una idea en la mente de un CEO.',
      imagenUrl: 'https://image.tmdb.org/t/p/w500/9gk7adHYeDvHkCSEqAvQNLV5Uge.jpg',
      tmdbId: 27205,
    },
  });

  console.log(`✅ ${6} películas creadas`);

  // ==========================================
  // CREAR CALIFICACIONES
  // ==========================================
  console.log('⭐ Creando calificaciones...');

  await prisma.calificacion.createMany({
    data: [
      // Usuario 1 calificaciones
      { usuarioId: usuario1.id, peliculaId: pelicula1.id, puntuacion: 5 },
      { usuarioId: usuario1.id, peliculaId: pelicula2.id, puntuacion: 5 },
      { usuarioId: usuario1.id, peliculaId: pelicula3.id, puntuacion: 4 },

      // Usuario 2 calificaciones
      { usuarioId: usuario2.id, peliculaId: pelicula1.id, puntuacion: 5 },
      { usuarioId: usuario2.id, peliculaId: pelicula3.id, puntuacion: 5 },
      { usuarioId: usuario2.id, peliculaId: pelicula4.id, puntuacion: 4 },
      { usuarioId: usuario2.id, peliculaId: pelicula5.id, puntuacion: 4 },

      // Usuario 3 calificaciones
      { usuarioId: usuario3.id, peliculaId: pelicula2.id, puntuacion: 5 },
      { usuarioId: usuario3.id, peliculaId: pelicula6.id, puntuacion: 5 },
    ],
  });

  console.log(`✅ ${9} calificaciones creadas`);

  // ==========================================
  // CREAR LISTAS PERSONALES
  // ==========================================
  console.log('📝 Creando listas personales...');

  await prisma.lista.createMany({
    data: [
      // Usuario 1 - Por ver
      { usuarioId: usuario1.id, peliculaId: pelicula4.id, tipoLista: 'por_ver' },
      { usuarioId: usuario1.id, peliculaId: pelicula5.id, tipoLista: 'por_ver' },

      // Usuario 1 - Vistas
      { usuarioId: usuario1.id, peliculaId: pelicula1.id, tipoLista: 'vistas' },
      { usuarioId: usuario1.id, peliculaId: pelicula2.id, tipoLista: 'vistas' },

      // Usuario 1 - Favoritas
      { usuarioId: usuario1.id, peliculaId: pelicula1.id, tipoLista: 'favoritas' },
      { usuarioId: usuario1.id, peliculaId: pelicula3.id, tipoLista: 'favoritas' },

      // Usuario 2 - Por ver
      { usuarioId: usuario2.id, peliculaId: pelicula6.id, tipoLista: 'por_ver' },

      // Usuario 2 - Vistas
      { usuarioId: usuario2.id, peliculaId: pelicula3.id, tipoLista: 'vistas' },
      { usuarioId: usuario2.id, peliculaId: pelicula4.id, tipoLista: 'vistas' },

      // Usuario 2 - Favoritas
      { usuarioId: usuario2.id, peliculaId: pelicula5.id, tipoLista: 'favoritas' },

      // Usuario 3 - Por ver
      { usuarioId: usuario3.id, peliculaId: pelicula2.id, tipoLista: 'por_ver' },

      // Usuario 3 - Favoritas
      { usuarioId: usuario3.id, peliculaId: pelicula6.id, tipoLista: 'favoritas' },

      // Usuario 3 - Lista personalizada "Noches Sci-Fi"
      {
        usuarioId: usuario3.id,
        peliculaId: pelicula6.id,
        tipoLista: 'personalizada',
        nombre: 'Noches Sci-Fi',
        descripcion: 'Películas para maratón de ciencia ficción',
        esPrivada: false,
      },
      {
        usuarioId: usuario3.id,
        peliculaId: pelicula3.id,
        tipoLista: 'personalizada',
        nombre: 'Noches Sci-Fi',
        descripcion: 'Películas para maratón de ciencia ficción',
        esPrivada: false,
      }
    ],
  });

  console.log(`✅ ${13} entradas de listas creadas`);

  console.log('');
  console.log('✅ Seed completado exitosamente! 🎉');
  console.log('');
  console.log('📊 Resumen:');
  console.log('   - 3 usuarios creados');
  console.log('   - 6 películas creadas');
  console.log('   - 9 calificaciones creadas');
  console.log('   - 13 listas personales creadas');
  console.log('');
  console.log('🔑 Credenciales de prueba:');
  console.log('   Email: juan@test.com');
  console.log('   Email: maria@test.com');
  console.log('   Email: admin@cinex.com');
  console.log('   Password (todas): password123');
}

main()
  .then(async () => {
    await prisma.$disconnect();
  })
  .catch(async (e) => {
    console.error('❌ Error durante el seed:', e);
    await prisma.$disconnect();
    process.exit(1);
  });
