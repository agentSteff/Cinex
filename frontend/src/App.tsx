import { useState, useEffect } from 'react';
import { LoginPage } from './components/LoginPage';
import { HomePage } from './components/HomePage';
import { MovieDetail } from './components/MovieDetail';
import { MyLists } from './components/MyLists';
import { Recommendations } from './components/Recommendations';

type Page = 'login' | 'home' | 'detail' | 'lists' | 'recommendations';

export default function App() {
  const [currentPage, setCurrentPage] = useState<Page>('login');
  const [selectedMovieId, setSelectedMovieId] = useState<number | null>(null);
  const [isLoggedIn, setIsLoggedIn] = useState(false);

  // Mantener sesión si hay token guardado
  useEffect(() => {
    const token = localStorage.getItem('token');
    if (token) {
      setIsLoggedIn(true);
      setCurrentPage('home');
    }
  }, []);

  const handleLogin = () => {
    setIsLoggedIn(true);
    setCurrentPage('home');
  };

  const handleLogout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('usuario');
    setIsLoggedIn(false);
    setSelectedMovieId(null);
    setCurrentPage('login');
  };

  const handleViewMovie = (id: number) => {
    setSelectedMovieId(id);
    setCurrentPage('detail');
  };

  if (!isLoggedIn) {
    return <LoginPage onLogin={handleLogin} />;
  }

  return (
    <div className="min-h-screen bg-black text-white">
      {currentPage === 'home' && (
        <HomePage
          onNavigate={setCurrentPage}
          onViewMovie={handleViewMovie}
          onLogout={handleLogout}
        />
      )}

    {currentPage === 'detail' && selectedMovieId !== null && (
    <MovieDetail
    movieId={selectedMovieId}
    onBack={() => setCurrentPage('home')}
    onNavigate={setCurrentPage}
    onLogout={handleLogout}
     />
    )}

      {currentPage === 'lists' && (
        <MyLists
          onNavigate={setCurrentPage}
          onViewMovie={handleViewMovie}
          onLogout={handleLogout}
        />
      )}

      {currentPage === 'recommendations' && (
        <Recommendations
          onNavigate={setCurrentPage}
          onViewMovie={handleViewMovie}
          onLogout={handleLogout}
        />
      )}
    </div>
  );
}
