import { Star, Clock, Calendar, Loader2 } from 'lucide-react';
import { Link } from 'react-router-dom';
import { Pelicula } from '../types/api';
import { Badge } from './ui/badge';
import { ImageWithFallback } from './figma/ImageWithFallback';

interface MovieCardProps {
  pelicula: Pelicula;
}

export function MovieCard({ pelicula }: MovieCardProps) {
  const ratingCinexNum = typeof pelicula.puntuacionCinex === 'number' ? Number(pelicula.puntuacionCinex) : NaN;
  const conteoCinexNum = typeof pelicula.conteoPuntuacionCinex === 'number' ? Number(pelicula.conteoPuntuacionCinex) : 0;
  const tieneRatingCinex = !isNaN(ratingCinexNum) && conteoCinexNum > 0;
  const valorMostrar = tieneRatingCinex ? ratingCinexNum.toFixed(1) : '—';
  const tieneRatingTmdb = typeof pelicula.puntuacionTMDB === 'number' && pelicula.puntuacionTMDB > 0;
  const esCinexPendiente = isNaN(ratingCinexNum) && !tieneRatingTmdb;

  return (
    <Link
      to={`/movie/${pelicula.id}`}
      className="block bg-zinc-900 rounded-lg overflow-hidden border border-yellow-500/20 hover:border-yellow-500 transition-all cursor-pointer group"
    >
      <div className="aspect-[2/3] relative overflow-hidden">
        <ImageWithFallback
          src={pelicula.imagen}
          alt={pelicula.titulo}
          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
        />
        <div className="absolute top-2 right-2">
          <Badge
            className={`gap-1 ${tieneRatingCinex ? 'bg-yellow-500 text-black' : 'bg-black/60 border border-white/20 text-gray-200'}`}
          >
            <Star className={`size-3 ${tieneRatingCinex ? 'fill-current' : ''}`} />
            {valorMostrar}
          </Badge>
        </div>
      </div>
      
      <div className="p-4">
        <h3 className="text-white mb-2 line-clamp-1">{pelicula.titulo}</h3>
        <div className="flex items-center gap-3 text-gray-400 mb-2">
          <div className="flex items-center gap-1">
            <Calendar className="size-3" />
            <span className="text-xs">{pelicula.año}</span>
          </div>
          {pelicula.duracion && (
            <div className="flex items-center gap-1">
              <Clock className="size-3" />
              <span className="text-xs">{pelicula.duracion}</span>
            </div>
          )}
        </div>
        <Badge variant="outline" className="text-xs border-yellow-500/30 text-yellow-500">
          {pelicula.genero}
        </Badge>
        <div className="mt-3 text-xs text-gray-400 space-y-1">
          {tieneRatingCinex ? (
            <p>
              Puntaje Cinex • {ratingCinexNum.toFixed(1)} ({conteoCinexNum} {conteoCinexNum === 1 ? 'voto' : 'votos'})
            </p>
          ) : esCinexPendiente ? (
            <p className="flex items-center gap-2">
              <Loader2 className="size-3 animate-spin text-yellow-500" />
              <span>Consultando calificaciones...</span>
            </p>
          ) : (
            <p>Sin calificaciones de Cinex aún</p>
          )}
          {tieneRatingTmdb && (
            <p className="text-gray-500">
              TMDB • {pelicula.puntuacionTMDB!.toFixed(1)} / 10
            </p>
          )}
        </div>
      </div>
    </Link>
  );
}
