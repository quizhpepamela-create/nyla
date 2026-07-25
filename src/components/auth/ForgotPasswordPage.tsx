import React, { useState } from 'react';
import { ViewState } from '../../types';

interface ForgotPasswordPageProps {
  setView: (view: ViewState) => void;
}

export default function ForgotPasswordPage({ setView }: ForgotPasswordPageProps) {
  const [email, setEmail] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [sent, setSent] = useState(false);
  const [devResetLink, setDevResetLink] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setSubmitting(true);
    try {
      const response = await fetch('/api/auth/forgot-password', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email }),
      });
      const data = await response.json();
      if (!response.ok) {
        throw new Error(data.error || 'No se pudo procesar la solicitud.');
      }
      setSent(true);
      setDevResetLink(data.devResetLink ?? null);
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
          <p className="text-xs text-editorial-muted">Recupera el acceso a tu cuenta</p>
        </div>

        {sent ? (
          <div className="space-y-4 text-center">
            <p className="text-sm text-editorial-text">
              Si existe una cuenta con ese correo, hemos enviado un enlace para restablecer la contraseña.
            </p>
            {devResetLink && (
              <div className="bg-editorial-bg border border-dashed border-editorial-border rounded-xl p-4 text-left space-y-2">
                <p className="text-[10px] font-bold text-editorial-muted uppercase tracking-wider">
                  Modo desarrollo (no hay proveedor de email configurado)
                </p>
                <a href={devResetLink} className="text-xs text-editorial-accent break-all underline">
                  {devResetLink}
                </a>
              </div>
            )}
            <button
              onClick={() => setView('login')}
              className="text-[11px] uppercase tracking-wider font-bold text-editorial-text cursor-pointer bg-transparent border-none underline"
            >
              Volver a iniciar sesión
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
                placeholder="tu@correo.com"
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
              {submitting ? 'Enviando...' : 'Enviar enlace de recuperación'}
            </button>
          </form>
        )}

        <button
          onClick={() => setView('login')}
          className="w-full text-center text-[11px] uppercase tracking-wider font-bold text-editorial-muted hover:text-editorial-text cursor-pointer bg-transparent border-none"
        >
          ← Volver a iniciar sesión
        </button>
      </div>
    </div>
  );
}
