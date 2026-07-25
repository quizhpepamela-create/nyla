import React, { useState } from 'react';
import { ViewState, UserRole } from '../../types';
import { useAuth, RegisterInput } from '../../context/AuthContext';

interface RegisterPageProps {
  setView: (view: ViewState) => void;
}

export default function RegisterPage({ setView }: RegisterPageProps) {
  const { register } = useAuth();
  const [role, setRole] = useState<Extract<UserRole, 'STUDENT' | 'ENTREPRENEUR'>>('STUDENT');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [fullName, setFullName] = useState('');
  const [university, setUniversity] = useState('');
  const [career, setCareer] = useState('');
  const [businessName, setBusinessName] = useState('');
  const [category, setCategory] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setSubmitting(true);
    try {
      const input: RegisterInput =
        role === 'STUDENT'
          ? { role: 'STUDENT', email, password, fullName, university, career }
          : { role: 'ENTREPRENEUR', email, password, businessName, category };
      await register(input);
      setView('dashboard');
    } catch (err: any) {
      setError(err.message || 'No se pudo crear la cuenta.');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-editorial-bg flex items-center justify-center p-6 py-12">
      <div className="w-full max-w-md bg-white border border-editorial-border rounded-[32px] p-8 space-y-6">
        <div className="text-center space-y-1">
          <h1 className="text-3xl font-serif font-black text-editorial-text">NYLA.</h1>
          <p className="text-xs text-editorial-muted">Crea tu cuenta</p>
        </div>

        <div className="grid grid-cols-2 gap-2 bg-editorial-bg p-1 rounded-full border border-editorial-border">
          <button
            type="button"
            onClick={() => setRole('STUDENT')}
            className={`py-2.5 rounded-full text-[11px] font-bold uppercase tracking-wider cursor-pointer border-none transition-all ${
              role === 'STUDENT' ? 'bg-editorial-text text-editorial-bg' : 'bg-transparent text-editorial-muted'
            }`}
          >
            Estudiante
          </button>
          <button
            type="button"
            onClick={() => setRole('ENTREPRENEUR')}
            className={`py-2.5 rounded-full text-[11px] font-bold uppercase tracking-wider cursor-pointer border-none transition-all ${
              role === 'ENTREPRENEUR' ? 'bg-editorial-text text-editorial-bg' : 'bg-transparent text-editorial-muted'
            }`}
          >
            Emprendedor
          </button>
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
              placeholder="Mín. 8 caracteres, 1 mayúscula, 1 número"
            />
          </div>

          {role === 'STUDENT' ? (
            <>
              <div className="space-y-1.5">
                <label className="text-[10px] font-bold text-editorial-muted uppercase tracking-wider">Nombre completo</label>
                <input
                  type="text"
                  required
                  value={fullName}
                  onChange={(e) => setFullName(e.target.value)}
                  className="w-full bg-editorial-bg border border-editorial-border rounded-xl p-3 text-sm focus:ring-1 focus:ring-editorial-text focus:outline-none"
                />
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1.5">
                  <label className="text-[10px] font-bold text-editorial-muted uppercase tracking-wider">Universidad</label>
                  <input
                    type="text"
                    value={university}
                    onChange={(e) => setUniversity(e.target.value)}
                    className="w-full bg-editorial-bg border border-editorial-border rounded-xl p-3 text-sm focus:ring-1 focus:ring-editorial-text focus:outline-none"
                  />
                </div>
                <div className="space-y-1.5">
                  <label className="text-[10px] font-bold text-editorial-muted uppercase tracking-wider">Carrera</label>
                  <input
                    type="text"
                    value={career}
                    onChange={(e) => setCareer(e.target.value)}
                    className="w-full bg-editorial-bg border border-editorial-border rounded-xl p-3 text-sm focus:ring-1 focus:ring-editorial-text focus:outline-none"
                  />
                </div>
              </div>
            </>
          ) : (
            <>
              <div className="space-y-1.5">
                <label className="text-[10px] font-bold text-editorial-muted uppercase tracking-wider">Nombre del emprendimiento</label>
                <input
                  type="text"
                  required
                  value={businessName}
                  onChange={(e) => setBusinessName(e.target.value)}
                  className="w-full bg-editorial-bg border border-editorial-border rounded-xl p-3 text-sm focus:ring-1 focus:ring-editorial-text focus:outline-none"
                />
              </div>
              <div className="space-y-1.5">
                <label className="text-[10px] font-bold text-editorial-muted uppercase tracking-wider">Categoría</label>
                <input
                  type="text"
                  value={category}
                  onChange={(e) => setCategory(e.target.value)}
                  className="w-full bg-editorial-bg border border-editorial-border rounded-xl p-3 text-sm focus:ring-1 focus:ring-editorial-text focus:outline-none"
                  placeholder="Ej. Repostería, Moda, Tecnología..."
                />
              </div>
            </>
          )}

          {error && (
            <p className="text-xs text-red-700 bg-red-50 border border-red-200 rounded-xl p-3">{error}</p>
          )}

          <button
            type="submit"
            disabled={submitting}
            className="w-full py-3 bg-editorial-text text-editorial-bg font-bold rounded-full text-[11px] uppercase tracking-[0.15em] hover:opacity-90 transition-all disabled:opacity-50 cursor-pointer border-none"
          >
            {submitting ? 'Creando cuenta...' : 'Crear cuenta'}
          </button>
        </form>

        <div className="text-center text-xs text-editorial-muted">
          ¿Ya tienes cuenta?{' '}
          <button onClick={() => setView('login')} className="text-editorial-text font-bold cursor-pointer bg-transparent border-none underline">
            Inicia sesión
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
