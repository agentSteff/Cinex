import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { ArrowLeft, Clock, Calendar, User, BookmarkPlus, Check, Eye, Loader2, Star } from 'lucide-react';
import { toast } from 'sonner';
import { NavBar } from './NavBar';
import { StarRating } from './StarRating';
import { Button } from './ui/button';
import { Badge } from './ui/badge';
import { Card } from './ui/card';
import { ImageWithFallback } from './figma/ImageWithFallback';
import api from '../lib/api';
import { useAuth } from '../contexts/AuthContext';
import { PeliculaBackend, mapearPelicula, Pelicula, CalificacionResponse, MiCalificacionResponse } from '../types/api';

interface MovieDetailProps {
  alCerrarSesion: () => void;
}

export function MovieDetail({ alCerrarSesion }: MovieDetailProps) {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const idPelicula = id ? parseInt(id, 10) : 0;

  const { isAuthenticated } = useAuth();
  const [pelicula, setPelicula] = useState<Pelicula | null>(null);
  const [cargando, setCargando] = useState(true);
  const [errorEstado, setErrorEstado] = useState<string | null>(null);
  
  const [ratingUsuario, setRatingUsuario] = useState(0);
  const [ratingUsuarioId, setRatingUsuarioId] = useState<number | null>(null);
  const [ratingPromedio, setRatingPromedio] = useState(0);
  const [totalRatings, setTotalRatings] = useState(0);
  
  const [enListaPorVer, setEnListaPorVer] = useState(false);
  const [vista, setVista] = useState(false);
  
  const [accionCargando, setAccionCargando] = useState<string | null>(null);

  const volverAtras = () => {
    navigate(-1);
  };

  // Obtener detalles de la película
  useEffect(() => {
    if (!idPelicula) return;

    const obtenerPelicula = async () => {
      try {
        setCargando(true);
        setErrorEstado(null);

        // Primero intentar con fallback de populares/TMDB para evitar 404 del backend para IDs de TMDB
        try {
          const respPopulares = await api.get<any>('/api/peliculas/populares');
          const peliculasPopulares: PeliculaBackend[] = Array.isArray(respPopulares)
            ? respPopulares
            : respPopulares?.data || [];
          const peliculaEncontrada = (peliculasPopulares || []).find(m => m.id === idPelicula || m.tmdbId === idPelicula);
          if (peliculaEncontrada) {
            setPelicula(mapearPelicula(peliculaEncontrada));
            return;
          }
        } catch (err) {
          // ignorar y recurrir al backend
        }

        // Intentar obtener película del backend (si existe en BD)
        try {
          const peliculaBackend = await api.get<PeliculaBackend>(`/api/peliculas/${idPelicula}`);
          setPelicula(mapearPelicula(peliculaBackend));
          return;
        } catch (err: any) {
          // Suprimir 404s esperados del backend (película no guardada aún)
          if (err && err.status && err.status !== 404) {
            console.error('Error inesperado obteniendo película del backend:', err);
          }
        }

        setErrorEstado('Película no encontrada');
      } catch (err: any) {
        console.error('Error obteniendo película:', err);
        setErrorEstado(err.message || 'Error al cargar película');
      } finally {
        setCargando(false);
      }
    };

    obtenerPelicula();
  }, [idPelicula]);

  // Obtener calificaciones y calificación del usuario (si está autenticado)
  useEffect(() => {
    if (!pelicula?.id) return;

    const obtenerCalificaciones = async () => {
      try {
        // Obtener calificación promedio
        const datosRating = await api.get<CalificacionResponse>(`/api/calificaciones/pelicula/${pelicula.id}`);
        setRatingPromedio(datosRating.promedio || 0);
        setTotalRatings(datosRating.total || 0);

        // Obtener calificación del usuario si está autenticado
        if (isAuthenticated) {
          try {
            const datosRatingUsuario = await api.get<MiCalificacionResponse>(`/api/calificaciones/mi-calificacion/${pelicula.id}`);
            if (datosRatingUsuario) {
              setRatingUsuario(datosRatingUsuario.puntuacion);
              setRatingUsuarioId(datosRatingUsuario.id);
            }
          } catch (err) {
            // El usuario no ha calificado esta película aún
            setRatingUsuario(0);
            setRatingUsuarioId(null);
          }
        }
      } catch (err) {
        console.error('Error obteniendo calificaciones:', err);
      }
    };

    obtenerCalificaciones();
  }, [pelicula?.id, isAuthenticated]);

  // Obtener estado en listas (si está autenticado)
  useEffect(() => {
    if (!pelicula?.id || !isAuthenticated) return;

    const obtenerEstadoListas = async () => {
      try {
        const resp = await api.get<any>('/api/listas/mis-listas?include=peliculas');
        const data = resp?.data || resp;

        // Verificar si la película está en lista "por_ver"
        const peliculasPorVer = data.peliculasPorVer || [];
        setEnListaPorVer(peliculasPorVer.some((p: any) => p.id === pelicula.id || p.tmdbId === pelicula.id));

        // Verificar si la película está en lista "vistas"
        const peliculasVistas = data.peliculasVistas || [];
        setVista(peliculasVistas.some((p: any) => p.id === pelicula.id || p.tmdbId === pelicula.id));
      } catch (err) {
        console.error('Error obteniendo estado de listas:', err);
      }
    };

    obtenerEstadoListas();
  }, [pelicula?.id, isAuthenticated]);

  // Manejar cambio de calificación
  const manejarCambioRating = async (nuevoRating: number) => {
    if (!isAuthenticated || !pelicula?.id) return;

    try {
      setAccionCargando('rating');
      
      if (ratingUsuarioId) {
        // Actualizar calificación existente
        await api.put(`/api/calificaciones/${ratingUsuarioId}`, {
          puntuacion: nuevoRating
        });
      } else {
        // Crear nueva calificación
        try {
          const respuesta = await api.post<{ id: number }>('/api/calificaciones', {
            peliculaId: pelicula.id,
            puntuacion: nuevoRating
          });
          setRatingUsuarioId(respuesta.id);
        } catch (err: any) {
          // Si la película no está en BD aún, backend retorna 404 'Película no encontrada'.
          // Intentar persistir la película primero (requiere auth) luego reintentar la calificación.
          if (err && err.status === 404) {
            try {
              // Construir payload para guardar desde TMDB — campos mínimos
              await api.post('/api/peliculas', {
                titulo: pelicula.titulo,
                tmdbId: pelicula.id,
                año: pelicula.año || null,
                genero: pelicula.genero || null,
                director: pelicula.director || null,
                sinopsis: pelicula.descripcion || null,
                imagenUrl: pelicula.imagen || null
              });
              // Reintentar creación de calificación
              const respReintento = await api.post<{ id: number }>('/api/calificaciones', {
                peliculaId: pelicula.id,
                puntuacion: nuevoRating
              });
              setRatingUsuarioId(respReintento.id);
            } catch (errGuardar: any) {
              throw errGuardar;
            }
          } else {
            throw err;
          }
        }
      }
      
      setRatingUsuario(nuevoRating);
      toast.success(`Calificación guardada: ${nuevoRating} estrellas`);
      
      // Refrescar calificación promedio
      const datosRating = await api.get<CalificacionResponse>(`/api/calificaciones/pelicula/${pelicula.id}`);
      setRatingPromedio(datosRating.promedio || 0);
      setTotalRatings(datosRating.total || 0);
    } catch (err: any) {
      console.error('Error guardando calificación:', err);
      toast.error(err.message || 'Error al guardar calificación');
    } finally {
      setAccionCargando(null);
    }
  };

  // Manejar toggle de lista "Por Ver"
  const manejarTogglePorVer = async () => {
    if (!isAuthenticated || !pelicula?.id) return;

    try {
      setAccionCargando('watchlist');
      
      if (enListaPorVer) {
        await api.delete(`/api/listas/por-ver/${pelicula.id}`);
        setEnListaPorVer(false);
        toast.success('Película removida de "Por Ver"');
      } else {
        await api.post(`/api/listas/por-ver/${pelicula.id}`);
        setEnListaPorVer(true);
        toast.success('Película agregada a "Por Ver"');
      }
    } catch (err: any) {
      console.error('Error modificando lista por ver:', err);
      toast.error(err.message || 'Error al modificar lista');
    } finally {
      setAccionCargando(null);
    }
  };

  // Manejar toggle de lista "Vistas"
  const manejarToggleVistas = async () => {
    if (!isAuthenticated || !pelicula?.id) return;

    try {
      setAccionCargando('watched');
      
      if (vista) {
        // Remover de vistas usando DELETE endpoint
        await api.delete(`/api/listas/vistas/${pelicula.id}`);
        setVista(false);
        toast.success('Película removida de "Vistas"');
      } else {
        await api.post(`/api/listas/marcar-vista/${pelicula.id}`);
        setVista(true);
        toast.success('Película marcada como vista');
      }
    } catch (err: any) {
      console.error('Error modificando lista vistas:', err);
      toast.error(err.message || 'Error al modificar lista');
    } finally {
      setAccionCargando(null);
    }
  };

  if (cargando) {
    return (
      <div className="min-h-screen bg-black">
        <NavBar alCerrarSesion={alCerrarSesion} />
        <div className="flex justify-center items-center py-16">
          <Loader2 className="size-8 text-yellow-500 animate-spin" />
          <span className="ml-3 text-gray-400">Cargando película...</span>
        </div>
      </div>
    );
  }

  if (errorEstado || !pelicula) {
    return (
      <div className="min-h-screen bg-black">
        <NavBar alCerrarSesion={alCerrarSesion} />
        <div className="flex flex-col items-center justify-center py-16">
          <p className="text-red-400 mb-4">{errorEstado || 'Película no encontrada'}</p>
          <Button onClick={volverAtras} variant="outline" className="border-yellow-500/30 text-yellow-500 cursor-pointer">
            <ArrowLeft className="size-4 mr-2" />
            Volver
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-black">
      <NavBar alCerrarSesion={alCerrarSesion} />
      
      <div className="container mx-auto px-4 py-8">
        <Button
          variant="ghost"
          onClick={volverAtras}
          className="gap-2 mb-6 text-gray-400 hover:text-white hover:bg-white/5 cursor-pointer"
        >
          <ArrowLeft className="size-4" />
          Volver
        </Button>

        <div className="grid md:grid-cols-[1fr] lg:grid-cols-[320px,1fr] gap-8">
          {/* Poster de Película */}
          <div className="space-y-4">
            <div className="rounded-lg overflow-hidden border border-yellow-500/20 w-fit mx-auto">
                <ImageWithFallback
                  src={pelicula.imagen}
                  alt={pelicula.titulo}
                  className="object-cover"
                  style={{ width: 300, height: 'auto' }}
                />
              </div>

            {/* Botones de Acción */}
            <div className="space-y-2 max-w-[300px] mx-auto">
              <Button
                variant={enListaPorVer ? "default" : "outline"}
                className={`w-full gap-2 cursor-pointer ${
                  enListaPorVer 
                    ? 'bg-yellow-500 text-black hover:bg-yellow-600' 
                    : 'border-yellow-500/30 text-yellow-500 hover:bg-yellow-500/10 hover:text-white'
                }`}
                onClick={manejarTogglePorVer}
                disabled={!isAuthenticated || accionCargando === 'watchlist'}
              >
                {accionCargando === 'watchlist' ? (
                  <>
                    <Loader2 className="size-4 animate-spin" />
                    Procesando...
                  </>
                ) : enListaPorVer ? (
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
                variant={vista ? "default" : "outline"}
                className={`w-full gap-2 cursor-pointer ${
                  vista 
                    ? 'bg-yellow-500 text-black hover:bg-yellow-600' 
                    : 'border-yellow-500/30 text-yellow-500 hover:bg-yellow-500/10 hover:text-white'
                }`}
                onClick={manejarToggleVistas}
                disabled={!isAuthenticated || accionCargando === 'watched'}
              >
                {accionCargando === 'watched' ? (
                  <>
                    <Loader2 className="size-4 animate-spin" />
                    Procesando...
                  </>
                ) : vista ? (
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

          {/* Detalles de Película */}
          <div className="space-y-6">
            <div>
              <h1 className="text-white mb-2">{pelicula.titulo}</h1>
              <div className="flex items-center gap-4 text-gray-400 mb-4">
                <div className="flex items-center gap-2">
                  <Calendar className="size-4" />
                  <span>{pelicula.año}</span>
                </div>
                <div className="flex items-center gap-2">
                  <Clock className="size-4" />
                  <span>{pelicula.duracion}</span>
                </div>
                {pelicula.director && (
                  <div className="flex items-center gap-2">
                    <User className="size-4" />
                    <span>{pelicula.director}</span>
                  </div>
                )}
              </div>
              <Badge>{pelicula.genero}</Badge>
            </div>

            {/* Sección de Calificación */}
            <Card className="p-6 bg-zinc-900 border-yellow-500/20 max-w-2xl space-y-4">
              <div className="grid sm:grid-cols-2 gap-6">
                <div>
                  <p className="text-gray-400 mb-2">Puntuación promedio (Cinex)</p>
                  <div className="flex items-center gap-3">
                    <StarRating calificacion={ratingPromedio} tamano="lg" />
                    <span className="text-white">{ratingPromedio.toFixed(1)}</span>
                    <span className="text-gray-500 text-sm">({totalRatings} {totalRatings === 1 ? 'voto' : 'votos'})</span>
                  </div>
                </div>
                <div>
                  <p className="text-gray-400 mb-2">
                    {isAuthenticated ? 'Tu puntuación' : 'Inicia sesión para calificar'}
                  </p>
                  <div className="flex items-center gap-3">
                    <StarRating
                      calificacion={ratingUsuario}
                      tamano="lg"
                      interactivo={isAuthenticated && accionCargando !== 'rating'}
                      alCambiarCalificacion={manejarCambioRating}
                    />
                    {ratingUsuario > 0 && (
                      <span className="text-white">{ratingUsuario.toFixed(1)}</span>
                    )}
                    {accionCargando === 'rating' && (
                      <Loader2 className="size-4 text-yellow-500 animate-spin" />
                    )}
                  </div>
                </div>
              </div>
              {pelicula.puntuacionTMDB && pelicula.puntuacionTMDB > 0 && (
                <div className="flex items-center gap-3 text-sm text-gray-400 border-t border-yellow-500/20 pt-4">
                  <Star className="size-4 text-sky-400" />
                  <span>Puntaje TMDB:</span>
                  <span className="text-white">{pelicula.puntuacionTMDB.toFixed(1)} / 10</span>
                </div>
              )}
            </Card>

            {/* Descripción */}
            <div>
              <h2 className="text-white mb-3">Descripción</h2>
              <p className="text-gray-300 leading-relaxed">{pelicula.descripcion}</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}