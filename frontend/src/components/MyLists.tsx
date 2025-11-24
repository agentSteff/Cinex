import { useState, useEffect } from 'react';
import { Bookmark, Eye, Loader2, List } from 'lucide-react';
import { NavBar } from './NavBar';
import { MovieCard } from './MovieCard';
import { Tabs, TabsContent, TabsList, TabsTrigger } from './ui/tabs';
import api from '../lib/api';
import { PeliculaBackend, mapearPelicula, Pelicula } from '../types/api';
import { obtenerLlavePelicula } from '../lib/movieKey';

interface MyListsProps {
  alCerrarSesion: () => void;
}

export function MyLists({ alCerrarSesion }: MyListsProps) {
  const [peliculasPorVer, setPeliculasPorVer] = useState<Pelicula[]>([]);
  const [peliculasVistas, setPeliculasVistas] = useState<Pelicula[]>([]);
  const [cargando, setCargando] = useState(true);
  const [errorEstado, setErrorEstado] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState(() => localStorage.getItem('cinex_active_list_tab') || 'por_ver');

  const handleTabChange = (value: string) => {
    setActiveTab(value);
    localStorage.setItem('cinex_active_list_tab', value);
  };

  useEffect(() => {
    const obtenerListas = async () => {
      try {
        setCargando(true);
        setErrorEstado(null);

        // Obtener listas del usuario
        const respuesta = await api.get<any>('/api/listas/mis-listas?include=peliculas');
        const data = respuesta?.data || respuesta;

        // Procesar lista "por_ver"
        if (data.peliculasPorVer && Array.isArray(data.peliculasPorVer)) {
          const peliculasBackend: PeliculaBackend[] = data.peliculasPorVer;
          setPeliculasPorVer(peliculasBackend.map(mapearPelicula));
        }

        // Procesar lista "vistas"
        if (data.peliculasVistas && Array.isArray(data.peliculasVistas)) {
          const peliculasBackend: PeliculaBackend[] = data.peliculasVistas;
          setPeliculasVistas(peliculasBackend.map(mapearPelicula));
        }

      } catch (err: any) {
        console.error('Error obteniendo listas:', err);
        setErrorEstado(err.message || 'Error al cargar tus listas');
      } finally {
        setCargando(false);
      }
    };

    obtenerListas();
  }, []);

  return (
    <div className="min-h-screen bg-black">
      <NavBar alCerrarSesion={alCerrarSesion} />
      
      <div className="container mx-auto px-4 py-8">
        <div className="flex items-center gap-2 mb-6">
          <List className="size-6 text-yellow-500" />
          <h1 className="text-white text-2xl font-bold">Mis Listas</h1>
        </div>

        {cargando && (
          <div className="flex justify-center items-center py-16">
            <Loader2 className="size-8 text-yellow-500 animate-spin" />
            <span className="ml-3 text-gray-400">Cargando listas...</span>
          </div>
        )}

        {errorEstado && !cargando && (
          <div className="text-center py-16">
            <p className="text-red-400 mb-2">Error al cargar listas</p>
            <p className="text-gray-500 text-sm">{errorEstado}</p>
          </div>
        )}

        {!cargando && !errorEstado && (
          <Tabs value={activeTab} onValueChange={handleTabChange} className="w-full">
            <TabsList className="bg-zinc-900 border border-yellow-500/20 p-1 mb-8">
              <TabsTrigger 
                value="por_ver"
                className="cursor-pointer data-[state=active]:bg-yellow-500 data-[state=active]:text-black text-gray-400 hover:bg-zinc-800 hover:text-white"
              >
                <Bookmark className="size-4 mr-2" />
                Por Ver ({peliculasPorVer.length})
              </TabsTrigger>
              <TabsTrigger 
                value="vistas"
                className="cursor-pointer data-[state=active]:bg-yellow-500 data-[state=active]:text-black text-gray-400 hover:bg-zinc-800 hover:text-white"
              >
                <Eye className="size-4 mr-2" />
                Vistas ({peliculasVistas.length})
              </TabsTrigger>
            </TabsList>

            <TabsContent value="por_ver">
              {peliculasPorVer.length === 0 ? (
                <div className="text-center py-16 border border-dashed border-gray-800 rounded-lg">
                  <Bookmark className="size-12 text-gray-600 mx-auto mb-4" />
                  <p className="text-gray-400">No tienes películas en tu lista "Por Ver"</p>
                </div>
              ) : (
                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
                  {peliculasPorVer.map((pelicula) => (
                    <MovieCard
                      key={obtenerLlavePelicula(pelicula)}
                      pelicula={pelicula}
                    />
                  ))}
                </div>
              )}
            </TabsContent>

            <TabsContent value="vistas">
              {peliculasVistas.length === 0 ? (
                <div className="text-center py-16 border border-dashed border-gray-800 rounded-lg">
                  <Eye className="size-12 text-gray-600 mx-auto mb-4" />
                  <p className="text-gray-400">No has marcado ninguna película como vista</p>
                </div>
              ) : (
                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
                  {peliculasVistas.map((pelicula) => (
                    <MovieCard
                      key={obtenerLlavePelicula(pelicula)}
                      pelicula={pelicula}
                    />
                  ))}
                </div>
              )}
            </TabsContent>
          </Tabs>
        )}
      </div>
    </div>
  );
}