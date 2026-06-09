'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { api } from '@/lib/api';

export default function Home() {
  const router = useRouter();
  const [isLogin, setIsLogin] = useState(true);
  const [email, setEmail] = useState('');
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

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
      setError(err.message || 'Error al conectar');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center p-4" style={{ background: 'var(--bg-primary)' }}>
      <div className="w-full max-w-md">
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold mb-2" style={{ color: 'var(--accent)' }}>ChatApp</h1>
          <p style={{ color: 'var(--text-secondary)' }}>Chat en tiempo real</p>
        </div>

        <div className="rounded-xl p-6" style={{ background: 'var(--bg-secondary)', border: '1px solid var(--border)' }}>
          <div className="flex mb-6 rounded-lg overflow-hidden" style={{ background: 'var(--bg-tertiary)' }}>
            <button
              onClick={() => setIsLogin(true)}
              className="flex-1 py-2 text-sm font-medium transition-colors"
              style={{ background: isLogin ? 'var(--accent)' : 'transparent', color: isLogin ? 'white' : 'var(--text-secondary)' }}
            >
              Iniciar Sesión
            </button>
            <button
              onClick={() => setIsLogin(false)}
              className="flex-1 py-2 text-sm font-medium transition-colors"
              style={{ background: !isLogin ? 'var(--accent)' : 'transparent', color: !isLogin ? 'white' : 'var(--text-secondary)' }}
            >
              Registrarse
            </button>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-sm mb-1" style={{ color: 'var(--text-secondary)' }}>Email</label>
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
              <div>
                <label className="block text-sm mb-1" style={{ color: 'var(--text-secondary)' }}>Username</label>
                <input
                  type="text"
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  required
                  className="w-full"
                  placeholder="tu_usuario"
                />
              </div>
            )}

            <div>
              <label className="block text-sm mb-1" style={{ color: 'var(--text-secondary)' }}>Contraseña</label>
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                className="w-full"
                placeholder="••••••••"
              />
            </div>

            {error && (
              <p className="text-sm" style={{ color: '#ef4444' }}>{error}</p>
            )}

            <button
              type="submit"
              disabled={loading}
              className="w-full py-3 rounded-lg font-medium text-white"
              style={{ background: 'var(--accent)', opacity: loading ? 0.7 : 1 }}
            >
              {loading ? 'Conectando...' : isLogin ? 'Entrar' : 'Crear Cuenta'}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}
