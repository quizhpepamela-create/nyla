import React, { useEffect, useState } from 'react';
import { Search, Clock, X, Briefcase, Loader2 } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { Project, ViewState } from '../types';
import { STUDENT_HOURLY_RATE, NYLA_FIXED_FEE, calculateStudentPayout } from '../constants';
import { useAuth } from '../context/AuthContext';

interface ProjectsPageProps {
  setView: (view: ViewState) => void;
}

const STATUS_LABEL: Record<string, string> = {
  OPEN: 'Abierto',
  IN_PROGRESS: 'En progreso',
  COMPLETED: 'Completado',
  CANCELLED: 'Cancelado',
};

export default function ProjectsPage({ setView }: ProjectsPageProps) {
  const { user } = useAuth();
  const isEntrepreneur = user?.role === 'ENTREPRENEUR';

  const [projects, setProjects] = useState<Project[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const [searchTerm, setSearchTerm] = useState('');
  const [selectedTag, setSelectedTag] = useState('All');
  const [minBudget, setMinBudget] = useState(0);

  // Postulation Custom Hours Modal states
  const [activeApplyProject, setActiveApplyProject] = useState<Project | null>(null);
  const [customHours, setCustomHours] = useState(3);
  const [applying, setApplying] = useState(false);
  const [applyError, setApplyError] = useState<string | null>(null);

  const loadProjects = async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await fetch(isEntrepreneur ? '/api/projects/mine' : '/api/projects?status=OPEN', { credentials: 'include' });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'No se pudieron cargar los proyectos.');
      setProjects(data.projects);
    } catch (err: any) {
      setError(err.message || 'No se pudieron cargar los proyectos.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadProjects();
  }, [isEntrepreneur]);

  // Get all unique required skills across open projects
  const allTags = ['All', ...Array.from(new Set(projects.flatMap(p => p.requiredSkills)))];

  const handleApply = async (id: string, hours: number) => {
    setApplying(true);
    setApplyError(null);
    try {
      const res = await fetch(`/api/projects/${id}/apply`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({ proposedHours: hours }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'No se pudo enviar la postulación.');
      setProjects(prev => prev.map(p => p.id === id ? { ...p, myApplicationStatus: 'PENDING' } : p));
      setActiveApplyProject(null);
    } catch (err: any) {
      setApplyError(err.message || 'No se pudo enviar la postulación.');
    } finally {
      setApplying(false);
    }
  };

  const filteredProjects = projects.filter(p => {
    const matchesSearch = p.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                          p.description.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesTag = selectedTag === 'All' || p.requiredSkills.includes(selectedTag);
    const matchesBudget = p.budget >= minBudget;
    return matchesSearch && matchesTag && matchesBudget;
  });

  // Entrepreneurs get a read-only view of their own published projects — publishing and
  // hiring a specific student happens through the match wizard (Dashboard → "Nuevo Proyecto"),
  // and applicants are managed from the Dashboard too.
  if (isEntrepreneur) {
    return (
      <div className="min-h-screen bg-editorial-bg pb-24 md:pb-8">
        <div className="mb-10 pb-6 border-b border-editorial-border">
          <button
            onClick={() => setView('landing')}
            className="mb-4 inline-flex items-center gap-1.5 text-xs font-bold uppercase tracking-wider text-editorial-muted hover:text-editorial-text transition-colors bg-white border border-editorial-border px-3 py-1.5 rounded-full cursor-pointer"
          >
            ← Volver a la Portada (Inicio)
          </button>
          <h2 className="text-3xl md:text-5xl font-serif font-black text-editorial-text tracking-tight">Mis Proyectos</h2>
          <p className="text-sm text-editorial-muted mt-1">Todos los proyectos que has publicado en NYLA.</p>
        </div>

        {loading && (
          <div className="flex items-center justify-center py-16 text-editorial-muted text-xs gap-2">
            <Loader2 className="w-4 h-4 animate-spin" /> Cargando tus proyectos...
          </div>
        )}
        {error && <p className="text-xs text-red-700 bg-red-50 border border-red-200 rounded-xl p-3 mb-6">{error}</p>}

        {!loading && (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {projects.map(project => (
              <div key={project.id} className="bg-editorial-bg rounded-[32px] overflow-hidden border border-editorial-border p-6 space-y-3">
                <div className="flex items-center justify-between">
                  <span className="bg-editorial-light text-editorial-text text-[9px] font-bold uppercase tracking-wider px-2.5 py-1 rounded-full">
                    {STATUS_LABEL[project.status] || project.status}
                  </span>
                  <span className="text-lg font-serif font-bold text-editorial-text">${project.budget.toFixed(2)}</span>
                </div>
                <h3 className="font-serif font-bold text-lg text-editorial-text leading-snug">{project.title}</h3>
                <p className="text-editorial-muted text-xs leading-relaxed line-clamp-3">{project.description}</p>
                <div className="flex flex-wrap gap-1.5 pt-1">
                  {project.requiredSkills.map((tag, idx) => (
                    <span key={idx} className="bg-editorial-light text-editorial-text text-[9px] font-bold uppercase tracking-wider px-2.5 py-1 rounded-full">
                      {tag}
                    </span>
                  ))}
                </div>
                {project.student?.studentProfile && (
                  <p className="text-[10px] text-editorial-muted font-bold uppercase tracking-wider pt-1 border-t border-editorial-border/60">
                    Asignado a {project.student.studentProfile.fullName}
                  </p>
                )}
                {project.status === 'OPEN' && (
                  <p className="text-[10px] text-editorial-muted">
                    {(project.applications?.length ?? 0)} postulante(s) — gestiónalos desde el Dashboard.
                  </p>
                )}
              </div>
            ))}
            {projects.length === 0 && (
              <div className="col-span-full text-center py-16 bg-editorial-bg border border-editorial-border rounded-[32px]">
                <p className="text-editorial-text font-serif italic text-lg">Aún no has publicado ningún proyecto.</p>
                <button
                  onClick={() => setView('contratacion')}
                  className="mt-3 text-editorial-text font-bold text-xs uppercase tracking-[0.15em] underline cursor-pointer"
                >
                  Publicar mi primer proyecto
                </button>
              </div>
            )}
          </div>
        )}
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-editorial-bg pb-24 md:pb-8">

      {/* Title */}
      <div className="mb-10 pb-6 border-b border-editorial-border">
        <button
          onClick={() => setView('landing')}
          className="mb-4 inline-flex items-center gap-1.5 text-xs font-bold uppercase tracking-wider text-editorial-muted hover:text-editorial-text transition-colors bg-white border border-editorial-border px-3 py-1.5 rounded-full cursor-pointer"
        >
          ← Volver a la Portada (Inicio)
        </button>
        <h2 className="text-3xl md:text-5xl font-serif font-black text-editorial-text tracking-tight">Portal de Proyectos</h2>
        <p className="text-sm text-editorial-muted mt-1">Explora oportunidades reales publicadas por emprendedores en NYLA.</p>
      </div>

      {/* Filter and Search Bar */}
      <div className="bg-editorial-bg p-6 rounded-[32px] border border-editorial-border shadow-none mb-10 space-y-4">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">

          {/* Search Input */}
          <div className="relative md:col-span-1">
            <Search className="w-4 h-4 text-editorial-muted absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="Buscar por palabra clave..."
              className="w-full bg-editorial-light border-none rounded-xl py-3 pl-9 pr-4 text-xs focus:ring-1 focus:ring-editorial-text focus:bg-editorial-bg text-editorial-text"
            />
          </div>

          {/* Budget filter */}
          <div>
            <select
              value={minBudget}
              onChange={(e) => setMinBudget(Number(e.target.value))}
              className="w-full bg-editorial-light border-none rounded-xl py-3 px-4 text-xs focus:ring-1 focus:ring-editorial-text text-editorial-text focus:bg-editorial-bg focus:outline-none"
            >
              <option value={0}>Cualquier presupuesto</option>
              <option value={50}>Desde $50 USD</option>
              <option value={100}>Desde $100 USD</option>
              <option value={200}>Desde $200 USD</option>
            </select>
          </div>

          {/* Skill filter */}
          <div className="flex gap-2">
            <select
              value={selectedTag}
              onChange={(e) => setSelectedTag(e.target.value)}
              className="w-full bg-editorial-light border-none rounded-xl py-3 px-4 text-xs focus:ring-1 focus:ring-editorial-text text-editorial-text focus:bg-editorial-bg focus:outline-none"
            >
              <option value="All">Todas las habilidades</option>
              {allTags.filter(t => t !== 'All').map(tag => (
                <option key={tag} value={tag}>{tag}</option>
              ))}
            </select>
          </div>

        </div>

        {/* Tags horizontal list */}
        <div className="flex gap-2 overflow-x-auto pt-2 pb-1">
          {allTags.map((tag) => (
            <button
              key={tag}
              onClick={() => setSelectedTag(tag)}
              className={`px-4 py-1.5 rounded-full text-[10px] font-bold uppercase tracking-wider transition-all whitespace-nowrap cursor-pointer ${
                selectedTag === tag
                  ? 'bg-editorial-text text-editorial-bg shadow-sm'
                  : 'bg-editorial-light text-editorial-text hover:bg-editorial-text/10'
              }`}
            >
              {tag === 'All' ? 'Ver Todos' : tag}
            </button>
          ))}
        </div>
      </div>

      {loading && (
        <div className="flex items-center justify-center py-16 text-editorial-muted text-xs gap-2">
          <Loader2 className="w-4 h-4 animate-spin" /> Cargando proyectos...
        </div>
      )}

      {error && (
        <p className="text-xs text-red-700 bg-red-50 border border-red-200 rounded-xl p-3 mb-6">{error}</p>
      )}

      {/* Grid List */}
      {!loading && (
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
        {filteredProjects.map((project) => {
          const applied = Boolean(project.myApplicationStatus);
          return (
          <div
            key={project.id}
            className="bg-editorial-bg rounded-[32px] overflow-hidden border border-editorial-border hover:scale-[1.01] transition-transform duration-300 flex flex-col justify-between group"
          >
            <div>
              <div className="h-32 w-full relative overflow-hidden bg-editorial-light flex items-center justify-center">
                <Briefcase className="w-10 h-10 text-editorial-text/20" />
                {project.entrepreneurName && (
                  <div className="absolute top-3 right-3 bg-editorial-text text-editorial-bg px-2.5 py-1 rounded-full text-[9px] font-bold uppercase tracking-wider">
                    {project.entrepreneurName}
                  </div>
                )}
              </div>

              <div className="p-6 space-y-3">
                <h3 className="font-serif font-bold text-lg text-editorial-text leading-snug group-hover:italic transition-all">
                  {project.title}
                </h3>
                {(project.entrepreneurCategory || project.entrepreneurDescription) && (
                  <p className="text-[10px] text-editorial-muted italic border-l-2 border-editorial-border pl-2">
                    {project.entrepreneurName}
                    {project.entrepreneurCategory ? ` · ${project.entrepreneurCategory}` : ''}
                    {project.entrepreneurDescription ? ` — ${project.entrepreneurDescription}` : ''}
                  </p>
                )}
                <p className="text-editorial-muted text-xs leading-relaxed line-clamp-3">
                  {project.description}
                </p>

                <div className="flex flex-wrap gap-1.5 pt-2">
                  {project.requiredSkills.map((tag, idx) => (
                    <span key={idx} className="bg-editorial-light text-editorial-text text-[9px] font-bold uppercase tracking-wider px-2.5 py-1 rounded-full">
                      {tag}
                    </span>
                  ))}
                </div>
              </div>
            </div>

            <div className="p-6 pt-0 border-t border-editorial-border mt-4 flex items-center justify-between gap-4">
              <div className="space-y-0.5">
                <p className="text-[9px] text-editorial-muted font-bold uppercase tracking-wider">Presupuesto</p>
                <p className="text-lg font-serif font-bold text-editorial-text">${project.budget.toFixed(2)} USD</p>
              </div>

              <button
                onClick={() => {
                  if (!applied) {
                    setActiveApplyProject(project);
                    setCustomHours(3);
                    setApplyError(null);
                  }
                }}
                disabled={applied}
                className={`py-2.5 px-6 rounded-full font-bold text-[10px] uppercase tracking-[0.15em] transition-all cursor-pointer ${
                  applied
                    ? 'bg-editorial-light text-editorial-muted cursor-not-allowed border border-transparent'
                    : 'bg-editorial-text text-editorial-bg hover:opacity-90'
                }`}
              >
                {applied ? 'Postulado' : 'Postular'}
              </button>
            </div>
          </div>
          );
        })}
        {filteredProjects.length === 0 && (
          <div className="col-span-full text-center py-16 bg-editorial-bg border border-editorial-border rounded-[32px]">
            <p className="text-editorial-text font-serif italic text-lg">No encontramos proyectos con esos filtros.</p>
            <button
              onClick={() => { setSearchTerm(''); setSelectedTag('All'); setMinBudget(0); }}
              className="mt-3 text-editorial-text font-bold text-xs uppercase tracking-[0.15em] underline cursor-pointer"
            >
              Restablecer filtros
            </button>
          </div>
        )}
      </div>
      )}

      {/* Interactive Postulation / Hours Proposal Modal */}
      <AnimatePresence>
        {activeApplyProject && (
          <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
            {/* Backdrop */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setActiveApplyProject(null)}
              className="absolute inset-0 bg-editorial-text/40 backdrop-blur-sm"
            />

            {/* Modal Body */}
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 15 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 15 }}
              transition={{ type: 'spring', damping: 25, stiffness: 220 }}
              className="relative bg-white w-full max-w-lg rounded-[32px] border border-editorial-border p-6 md:p-8 shadow-xl overflow-hidden z-10"
            >
              {/* Close Button */}
              <button
                onClick={() => setActiveApplyProject(null)}
                className="absolute top-6 right-6 w-8 h-8 rounded-full border border-editorial-border flex items-center justify-center hover:bg-editorial-light transition-colors text-editorial-text"
              >
                <X className="w-4 h-4" />
              </button>

              <div className="space-y-6">
                <div>
                  <span className="bg-editorial-accent/10 text-editorial-accent border border-editorial-accent/20 px-2.5 py-1 rounded text-[9px] font-bold uppercase tracking-wider">
                    PROPUESTA DE COLABORACIÓN
                  </span>
                  <h3 className="text-2xl font-serif font-black text-editorial-text mt-2.5 leading-snug">
                    Postular a: {activeApplyProject.title}
                  </h3>
                  <p className="text-xs text-editorial-muted mt-1 leading-relaxed">
                    Propón las horas estimadas que necesitarás para completar este proyecto.
                  </p>
                </div>

                {/* Hours selection / custom slider */}
                <div className="bg-editorial-bg p-5 rounded-2xl border border-editorial-border space-y-4">
                  <div className="flex justify-between items-center">
                    <span className="text-[10px] uppercase tracking-wider font-bold text-editorial-muted flex items-center gap-1.5">
                      <Clock className="w-3.5 h-3.5 text-editorial-accent" /> HORAS ESTIMADAS DE TRABAJO
                    </span>
                    <span className="text-sm font-serif font-bold text-editorial-accent bg-editorial-accent/15 px-3 py-1 rounded-full">
                      {customHours} horas
                    </span>
                  </div>

                  <input
                    type="range"
                    min={1}
                    max={20}
                    step={1}
                    value={customHours}
                    onChange={(e) => setCustomHours(Number(e.target.value))}
                    className="w-full h-1 bg-editorial-light rounded-lg appearance-none cursor-pointer accent-editorial-text"
                  />

                  <div className="flex justify-between text-[10px] text-editorial-muted">
                    <span>Mínimo (1 hora)</span>
                    <span className="font-bold text-editorial-text bg-editorial-light px-2 py-0.5 rounded">Recomendado: 3 horas</span>
                    <span>Máximo (20 horas)</span>
                  </div>

                  <p className="text-[10px] text-editorial-muted italic text-center font-sans">
                    💡 Ajusta las horas dependiendo del tiempo real que consideres que necesitas para los entregables.
                  </p>
                </div>

                {/* Real-time earnings preview for the proposed hours */}
                <div className="space-y-3 pt-2">
                  <span className="text-[10px] uppercase tracking-wider font-bold text-editorial-muted block">LIQUIDACIÓN FINANCIERA DE LA POSTULACIÓN</span>

                  <div className="bg-editorial-bg/50 p-4 rounded-2xl border border-editorial-border border-dashed text-xs space-y-2.5 font-sans leading-relaxed">
                    <div className="flex justify-between">
                      <span className="text-editorial-muted">Tarifa de Estudiante Fija:</span>
                      <strong className="text-editorial-text">${STUDENT_HOURLY_RATE.toFixed(2)} USD / hora</strong>
                    </div>
                    <div className="flex justify-between border-b border-editorial-border/60 pb-2 mb-1.5">
                      <span className="text-editorial-muted">Horas propuestas:</span>
                      <strong className="text-editorial-text">{customHours} {customHours === 1 ? 'hora' : 'horas'}</strong>
                    </div>
                    <div className="flex justify-between font-serif font-bold text-sm text-editorial-accent">
                      <span>Recibirías por este trabajo:</span>
                      <span>${calculateStudentPayout(customHours).toFixed(2)} USD</span>
                    </div>
                    <p className="text-[9px] text-editorial-muted italic pt-1">
                      *La comisión fija de NYLA (${NYLA_FIXED_FEE.toFixed(2)}) la paga el emprendedor por separado; no se descuenta de tu pago.
                    </p>
                  </div>
                </div>

                {applyError && (
                  <p className="text-xs text-red-700 bg-red-50 border border-red-200 rounded-xl p-3">{applyError}</p>
                )}

                {/* Actions */}
                <div className="flex gap-3 pt-2">
                  <button
                    type="button"
                    onClick={() => setActiveApplyProject(null)}
                    className="flex-1 py-3 border border-editorial-border text-editorial-text font-bold rounded-full text-[10px] uppercase tracking-[0.15em] hover:bg-editorial-light transition-all cursor-pointer bg-transparent"
                  >
                    Cancelar
                  </button>
                  <button
                    type="button"
                    onClick={() => handleApply(activeApplyProject.id, customHours)}
                    disabled={applying}
                    className="flex-1 py-3 bg-editorial-text text-editorial-bg font-bold rounded-full text-[10px] uppercase tracking-[0.15em] hover:opacity-90 transition-all cursor-pointer border-none disabled:opacity-50"
                  >
                    {applying ? 'Enviando...' : 'Confirmar Postulación'}
                  </button>
                </div>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

    </div>
  );
}
