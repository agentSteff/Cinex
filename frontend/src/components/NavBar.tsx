import { Film, Home, List, Sparkles, LogOut } from 'lucide-react';
import { Button } from './ui/button';

interface NavBarProps {
  onNavigate: (page: 'home' | 'lists' | 'recommendations') => void;
  currentPage?: string;
  onLogout: () => void;
}

export function NavBar({ onNavigate, currentPage, onLogout }: NavBarProps) {
  return (
    <nav className="bg-black border-b border-yellow-500/20">
      <div className="container mx-auto px-4 py-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-6">
            <div className="flex items-center gap-2">
              <div className="p-2 bg-yellow-500 rounded-lg">
                <Film className="size-6 text-black" />
              </div>
              <span className="text-xl text-white tracking-tight">CinéList</span>
            </div>
            
            <div className="flex gap-2">
              <Button
                variant={currentPage === 'home' ? 'default' : 'ghost'}
                onClick={() => onNavigate('home')}
                className={`gap-2 ${
                  currentPage === 'home' 
                    ? 'bg-yellow-500 text-black hover:bg-yellow-600' 
                    : 'text-gray-400 hover:text-white hover:bg-white/5'
                }`}
              >
                <Home className="size-4" />
                Inicio
              </Button>
              <Button
                variant={currentPage === 'lists' ? 'default' : 'ghost'}
                onClick={() => onNavigate('lists')}
                className={`gap-2 ${
                  currentPage === 'lists' 
                    ? 'bg-yellow-500 text-black hover:bg-yellow-600' 
                    : 'text-gray-400 hover:text-white hover:bg-white/5'
                }`}
              >
                <List className="size-4" />
                Mis Listas
              </Button>
              <Button
                variant={currentPage === 'recommendations' ? 'default' : 'ghost'}
                onClick={() => onNavigate('recommendations')}
                className={`gap-2 ${
                  currentPage === 'recommendations' 
                    ? 'bg-yellow-500 text-black hover:bg-yellow-600' 
                    : 'text-gray-400 hover:text-white hover:bg-white/5'
                }`}
              >
                <Sparkles className="size-4" />
                Recomendaciones
              </Button>
            </div>
          </div>

          <Button
            variant="outline"
            onClick={onLogout}
            className="gap-2 border-white/10 text-gray-400 hover:text-white hover:bg-white/5 hover:border-yellow-500/50"
          >
            <LogOut className="size-4" />
            Salir
          </Button>
        </div>
      </div>
    </nav>
  );
}