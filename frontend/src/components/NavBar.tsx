import { Film, Home, List, Sparkles, LogOut } from 'lucide-react';
import { Link, useLocation } from 'react-router-dom';
import { Button } from './ui/button';

interface NavBarProps {
  alCerrarSesion: () => void;
}

export function NavBar({ alCerrarSesion }: NavBarProps) {
  const location = useLocation();
  const esActivo = (ruta: string) => location.pathname === ruta;

  return (
    <nav className="bg-black border-b border-yellow-500/20">
      <div className="container mx-auto px-4 py-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-6">
            <Link to="/" className="flex items-center gap-2">
              <div className="p-2 bg-yellow-500 rounded-lg">
                <Film className="size-6 text-black" />
              </div>
              <span className="text-xl text-white tracking-tight">Cinex</span>
            </Link>
            
            <div className="flex gap-2">
              <Button
                asChild
                variant={esActivo('/') ? 'default' : 'ghost'}
                className={`gap-2 ${
                  esActivo('/') 
                    ? 'bg-yellow-500 text-black hover:bg-yellow-600' 
                    : 'text-gray-400 hover:text-white hover:bg-white/5'
                }`}
              >
                <Link to="/">
                  <Home className="size-4" />
                  Inicio
                </Link>
              </Button>
              <Button
                asChild
                variant={esActivo('/lists') ? 'default' : 'ghost'}
                className={`gap-2 ${
                  esActivo('/lists') 
                    ? 'bg-yellow-500 text-black hover:bg-yellow-600' 
                    : 'text-gray-400 hover:text-white hover:bg-white/5'
                }`}
              >
                <Link to="/lists">
                  <List className="size-4" />
                  Mis Listas
                </Link>
              </Button>
              <Button
                asChild
                variant={esActivo('/recommendations') ? 'default' : 'ghost'}
                className={`gap-2 ${
                  esActivo('/recommendations') 
                    ? 'bg-yellow-500 text-black hover:bg-yellow-600' 
                    : 'text-gray-400 hover:text-white hover:bg-white/5'
                }`}
              >
                <Link to="/recommendations">
                  <Sparkles className="size-4" />
                  Recomendaciones
                </Link>
              </Button>
            </div>
          </div>

          <Button
            variant="outline"
            onClick={alCerrarSesion}
            className="gap-2 border-yellow-500/30 text-yellow-500 hover:bg-yellow-500/10 hover:text-white cursor-pointer"
          >
            <LogOut className="size-4" />
            Salir
          </Button>
        </div>
      </div>
    </nav>
  );
}
