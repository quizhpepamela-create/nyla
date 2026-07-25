import React from 'react';
import { Settings, Key, Sparkles, AlertCircle } from 'lucide-react';
import { ViewState, StudentProfileData, EntrepreneurProfileData } from '../types';
import { useAuth } from '../context/AuthContext';

interface ConfigPageProps {
  setView: (view: ViewState) => void;
}

export default function ConfigPage({ setView }: ConfigPageProps) {
  const { user, profile } = useAuth();
  const isStudent = user?.role === 'STUDENT';
  const displayName = isStudent
    ? (profile as StudentProfileData | null)?.fullName
    : (profile as EntrepreneurProfileData | null)?.businessName;

  return (
    <div className="min-h-screen bg-editorial-bg pb-24 md:pb-8">

      {/* Title */}
      <div className="mb-8 pb-6 border-b border-editorial-border">
        <button
          onClick={() => setView('landing')}
          className="mb-4 inline-flex items-center gap-1.5 text-xs font-bold uppercase tracking-wider text-editorial-muted hover:text-editorial-text transition-colors bg-white border border-editorial-border px-3 py-1.5 rounded-full cursor-pointer"
        >
          ← Volver a la Portada (Inicio)
        </button>
        <h2 className="text-3xl md:text-5xl font-serif font-black text-editorial-text tracking-tight">Configuración</h2>
        <p className="text-sm text-editorial-muted mt-1">Información de tu cuenta y de la plataforma.</p>
      </div>

      <div className="max-w-2xl bg-editorial-bg p-8 rounded-[32px] border border-editorial-border shadow-none space-y-8">

        {/* Account info (read-only — edit via Mi Perfil) */}
        <div className="space-y-4">
          <div className="flex items-center gap-2.5 text-editorial-text border-b border-editorial-border pb-2">
            <Settings className="w-5 h-5" />
            <h3 className="font-serif font-bold text-base text-editorial-text">Cuenta</h3>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
            <div className="space-y-1.5">
              <label className="font-bold text-editorial-muted uppercase tracking-wider text-[9px]">
                {isStudent ? 'Nombre Completo' : 'Nombre del Emprendimiento'}
              </label>
              <div className="w-full bg-white border border-editorial-border rounded-xl p-3 text-editorial-text">
                {displayName || '—'}
              </div>
            </div>
            <div className="space-y-1.5">
              <label className="font-bold text-editorial-muted uppercase tracking-wider text-[9px]">Correo Electrónico</label>
              <div className="w-full bg-white border border-editorial-border rounded-xl p-3 text-editorial-text">
                {user?.email || '—'}
              </div>
            </div>
          </div>
          <button
            onClick={() => setView('perfil')}
            className="text-[11px] uppercase tracking-[0.15em] font-bold text-editorial-text underline cursor-pointer bg-transparent border-none"
          >
            Editar en Mi Perfil
          </button>
        </div>

        {/* AI Assistant info */}
        <div className="space-y-4">
          <div className="flex items-center gap-2.5 text-editorial-text border-b border-editorial-border pb-2">
            <Key className="w-5 h-5" />
            <h3 className="font-serif font-bold text-base text-editorial-text">Inteligencia Artificial</h3>
          </div>

          <div className="p-4 bg-editorial-light border border-editorial-border rounded-2xl text-xs space-y-3">
            <div className="flex gap-2.5 text-editorial-text">
              <Sparkles className="w-5 h-5 shrink-0" />
              <p className="font-bold">¿Cómo funciona el asistente de NYLA?</p>
            </div>
            <p className="text-editorial-text leading-relaxed font-sans">
              El chatbot usa la API de Gemini configurada en el servidor para responder preguntas sobre registro, funcionamiento de la plataforma, pagos y soporte.
            </p>
          </div>

          <div className="p-4 bg-white rounded-2xl border border-editorial-border text-xs space-y-2">
            <div className="flex gap-2 text-editorial-text">
              <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
              <p className="font-bold uppercase tracking-wider text-[10px]">Configuración</p>
            </div>
            <p className="text-editorial-muted leading-relaxed">
              La clave de API se configura del lado del servidor (variable de entorno). No se ingresa ni se almacena desde esta pantalla por seguridad.
            </p>
          </div>
        </div>

        <div className="pt-4 border-t border-editorial-border flex gap-3 justify-end">
          <button
            onClick={() => setView('dashboard')}
            className="px-6 py-2.5 bg-editorial-text text-editorial-bg rounded-full text-[11px] uppercase tracking-[0.15em] font-bold hover:opacity-90 transition-all cursor-pointer shadow-none"
          >
            Volver al Dashboard
          </button>
        </div>

      </div>

    </div>
  );
}
