import { Sparkles, Wand2, Loader2, MessageSquare } from 'lucide-react';
import { NavBar } from './NavBar';
import { MovieCard } from './MovieCard';
import { Card } from './ui/card';
import { Badge } from './ui/badge';
import { Button } from './ui/button';
import { useState, useEffect, useCallback } from 'react';
import { Chatbot } from './Chatbot';
import { useAuth } from '../contexts/AuthContext';
import { Pelicula } from '../types/api';

interface RecommendationsProps {
  alCerrarSesion: () => void;
}

interface PeliculaIA {
  id?: number;
  titulo: string;
  año: number;
  genero: string;
  director: string;
  rating: number; // Mantenemos 'rating' para compatibilidad con la respuesta de IA
  descripcion: string;
  razon: string;
  poster?: string;
}

const CACHE_RECOMENDACIONES_IA = 'cinex_recomendaciones_ia';
const TIMEOUT_RECOMENDACIONES_IA_MS = 1000 * 10;

// Generar placeholder SVG inline
const generarPlaceholderPoster = (titulo: string) => {
  const tituloMostrar = titulo.length > 20 ? titulo.substring(0, 17) + '...' : titulo;
  const svg = `<svg width="300" height="450" xmlns="http://www.w3.org/2000/svg">
    <rect width="300" height="450" fill="#1a1a1a"/>
    <circle cx="150" cy="180" r="60" fill="#333333"/>
    <polygon points="135,165 135,195 165,180" fill="#ffffff"/>
    <text x="150" y="280" font-family="Arial, sans-serif" font-size="18" fill="#ffffff" text-anchor="middle">${tituloMostrar}</text>
  </svg>`;
  return `data:image/svg+xml,${encodeURIComponent(svg)}`;
};

const cargarRecomendacionesCacheadas = (): PeliculaIA[] | null => {
  try {
    const crudo = localStorage.getItem(CACHE_RECOMENDACIONES_IA);
    if (!crudo) return null;
    const procesado = JSON.parse(crudo);
    if (Array.isArray(procesado?.peliculas)) {
      return procesado.peliculas as PeliculaIA[];
    }
  } catch (err) {
    console.warn('Error al parsear recomendaciones IA cacheadas:', err);
  }
  return null;
};

const persistirCacheRecomendaciones = (peliculas: PeliculaIA[]) => {
  try {
    localStorage.setItem(
      CACHE_RECOMENDACIONES_IA,
      JSON.stringify({ timestamp: Date.now(), peliculas })
    );
  } catch (err) {
    console.warn('Error al persistir cache de recomendaciones IA:', err);
  }
};

const peticionConTimeout = async (entrada: string, opciones: RequestInit, tiempoEsperaMs = TIMEOUT_RECOMENDACIONES_IA_MS) => {
  const controlador = new AbortController();
  const idTimeout = setTimeout(() => controlador.abort(), tiempoEsperaMs);
  try {
    const respuesta = await fetch(entrada, { ...opciones, signal: controlador.signal });
    return respuesta;
  } finally {
    clearTimeout(idTimeout);
  }
};

export function Recommendations({ alCerrarSesion }: RecommendationsProps) {
  const { isAuthenticated, token } = useAuth();
  const [peliculasRecomendadas, setPeliculasRecomendadas] = useState<PeliculaIA[]>([]);
  const [cargando, setCargando] = useState(false);
  const [errorEstado, setErrorEstado] = useState<string | null>(null);
  const [chatbotAbierto, setChatbotAbierto] = useState(false);
  const [peliculasChatbot, setPeliculasChatbot] = useState<PeliculaIA[]>([]);

  // Función para generar recomendaciones con IA
  const generarRecomendaciones = useCallback(async () => {
    setCargando(true);
    setErrorEstado(null);

    try {
      if (!isAuthenticated || !token) {
        setErrorEstado('Debes iniciar sesión para ver recomendaciones personalizadas.');
        setCargando(false);
        return;
      }

      const respuesta = await peticionConTimeout('http://localhost:5000/api/recomendaciones/generate', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({}), // Body vacío, el backend obtiene los datos del usuario
      });

      if (!respuesta.ok) {
        if (respuesta.status === 401) {
          setErrorEstado('Tu sesión ha expirado. Por favor, inicia sesión nuevamente.');
          setCargando(false);
          return;
        }
        throw new Error('Error al generar recomendaciones');
      }

      const recomendaciones: any[] = await respuesta.json();

      // Adaptar respuesta y agregar IDs temporales y posters placeholder
      const peliculasConIds = recomendaciones.map((p, index) => ({
        id: Date.now() + index,
        titulo: p.title || p.titulo,
        año: p.year || p.año,
        genero: p.genre || p.genero,
        director: p.director,
        rating: p.rating,
        descripcion: p.description || p.descripcion,
        razon: p.reason || p.razon,
        poster: generarPlaceholderPoster(p.title || p.titulo)
      }));

      setPeliculasRecomendadas(peliculasConIds);
      persistirCacheRecomendaciones(peliculasConIds);
    } catch (err) {
      console.error('Error:', err);
      setErrorEstado('No se pudieron generar las recomendaciones. Intenta nuevamente más tarde.');
    } finally {
      setCargando(false);
    }
  }, [isAuthenticated, token]);

  // Función para manejar recomendaciones del chatbot
  const manejarRecomendacionChatbot = (peliculas: any[]) => {
    const peliculasAdaptadas: PeliculaIA[] = peliculas.map((p, index) => ({
      id: Date.now() + index,
      titulo: p.title || p.titulo,
      año: p.year || p.año,
      genero: p.genre || p.genero,
      director: p.director,
      rating: p.rating,
      descripcion: p.description || p.descripcion,
      razon: p.reason || p.razon || 'Recomendado por el asistente',
      poster: p.poster || generarPlaceholderPoster(p.title || p.titulo)
    }));

    setPeliculasChatbot(peliculasAdaptadas);
    setChatbotAbierto(false);
  };

  // Generar recomendaciones al cargar el componente
  useEffect(() => {
    const cached = cargarRecomendacionesCacheadas();
    if (cached && cached.length > 0) {
      setPeliculasRecomendadas(cached);
    } else {
      // Solo generar si no hay cache
      if (isAuthenticated) {
        generarRecomendaciones();
      }
    }
  }, [isAuthenticated]);

  return (
    <div className="min-h-screen bg-black">
      <NavBar alCerrarSesion={alCerrarSesion} />

      <div className="container mx-auto px-4 py-8">
        <div className="flex items-center gap-2 mb-6">
          <Sparkles className="size-6 text-yellow-500" />
          <h1 className="text-white text-2xl font-bold">Recomendaciones con IA</h1>
        </div>

        {/* AI Info Card */}
        <Card className="p-6 bg-gradient-to-r from-yellow-950/30 to-yellow-900/20 border-yellow-500/30 mb-8">
          <div className="flex items-start gap-4">
            <div className="p-3 bg-yellow-500/20 rounded-lg">
              <Wand2 className="size-6 text-yellow-500" />
            </div>
            <div className="flex-1">
              <div className="flex justify-between items-start mb-3">
                <div>
                  <h3 className="text-white text-lg font-semibold mb-2">Recomendaciones Personalizadas</h3>
                  <p className="text-gray-300">
                    Basadas en tus películas vistas y calificaciones, nuestra IA selecciona películas que podrían interesarte.
                  </p>
                </div>
                <div className="flex gap-2">
                  <Button 
                    onClick={() => setChatbotAbierto(true)}
                    className="bg-blue-500 hover:bg-blue-600 text-white cursor-pointer"
                  >
                    <MessageSquare className="size-4 mr-2" />
                    Asistente
                  </Button>
                  <Button
                    onClick={generarRecomendaciones}
                    disabled={cargando}
                    className="bg-yellow-500 hover:bg-yellow-600 text-black cursor-pointer"
                  >
                    {cargando ? (
                      <>
                        <Loader2 className="size-4 animate-spin mr-2" />
                        Generando...
                      </>
                    ) : (
                      <>
                        <Sparkles className="size-4 mr-2" />
                        Regenerar
                      </>
                    )}
                  </Button>
                </div>
              </div>

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
                <Badge variant="outline" className="border-blue-500/50 text-blue-500">
                  Chatbot disponible
                </Badge>
              </div>
            </div>
          </div>
        </Card>

        {/* Mensaje de Error */}
        {errorEstado && (
          <Card className="p-4 bg-red-900/20 border-red-500/30 mb-6">
            <p className="text-red-400 text-center">{errorEstado}</p>
          </Card>
        )}

        {/* Grid de Recomendaciones */}
        <div>
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-white text-xl font-semibold">Recomendadas para ti</h2>
            <span className="text-gray-400 text-sm">
              {peliculasRecomendadas.length} películas recomendadas
            </span>
          </div>

          {cargando ? (
            <div className="flex justify-center items-center py-12">
              <Loader2 className="size-12 text-yellow-500 animate-spin" />
            </div>
          ) : peliculasRecomendadas.length > 0 ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
              {peliculasRecomendadas.map((p) => {
                // Adaptar los datos de IA al formato que espera MovieCard
                const peliculaAdaptada: Pelicula = {
                  id: p.id!,
                  titulo: p.titulo,
                  año: p.año,
                  genero: p.genero,
                  director: p.director,
                  puntuacionTMDB: p.rating,
                  puntuacion: p.rating,
                  descripcion: p.descripcion,
                  imagen: p.poster || '/api/placeholder/300/450',
                  duracion: '120 min', // Placeholder
                  reseñas: [],
                  reparto: [],
                  fuentePuntuacion: 'none',
                };

                return (
                  <MovieCard
                    key={p.id}
                    pelicula={peliculaAdaptada}
                  />
                );
              })}
            </div>
          ) : (
            <Card className="p-8 text-center bg-zinc-900 border-zinc-700">
              <Wand2 className="size-12 text-gray-600 mx-auto mb-4" />
              <h3 className="text-white text-lg font-semibold mb-2">No hay recomendaciones</h3>
              <p className="text-gray-400 mb-4">
                Haz click en "Regenerar" para obtener recomendaciones personalizadas
              </p>
              <div className="flex gap-2 justify-center">
                <Button 
                  onClick={() => setChatbotAbierto(true)}
                  className="bg-blue-500 hover:bg-blue-600 text-white cursor-pointer"
                >
                  <MessageSquare className="size-4 mr-2" />
                  Usar Asistente
                </Button>
                <Button
                  onClick={generarRecomendaciones}
                  className="bg-yellow-500 hover:bg-yellow-600 text-black cursor-pointer"
                >
                  <Sparkles className="size-4 mr-2" />
                  Generar Recomendaciones
                </Button>
              </div>
            </Card>
          )}
        </div>

        {/* Sección para mostrar recomendaciones del chatbot */}
        {peliculasChatbot.length > 0 && (
          <div className="mt-8">
            <div className="flex items-center gap-2 mb-4">
              <MessageSquare className="size-5 text-blue-500" />
              <h2 className="text-white text-xl font-semibold">Recomendaciones del Asistente</h2>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
              {peliculasChatbot.map((p) => {
                const peliculaAdaptada: Pelicula = {
                  id: p.id!,
                  titulo: p.titulo,
                  año: p.año,
                  genero: p.genero,
                  director: p.director,
                  puntuacionTMDB: p.rating,
                  puntuacion: p.rating,
                  descripcion: p.descripcion,
                  imagen: p.poster || '/api/placeholder/300/450',
                  duracion: '120 min',
                  reseñas: [],
                  reparto: [],
                  fuentePuntuacion: 'none',
                };

                return (
                  <MovieCard
                    key={p.id}
                    pelicula={peliculaAdaptada}
                  />
                );
              })}
            </div>
          </div>
        )}

        {/* AI Explanation Section */}
        {(peliculasRecomendadas.length > 0 || peliculasChatbot.length > 0) && (
          <Card className="p-6 bg-zinc-900 border-zinc-700 mt-8">
            <h3 className="text-white font-semibold mb-4">¿Cómo funciona nuestra IA?</h3>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="text-center">
                <div className="bg-yellow-500/20 rounded-full size-12 flex items-center justify-center mx-auto mb-2">
                  <span className="text-yellow-500 font-bold">1</span>
                </div>
                <h4 className="text-white font-medium mb-1">Analiza tus gustos</h4>
                <p className="text-gray-400 text-sm">Revisa tu historial de películas vistas y calificadas</p>
              </div>
              <div className="text-center">
                <div className="bg-yellow-500/20 rounded-full size-12 flex items-center justify-center mx-auto mb-2">
                  <span className="text-yellow-500 font-bold">2</span>
                </div>
                <h4 className="text-white font-medium mb-1">Compara patrones</h4>
                <p className="text-gray-400 text-sm">Encuentra similitudes en géneros, directores y temas</p>
              </div>
              <div className="text-center">
                <div className="bg-yellow-500/20 rounded-full size-12 flex items-center justify-center mx-auto mb-2">
                  <span className="text-yellow-500 font-bold">3</span>
                </div>
                <h4 className="text-white font-medium mb-1">Genera recomendaciones</h4>
                <p className="text-gray-400 text-sm">Selecciona películas que coincidan con tus preferencias</p>
              </div>
            </div>
          </Card>
        )}
      </div>

      {/* Botón flotante del chatbot */}
      <Button
        onClick={() => setChatbotAbierto(true)}
        className="fixed bottom-6 right-6 bg-blue-500 hover:bg-blue-600 text-white rounded-full p-4 shadow-lg z-40 size-14 cursor-pointer"
        size="lg"
      >
        <MessageSquare className="size-6" />
      </Button>

      {/* Chatbot */}
      <Chatbot
        abierto={chatbotAbierto}
        alCerrar={() => setChatbotAbierto(false)}
        alRecomendarPeliculas={manejarRecomendacionChatbot}
      />
    </div>
  );
}