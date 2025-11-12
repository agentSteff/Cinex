import { useState } from 'react';
import { BookmarkPlus, Eye } from 'lucide-react';
import { NavBar } from './NavBar';
import { MovieCard } from './MovieCard';
import { Tabs, TabsContent, TabsList, TabsTrigger } from './ui/tabs';
import { movies } from '../data/movies';

interface MyListsProps {
  onNavigate: (page: 'home' | 'lists' | 'recommendations') => void;
  onViewMovie: (id: number) => void;
  onLogout: () => void;
}

export function MyLists({ onNavigate, onViewMovie, onLogout }: MyListsProps) {
  // Simulamos algunas películas en las listas
  const watchlistMovies = movies.slice(0, 3);
  const watchedMovies = movies.slice(3, 7);

  return (
    <div className="min-h-screen bg-black">
      <NavBar onNavigate={onNavigate} currentPage="lists" onLogout={onLogout} />
      
      <div className="container mx-auto px-4 py-8">
        <h1 className="text-white mb-6">Mis Listas</h1>

        <Tabs defaultValue="watchlist" className="w-full">
          <TabsList className="mb-6">
            <TabsTrigger value="watchlist" className="gap-2">
              <BookmarkPlus className="size-4" />
              Por Ver ({watchlistMovies.length})
            </TabsTrigger>
            <TabsTrigger value="watched" className="gap-2">
              <Eye className="size-4" />
              Vistas ({watchedMovies.length})
            </TabsTrigger>
          </TabsList>

          <TabsContent value="watchlist">
            {watchlistMovies.length === 0 ? (
              <div className="text-center py-16">
                <BookmarkPlus className="size-12 text-gray-600 mx-auto mb-4" />
                <p className="text-gray-400">
                  No tienes películas en tu lista "Por Ver"
                </p>
                <p className="text-gray-500 text-sm mt-2">
                  Agrega películas desde la página principal o el detalle de película
                </p>
              </div>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
                {watchlistMovies.map((movie) => (
                  <MovieCard
                    key={movie.id}
                    movie={movie}
                    onClick={() => onViewMovie(movie.id)}
                  />
                ))}
              </div>
            )}
          </TabsContent>

          <TabsContent value="watched">
            {watchedMovies.length === 0 ? (
              <div className="text-center py-16">
                <Eye className="size-12 text-gray-600 mx-auto mb-4" />
                <p className="text-gray-400">
                  No has marcado ninguna película como vista
                </p>
                <p className="text-gray-500 text-sm mt-2">
                  Marca películas como vistas desde el detalle de película
                </p>
              </div>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
                {watchedMovies.map((movie) => (
                  <MovieCard
                    key={movie.id}
                    movie={movie}
                    onClick={() => onViewMovie(movie.id)}
                  />
                ))}
              </div>
            )}
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}