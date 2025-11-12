import { useState } from 'react';
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

  const handleLogin = () => {
    setIsLoggedIn(true);
    setCurrentPage('home');
  };

  const handleViewMovie = (id: number) => {
    setSelectedMovieId(id);
    setCurrentPage('detail');
  };

  const handleLogout = () => {
    setIsLoggedIn(false);
    setCurrentPage('login');
  };

  if (!isLoggedIn) {
    return <LoginPage onLogin={handleLogin} />;
  }

  return (
    <div className="min-h-screen bg-black">
      {currentPage === 'home' && (
        <HomePage 
          onNavigate={setCurrentPage} 
          onViewMovie={handleViewMovie}
          onLogout={handleLogout}
        />
      )}
      {currentPage === 'detail' && selectedMovieId && (
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