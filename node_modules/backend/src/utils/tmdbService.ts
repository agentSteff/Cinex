import axios from 'axios';
import { PeliculaTMDB } from '../types';

const TMDB_API_KEY = process.env.TMDB_API_KEY;
const TMDB_BASE_URL = 'https://api.themoviedb.org/3';

if (!TMDB_API_KEY) {
  console.warn('⚠️  TMDB_API_KEY no configurada en .env');
}

const tmdbClient = axios.create({
  baseURL: TMDB_BASE_URL,
  params: {
    api_key: TMDB_API_KEY,
    language: 'es-ES'
  }
});

interface TMDBMovie {
  id: number;
  title: string;
  release_date: string;
  overview: string;
  poster_path: string | null;
  genre_ids: number[];
  vote_average: number;
}

const mapearPelicula = (movie: TMDBMovie): PeliculaTMDB => ({
  titulo: movie.title,
  año: movie.release_date ? new Date(movie.release_date).getFullYear() : null,
  sinopsis: movie.overview,
  imagenUrl: movie.poster_path 
    ? `https://image.tmdb.org/t/p/w500${movie.poster_path}` 
    : null,
  tmdbId: movie.id,
  calificacionTMDB: movie.vote_average
});

export const buscarPeliculas = async (query: string): Promise<PeliculaTMDB[]> => {
  try {
    const response = await tmdbClient.get('/search/movie', {
      params: { query }
    });
    
    return response.data.results.map(mapearPelicula);
  } catch (error) {
    console.error('Error buscando películas en TMDB:', error);
    throw new Error('Error consultando TMDB API');
  }
};

export const obtenerPeliculasPopulares = async (): Promise<PeliculaTMDB[]> => {
  try {
    const response = await tmdbClient.get('/movie/popular');
    return response.data.results.map(mapearPelicula);
  } catch (error) {
    console.error('Error obteniendo películas populares:', error);
    throw new Error('Error consultando TMDB API');
  }
};

export const obtenerPeliculasTop = async (): Promise<PeliculaTMDB[]> => {
  try {
    const response = await tmdbClient.get('/movie/top_rated');
    return response.data.results.map(mapearPelicula);
  } catch (error) {
    console.error('Error obteniendo top películas:', error);
    throw new Error('Error consultando TMDB API');
  }
};
