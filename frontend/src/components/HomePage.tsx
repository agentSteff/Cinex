import { useState } from 'react';
import { Search, TrendingUp } from 'lucide-react';
import { NavBar } from './NavBar';
import { MovieCard } from './MovieCard';
import { Input } from './ui/input';
import { movies } from '../data/movies';

interface HomePageProps {
  onNavigate: (page: 'home' | 'lists' | 'recommendations') => void;
  onViewMovie: (id: number) => void;
  onLogout: () => void;
}

export function HomePage({ onNavigate, onViewMovie, onLogout }: HomePageProps) {
  const [searchQuery, setSearchQuery] = useState('');

  const filteredMovies = movies.filter(movie =>
    movie.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
    movie.genre.toLowerCase().includes(searchQuery.toLowerCase()) ||
    movie.director.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="min-h-screen bg-black">
      <NavBar onNavigate={onNavigate} currentPage="home" onLogout={onLogout} />
      
      <div className="container mx-auto px-4 py-8">
        {/* Hero Section */}
        <div className="mb-8">
          <div className="flex items-center gap-2 mb-4">
            <TrendingUp className="size-6 text-yellow-500" />
            <h1 className="text-white">Películas Populares</h1>
          </div>
          <p className="text-gray-400 mb-6">
            Descubre, califica y organiza tus películas favoritas
          </p>
          
          {/* Search Bar */}
          <div className="relative max-w-xl">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 size-5 text-gray-400" />
            <Input
              type="text"
              placeholder="Buscar películas por título, género o director..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10"
            />
          </div>
        </div>

        {/* Movies Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
          {filteredMovies.map((movie) => (
            <MovieCard
              key={movie.id}
              movie={movie}
              onClick={() => onViewMovie(movie.id)}
            />
          ))}
        </div>

        {filteredMovies.length === 0 && (
          <div className="text-center py-16">
            <p className="text-gray-400">
              No se encontraron películas que coincidan con tu búsqueda
            </p>
          </div>
        )}
      </div>
    </div>
  );
}