import { Sparkles, Wand2 } from 'lucide-react';
import { NavBar } from './NavBar';
import { MovieCard } from './MovieCard';
import { Card } from './ui/card';
import { Badge } from './ui/badge';
import { movies } from '../data/movies';

interface RecommendationsProps {
  onNavigate: (page: 'home' | 'lists' | 'recommendations') => void;
  onViewMovie: (id: number) => void;
  onLogout: () => void;
}

export function Recommendations({ onNavigate, onViewMovie, onLogout }: RecommendationsProps) {
  // Simulamos recomendaciones basadas en películas similares
  const recommendedMovies = movies.slice(4, 8);

  return (
    <div className="min-h-screen bg-black">
      <NavBar onNavigate={onNavigate} currentPage="recommendations" onLogout={onLogout} />
      
      <div className="container mx-auto px-4 py-8">
        <div className="flex items-center gap-2 mb-6">
          <Sparkles className="size-6 text-yellow-500" />
          <h1 className="text-white">Recomendaciones con IA</h1>
        </div>

        {/* AI Info Card */}
        <Card className="p-6 bg-gradient-to-r from-yellow-950/30 to-yellow-900/20 border-yellow-500/30 mb-8">
          <div className="flex items-start gap-4">
            <div className="p-3 bg-yellow-500/20 rounded-lg">
              <Wand2 className="size-6 text-yellow-500" />
            </div>
            <div className="flex-1">
              <h3 className="text-white mb-2">Recomendaciones Personalizadas</h3>
              <p className="text-gray-300 mb-3">
                Basadas en tus películas vistas y calificaciones, nuestra IA selecciona películas que podrían interesarte.
              </p>
              <div className="flex flex-wrap gap-2">
                <Badge variant="outline" className="border-yellow-500/50 text-yellow-500">
                  Basado en tus gustos
                </Badge>
                <Badge variant="outline" className="border-yellow-500/50 text-yellow-500">
                  Similitudes de género
                </Badge>
                <Badge variant="outline" className="border-yellow-500/50 text-yellow-500">
                  Directores favoritos
                </Badge>
              </div>
            </div>
          </div>
        </Card>

        {/* Recommendations Grid */}
        <div>
          <h2 className="text-white mb-4">Recomendadas para ti</h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
            {recommendedMovies.map((movie) => (
              <MovieCard
                key={movie.id}
                movie={movie}
                onClick={() => onViewMovie(movie.id)}
              />
            ))}
          </div>
        </div>

        {/* Future Features Placeholder */}
        <Card className="p-8 bg-zinc-900 border-yellow-500/20 mt-8 text-center">
          <Sparkles className="size-12 text-gray-600 mx-auto mb-4" />
          <h3 className="text-white mb-2">Próximamente</h3>
          <p className="text-gray-400">
            Más funciones de IA incluyendo análisis de preferencias, 
            descubrimiento inteligente y recomendaciones basadas en estado de ánimo
          </p>
        </Card>
      </div>
    </div>
  );
}