'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { api } from '@/lib/api';
import LoadingSpinner from '@/components/LoadingSpinner';

export default function Home() {
  const router = useRouter();
  const [isLogin, setIsLogin] = useState(true);
  const [email, setEmail] = useState('');
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
    const token = localStorage.getItem('token');
    if (token) {
      router.push('/chat');
    }
  }, [router]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      let result;
      if (isLogin) {
        result = await api.login({ email, password });
      } else {
        result = await api.register({ email, username, password });
      }
      localStorage.setItem('token', result.token);
      localStorage.setItem('user', JSON.stringify(result.user));
      router.push('/chat');
    } catch (err: any) {
      setError(err.message || 'Error al conectar con el servidor');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div
      className="min-h-screen flex items-center justify-center p-4 relative overflow-hidden"
      style={{ background: 'var(--bg-primary)' }}
    >
      <div
        className="absolute inset-0 opacity-30"
        style={{
          background: 'radial-gradient(ellipse at center top, var(--accent-muted) 0%, transparent 60%)',
        }}
      />

      <div
        className={`w-full max-w-md relative transition-all duration-500 ${mounted ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4'}`}
      >
        <div className="text-center mb-8">
          <div className="w-16 h-16 mx-auto mb-4 rounded-2xl flex items-center justify-center text-white text-2xl font-bold" style={{ background: 'var(--accent)', boxShadow: 'var(--shadow-glow)' }}>
            RC
          </div>
          <h1 className="text-3xl font-bold mb-2" style={{ fontFamily: 'var(--font-heading)', color: 'var(--text-primary)' }}>
            Railway Chat
          </h1>
          <p style={{ color: 'var(--text-muted)' }}>
            Plataforma de mensajeria en tiempo real
          </p>
        </div>

        <div
          className="rounded-2xl p-6"
          style={{
            background: 'var(--bg-secondary)',
            border: '1px solid var(--border)',
            boxShadow: 'var(--shadow-lg)',
          }}
        >
          <div className="flex mb-6 rounded-xl overflow-hidden" style={{ background: 'var(--bg-tertiary)' }}>
            <button
              onClick={() => { setIsLogin(true); setError(''); }}
              className="flex-1 py-2.5 text-sm font-medium transition-all duration-200"
              style={{
                background: isLogin ? 'var(--accent)' : 'transparent',
                color: isLogin ? 'white' : 'var(--text-muted)',
              }}
            >
              Iniciar Sesion
            </button>
            <button
              onClick={() => { setIsLogin(false); setError(''); }}
              className="flex-1 py-2.5 text-sm font-medium transition-all duration-200"
              style={{
                background: !isLogin ? 'var(--accent)' : 'transparent',
                color: !isLogin ? 'white' : 'var(--text-muted)',
              }}
            >
              Registrarse
            </button>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-sm font-medium mb-1.5" style={{ color: 'var(--text-secondary)' }}>
                Email
              </label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                className="w-full"
                placeholder="tu@email.com"
              />
            </div>

            {!isLogin && (
              <div className="animate-slide-up">
                <label className="block text-sm font-medium mb-1.5" style={{ color: 'var(--text-secondary)' }}>
                  Username
                </label>
                <input
                  type="text"
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  required
                  className="w-full"
                  placeholder="tu_usuario"
                  minLength={3}
                  maxLength={30}
                />
              </div>
            )}

            <div>
              <label className="block text-sm font-medium mb-1.5" style={{ color: 'var(--text-secondary)' }}>
                Contrasena
              </label>
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                className="w-full"
                placeholder="Minimo 6 caracteres"
                minLength={6}
              />
            </div>

            {error && (
              <div
                className="p-3 rounded-lg text-sm animate-fade-in"
                style={{ background: 'var(--danger-muted)', color: 'var(--danger)' }}
              >
                {error}
              </div>
            )}

            <button
              type="submit"
              disabled={loading}
              className="w-full py-3 rounded-xl font-medium text-white transition-all duration-200 flex items-center justify-center gap-2"
              style={{
                background: loading ? 'var(--accent-muted)' : 'var(--accent)',
                color: loading ? 'var(--accent)' : 'white',
                boxShadow: loading ? 'none' : '0 0 20px var(--accent-muted)',
              }}
              onMouseEnter={(e) => {
                if (!loading) e.currentTarget.style.background = 'var(--accent-hover)';
              }}
              onMouseLeave={(e) => {
                if (!loading) e.currentTarget.style.background = 'var(--accent)';
              }}
            >
              {loading ? (
                <>
                  <LoadingSpinner size="sm" />
                  Conectando...
                </>
              ) : isLogin ? (
                'Entrar'
              ) : (
                'Crear Cuenta'
              )}
            </button>
          </form>
        </div>

        <p className="text-center text-xs mt-6" style={{ color: 'var(--text-muted)' }}>
          Chat en tiempo real con WebSockets
        </p>
      </div>
    </div>
  );
}
