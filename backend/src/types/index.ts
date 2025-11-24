// Tipos de Películas
export interface PeliculaTMDB {
  titulo: string;
  año: number | null;
  sinopsis: string;
  imagenUrl: string | null;
  tmdbId: number;
  calificacionTMDB?: number;
  duracion?: number;
  genero?: string;
  director?: string;
}

// Tipos de Usuario
export interface UsuarioPayload {
  id: number;
  email: string;
  username: string;
}

export interface UsuarioRegistro {
  email: string;
  password: string;
  username: string;
}

export interface UsuarioLogin {
  email: string;
  password: string;
}

// Tipos de Calificación
export interface CalificacionCreate {
  peliculaId: number;
  puntuacion: number; // 1-5
  comentario?: string | null;
}

// Tipos de Lista
export type TipoLista = 'por_ver' | 'vistas' | 'favoritas' | 'personalizada';

export interface ListaCreate {
  peliculaId?: number | null;
  tipoLista: TipoLista;
  nombre?: string | null; // usado cuando tipoLista === 'personalizada'
  descripcion?: string | null;
  esPrivada?: boolean;
}

export interface RecommendationRequest {
  userPreferences: string;
  watchedMovies: string[];
  favoriteGenres: string[];
}

export interface MovieRecommendation {
  title: string;
  year: number;
  genre: string;
  director: string;
  rating: number;
  description: string;
  reason: string;
}

export interface ChatRequest {
  message: string;
  conversation: Array<{
    role: 'user' | 'assistant';
    content: string;
  }>;
}

export interface ChatResponse {
  response: string;
  movies: MovieRecommendation[];
  timestamp: string;
}
