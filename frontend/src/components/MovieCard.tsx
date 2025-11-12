import { Star, Clock, Calendar } from 'lucide-react';
import { Movie } from '../data/movies';
import { Badge } from './ui/badge';
import { ImageWithFallback } from './figma/ImageWithFallback';

interface MovieCardProps {
  movie: Movie;
  onClick: () => void;
}

export function MovieCard({ movie, onClick }: MovieCardProps) {
  return (
    <div
      onClick={onClick}
      className="bg-zinc-900 rounded-lg overflow-hidden border border-yellow-500/20 hover:border-yellow-500 transition-all cursor-pointer group"
    >
      <div className="aspect-[2/3] relative overflow-hidden">
        <ImageWithFallback
          src={movie.image}
          alt={movie.title}
          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
        />
        <div className="absolute top-2 right-2">
          <Badge className="bg-yellow-500 text-black gap-1">
            <Star className="size-3 fill-current" />
            {movie.rating.toFixed(1)}
          </Badge>
        </div>
      </div>
      
      <div className="p-4">
        <h3 className="text-white mb-2 line-clamp-1">{movie.title}</h3>
        <div className="flex items-center gap-3 text-gray-400 mb-2">
          <div className="flex items-center gap-1">
            <Calendar className="size-3" />
            <span className="text-xs">{movie.year}</span>
          </div>
          <div className="flex items-center gap-1">
            <Clock className="size-3" />
            <span className="text-xs">{movie.duration}</span>
          </div>
        </div>
        <Badge variant="outline" className="text-xs border-yellow-500/30 text-yellow-500">
          {movie.genre}
        </Badge>
      </div>
    </div>
  );
}