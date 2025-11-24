import { useState, useEffect, useRef } from 'react';
import { Search, TrendingUp, Loader2 } from 'lucide-react';
import { NavBar } from './NavBar';
import { MovieCard } from './MovieCard';
import { Input } from './ui/input';
import api from '../lib/api';
import { PeliculaBackend, mapearPelicula, Pelicula } from '../types/api';
import { obtenerCalificacionesCinex } from '../lib/ratings';
import { obtenerLlavePelicula } from '../lib/movieKey';

interface HomePageProps {
  alCerrarSesion: () => void;
}

export function HomePage({ alCerrarSesion }: HomePageProps) {
  const [busqueda, setBusqueda] = useState('');
  const [peliculas, setPeliculas] = useState<Pelicula[]>([]);
  const [cargando, setCargando] = useState(true);
  const [errorEstado, setErrorEstado] = useState<string | null>(null);
  const [busquedaDiferida, setBusquedaDiferida] = useState('');
  const refIdPeticion = useRef(0);

  // Debounce búsqueda (retraso de 300ms)
  useEffect(() => {
    const temporizador = setTimeout(() => {
      setBusquedaDiferida(busqueda);
    }, 300);

    return () => clearTimeout(temporizador);
  }, [busqueda]);

  // Obtener películas populares al montar o buscar cuando cambia la query
  useEffect(() => {
    const obtenerPeliculas = async () => {
      try {
        setCargando(true);
        setErrorEstado(null);

        const idPeticion = refIdPeticion.current + 1;
        refIdPeticion.current = idPeticion;

        let respuesta: any;
        if (busquedaDiferida.trim()) {
          // Buscar películas
          respuesta = await api.get(`/api/peliculas/buscar?q=${encodeURIComponent(busquedaDiferida)}`);
        } else {
          // Obtener películas populares
          respuesta = await api.get('/api/peliculas/populares');
        }

        // Manejar respuesta - puede ser anidada o array directo
        const datos: PeliculaBackend[] = Array.isArray(respuesta) ? respuesta : respuesta.data || [];

        // Convertir formato backend a frontend
        const peliculasConvertidas = datos.map(mapearPelicula);
        setPeliculas(peliculasConvertidas);

        // Visible-first: obtener calificaciones Cinex para las primeras 24 películas sin bloquear render
        const visibles = peliculasConvertidas.slice(0, 24);
        if (visibles.length) {
          obtenerCalificacionesCinex(visibles, { batchSize: 12 })
            .then(mapaRatings => {
              if (refIdPeticion.current !== idPeticion) return;
              setPeliculas(peliculasActuales =>
                peliculasActuales.map(p => {
                  const rating = mapaRatings[p.id];
                  if (rating) {
                    return { ...p, puntuacionCinex: rating.promedio, conteoPuntuacionCinex: rating.total } as Pelicula;
                  }
                  return p;
                })
              );
            })
            .catch(err => {
              if (refIdPeticion.current !== idPeticion) return;
              console.warn('Error obteniendo lote de calificaciones Cinex:', err);
            });
        }
      } catch (err: any) {
        console.error('Error obteniendo películas:', err);
        setErrorEstado(err.message || 'Error al cargar películas');
        setPeliculas([]);
      } finally {
        setCargando(false);
      }
    };

    obtenerPeliculas();

    return () => {
      refIdPeticion.current += 1;
    };
  }, [busquedaDiferida]);

  return (
    <div className="min-h-screen bg-black">
      <NavBar alCerrarSesion={alCerrarSesion} />
      
      <div className="container mx-auto px-4 py-8">
        {/* Sección Hero */}
        <div className="mb-8">
          <div className="flex items-center gap-2 mb-6">
            <TrendingUp className="size-6 text-yellow-500" />
            <h1 className="text-white text-2xl font-bold">Películas Populares</h1>
          </div>
          <p className="text-gray-400 mb-6">
            Descubre, califica y organiza tus películas favoritas
          </p>
          
          {/* Barra de Búsqueda */}
          <div className="relative max-w-xl">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 size-5 text-gray-400" />
            <Input
              type="text"
              placeholder="Buscar películas por título, género o director..."
              value={busqueda}
              onChange={(e) => setBusqueda(e.target.value)}
              className="pl-10 text-black placeholder-black"
              aria-label="Buscar películas"
            />
          </div>
        </div>

        {/* Estado de Carga */}
        {cargando && (
          <div className="flex justify-center items-center py-16">
            <Loader2 className="size-8 text-yellow-500 animate-spin" />
            <span className="ml-3 text-gray-400">Cargando películas...</span>
          </div>
        )}

        {/* Estado de Error */}
        {errorEstado && !cargando && (
          <div className="text-center py-16">
            <p className="text-red-400 mb-2">Error al cargar películas</p>
            <p className="text-gray-500 text-sm">{errorEstado}</p>
          </div>
        )}

        {/* Grid de Películas */}
        {!cargando && !errorEstado && (
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
            {peliculas.map((pelicula) => (
              <MovieCard
                key={obtenerLlavePelicula(pelicula)}
                pelicula={pelicula}
              />
            ))}
          </div>
        )}

        {/* Estado Vacío */}
        {!cargando && !errorEstado && peliculas.length === 0 && (
          <div className="text-center py-16">
            <p className="text-gray-400">
              {busqueda ? 'No se encontraron películas que coincidan con tu búsqueda' : 'No hay películas disponibles'}
            </p>
          </div>
        )}
      </div>
    </div>
  );
}