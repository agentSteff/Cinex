import { createContext, useState, useEffect, useContext, ReactNode } from 'react';
import api from '../lib/api';
import { Usuario } from '../types/api';

interface AuthContextType {
  usuario: Usuario | null;
  token: string | null;
  login: (usuario: Usuario, token: string) => void;
  logout: () => void;
  isAuthenticated: boolean;
  cargando: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const [usuario, setUsuario] = useState<Usuario | null>(null);
  const [token, setToken] = useState<string | null>(null);
  const [cargando, setCargando] = useState<boolean>(true);
  const [saltarValidacion, setSaltarValidacion] = useState<boolean>(false);

  // Cargar token y usuario del almacenamiento y validar solicitando perfil
  useEffect(() => {
    const cargar = async () => {
      const tokenAlmacenado = localStorage.getItem('token');
      const usuarioAlmacenado = localStorage.getItem('usuario');

      if (tokenAlmacenado) {
        setToken(tokenAlmacenado);
        if (usuarioAlmacenado) {
          try {
            setUsuario(JSON.parse(usuarioAlmacenado));
          } catch (e) {
            console.error('[AuthContext] Error parseando usuario almacenado:', e);
          }
        }

        // Saltar validación si acabamos de iniciar sesión (para evitar 401 inmediato causando recarga)
        if (saltarValidacion) {
          console.log('[AuthContext] Saltando validación (acabamos de iniciar sesión)');
          setSaltarValidacion(false);
          setCargando(false);
          return;
        }

        // Validar token obteniendo perfil
        try {
          console.log('[AuthContext] Validando token con /api/auth/perfil');
          const perfil = await api.get<Usuario>('/api/auth/perfil');
          if (perfil && perfil.id) {
            setUsuario(perfil);
            // Actualizar localStorage con datos frescos del usuario
            localStorage.setItem('usuario', JSON.stringify(perfil));
            console.log('[AuthContext] Token validado exitosamente');
          }
        } catch (err) {
          // Token es inválido o expirado
          console.error('[AuthContext] Validación de token fallida:', err);
          localStorage.removeItem('token');
          localStorage.removeItem('usuario');
          setToken(null);
          setUsuario(null);
        }
      }

      setCargando(false);
    };

    cargar();
  }, [saltarValidacion]);

  const login = (nuevoUsuario: Usuario, nuevoToken: string) => {
    console.log('[AuthContext] login llamado', { nuevoUsuario, nuevoToken });
    localStorage.setItem('token', nuevoToken);
    localStorage.setItem('usuario', JSON.stringify(nuevoUsuario));
    setToken(nuevoToken);
    setUsuario(nuevoUsuario);
    // Saltar validación en la próxima carga ya que acabamos de obtener un token fresco
    setSaltarValidacion(true);
  };

  const logout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('usuario');
    setToken(null);
    setUsuario(null);
  };

  const isAuthenticated = !!token && !!usuario;

  return (
    <AuthContext.Provider value={{ usuario, token, login, logout, isAuthenticated, cargando }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth debe ser usado dentro de un AuthProvider');
  }
  return context;
};
