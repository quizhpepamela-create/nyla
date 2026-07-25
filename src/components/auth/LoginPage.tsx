import React, { useState } from 'react';
import { ViewState } from '../../types';
import { useAuth } from '../../context/AuthContext';

interface LoginPageProps {
  setView: (view: ViewState) => void;
}

export default function LoginPage({ setView }: LoginPageProps) {
  const { login } = useAuth();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setSubmitting(true);
    try {
      await login(email, password);
      setView('dashboard');
    } catch (err: any) {
      setError(err.message || 'No se pudo iniciar sesión.');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-editorial-bg flex items-center justify-center p-6">
      <div className="w-full max-w-md bg-white border border-editorial-border rounded-[32px] p-8 space-y-6">
        <div className="text-center space-y-1">
          <h1 className="text-3xl font-serif font-black text-editorial-text">NYLA.</h1>
          <p className="text-xs text-editorial-muted">Inicia sesión en tu cuenta</p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-1.5">
            <label className="text-[10px] font-bold text-editorial-muted uppercase tracking-wider">Correo electrónico</label>
            <input
              type="email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full bg-editorial-bg border border-editorial-border rounded-xl p-3 text-sm focus:ring-1 focus:ring-editorial-text focus:outline-none"
              placeholder="tu@correo.com"
            />
          </div>

          <div className="space-y-1.5">
            <label className="text-[10px] font-bold text-editorial-muted uppercase tracking-wider">Contraseña</label>
            <input
              type="password"
              required
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full bg-editorial-bg border border-editorial-border rounded-xl p-3 text-sm focus:ring-1 focus:ring-editorial-text focus:outline-none"
              placeholder="••••••••"
            />
          </div>

          {error && (
            <p className="text-xs text-red-700 bg-red-50 border border-red-200 rounded-xl p-3">{error}</p>
          )}

          <button
            type="submit"
            disabled={submitting}
            className="w-full py-3 bg-editorial-text text-editorial-bg font-bold rounded-full text-[11px] uppercase tracking-[0.15em] hover:opacity-90 transition-all disabled:opacity-50 cursor-pointer border-none"
          >
            {submitting ? 'Ingresando...' : 'Iniciar sesión'}
          </button>
        </form>

        <div className="flex justify-between text-xs text-editorial-muted">
          <button onClick={() => setView('forgot-password')} className="hover:text-editorial-text cursor-pointer bg-transparent border-none underline">
            Olvidé mi contraseña
          </button>
          <button onClick={() => setView('register')} className="hover:text-editorial-text cursor-pointer bg-transparent border-none underline">
            Crear cuenta
          </button>
        </div>

        <button
          onClick={() => setView('landing')}
          className="w-full text-center text-[11px] uppercase tracking-wider font-bold text-editorial-muted hover:text-editorial-text cursor-pointer bg-transparent border-none"
        >
          ← Volver a la portada
        </button>
      </div>
    </div>
  );
}
