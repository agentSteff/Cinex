import api from './api';
import { Pelicula } from '../types/api';

type InfoRating = { promedio: number; total: number };

const cache = new Map<number, InfoRating>();

function esError404Axios(error: any) {
  const status = error?.status || error?.response?.status;
  return status === 404;
}

async function obtenerRating(peliculaId: number): Promise<InfoRating | null> {
  if (cache.has(peliculaId)) return cache.get(peliculaId)!;
  try {
    const resp: any = await api.get(`/api/calificaciones/estadisticas/${peliculaId}`);
    const data = resp?.data ?? resp;
    const promedio = typeof data?.promedio === 'number' ? Number(data.promedio) : null;
    const total = typeof data?.total === 'number' ? Number(data.total) : null;
    if (promedio === null || total === null) {
      // sin datos de cinex
      return null;
    }
    const info = { promedio: Number(promedio), total: Number(total) };
    cache.set(peliculaId, info);
    return info;
  } catch (err: any) {
    if (esError404Axios(err)) return null;
    console.warn('Error obteniendo rating cinex para', peliculaId, err?.message || err);
    return null;
  }
}

export async function obtenerCalificacionesCinex(peliculas: Pelicula[], opciones?: { batchSize?: number }) {
  const batchSize = Math.max(1, opciones?.batchSize ?? 12);
  const resultados: Record<number, InfoRating> = {};

  // Construir lista de ids para obtener (saltar los ya cacheados)
  const idsParaObtener = peliculas
    .map(p => p.id)
    .filter(id => id && !cache.has(id));

  const lotes = [];
  for (let i = 0; i < idsParaObtener.length; i += batchSize) {
    lotes.push(idsParaObtener.slice(i, i + batchSize));
  }

  await Promise.all(
    lotes.map(async lote => {
      const resueltos = await Promise.all(lote.map(id => obtenerRating(id)));
      lote.forEach((id, idx) => {
        const info = resueltos[idx];
        if (info) {
          resultados[id] = info;
        }
      });
    })
  );

  // También incluir entradas cacheadas
  for (const p of peliculas) {
    const id = p.id;
    if (cache.has(id) && !resultados[id]) {
      resultados[id] = cache.get(id)!;
    }
  }

  return resultados;
}

export function obtenerRatingCinexCacheado(peliculaId: number) {
  return cache.get(peliculaId) || null;
}
