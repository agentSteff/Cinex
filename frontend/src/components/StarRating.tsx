import { Star } from 'lucide-react';
import { useState } from 'react';

interface StarRatingProps {
  calificacion: number;
  maximo?: number;
  interactivo?: boolean;
  alCambiarCalificacion?: (calificacion: number) => void;
  tamano?: 'sm' | 'md' | 'lg';
}

export function StarRating({ 
  calificacion, 
  maximo = 5, 
  interactivo = false,
  alCambiarCalificacion,
  tamano = 'md'
}: StarRatingProps) {
  const [calificacionHover, setCalificacionHover] = useState(0);

  const clasesTamano = {
    sm: 'size-4',
    md: 'size-5',
    lg: 'size-6'
  };

  const manejarClick = (valor: number) => {
    if (interactivo && alCambiarCalificacion) {
      alCambiarCalificacion(valor);
    }
  };

  const manejarMouseEnter = (valor: number) => {
    if (interactivo) {
      setCalificacionHover(valor);
    }
  };

  const manejarMouseLeave = () => {
    if (interactivo) {
      setCalificacionHover(0);
    }
  };

  return (
    <div className="flex gap-1" onMouseLeave={manejarMouseLeave}>
      {Array.from({ length: maximo }, (_, i) => {
        const valor = i + 1;
        // Usar calificacionHover si está presente, de lo contrario usar la calificación real
        const calificacionEfectiva = calificacionHover > 0 ? calificacionHover : calificacion;
        
        const estaLleno = valor <= calificacionEfectiva;
        // Las estrellas parciales solo tienen sentido para la calificación real, no para el hover (usualmente)
        // Pero si queremos un relleno simple al hacer hover, solo verificamos <= calificacionHover.
        // Si queremos mantener estrellas parciales para la calificación subyacente cuando NO se hace hover:
        const esParcial = calificacionHover === 0 && valor - 0.5 === calificacion;

        return (
          <button
            key={i}
            type="button"
            onClick={() => manejarClick(valor)}
            onMouseEnter={() => manejarMouseEnter(valor)}
            disabled={!interactivo}
            className={interactivo ? 'cursor-pointer hover:scale-110 transition-transform' : ''}
          >
            <Star
              className={`${clasesTamano[tamano]} ${
                estaLleno ? 'fill-yellow-500 text-yellow-500' : 
                esParcial ? 'fill-yellow-500/50 text-yellow-500' :
                'fill-none text-gray-600'
              }`}
            />
          </button>
        );
      })}
    </div>
  );
}