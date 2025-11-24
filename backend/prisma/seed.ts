import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

async function main() {
  console.log('🌱 Iniciando seed de la base de datos...');

  // Limpiar datos existentes (opcional)
  console.log('🧹 Limpiando datos antiguos (TRUNCATE)...');
  await prisma.$executeRawUnsafe('TRUNCATE TABLE "lista_personalizada_items", "listas_personalizadas", "listas", "calificaciones", "peliculas", "usuarios" RESTART IDENTITY CASCADE');

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
  const tmdbSeedMovies = [
    {
      titulo: 'Frankenstein',
      año: 2025,
      sinopsis:
        'Un científico brillante y obsesivo, Victor Frankenstein, en su ambición por desafiar a la muerte, da vida a una criatura ensamblada con partes de cadáveres. Pese a tratarse de una proeza científica, Frankenstein considera que la criatura carece de inteligencia y la rechaza. Dolida, esta se rebela contra su creador.',
      imagenUrl: 'https://image.tmdb.org/t/p/w500/hTj8x0ElKldJyAjTYvaqxkQNxxN.jpg',
      tmdbId: 1062722,
      genero: 'Drama',
      director: 'Dug Rotstein'
    },
    {
      titulo: 'Una batalla tras otra',
      año: 2025,
      sinopsis:
        "Un ex revolucionario, tras años apartado de la lucha, se ve obligado a volver a la acción para enfrentar a viejos enemigos en un ambiente cargado de tensión política, racismo y violencia militar... Adaptación modernizada de la novela 'Vineland', de Thomas Pynchon (1990), sobre los movimientos radicales de los años sesenta.",
      imagenUrl: 'https://image.tmdb.org/t/p/w500/sRiK0GwWAQ1qukvAgN3I9t5dGVq.jpg',
      tmdbId: 1054867,
      genero: 'Acción',
      director: 'Paul Thomas Anderson'
    },
    {
      titulo: 'Juegos de niños',
      año: 2025,
      sinopsis:
        'Brian acaba de ser despedido de su trabajo, y se convierte en un padre que se queda en casa. Acepta una invitación para jugar de otro padre, que resulta ser un bala perdida.',
      imagenUrl: 'https://image.tmdb.org/t/p/w500/sWhglhFoGA0T7n5U6Yi0t8LBGjA.jpg',
      tmdbId: 1248226,
      genero: 'Acción',
      director: 'Luke Greenfield'
    },
    {
      titulo: 'El descubridor de leyendas',
      año: 2024,
      sinopsis:
        'Un arqueólogo nota que la textura de las reliquias descubiertas durante la excavación de un glaciar se parece mucho a un colgante de jade visto en uno de sus sueños. Él y su equipo se embarcan en una expedición a las profundidades del glaciar.',
      imagenUrl: 'https://image.tmdb.org/t/p/w500/jvrSYRtgHTu3oqJN1X7LWZoekB6.jpg',
      tmdbId: 1116465,
      genero: 'Acción',
      director: '唐季禮'
    },
    {
      titulo: 'Caza sangrienta',
      año: 2024,
      sinopsis:
        'En 1944, un prolífico experto del ocultismo y el whisky, El Reverendo, acompaña a un grupo de militares a una remota isla del Pacífico Sur para investigar la desaparición de las unidades estacionadas allí.',
      imagenUrl: 'https://image.tmdb.org/t/p/w500/x4hebEzPIn8WeyTEQSj2jotpYzM.jpg',
      tmdbId: 1084222,
      genero: 'Acción',
      director: 'Louis Mandylor'
    },
    {
      titulo: 'Predator: Badlands',
      año: 2025,
      sinopsis:
        'Un joven Predator rechazado por su clan encuentra un aliado inesperado en Thia y emprende un peligroso viaje en busca del adversario definitivo.',
      imagenUrl: 'https://image.tmdb.org/t/p/w500/iANU8C9n6lH7Wx0MbOdM4aATfrW.jpg',
      tmdbId: 1242898,
      genero: 'Acción',
      director: 'Dan Trachtenberg'
    },
    {
      titulo: 'The Prosecutor',
      año: 2024,
      sinopsis:
        'Un exdetective se convierte en fiscal y enfrenta la corrupción en el sistema judicial. Al investigar un caso lleno de dudas, se embarca en una misión personal para hacer justicia, enfrentándose a traficantes de drogas, conspiraciones y jueces corruptos en un intenso thriller de acción.',
      imagenUrl: 'https://image.tmdb.org/t/p/w500/hLAek7EiM5NpLiotmQkmS8SIZw9.jpg',
      tmdbId: 1128650,
      genero: 'Acción',
      director: 'Donnie Yen'
    },
    {
      titulo: 'Venganza justificada',
      año: 2025,
      sinopsis:
        'En 2025, dos amigos se enfrentan a decisiones difíciles mientras luchan por sus ideales en medio de tensiones sociales. Su amistad se pone a prueba y deben aprender a mantenerse firmes, incluso cuando las cosas se complican.',
      imagenUrl: 'https://image.tmdb.org/t/p/w500/3kliZ6mw8ZgnhfmHw14Zye6GyPS.jpg',
      tmdbId: 1296504,
      genero: 'Acción',
      director: 'Fansu Njie'
    },
    {
      titulo: 'Tee Yai: Nacido para el crimen',
      año: 2025,
      sinopsis:
        'Bangkok, década de 1980. Un astuto ladrón que da golpes audaces deja perplejos al público y las autoridades… hasta que un policía se propone atraparlo.',
      imagenUrl: 'https://image.tmdb.org/t/p/w500/wM125GkMUzSyjPzNqvx9j2UHYV7.jpg',
      tmdbId: 1429738,
      genero: 'Crimen',
      director: 'Nonzee Nimibutr'
    },
    {
      titulo: 'La guerra de los mundos',
      año: 2025,
      sinopsis:
        'Will Radford, un destacado analista de ciberseguridad, pasa sus días rastreando posibles amenazas a la seguridad nacional a través de un programa de vigilancia masiva. Un ataque de una entidad desconocida le lleva a cuestionarse si el gobierno le está ocultando algo a él... y al resto del mundo.',
      imagenUrl: 'https://image.tmdb.org/t/p/w500/fjgSlNGECNgVeMJaOdDAXmGh7ZM.jpg',
      tmdbId: 755898,
      genero: 'Ciencia ficción',
      director: 'Rich Lee'
    },
    {
      titulo: 'First Moon',
      año: 2025,
      sinopsis:
        'Una joven camarera es secuestrada por una secta religiosa, que está empeñada en curarla de un virus de hombre lobo de transmisión sexual... o matarla en el proceso. ¿Escapará antes de la primera luna llena?',
      imagenUrl: 'https://image.tmdb.org/t/p/w500/uJ13k79tpmsFDhXX2YUAlsRFzDT.jpg',
      tmdbId: 1468417,
      genero: 'Terror',
      director: 'Peter McLeod'
    },
    {
      titulo: 'Black Phone 2',
      año: 2025,
      sinopsis:
        'La película Teléfono negro 2 (2025) es una secuela ambientada en 1982, cuatro años después de que Finney Blake lograra matar al secuestrador y asesino en serie conocido como "The Grabber". Finney, ahora marcado por el trauma, junto a su hermana menor Gwen, que tiene habilidades psíquicas, comienzan a tener visiones relacionadas con asesinatos ocurridos en un campamento cristiano en las Montañas Rocosas. Decididos a descubrir la verdad, viajan junto con Ernesto, un amigo, al campamento donde trabajó su madre, que también tenía dones psíquicos y fue víctima del asesino.',
      imagenUrl: 'https://image.tmdb.org/t/p/w500/i5OfOjbZMxNfiFGkdETdbJUOLAq.jpg',
      tmdbId: 1197137,
      genero: 'Terror',
      director: 'Scott Derrickson'
    },
    {
      titulo: 'Ahora me ves 3',
      año: 2025,
      sinopsis:
        'Los Cuatro Jinetes regresan junto a una nueva generación de ilusionistas en una extraordinaria aventura que contiene giros asombrosos, sorpresas alucinantes y trucos de magia nunca vistos en la gran pantalla.',
      imagenUrl: 'https://image.tmdb.org/t/p/w500/Aspr0HcItNVbgLC8cV0ZAO0EBcc.jpg',
      tmdbId: 425274,
      genero: 'Suspense',
      director: 'Ruben Fleischer'
    },
    {
      titulo: 'Guardianes de la noche: Kimetsu no Yaiba La fortaleza infinita',
      año: 2025,
      sinopsis:
        'El Cuerpo de Cazadores de Demonios se enfrenta a los Doce Kizuki restantes antes de enfrentarse a Muzan en el Castillo del Infinito para derrotarlo de una vez por todas.',
      imagenUrl: 'https://image.tmdb.org/t/p/w500/iWLV12z9oexSRLz2WKyqCZbKoPA.jpg',
      tmdbId: 1311031,
      genero: 'Animación',
      director: 'Haruo Sotozaki'
    },
    {
      titulo: 'JUJUTSU KAISEN: Ejecución',
      año: 2025,
      sinopsis: '',
      imagenUrl: 'https://image.tmdb.org/t/p/w500/a4QuZ6oW71zCpwVW08u3fHBxc6E.jpg',
      tmdbId: 1539104,
      genero: 'Animación',
      director: '御所園翔太'
    },
    {
      titulo: 'xXx',
      año: 2002,
      sinopsis:
        'Xander Cage es XXX, un antiguo ganador de X-Games y atleta profesional de deportes de extremo, que sobrevive vendiendo videos de sus increíbles hazañas, las cuales hacen emitir adrenalina por todo el cuerpo. Pero después de incontables encuentros con la ley, su mundo está a punto de tomar un rumbo aún más extremo... Porque Xander no sabe que ha sido "espiado" por Augustus Gibbons, un agente veterano de la Agencia Nacional de Seguridad que se encuentra en una desesperada situación en la distante ciudad de Praga, en donde su operativo secreto ha sido asesinado por una pandilla de mafiosos con un estilo muy propio, que se llaman así mismos Anarchy 99, encabezados por el brutal ex-Comandante del Ejército Ruso Yorgi.',
      imagenUrl: 'https://image.tmdb.org/t/p/w500/gd4hRY3pFXRY7YVbMdVBpnKV7wC.jpg',
      tmdbId: 7451,
      genero: 'Acción',
      director: 'Rob Cohen'
    },
    {
      titulo: 'Código 3',
      año: 2025,
      sinopsis:
        'Un paramédico a punto de dejar su trabajo estresante se ve obligado a hacer un último turno de 24 horas para entrenar a su reemplazo. La serie mezcla humor oscuro con una crítica al sistema de salud estadounidense, haciendo que nunca mires a una ambulancia de la misma manera.',
      imagenUrl: 'https://image.tmdb.org/t/p/w500/3hPPcGOS8XUciA2TDLWEE5hwikH.jpg',
      tmdbId: 1161617,
      genero: 'Acción',
      director: 'Christopher Leone'
    },
    {
      titulo: 'Chainsaw Man - La película: El arco de Reze',
      año: 2025,
      sinopsis:
        'Denji trabajaba como cazador de demonios para la yakuza, tratando de saldar la deuda que había heredado de sus padres, pero la yakuza lo traicionó y lo mató. Antes de perder el conocimiento, Pochita, el perro-demonio motosierra de Denji, hizo un trato con él y le salvó la vida. Así se fusionaron, creando al imparable Chainsaw Man. Ahora, en medio de una brutal guerra entre demonios, cazadores y enemigos secretos, una misteriosa chica llamada Reze irrumpe en su mundo y Denji se enfrenta a su batalla más mortífera, impulsado por el amor, en un mundo donde la supervivencia no conoce reglas.',
      imagenUrl: 'https://image.tmdb.org/t/p/w500/1CfZCb56vWjq37uXtbKNMevMzwG.jpg',
      tmdbId: 1218925,
      genero: 'Animación',
      director: 'Tatsuya Yoshihara'
    },
    {
      titulo: '捕风追影',
      año: 2025,
      sinopsis: '',
      imagenUrl: 'https://image.tmdb.org/t/p/w500/25OeH0GOuEljJqZoF0HoKxOpq0B.jpg',
      tmdbId: 1419406,
      genero: 'Acción',
      director: 'Larry Yang'
    },
    {
      titulo: 'Monster Island',
      año: 2025,
      sinopsis:
        'Ambientada en el Pacífico, 1942. Un soldado japonés y un prisionero de guerra británico se encuentran varados en una isla desierta, perseguidos por una criatura mortal. Dos enemigos acérrimos deben unirse para sobrevivir a lo desconocido.',
      imagenUrl: 'https://image.tmdb.org/t/p/w500/x1JOs4xWNr1QYjDAXHxWw1NJ7Sq.jpg',
      tmdbId: 1214140,
      genero: 'Terror',
      director: 'Mike Wiluan'
    }
  ];

  await prisma.pelicula.createMany({
    data: tmdbSeedMovies.map((movie) => ({
      titulo: movie.titulo,
      año: movie.año ?? null,
      genero: movie.genero ?? null,
      director: movie.director ?? null,
      sinopsis: movie.sinopsis ?? null,
      imagenUrl: movie.imagenUrl ?? null,
      tmdbId: movie.tmdbId
    })),
    skipDuplicates: true
  });

  const peliculasCreadas = await prisma.pelicula.findMany({
    where: {
      tmdbId: {
        in: tmdbSeedMovies.map((movie) => movie.tmdbId)
      }
    }
  });

  const peliculaMap = new Map<number, number>();
  peliculasCreadas.forEach((pelicula) => {
    if (typeof pelicula.tmdbId === 'number') {
      peliculaMap.set(pelicula.tmdbId, pelicula.id);
    }
  });

  const getPeliculaId = (tmdbId: number) => {
    const id = peliculaMap.get(tmdbId);
    if (!id) {
      throw new Error(`No se encontró película con tmdbId ${tmdbId} después del seed`);
    }
    return id;
  };

  const seedMovieIds = {
    frankenstein: getPeliculaId(1062722),
    batalla: getPeliculaId(1054867),
    juegos: getPeliculaId(1248226),
    descubridor: getPeliculaId(1116465),
    cazaSangrienta: getPeliculaId(1084222),
    predator: getPeliculaId(1242898),
    prosecutor: getPeliculaId(1128650),
    teeYai: getPeliculaId(1429738),
    blackPhone2: getPeliculaId(1197137),
    nowYouSeeMe3: getPeliculaId(425274)
  } as const;

  console.log(`✅ ${tmdbSeedMovies.length} películas creadas`);

  // ==========================================
  // CREAR CALIFICACIONES
  // ==========================================
  console.log('⭐ Creando calificaciones...');

  await prisma.calificacion.createMany({
    data: [
      // Usuario 1 calificaciones
      { usuarioId: usuario1.id, peliculaId: seedMovieIds.frankenstein, puntuacion: 5 },
      { usuarioId: usuario1.id, peliculaId: seedMovieIds.predator, puntuacion: 4 },
      { usuarioId: usuario1.id, peliculaId: seedMovieIds.prosecutor, puntuacion: 4 },

      // Usuario 2 calificaciones
      { usuarioId: usuario2.id, peliculaId: seedMovieIds.frankenstein, puntuacion: 4 },
      { usuarioId: usuario2.id, peliculaId: seedMovieIds.teeYai, puntuacion: 5 },
      { usuarioId: usuario2.id, peliculaId: seedMovieIds.cazaSangrienta, puntuacion: 3 },
      { usuarioId: usuario2.id, peliculaId: seedMovieIds.blackPhone2, puntuacion: 4 },

      // Usuario 3 calificaciones
      { usuarioId: usuario3.id, peliculaId: seedMovieIds.nowYouSeeMe3, puntuacion: 5 },
      { usuarioId: usuario3.id, peliculaId: seedMovieIds.batalla, puntuacion: 4 },
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
      { usuarioId: usuario1.id, peliculaId: seedMovieIds.predator, tipoLista: 'por_ver' },
      { usuarioId: usuario1.id, peliculaId: seedMovieIds.cazaSangrienta, tipoLista: 'por_ver' },

      // Usuario 1 - Vistas
      { usuarioId: usuario1.id, peliculaId: seedMovieIds.frankenstein, tipoLista: 'vistas' },
      { usuarioId: usuario1.id, peliculaId: seedMovieIds.batalla, tipoLista: 'vistas' },

      // Usuario 1 - Favoritas
      { usuarioId: usuario1.id, peliculaId: seedMovieIds.blackPhone2, tipoLista: 'favoritas' },
      { usuarioId: usuario1.id, peliculaId: seedMovieIds.predator, tipoLista: 'favoritas' },

      // Usuario 2 - Por ver
      { usuarioId: usuario2.id, peliculaId: seedMovieIds.juegos, tipoLista: 'por_ver' },

      // Usuario 2 - Vistas
      { usuarioId: usuario2.id, peliculaId: seedMovieIds.predator, tipoLista: 'vistas' },
      { usuarioId: usuario2.id, peliculaId: seedMovieIds.prosecutor, tipoLista: 'vistas' },

      // Usuario 2 - Favoritas
      { usuarioId: usuario2.id, peliculaId: seedMovieIds.nowYouSeeMe3, tipoLista: 'favoritas' },

      // Usuario 3 - Por ver
      { usuarioId: usuario3.id, peliculaId: seedMovieIds.frankenstein, tipoLista: 'por_ver' },

      // Usuario 3 - Favoritas
      { usuarioId: usuario3.id, peliculaId: seedMovieIds.teeYai, tipoLista: 'favoritas' }
    ],
  });

  console.log(`✅ ${12} entradas de listas creadas`);

  // ==========================================
  // LISTAS PERSONALIZADAS (cabeceras + items)
  // ==========================================
  console.log('📂 Creando listas personalizadas...');

  const listaNochesSciFi = await prisma.listaPersonalizada.create({
    data: {
      usuarioId: usuario3.id,
      nombre: 'Noches Sci-Fi',
      descripcion: 'Películas para maratón de ciencia ficción',
      esPrivada: false
    }
  });

  await prisma.listaPersonalizadaItem.createMany({
    data: [
      { listaId: listaNochesSciFi.id, peliculaId: seedMovieIds.predator },
      { listaId: listaNochesSciFi.id, peliculaId: seedMovieIds.prosecutor }
    ]
  });

  console.log(`✅ 1 lista personalizada y 2 entradas creadas`);

  console.log('');
  console.log('✅ Seed completado exitosamente! 🎉');
  console.log('');
  console.log('📊 Resumen:');
  console.log('   - 3 usuarios creados');
  console.log(`   - ${tmdbSeedMovies.length} películas creadas`);
  console.log('   - 9 calificaciones creadas');
  console.log('   - 12 entradas en listas predeterminadas');
  console.log('   - 1 lista personalizada con 2 películas');
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
