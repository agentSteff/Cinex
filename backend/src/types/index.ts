// Tipos de Películas
export interface PeliculaTMDB {
  titulo: string;
  año: number | null;
  sinopsis: string;
  imagenUrl: string | null;
  tmdbId: number;
  calificacionTMDB?: number;
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
}

// Tipos de Lista
export type TipoLista = 'por_ver' | 'vistas';

export interface ListaCreate {
  peliculaId: number;
  tipoLista: TipoLista;
}
