import { useAuth } from './contexts/AuthContext';
import { Routes, Route, Navigate } from 'react-router-dom';
import { LoginPage } from './components/LoginPage';
import { HomePage } from './components/HomePage';
import { MovieDetail } from './components/MovieDetail';
import { MyLists } from './components/MyLists';
import { Recommendations } from './components/Recommendations';

export default function App() {
  const { isAuthenticated, cargando, logout } = useAuth();

  // Mostrar estado de carga mientras se valida el token
  if (cargando) {
    return (
      <div className="min-h-screen bg-black flex items-center justify-center">
        <div className="text-white text-xl">Cargando...</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-black text-white">
      <Routes>
        <Route 
          path="/login" 
          element={!isAuthenticated ? <LoginPage /> : <Navigate to="/" />} 
        />
        
        <Route 
          path="/" 
          element={isAuthenticated ? <HomePage alCerrarSesion={logout} /> : <Navigate to="/login" />} 
        />
        
        <Route 
          path="/lists" 
          element={isAuthenticated ? <MyLists alCerrarSesion={logout} /> : <Navigate to="/login" />} 
        />
        
        <Route 
          path="/recommendations" 
          element={isAuthenticated ? <Recommendations alCerrarSesion={logout} /> : <Navigate to="/login" />} 
        />
        
        <Route 
          path="/movie/:id" 
          element={isAuthenticated ? <MovieDetail alCerrarSesion={logout} /> : <Navigate to="/login" />} 
        />

        <Route path="*" element={<Navigate to="/" />} />
      </Routes>
    </div>
  );
}
