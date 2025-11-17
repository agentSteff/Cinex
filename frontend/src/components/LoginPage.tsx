import { useState, FormEvent } from 'react';
import { Film, Mail, Lock, User, ArrowRight, Sparkles } from 'lucide-react';
import { Button } from './ui/button';
import { Input } from './ui/input';

const API_BASE_URL = 'http://localhost:5000';  // BACKEND EN 5000

interface LoginPageProps {
  onLogin: () => void;
}

export function LoginPage({ onLogin }: LoginPageProps) {
  const [isLogin, setIsLogin] = useState(true);
  const [loginEmail, setLoginEmail] = useState('');
  const [loginPassword, setLoginPassword] = useState('');
  const [registerName, setRegisterName] = useState('');
  const [registerEmail, setRegisterEmail] = useState('');
  const [registerPassword, setRegisterPassword] = useState('');

  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  // LOGIN
  const handleLogin = async (e: FormEvent) => {
    e.preventDefault();
    setError(null);
    setLoading(true);

    try {
      const res = await fetch(`${API_BASE_URL}/api/auth/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          email: loginEmail,
          password: loginPassword,
        }),
      });

      const data = await res.json();
      console.log('LOGIN RESPONSE:', data);

      if (!res.ok) {
        throw new Error(data.error || 'Error al iniciar sesión');
      }

      // Guardar token y usuario
      localStorage.setItem('token', data.token);
      localStorage.setItem('usuario', JSON.stringify(data.usuario));

      console.log('TOKEN:', data.token);
      console.log('USUARIO:', data.usuario);
      console.log('LLAMANDO onLogin()...');

      onLogin(); // Esto manda al Home en App.tsx
    } catch (err: any) {
      console.error('ERROR LOGIN:', err);
      setError(err.message || 'Error al iniciar sesión');
    } finally {
      setLoading(false);
    }
  };

  // REGISTER
  const handleRegister = async (e: FormEvent) => {
  e.preventDefault();
  setError(null);
  setLoading(true);

  try {
    const res = await fetch(`${API_BASE_URL}/api/auth/register`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        username: registerName,
        email: registerEmail,
        password: registerPassword,
      }),
    });

    const data = await res.json();

    if (!res.ok) {
      throw new Error(data.error || 'Error al registrarse');
    }

    // YA NO ENTRA AUTOMÁTICAMENTE
    // localStorage.setItem('token', data.token);
    // localStorage.setItem('usuario', JSON.stringify(data.usuario));

    // CAMBIO IMPORTANTE:
    setIsLogin(true);  // ← TE LLEVA A INICIAR SESIÓN

    setError("Cuenta creada correctamente. Ahora inicia sesión.");
  } catch (err: any) {
    setError(err.message || 'Error al registrarse');
  } finally {
    setLoading(false);
  }
};
  return (
    <div className="min-h-screen bg-black flex">

      {/* Left Branding */}
      <div className="hidden lg:flex lg:w-1/2 bg-gradient-to-br from-black via-yellow-950/20 to-black relative overflow-hidden">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_30%_50%,rgba(234,179,8,0.1),transparent_50%)]" />
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_70%_70%,rgba(234,179,8,0.05),transparent_50%)]" />

        <div className="relative z-10 flex flex-col justify-between p-12 w-full">
          <div className="flex items-center gap-3">
            <div className="p-3 bg-yellow-500 rounded-lg">
              <Film className="size-8 text-black" />
            </div>
            <span className="text-3xl text-white tracking-tight">Cinex</span>
          </div>

          <div className="space-y-6">
            <h1 className="text-5xl text-white leading-tight">
              Tu catálogo <br />
              <span className="text-yellow-500">cinematográfico</span>
            </h1>
            <p className="text-xl text-gray-400 max-w-md">
              Descubre, califica y organiza películas con elegancia
            </p>

            <div className="grid grid-cols-2 gap-4 max-w-lg">
              <div className="bg-white/5 backdrop-blur-sm border border-yellow-500/20 rounded-lg p-4">
                <Sparkles className="size-6 text-yellow-500 mb-2" />
                <p className="text-white text-sm">Recomendaciones IA</p>
              </div>

              <div className="bg-white/5 backdrop-blur-sm border border-yellow-500/20 rounded-lg p-4">
                <Film className="size-6 text-yellow-500 mb-2" />
                <p className="text-white text-sm">Miles de películas</p>
              </div>
            </div>
          </div>

          <div className="flex gap-8 text-gray-500 text-sm">
            <button className="hover:text-yellow-500">Términos</button>
            <button className="hover:text-yellow-500">Privacidad</button>
            <button className="hover:text-yellow-500">Ayuda</button>
          </div>
        </div>
      </div>

      {/* Right Forms */}
      <div className="flex-1 flex items-center justify-center p-6 lg:p-12">
        <div className="w-full max-w-md">

          {/* Toggle Login / Register */}
          <div className="flex gap-2 p-1 bg-white/5 rounded-lg mb-8">
            <button
              onClick={() => setIsLogin(true)}
              className={`flex-1 py-3 rounded-md transition-all ${
                isLogin ? 'bg-yellow-500 text-black' : 'text-gray-400 hover:text-white'
              }`}
            >
              Iniciar Sesión
            </button>

            <button
              onClick={() => setIsLogin(false)}
              className={`flex-1 py-3 rounded-md transition-all ${
                !isLogin ? 'bg-yellow-500 text-black' : 'text-gray-400 hover:text-white'
              }`}
            >
              Registrarse
            </button>
          </div>

          {/* LOGIN FORM */}
          {isLogin ? (
            <form onSubmit={handleLogin} className="space-y-5">

              <div className="space-y-4">
                <div className="relative">
                  <Mail className="absolute left-4 top-1/2 -translate-y-1/2 size-5 text-gray-500" />
                  <Input
                    type="email"
                    placeholder="Correo electrónico"
                    value={loginEmail}
                    onChange={(e) => setLoginEmail(e.target.value)}
                    className="pl-12 bg-white/5 border-white/10 text-white placeholder:text-gray-500 h-14 rounded-lg focus:border-yellow-500"
                    required
                  />
                </div>

                <div className="relative">
                  <Lock className="absolute left-4 top-1/2 -translate-y-1/2 size-5 text-gray-500" />
                  <Input
                    type="password"
                    placeholder="Contraseña"
                    value={loginPassword}
                    onChange={(e) => setLoginPassword(e.target.value)}
                    className="pl-12 bg-white/5 border-white/10 text-white placeholder:text-gray-500 h-14 rounded-lg focus:border-yellow-500"
                    required
                  />
                </div>
              </div>

              <Button
                type="submit"
                disabled={loading}
                className="w-full h-14 bg-yellow-500 hover:bg-yellow-600 text-black rounded-lg gap-2"
              >
                {loading ? 'Ingresando...' : 'Iniciar Sesión'}
                {!loading && <ArrowRight className="size-5" />}
              </Button>

              {error && <p className="text-red-400 text-sm mt-2">{error}</p>}
            </form>
          ) : (
            /* REGISTER FORM */
            <form onSubmit={handleRegister} className="space-y-5">

              <div className="relative">
                <User className="absolute left-4 top-1/2 -translate-y-1/2 size-5 text-gray-500" />
                <Input
                  type="text"
                  placeholder="Nombre completo"
                  value={registerName}
                  onChange={(e) => setRegisterName(e.target.value)}
                  className="pl-12 bg-white/5 border-white/10 text-white placeholder:text-gray-500 h-14 rounded-lg focus:border-yellow-500"
                  required
                />
              </div>

              <div className="relative">
                <Mail className="absolute left-4 top-1/2 -translate-y-1/2 size-5 text-gray-500" />
                <Input
                  type="email"
                  placeholder="Correo electrónico"
                  value={registerEmail}
                  onChange={(e) => setRegisterEmail(e.target.value)}
                  className="pl-12 bg-white/5 border-white/10 text-white placeholder:text-gray-500 h-14 rounded-lg focus:border-yellow-500"
                  required
                />
              </div>

              <div className="relative">
                <Lock className="absolute left-4 top-1/2 -translate-y-1/2 size-5 text-gray-500" />
                <Input
                  type="password"
                  placeholder="Contraseña"
                  value={registerPassword}
                  onChange={(e) => setRegisterPassword(e.target.value)}
                  className="pl-12 bg-white/5 border-white/10 text-white placeholder:text-gray-500 h-14 rounded-lg focus:border-yellow-500"
                  required
                />
              </div>

              <Button
                type="submit"
                disabled={loading}
                className="w-full h-14 bg-yellow-500 hover:bg-yellow-600 text-black rounded-lg gap-2"
              >
                {loading ? 'Creando cuenta...' : 'Crear cuenta'}
                {!loading && <ArrowRight className="size-5" />}
              </Button>

              {error && <p className="text-red-400 text-sm mt-2">{error}</p>}
            </form>
          )}
        </div>
      </div>
    </div>
  );
}
