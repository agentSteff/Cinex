import { Request, Response } from 'express';
import { GoogleGenerativeAI } from '@google/generative-ai';
import { PrismaClient } from '@prisma/client';
import { AuthRequest } from '../middleware/auth';

const prisma = new PrismaClient();
const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY || '');
const model = genAI.getGenerativeModel({ model: 'models/gemini-1.5-pro' });

export const generateRecommendations = async (req: AuthRequest, res: Response) => {
  let perfilUsuario = {
    peliculasGustadas: [] as string[],
    generosFavoritos: [] as string[]
  };

  try {
    const usuarioId = req.usuario?.id;

    if (!usuarioId) {
      return res.status(401).json({ error: 'No autorizado' });
    }

    // 1. Obtener historial del usuario (calificaciones altas)
    const calificacionesAltas = await prisma.calificacion.findMany({
      where: {
        usuarioId,
        puntuacion: { gte: 4 }
      },
      include: {
        pelicula: true
      },
      take: 10,
      orderBy: { fechaCalificacion: 'desc' }
    });

    // 2. Obtener películas en listas "favoritas" y "vistas"
    const listasRelevantes = await prisma.lista.findMany({
      where: {
        usuarioId,
        tipoLista: { in: ['favoritas', 'vistas'] }
      },
      include: {
        pelicula: true
      },
      take: 10,
      orderBy: { fechaAgregada: 'desc' }
    });

    // 3. Construir perfil de gustos
    // Construir array de películas gustadas asegurando que filtramos valores undefined
    const peliculasGustadas: string[] = [
      ...calificacionesAltas.map(c => c.pelicula.titulo),
      ...listasRelevantes
        .map(l => l.pelicula?.titulo)
        .filter((t): t is string => typeof t === 'string' && t.length > 0)
    ];

    // Extraer géneros
    const generos = new Set<string>();
    [...calificacionesAltas, ...listasRelevantes].forEach(item => {
      const p = 'pelicula' in item ? item.pelicula : null;
      if (p && p.genero) {
        p.genero.split(',').forEach(g => generos.add(g.trim()));
      }
    });

    perfilUsuario = {
      peliculasGustadas: [...new Set(peliculasGustadas)].slice(0, 10), // Top 10 películas únicas
      generosFavoritos: [...generos].slice(0, 5)
    };

    console.log('Generando recomendaciones para usuario:', usuarioId, perfilUsuario);

    if (perfilUsuario.peliculasGustadas.length === 0 && perfilUsuario.generosFavoritos.length === 0) {
      // Fallback para usuarios nuevos sin historial
      perfilUsuario.peliculasGustadas.push('Pulp Fiction', 'The Godfather', 'Inception');
      perfilUsuario.generosFavoritos.push('General');
    }

    const prompt = `
      Como experto en cine, recomienda 4 películas basadas en este perfil de usuario:
      - Películas que le gustaron: ${perfilUsuario.peliculasGustadas.join(', ')}
      - Géneros recurrentes: ${perfilUsuario.generosFavoritos.join(', ')}

      IMPORTANTE: No recomiendes las mismas películas que ya están en la lista de "gustadas".
      
      Responde SOLO con un JSON array con 4 objetos, cada uno con:
      - title: string
      - year: number
      - genre: string
      - director: string
      - rating: number (1-10)
      - description: string (breve)
      - reason: string (por qué le gustaría a este usuario específico)

      Ejemplo de formato JSON válido:
      [{"title": "Movie", "year": 2020, "genre": "Action", "director": "Director", "rating": 8.5, "description": "Desc", "reason": "Reason"}]
    `;

    const result = await model.generateContent(prompt);
    const messageContent = result.response.text();
    
    if (!messageContent) {
      throw new Error('No se recibió respuesta de la IA');
    }

    // Intentar limpiar el string por si trae markdown
    const cleanJson = messageContent.replace(/```json/g, '').replace(/```/g, '').trim();
    const recommendations = JSON.parse(cleanJson);
    
    res.json(recommendations);

  } catch (error) {
    console.error('Error generando recomendaciones:', error);
    
    // Verificar si es un error de API de IA (quota/auth/model not found)
    if (error instanceof Error && 'status' in error) {
      const status = (error as any).status;
      const code = (error as any).code;
      
      if (status === 429 || status === 402 || status === 404 || code === 'insufficient_quota' || code === 'invalid_api_key' || code === 'invalid_request_error') {
        console.log('API de IA no disponible (problema de cuota/balance/modelo), retornando recomendaciones fallback');
        
        // Retornar recomendaciones fallback basadas en géneros del usuario
        const fallbackRecommendations = generateFallbackRecommendations(
          perfilUsuario.generosFavoritos,
          perfilUsuario.peliculasGustadas
        );
        
        return res.json(fallbackRecommendations);
      }
    }
    
    if (error instanceof SyntaxError) {
      return res.status(500).json({ 
        error: 'Error procesando la respuesta de la IA' 
      });
    }
    
    res.status(500).json({ 
      error: 'Error generando recomendaciones. Verifica tu conexión o intenta más tarde.' 
    });
  }
};

export const getChatRecommendations = async (req: Request, res: Response) => {
  try {
    const { message } = req.body;

    if (!message) {
      return res.status(400).json({ 
        error: 'El mensaje es requerido' 
      });
    }

    const prompt = `
      El usuario busca: "${message}"
      
      Como experto en cine, recomienda 4 películas que se ajusten a esta descripción.
      
      Responde SOLO con un JSON array con 4 objetos, cada uno con:
      - title: string
      - year: number
      - genre: string
      - director: string
      - rating: number
      - description: string
      - reason: string (explica por qué esta película coincide con lo que busca el usuario)

      Formato:
      [{"title": "...", "year": ..., "genre": "...", "director": "...", "rating": ..., "description": "...", "reason": "..."}]
    `;

    const result = await model.generateContent(prompt);
    const messageContent = result.response.text();
    
    if (!messageContent) {
      throw new Error('No se recibió respuesta de la IA');
    }

    const recommendations = JSON.parse(messageContent);
    res.json(recommendations);

  } catch (error) {
    console.error('Error en recomendaciones de chat:', error);
    res.status(500).json({ 
      error: 'Error procesando tu solicitud' 
    });
  }
};

// Recomendaciones fallback cuando OpenAI/Gemini no está disponible
function generateFallbackRecommendations(generos: string[], peliculasGustadas: string[]) {
  const movieDatabase: Record<string, any[]> = {
    'Acción': [
      { title: 'Mad Max: Fury Road', year: 2015, director: 'George Miller', rating: 8.1, description: 'En un futuro post-apocalíptico, Max ayuda a un grupo rebelde.' },
      { title: 'John Wick', year: 2014, director: 'Chad Stahelski', rating: 7.4, description: 'Un asesino retirado busca venganza contra quienes mataron a su perro.' },
      { title: 'The Raid', year: 2011, director: 'Gareth Evans', rating: 7.6, description: 'Un equipo SWAT queda atrapado en un edificio controlado por un señor del crimen.' },
      { title: 'Atomic Blonde', year: 2017, director: 'David Leitch', rating: 6.7, description: 'Una agente del MI6 debe recuperar una lista de espías en Berlín.' }
    ],
    'Drama': [
      { title: 'The Shawshank Redemption', year: 1994, director: 'Frank Darabont', rating: 9.3, description: 'Dos hombres encarcelados forman una amistad durante décadas.' },
      { title: 'Whiplash', year: 2014, director: 'Damien Chazelle', rating: 8.5, description: 'Un joven baterista enfrenta a un instructor brutal en una academia de música.' },
      { title: 'Moonlight', year: 2016, director: 'Barry Jenkins', rating: 7.4, description: 'La historia de un joven negro que lucha con su identidad y sexualidad.' },
      { title: 'Manchester by the Sea', year: 2016, director: 'Kenneth Lonergan', rating: 7.8, description: 'Un hombre afligido regresa a su ciudad natal tras la muerte de su hermano.' }
    ],
    'Terror': [
      { title: 'Hereditary', year: 2018, director: 'Ari Aster', rating: 7.3, description: 'Una familia enfrenta eventos terroríficos tras la muerte de su matriarca.' },
      { title: 'The Conjuring', year: 2013, director: 'James Wan', rating: 7.5, description: 'Investigadores paranormales ayudan a una familia atormentada por una presencia oscura.' },
      { title: 'Get Out', year: 2017, director: 'Jordan Peele', rating: 7.7, description: 'Un joven descubre un horrible secreto cuando visita a la familia de su novia.' },
      { title: 'A Quiet Place', year: 2018, director: 'John Krasinski', rating: 7.5, description: 'Una familia debe vivir en silencio para evitar criaturas que cazan por el sonido.' }
    ],
    'Comedia': [
      { title: 'The Grand Budapest Hotel', year: 2014, director: 'Wes Anderson', rating: 8.1, description: 'Las aventuras de un conserje legendario y su protegido en un hotel famoso.' },
      { title: 'Knives Out', year: 2019, director: 'Rian Johnson', rating: 7.9, description: 'Un detective investiga la muerte de un patriarca de una familia disfuncional.' },
      { title: 'Jojo Rabbit', year: 2019, director: 'Taika Waititi', rating: 7.9, description: 'Un niño nazi descubre que su madre esconde a una joven judía en su ático.' },
      { title: 'Palm Springs', year: 2020, director: 'Max Barbakow', rating: 7.4, description: 'Dos personas quedan atrapadas en un bucle temporal durante una boda.' }
    ],
    'Ciencia Ficción': [
      { title: 'Blade Runner 2049', year: 2017, director: 'Denis Villeneuve', rating: 8.0, description: 'Un blade runner descubre un secreto que podría cambiar la sociedad.' },
      { title: 'Arrival', year: 2016, director: 'Denis Villeneuve', rating: 7.9, description: 'Una lingüista intenta comunicarse con extraterrestres que han llegado a la Tierra.' },
      { title: 'Ex Machina', year: 2014, director: 'Alex Garland', rating: 7.7, description: 'Un programador evalúa las capacidades de una inteligencia artificial.' },
      { title: 'Annihilation', year: 2018, director: 'Alex Garland', rating: 6.8, description: 'Un grupo de científicas investiga una zona contaminada por algo alienígena.' }
    ]
  };

  // Seleccionar películas basadas en géneros favoritos del usuario
  let recomendaciones: any[] = [];
  const generosAUsar = generos.length > 0 ? generos : ['Acción', 'Drama'];
  
  generosAUsar.forEach(genero => {
    const peliculasEnGenero = movieDatabase[genero] || movieDatabase['Drama'];
    const disponibles = peliculasEnGenero.filter(m => !peliculasGustadas.includes(m.title));
    if (disponibles.length > 0) {
      recomendaciones.push(disponibles[Math.floor(Math.random() * disponibles.length)]);
    }
  });

  // Llenar hasta 4 recomendaciones
  while (recomendaciones.length < 4) {
    const todosGeneros = Object.keys(movieDatabase);
    const generoRandom = todosGeneros[Math.floor(Math.random() * todosGeneros.length)];
    const peliculasEnGenero = movieDatabase[generoRandom];
    const pelicula = peliculasEnGenero[Math.floor(Math.random() * peliculasEnGenero.length)];
    
    if (!recomendaciones.find(r => r.title === pelicula.title) && !peliculasGustadas.includes(pelicula.title)) {
      recomendaciones.push(pelicula);
    }
  }

  // Formatear para coincidir con la estructura esperada
  return recomendaciones.slice(0, 4).map(pelicula => ({
    ...pelicula,
    genre: Object.keys(movieDatabase).find(g => movieDatabase[g].includes(pelicula)) || 'Drama',
    reason: `Basado en tus preferencias por ${generosAUsar.join(', ')}, esta película ofrece una experiencia similar.`
  }));
}