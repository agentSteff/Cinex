// frontend/src/components/Chatbot.tsx
import { useState, useRef, useEffect } from 'react';
import { Send, Bot, User, X } from 'lucide-react';
import { Button } from './ui/button';
import { Card } from './ui/card';
import { Badge } from './ui/badge';

interface Mensaje {
  id: string;
  contenido: string;
  esUsuario: boolean;
  timestamp: Date;
}

interface ChatbotProps {
  abierto: boolean;
  alCerrar: () => void;
  alRecomendarPeliculas: (peliculas: any[]) => void;
}

export function Chatbot({ abierto, alCerrar, alRecomendarPeliculas }: ChatbotProps) {
  const [mensajes, setMensajes] = useState<Mensaje[]>([
    {
      id: '1',
      contenido: '¡Hola! Soy tu asistente de cine. ¿Qué tipo de película te gustaría ver hoy? Por ejemplo: "Quiero una comedia romántica con final feliz" o "Busco una película de sci-fi con buenos efectos visuales"',
      esUsuario: false,
      timestamp: new Date()
    }
  ]);
  const [entrada, setEntrada] = useState('');
  const [cargando, setCargando] = useState(false);
  const finMensajesRef = useRef<HTMLDivElement>(null);

  const scrollAlFondo = () => {
    finMensajesRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollAlFondo();
  }, [mensajes]);

  const enviarMensaje = async () => {
    if (!entrada.trim() || cargando) return;

    const mensajeUsuario: Mensaje = {
      id: Date.now().toString(),
      contenido: entrada,
      esUsuario: true,
      timestamp: new Date()
    };

    setMensajes(prev => [...prev, mensajeUsuario]);
    setEntrada('');
    setCargando(true);

    try {
      const response = await fetch('http://localhost:3001/api/recomendaciones/chat', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          message: entrada, // Backend espera 'message'
          conversation: mensajes.slice(-4).map(m => ({
            role: m.esUsuario ? 'user' : 'assistant',
            content: m.contenido
          }))
        }),
      });

      if (!response.ok) {
        throw new Error('Error en la respuesta del servidor');
      }

      const data = await response.json();

      const mensajeBot: Mensaje = {
        id: (Date.now() + 1).toString(),
        contenido: data.response,
        esUsuario: false,
        timestamp: new Date()
      };

      setMensajes(prev => [...prev, mensajeBot]);

      // Si hay recomendaciones de películas, pasarlas al componente padre
      if (data.movies && data.movies.length > 0) {
        alRecomendarPeliculas(data.movies);
      }

    } catch (error) {
      console.error('Error:', error);
      const mensajeError: Mensaje = {
        id: (Date.now() + 1).toString(),
        contenido: 'Lo siento, hubo un error al procesar tu solicitud. Por favor, intenta de nuevo.',
        esUsuario: false,
        timestamp: new Date()
      };
      setMensajes(prev => [...prev, mensajeError]);
    } finally {
      setCargando(false);
    }
  };

  const manejarTeclaPresionada = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      enviarMensaje();
    }
  };

  if (!abierto) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <Card className="bg-zinc-900 border-yellow-500/30 w-full max-w-2xl h-[600px] flex flex-col">
        {/* Encabezado */}
        <div className="flex items-center justify-between p-4 border-b border-yellow-500/20">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-yellow-500/20 rounded-lg">
              <Bot className="size-5 text-yellow-500" />
            </div>
            <div>
              <h3 className="text-white font-semibold">Asistente de Cine</h3>
              <p className="text-gray-400 text-sm">Recomendaciones personalizadas</p>
            </div>
          </div>
          <Button
            variant="ghost"
            size="icon"
            onClick={alCerrar}
            className="text-gray-400 hover:text-white cursor-pointer"
          >
            <X className="size-4" />
          </Button>
        </div>

        {/* Mensajes */}
        <div className="flex-1 overflow-y-auto p-4 space-y-4">
          {mensajes.map((mensaje) => (
            <div
              key={mensaje.id}
              className={`flex gap-3 ${mensaje.esUsuario ? 'justify-end' : 'justify-start'}`}
            >
              {!mensaje.esUsuario && (
                <div className="flex-shrink-0">
                  <div className="p-2 bg-yellow-500/20 rounded-lg">
                    <Bot className="size-4 text-yellow-500" />
                  </div>
                </div>
              )}
              <div
                className={`max-w-[80%] rounded-lg p-3 ${
                  mensaje.esUsuario
                    ? 'bg-yellow-500 text-black'
                    : 'bg-zinc-800 text-white'
                }`}
              >
                <p className="text-sm whitespace-pre-wrap">{mensaje.contenido}</p>
                <span className={`text-xs mt-1 block ${
                  mensaje.esUsuario ? 'text-gray-700' : 'text-gray-400'
                }`}>
                  {mensaje.timestamp.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                </span>
              </div>
              {mensaje.esUsuario && (
                <div className="flex-shrink-0">
                  <div className="p-2 bg-blue-500/20 rounded-lg">
                    <User className="size-4 text-blue-500" />
                  </div>
                </div>
              )}
            </div>
          ))}
          {cargando && (
            <div className="flex gap-3 justify-start">
              <div className="flex-shrink-0">
                <div className="p-2 bg-yellow-500/20 rounded-lg">
                  <Bot className="size-4 text-yellow-500" />
                </div>
              </div>
              <div className="bg-zinc-800 rounded-lg p-3">
                <div className="flex gap-1">
                  <div className="w-2 h-2 bg-yellow-500 rounded-full animate-bounce"></div>
                  <div className="w-2 h-2 bg-yellow-500 rounded-full animate-bounce" style={{ animationDelay: '0.1s' }}></div>
                  <div className="w-2 h-2 bg-yellow-500 rounded-full animate-bounce" style={{ animationDelay: '0.2s' }}></div>
                </div>
              </div>
            </div>
          )}
          <div ref={finMensajesRef} />
        </div>

        {/* Entrada */}
        <div className="p-4 border-t border-yellow-500/20">
          <div className="flex gap-2">
            <textarea
              value={entrada}
              onChange={(e) => setEntrada(e.target.value)}
              onKeyPress={manejarTeclaPresionada}
              placeholder="Describe qué película quieres ver..."
              className="flex-1 bg-zinc-800 border border-zinc-600 rounded-lg px-3 py-2 text-white placeholder-gray-400 focus:outline-none focus:border-yellow-500 resize-none"
              rows={2}
              disabled={cargando}
            />
            <Button
              onClick={enviarMensaje}
              disabled={!entrada.trim() || cargando}
              className="bg-yellow-500 hover:bg-yellow-600 text-black cursor-pointer"
            >
              <Send className="size-4" />
            </Button>
          </div>
          <div className="flex flex-wrap gap-1 mt-2">
            <Badge 
              variant="outline" 
              className="text-xs cursor-pointer border-yellow-500/30 text-yellow-500 hover:bg-yellow-500/10"
              onClick={() => setEntrada('Quiero una comedia romántica con final feliz')}
            >
              Comedia romántica
            </Badge>
            <Badge 
              variant="outline" 
              className="text-xs cursor-pointer border-yellow-500/30 text-yellow-500 hover:bg-yellow-500/10"
              onClick={() => setEntrada('Busco una película de sci-fi con buenos efectos visuales')}
            >
              Sci-fi
            </Badge>
            <Badge 
              variant="outline" 
              className="text-xs cursor-pointer border-yellow-500/30 text-yellow-500 hover:bg-yellow-500/10"
              onClick={() => setEntrada('Recomiéndame un thriller psicológico con plot twist')}
            >
              Thriller
            </Badge>
            <Badge 
              variant="outline" 
              className="text-xs cursor-pointer border-yellow-500/30 text-yellow-500 hover:bg-yellow-500/10"
              onClick={() => setEntrada('Película de acción con muchas escenas de pelea')}
            >
              Acción
            </Badge>
          </div>
        </div>
      </Card>
    </div>
  );
}