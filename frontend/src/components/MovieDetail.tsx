import { useState } from 'react';
import { ArrowLeft, Clock, Calendar, User, BookmarkPlus, Check, Eye } from 'lucide-react';
import { NavBar } from './NavBar';
import { StarRating } from './StarRating';
import { Button } from './ui/button';
import { Badge } from './ui/badge';
import { Card } from './ui/card';
import { Separator } from './ui/separator';
import { movies } from '../data/movies';
import { ImageWithFallback } from './figma/ImageWithFallback';

interface MovieDetailProps {
  movieId: number;
  onBack: () => void;
  onNavigate: (page: 'home' | 'lists' | 'recommendations') => void;
  onLogout: () => void;
}

export function MovieDetail({ movieId, onBack, onNavigate, onLogout }: MovieDetailProps) {
  const movie = movies.find(m => m.id === movieId);
  const [userRating, setUserRating] = useState(movie?.userRating || 0);
  const [isInWatchlist, setIsInWatchlist] = useState(movie?.isWatchlist || false);
  const [isWatched, setIsWatched] = useState(movie?.isWatched || false);

  if (!movie) {
    return (
      <div className="min-h-screen bg-gray-950 flex items-center justify-center">
        <p className="text-gray-400">Película no encontrada</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-black">
      <NavBar onNavigate={onNavigate} onLogout={onLogout} />
      
      <div className="container mx-auto px-4 py-8">
        <Button
          variant="ghost"
          onClick={onBack}
          className="gap-2 mb-6 text-gray-400 hover:text-white hover:bg-white/5"
        >
          <ArrowLeft className="size-4" />
          Volver
        </Button>

        <div className="grid md:grid-cols-[300px,1fr] gap-8">
          {/* Movie Poster */}
          <div className="space-y-4">
            <div className="aspect-[2/3] rounded-lg overflow-hidden border border-yellow-500/20">
              <ImageWithFallback
                src={movie.image}
                alt={movie.title}
                className="w-full h-full object-cover"
              />
            </div>

            {/* Action Buttons */}
            <div className="space-y-2">
              <Button
                variant={isInWatchlist ? "default" : "outline"}
                className={`w-full gap-2 ${
                  isInWatchlist 
                    ? 'bg-yellow-500 text-black hover:bg-yellow-600' 
                    : 'border-yellow-500/30 text-yellow-500 hover:bg-yellow-500/10'
                }`}
                onClick={() => setIsInWatchlist(!isInWatchlist)}
              >
                {isInWatchlist ? (
                  <>
                    <Check className="size-4" />
                    En mi lista
                  </>
                ) : (
                  <>
                    <BookmarkPlus className="size-4" />
                    Agregar a "Por Ver"
                  </>
                )}
              </Button>

              <Button
                variant={isWatched ? "default" : "outline"}
                className={`w-full gap-2 ${
                  isWatched 
                    ? 'bg-yellow-500 text-black hover:bg-yellow-600' 
                    : 'border-yellow-500/30 text-yellow-500 hover:bg-yellow-500/10'
                }`}
                onClick={() => setIsWatched(!isWatched)}
              >
                {isWatched ? (
                  <>
                    <Check className="size-4" />
                    Ya la vi
                  </>
                ) : (
                  <>
                    <Eye className="size-4" />
                    Marcar como vista
                  </>
                )}
              </Button>
            </div>
          </div>

          {/* Movie Details */}
          <div className="space-y-6">
            <div>
              <h1 className="text-white mb-2">{movie.title}</h1>
              <div className="flex items-center gap-4 text-gray-400 mb-4">
                <div className="flex items-center gap-2">
                  <Calendar className="size-4" />
                  <span>{movie.year}</span>
                </div>
                <div className="flex items-center gap-2">
                  <Clock className="size-4" />
                  <span>{movie.duration}</span>
                </div>
                <div className="flex items-center gap-2">
                  <User className="size-4" />
                  <span>{movie.director}</span>
                </div>
              </div>
              <Badge>{movie.genre}</Badge>
            </div>

            {/* Rating Section */}
            <Card className="p-6 bg-zinc-900 border-yellow-500/20">
              <div className="grid md:grid-cols-2 gap-6">
                <div>
                  <p className="text-gray-400 mb-2">Puntuación promedio</p>
                  <div className="flex items-center gap-3">
                    <StarRating rating={movie.rating} size="lg" />
                    <span className="text-white">{movie.rating.toFixed(1)}</span>
                  </div>
                </div>
                <div>
                  <p className="text-gray-400 mb-2">Tu puntuación</p>
                  <div className="flex items-center gap-3">
                    <StarRating
                      rating={userRating}
                      size="lg"
                      interactive
                      onRatingChange={setUserRating}
                    />
                    {userRating > 0 && (
                      <span className="text-white">{userRating.toFixed(1)}</span>
                    )}
                  </div>
                </div>
              </div>
            </Card>

            {/* Description */}
            <div>
              <h2 className="text-white mb-3">Descripción</h2>
              <p className="text-gray-300 leading-relaxed">{movie.description}</p>
            </div>

            {/* Reviews */}
            <div>
              <h2 className="text-white mb-4">Reseñas ({movie.reviews.length})</h2>
              <div className="space-y-4">
                {movie.reviews.map((review) => (
                  <Card key={review.id} className="p-4 bg-zinc-900 border-yellow-500/20">
                    <div className="flex items-start justify-between mb-2">
                      <div>
                        <p className="text-white">{review.user}</p>
                        <p className="text-gray-400 text-xs">{review.date}</p>
                      </div>
                      <StarRating rating={review.rating} size="sm" />
                    </div>
                    <Separator className="my-3 bg-yellow-500/20" />
                    <p className="text-gray-300">{review.comment}</p>
                  </Card>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}