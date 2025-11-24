import { Pelicula } from '../types/api';

export function obtenerLlavePelicula(pelicula: Pelicula) {
  // Usar id y título para formar una llave estable; el título se incluye para reducir riesgo de colisiones
  return `${pelicula.id}-${pelicula.titulo.replace(/\s+/g, '_')}`;
}
