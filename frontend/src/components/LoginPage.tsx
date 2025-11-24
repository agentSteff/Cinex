import { useState, FormEvent } from 'react';
import { Film, Mail, Lock, User, ArrowRight, Sparkles } from 'lucide-react';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { useAuth } from '../contexts/AuthContext';
import api from '../lib/api';
import { AuthResponse } from '../types/api';

export function LoginPage() {
  const { login } = useAuth();
  const [esLogin, setEsLogin] = useState(true);
  const [emailLogin, setEmailLogin] = useState('');
  const [passwordLogin, setPasswordLogin] = useState('');
  const [nombreRegistro, setNombreRegistro] = useState('');
  const [emailRegistro, setEmailRegistro] = useState('');
  const [passwordRegistro, setPasswordRegistro] = useState('');

  const [error, setError] = useState<string | null>(null);
  const [cargando, setCargando] = useState(false);

  const manejarLogin = async (e: FormEvent) => {
    e.preventDefault();
    setError(null);
    setCargando(true);

    try {
      const data = await api.post<AuthResponse>('/api/auth/login', {
        email: emailLogin,
        password: passwordLogin,
      });

      // Llamar a la función login del AuthContext
      login(data.usuario, data.token);
    } catch (err: any) {
      console.error('[LoginPage] Error de login:', err);
      setError(err.message || 'Error al iniciar sesión');
    } finally {
      setCargando(false);
    }
  };

  const manejarRegistro = async (e: FormEvent) => {
    e.preventDefault();
    setError(null);
    setCargando(true);

    try {
      const data = await api.post<AuthResponse>('/api/auth/register', {
        username: nombreRegistro,
        email: emailRegistro,
        password: passwordRegistro,
      });

      // Llamar a la función login del AuthContext
      login(data.usuario, data.token);
    } catch (err: any) {
      setError(err.message || 'Error al registrarse');
    } finally {
      setCargando(false);
    }
  };

  return (
    <div className="min-h-screen bg-black flex">
      {/* Lado Izquierdo - Branding */}
      <div className="hidden lg:flex lg:w-1/2 bg-gradient-to-br from-black via-yellow-950/20 to-black relative overflow-hidden">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_30%_50%,rgba(234,179,8,0.1),transparent_50%)]" />
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_70%_70%,rgba(234,179,8,0.05),transparent_50%)]" />

        <div className="relative z-10 flex flex-col justify-center items-center p-12 w-full min-h-full">
          <div className="flex items-center gap-3">
            <div className="p-3 bg-yellow-500 rounded-lg">
              <Film className="size-8 text-black" />
            </div>
            <span className="text-3xl text-white tracking-tight">Cinex</span>
          </div>

          <div className="space-y-6">
            <div className="space-y-2">
              <h1 className="text-5xl text-white leading-tight">
                Tu catálogo
                <br />
                <span className="text-yellow-500">cinematográfico</span>
              </h1>
              <p className="text-xl text-gray-400 max-w-md">
                Descubre, califica y organiza películas con elegancia
              </p>
            </div>

            <div className="grid grid-cols-2 gap-4 max-w-lg">
              <div className="bg-white/5 backdrop-blur-sm border border-yellow-500/20 rounded-lg p-4 card-hover">
                <Sparkles className="size-6 text-yellow-500 mb-2" />
                <p className="text-white text-sm">Recomendaciones IA</p>
              </div>

              <div className="bg-white/5 backdrop-blur-sm border border-yellow-500/20 rounded-lg p-4 card-hover">
                <Film className="size-6 text-yellow-500 mb-2" />
                <p className="text-white text-sm">Miles de películas</p>
              </div>
            </div>
          </div>

          <div className="flex gap-8 text-gray-500 text-sm"/>
        </div>
      </div>

      {/* Lado Derecho - Formularios */}
      <div className="flex items-center justify-center lg:justify-start w-full p-6 lg:w-1/2 lg:pl-8 lg:pr-12 lg:py-12">
        <div className="w-full max-w-md">
          {/* Logo Móvil */}
          <div className="lg:hidden flex items-center justify-center gap-3 mb-8">
            <div className="p-2 bg-yellow-500 rounded-lg">
              <Film className="size-6 text-black" />
            </div>
            <span className="text-2xl text-white tracking-tight">Cinex</span>
          </div>

          {/* Botones Toggle */}
          <div className="flex gap-2 p-1 bg-white/5 rounded-lg mb-8">
            <button
              onClick={() => setEsLogin(true)}
              className={`flex-1 py-3 rounded-md transition-all cursor-pointer ${
                esLogin ? 'bg-yellow-500 text-black' : 'text-gray-400 hover:text-white'
              }`}
            >
              Iniciar Sesión
            </button>
            <button
              onClick={() => setEsLogin(false)}
              className={`flex-1 py-3 rounded-md transition-all cursor-pointer ${
                !esLogin ? 'bg-yellow-500 text-black' : 'text-gray-400 hover:text-white'
              }`}
            >
              Registrarse
            </button>
          </div>

          {esLogin ? (
            <form onSubmit={manejarLogin} className="space-y-5">
              <div>
                <h2 className="text-white mb-1">Bienvenido de nuevo</h2>
                <p className="text-gray-400">Ingresa tus credenciales para continuar</p>
              </div>

              <div className="space-y-4">
                <div className="relative">
                  <Mail className="absolute left-4 top-1/2 -translate-y-1/2 size-5 text-gray-500" />
                  <Input
                    type="email"
                    placeholder="Correo electrónico"
                    value={emailLogin}
                    onChange={(e) => setEmailLogin(e.target.value)}
                    className="pl-12 bg-white/5 border-white/10 text-white placeholder:text-gray-500 h-14 rounded-lg focus:border-yellow-500"
                    required
                  />
                </div>

                <div className="relative">
                  <Lock className="absolute left-4 top-1/2 -translate-y-1/2 size-5 text-gray-500" />
                  <Input
                    type="password"
                    placeholder="Contraseña"
                    value={passwordLogin}
                    onChange={(e) => setPasswordLogin(e.target.value)}
                    className="pl-12 bg-white/5 border-white/10 text-white placeholder:text-gray-500 h-14 rounded-lg focus:border-yellow-500"
                    required
                  />
                </div>
              </div>

              <Button
                type="submit"
                disabled={cargando}
                className="w-full h-14 bg-yellow-500 hover:bg-yellow-600 text-black rounded-lg gap-2 group cursor-pointer"
              >
                {cargando ? 'Ingresando...' : 'Iniciar Sesión'}
                {!cargando && (
                  <ArrowRight className="size-5 group-hover:translate-x-1 transition-transform" />
                )}
              </Button>

              {error && <p className="text-red-400 text-sm mt-2">{error}</p>}
            </form>
          ) : (
            <form onSubmit={manejarRegistro} className="space-y-5">
              <div>
                <h2 className="text-white mb-1">Crear cuenta nueva</h2>
                <p className="text-gray-400">Únete a nuestra comunidad cinematográfica</p>
              </div>

              <div className="space-y-4">
                <div className="relative">
                  <User className="absolute left-4 top-1/2 -translate-y-1/2 size-5 text-gray-500" />
                  <Input
                    type="text"
                    placeholder="Nombre completo"
                    value={nombreRegistro}
                    onChange={(e) => setNombreRegistro(e.target.value)}
                    className="pl-12 bg-white/5 border-white/10 text-white placeholder:text-gray-500 h-14 rounded-lg focus:border-yellow-500"
                    required
                  />
                </div>

                <div className="relative">
                  <Mail className="absolute left-4 top-1/2 -translate-y-1/2 size-5 text-gray-500" />
                  <Input
                    type="email"
                    placeholder="Correo electrónico"
                    value={emailRegistro}
                    onChange={(e) => setEmailRegistro(e.target.value)}
                    className="pl-12 bg-white/5 border-white/10 text-white placeholder:text-gray-500 h-14 rounded-lg focus:border-yellow-500"
                    required
                  />
                </div>

                <div className="relative">
                  <Lock className="absolute left-4 top-1/2 -translate-y-1/2 size-5 text-gray-500" />
                  <Input
                    type="password"
                    placeholder="Contraseña"
                    value={passwordRegistro}
                    onChange={(e) => setPasswordRegistro(e.target.value)}
                    className="pl-12 bg-white/5 border-white/10 text-white placeholder:text-gray-500 h-14 rounded-lg focus:border-yellow-500"
                    required
                  />
                </div>
              </div>

              <Button
                type="submit"
                disabled={cargando}
                className="w-full h-14 bg-yellow-500 hover:bg-yellow-600 text-black rounded-lg gap-2 group cursor-pointer"
              >
                {cargando ? 'Registrando...' : 'Crear Cuenta'}
                {!cargando && (
                  <ArrowRight className="size-5 group-hover:translate-x-1 transition-transform" />
                )}
              </Button>

              {error && <p className="text-red-400 text-sm mt-2">{error}</p>}
            </form>
          )}

        </div>
      </div>
    </div>
  );
}
