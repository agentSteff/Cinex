export interface Usuario {
  id: number;
  email: string;
  username: string;
}

export interface PeliculaBackend {
  id?: number;
  titulo: string;
  año?: number;
  genero?: string;
  director?: string;
  sinopsis?: string;
  imagenUrl?: string;
  tmdbId?: number;
  // Calificación de TMDB (0-10) mapeada por el backend
  calificacionTMDB?: number;
  // Calificación promedio almacenada en nuestro backend (escala 0-5)
  calificacionPromedio?: number;
  // Duración en minutos (si está disponible)
  duracion?: number;
  // Número total de calificaciones de Cinex (opcional)
  totalCalificaciones?: number;
}

// Interfaz de Reseña
export interface Reseña {
  id: number;
  user: string;
  rating: number;
  comment: string;
  date: string;
}

// Tipo de Película Frontend (para compatibilidad con componentes existentes)
export interface Pelicula {
  id: number;
  titulo: string;
  año: number;
  genero: string;
  director: string;
  duracion: string;
  descripcion: string;
  imagen: string;
  puntuacion: number; // Antes rating
  fuentePuntuacion: 'cinex' | 'tmdb' | 'none'; // Antes fuenteRating
  puntuacionCinex?: number; // Antes cinexRating
  conteoPuntuacionCinex?: number; // Antes cinexRatingCount
  puntuacionTMDB?: number; // Antes tmdbRating (Puntaje original TMDB 0-10)
  puntuacionUsuario?: number; // Antes userRating
  reseñas: Reseña[];
  enListaPorVer?: boolean;
  vista?: boolean;
  reparto?: string[];
}

// Función de mapeo para convertir PeliculaBackend a Pelicula (Frontend)
function hashEstableANumero(s: string): number {
  let h = 0;
  for (let i = 0; i < s.length; i++) {
    h = (h * 31 + s.charCodeAt(i)) | 0;
  }
  return Math.abs(h);
}

export function mapearPelicula(pelicula: PeliculaBackend): Pelicula {
  const puntuacionCinexRaw = typeof pelicula.calificacionPromedio === 'string'
    ? parseFloat(pelicula.calificacionPromedio)
    : pelicula.calificacionPromedio;
  const puntuacionCinex = Number.isFinite(puntuacionCinexRaw ?? NaN) ? puntuacionCinexRaw ?? undefined : undefined;
  const puntuacionTMDBRaw = typeof pelicula.calificacionTMDB === 'number' ? pelicula.calificacionTMDB : undefined;
  const puntuacionTMDBNormalizada = typeof puntuacionTMDBRaw === 'number' ? puntuacionTMDBRaw / 2 : undefined;

  let puntuacion = 0;
  let fuentePuntuacion: 'cinex' | 'tmdb' | 'none' = 'none';
  if (typeof puntuacionCinex === 'number' && puntuacionCinex > 0) {
    puntuacion = puntuacionCinex;
    fuentePuntuacion = 'cinex';
  } else if (typeof puntuacionTMDBNormalizada === 'number' && puntuacionTMDBNormalizada > 0) {
    puntuacion = puntuacionTMDBNormalizada;
    fuentePuntuacion = 'tmdb';
  }

  return {
    id: pelicula.id ?? pelicula.tmdbId ?? hashEstableANumero(pelicula.titulo),
    titulo: pelicula.titulo,
    año: pelicula.año || 0,
    genero: pelicula.genero || 'Sin género',
    director: pelicula.director || (pelicula as any).directorName || (pelicula as any).director_name || '',
    duracion: (() => {
      const mins = pelicula.duracion ?? 0;
      if (!mins) return '';
      const h = Math.floor(mins / 60);
      const m = mins % 60;
      return `${h}h ${m}min`;
    })(), // Formato minutos -> "Xh Ymin"
    descripcion: pelicula.sinopsis || 'Sin descripción',
    imagen: pelicula.imagenUrl || '',
    puntuacion,
    fuentePuntuacion,
    puntuacionCinex,
    conteoPuntuacionCinex: pelicula.totalCalificaciones,
    puntuacionTMDB: puntuacionTMDBRaw,
    puntuacionUsuario: undefined,
    reseñas: [], // Las reseñas se obtendrán por separado de las calificaciones
    enListaPorVer: false,
    vista: false,
  };
}

export interface Calificacion {
  id?: number;
  usuarioId?: number;
  peliculaId?: number;
  puntuacion: number; // 1-5 estrellas
  comentario?: string;
}
// Respuesta de API para calificaciones
export interface CalificacionResponse {
  promedio: number;
  total: number;
  calificaciones?: Calificacion[];
}

export interface MiCalificacionResponse {
  id: number;
  puntuacion: number;
  comentario?: string;
}
export interface Lista {
  id: number;
  nombre: string;
  tipoLista: 'por_ver' | 'vistas' | 'favoritas' | 'personalizada';
  peliculas: PeliculaBackend[];
}

// Tipos de Respuesta API
export interface AuthResponse {
  token: string;
  usuario: Usuario;
}

export interface ApiError {
  message: string;
  status: number;
  original?: Error;
}
