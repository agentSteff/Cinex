import { useState } from 'react';
import { Film, Mail, Lock, User, ArrowRight, Sparkles } from 'lucide-react';
import { Button } from './ui/button';
import { Input } from './ui/input';

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

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    onLogin();
  };

  const handleRegister = (e: React.FormEvent) => {
    e.preventDefault();
    onLogin();
  };

  return (
    <div className="min-h-screen bg-black flex">
      {/* Left Side - Branding */}
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
            <div className="space-y-2">
              <h1 className="text-5xl text-white leading-tight">
                Tu catálogo<br />
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
           </ div>

            <div className="bg-white/5 backdrop-blur-sm border border-yellow-500/20 rounded-lg p-4 card-hover">
              <Film className="size-6 text-yellow-500 mb-2" />
              <p className="text-white text-sm">Miles de películas</p>
            </div>
          </div>

          </div>

          <div className="flex gap-8 text-gray-500 text-sm">
            <button className="hover:text-yellow-500 transition-colors">Términos</button>
            <button className="hover:text-yellow-500 transition-colors">Privacidad</button>
            <button className="hover:text-yellow-500 transition-colors">Ayuda</button>
          </div>
        </div>
      </div>

      {/* Right Side - Forms */}
      <div className="flex-1 flex items-center justify-center p-6 lg:p-12">
        <div className="w-full max-w-md">
          {/* Mobile Logo */}
          <div className="lg:hidden flex items-center justify-center gap-3 mb-8">
            <div className="p-2 bg-yellow-500 rounded-lg">
              <Film className="size-6 text-black" />
            </div>
            <span className="text-2xl text-white tracking-tight">CinéList</span>
          </div>

          {/* Toggle Buttons */}
          <div className="flex gap-2 p-1 bg-white/5 rounded-lg mb-8">
            <button
              onClick={() => setIsLogin(true)}
              className={`flex-1 py-3 rounded-md transition-all ${
                isLogin
                  ? 'bg-yellow-500 text-black'
                  : 'text-gray-400 hover:text-white'
              }`}
            >
              Iniciar Sesión
            </button>
            <button
              onClick={() => setIsLogin(false)}
              className={`flex-1 py-3 rounded-md transition-all ${
                !isLogin
                  ? 'bg-yellow-500 text-black'
                  : 'text-gray-400 hover:text-white'
              }`}
            >
              Registrarse
            </button>
          </div>

          {isLogin ? (
            <form onSubmit={handleLogin} className="space-y-5">
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

              <div className="flex items-center justify-between text-sm">
                <label className="flex items-center gap-2 text-gray-400 cursor-pointer">
                  <input type="checkbox" className="rounded border-white/20 bg-white/5" />
                  Recordarme
                </label>
                <button type="button" className="text-yellow-500 hover:text-yellow-400">
                  ¿Olvidaste tu contraseña?
                </button>
              </div>

              <Button
                type="submit"
                className="w-full h-14 bg-yellow-500 hover:bg-yellow-600 text-black rounded-lg gap-2 group"
              >
                Iniciar Sesión
                <ArrowRight className="size-5 group-hover:translate-x-1 transition-transform" />
              </Button>
            </form>
          ) : (
            <form onSubmit={handleRegister} className="space-y-5">
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
              </div>

              <div className="text-sm">
                <label className="flex items-start gap-2 text-gray-400 cursor-pointer">
                  <input type="checkbox" className="mt-1 rounded border-white/20 bg-white/5" required />
                  <span>
                    Acepto los{' '}
                    <button type="button" className="text-yellow-500 hover:text-yellow-400">
                      términos y condiciones
                    </button>
                    {' '}y la{' '}
                    <button type="button" className="text-yellow-500 hover:text-yellow-400">
                      política de privacidad
                    </button>
                  </span>
                </label>
              </div>

              <Button
                type="submit"
                className="w-full h-14 bg-yellow-500 hover:bg-yellow-600 text-black rounded-lg gap-2 group"
              >
                Crear Cuenta
                <ArrowRight className="size-5 group-hover:translate-x-1 transition-transform" />
              </Button>
            </form>
          )}

          <div className="mt-8">
            <div className="relative">
              <div className="absolute inset-0 flex items-center">
                <div className="w-full border-t border-white/10" />
              </div>
              <div className="relative flex justify-center text-sm">
                <span className="px-4 bg-black text-gray-500">O continúa con</span>
              </div>
            </div>

            <div className="mt-6 grid grid-cols-2 gap-3">
              <Button
                type="button"
                variant="outline"
                className="h-12 bg-white/5 border-white/10 text-white hover:bg-white/10 hover:border-yellow-500/50"
              >
                Google
              </Button>
              <Button
                type="button"
                variant="outline"
                className="h-12 bg-white/5 border-white/10 text-white hover:bg-white/10 hover:border-yellow-500/50"
              >
                Apple
              </Button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}