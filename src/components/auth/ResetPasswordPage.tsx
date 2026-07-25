import React, { useEffect, useState } from 'react';
import { ViewState } from '../../types';

interface ResetPasswordPageProps {
  setView: (view: ViewState) => void;
}

export default function ResetPasswordPage({ setView }: ResetPasswordPageProps) {
  const [email, setEmail] = useState('');
  const [token, setToken] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const [success, setSuccess] = useState(false);

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    setEmail(params.get('email') || '');
    setToken(params.get('token') || '');
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setSubmitting(true);
    try {
      const response = await fetch('/api/auth/reset-password', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, token, password }),
      });
      const data = await response.json();
      if (!response.ok) {
        throw new Error(data.error || 'No se pudo restablecer la contraseña.');
      }
      setSuccess(true);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-editorial-bg flex items-center justify-center p-6">
      <div className="w-full max-w-md bg-white border border-editorial-border rounded-[32px] p-8 space-y-6">
        <div className="text-center space-y-1">
          <h1 className="text-3xl font-serif font-black text-editorial-text">NYLA.</h1>
          <p className="text-xs text-editorial-muted">Restablece tu contraseña</p>
        </div>

        {success ? (
          <div className="space-y-4 text-center">
            <p className="text-sm text-editorial-text">Tu contraseña fue actualizada correctamente.</p>
            <button
              onClick={() => setView('login')}
              className="w-full py-3 bg-editorial-text text-editorial-bg font-bold rounded-full text-[11px] uppercase tracking-[0.15em] hover:opacity-90 transition-all cursor-pointer border-none"
            >
              Iniciar sesión
            </button>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-1.5">
              <label className="text-[10px] font-bold text-editorial-muted uppercase tracking-wider">Correo electrónico</label>
              <input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full bg-editorial-bg border border-editorial-border rounded-xl p-3 text-sm focus:ring-1 focus:ring-editorial-text focus:outline-none"
              />
            </div>

            <div className="space-y-1.5">
              <label className="text-[10px] font-bold text-editorial-muted uppercase tracking-wider">Nueva contraseña</label>
              <input
                type="password"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full bg-editorial-bg border border-editorial-border rounded-xl p-3 text-sm focus:ring-1 focus:ring-editorial-text focus:outline-none"
                placeholder="Mín. 8 caracteres, 1 mayúscula, 1 número"
              />
            </div>

            {error && (
              <p className="text-xs text-red-700 bg-red-50 border border-red-200 rounded-xl p-3">{error}</p>
            )}

            <button
              type="submit"
              disabled={submitting || !token}
              className="w-full py-3 bg-editorial-text text-editorial-bg font-bold rounded-full text-[11px] uppercase tracking-[0.15em] hover:opacity-90 transition-all disabled:opacity-50 cursor-pointer border-none"
            >
              {submitting ? 'Guardando...' : 'Restablecer contraseña'}
            </button>
            {!token && (
              <p className="text-[10px] text-editorial-muted text-center">
                Este enlace no incluye un token válido. Solicita uno nuevo desde "Olvidé mi contraseña".
              </p>
            )}
          </form>
        )}
      </div>
    </div>
  );
}
