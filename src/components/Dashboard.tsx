import React, { useEffect, useState } from 'react';
import { Send, Rocket, Landmark, Bell, Lightbulb, ChevronRight, CheckCircle2, Hourglass, Plus, BadgeCheck, ShieldCheck, Loader2, Users, Wallet } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { ViewState, Project, StudentProfileData, EntrepreneurProfileData } from '../types';
import { useAuth } from '../context/AuthContext';
import { NYLA_FIXED_FEE, calculateStudentPayout } from '../constants';

interface DashboardProps {
  setView: (view: ViewState) => void;
  onOpenNewProject?: () => void;
}

interface MeStats {
  appliedCount?: number;
  activeCount?: number;
  completedCount?: number;
  earningsCount?: number;
  postedCount?: number;
  spentCount?: number;
}

export default function Dashboard({ setView, onOpenNewProject }: DashboardProps) {
  const { user, profile } = useAuth();
  const isStudent = user?.role === 'STUDENT';
  const displayName = isStudent
    ? (profile as StudentProfileData | null)?.fullName
    : (profile as EntrepreneurProfileData | null)?.businessName;
  const firstName = displayName?.split(' ')[0] || 'de nuevo';
  const photoUrl = isStudent ? (profile as StudentProfileData | null)?.photoUrl : (profile as EntrepreneurProfileData | null)?.logoUrl;

  const [showNotifications, setShowNotifications] = useState(false);
  const [hasNewNotifications, setHasNewNotifications] = useState(true);

  const [projects, setProjects] = useState<Project[]>([]);
  const [stats, setStats] = useState<MeStats>({});
  const [loading, setLoading] = useState(true);
  const [unreadMessages, setUnreadMessages] = useState(0);

  // Escrow Release Celebration Modal state
  const [releasingProject, setReleasingProject] = useState<Project | null>(null);
  const [showCelebration, setShowCelebration] = useState(false);
  const [actionError, setActionError] = useState<string | null>(null);
  const [assigningId, setAssigningId] = useState<string | null>(null);

  // Review modal state
  const [reviewingProject, setReviewingProject] = useState<Project | null>(null);
  const [reviewRating, setReviewRating] = useState(5);
  const [reviewComment, setReviewComment] = useState('');
  const [submittingReview, setSubmittingReview] = useState(false);
  const [reviewError, setReviewError] = useState<string | null>(null);

  const loadDashboard = async () => {
    setLoading(true);
    try {
      const [projectsRes, statsRes, contactsRes] = await Promise.all([
        fetch('/api/projects/mine', { credentials: 'include' }),
        fetch('/api/stats/me', { credentials: 'include' }),
        fetch('/api/messages/contacts', { credentials: 'include' }),
      ]);
      const projectsData = await projectsRes.json();
      const statsData = await statsRes.json();
      if (projectsRes.ok) setProjects(projectsData.projects);
      if (statsRes.ok) setStats(statsData);
      if (contactsRes.ok) {
        const contactsData = await contactsRes.json();
        setUnreadMessages(contactsData.contacts.reduce((sum: number, c: any) => sum + c.unreadCount, 0));
      }
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadDashboard();
    const interval = setInterval(loadDashboard, 20000);
    return () => clearInterval(interval);
  }, []);

  const [deliverImages, setDeliverImages] = useState<Record<string, string[]>>({});

  const handleAddDeliverImage = async (projectId: string, file: File) => {
    if ((deliverImages[projectId]?.length ?? 0) >= 5) {
      setActionError('Máximo 5 imágenes por entrega.');
      return;
    }
    if (file.size > 1.5 * 1024 * 1024) {
      setActionError('La imagen es muy pesada (máximo 1.5MB).');
      return;
    }
    const dataUrl: string = await new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = () => resolve(reader.result as string);
      reader.onerror = reject;
      reader.readAsDataURL(file);
    });
    setDeliverImages(prev => ({ ...prev, [projectId]: [...(prev[projectId] || []), dataUrl] }));
  };

  const handleDeliver = async (projectId: string) => {
    setActionError(null);
    try {
      const res = await fetch(`/api/projects/${projectId}/deliver`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({ deliverables: deliverImages[projectId] || [] }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'No se pudo marcar la entrega.');
      setProjects(prev => prev.map(p => p.id === projectId ? data.project : p));
      setDeliverImages(prev => { const next = { ...prev }; delete next[projectId]; return next; });
    } catch (err: any) {
      setActionError(err.message);
    }
  };

  const handleInitiateRelease = (project: Project) => {
    setReleasingProject(project);
    setShowCelebration(true);
  };

  const handleConfirmRelease = async () => {
    if (!releasingProject) return;
    setActionError(null);
    try {
      const res = await fetch(`/api/payments/projects/${releasingProject.id}/release`, { method: 'POST', credentials: 'include' });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'No se pudo liberar el pago.');
      setProjects(prev => prev.map(p => p.id === releasingProject.id ? data.project : p));
      await loadDashboard();
      setShowCelebration(false);
      setReleasingProject(null);
    } catch (err: any) {
      setActionError(err.message);
      setShowCelebration(false);
    }
  };

  const handleOpenReview = (project: Project) => {
    setReviewingProject(project);
    setReviewRating(5);
    setReviewComment('');
    setReviewError(null);
  };

  const handleSubmitReview = async () => {
    if (!reviewingProject) return;
    setSubmittingReview(true);
    setReviewError(null);
    try {
      const res = await fetch(`/api/projects/${reviewingProject.id}/review`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({ rating: reviewRating, comment: reviewComment.trim() || undefined }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'No se pudo enviar la calificación.');
      setProjects(prev => prev.map(p => p.id === reviewingProject.id ? { ...p, review: data.review } : p));
      setReviewingProject(null);
    } catch (err: any) {
      setReviewError(err.message);
    } finally {
      setSubmittingReview(false);
    }
  };

  const [depositingId, setDepositingId] = useState<string | null>(null);

  const handleDeposit = async (projectId: string) => {
    setDepositingId(projectId);
    setActionError(null);
    try {
      const res = await fetch(`/api/payments/projects/${projectId}/checkout`, { method: 'POST', credentials: 'include' });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'No se pudo iniciar el depósito en garantía.');
      window.location.href = data.url;
    } catch (err: any) {
      setActionError(err.message);
      setDepositingId(null);
    }
  };

  const handleAssign = async (projectId: string, studentId: string) => {
    setAssigningId(studentId);
    setActionError(null);
    try {
      const res = await fetch(`/api/projects/${projectId}/assign`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({ studentId }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'No se pudo asignar al estudiante.');
      await loadDashboard();
    } catch (err: any) {
      setActionError(err.message);
    } finally {
      setAssigningId(null);
    }
  };

  const activeProjects = projects.filter(p => p.status === 'IN_PROGRESS' && p.escrowStatus === 'HELD');
  const awaitingDepositProjects = projects.filter(p => p.status === 'IN_PROGRESS' && p.escrowStatus === 'NONE');
  const openProjects = projects.filter(p => p.status === 'OPEN');
  const pendingApplications = projects.filter(p => p.myApplicationStatus === 'PENDING');
  const completedProjects = projects.filter(p => p.status === 'COMPLETED');
  const unreviewedCompleted = completedProjects.filter(p => !p.review);

  const notifications: { text: string; sub: string }[] = [];
  if (unreadMessages > 0) {
    notifications.push({
      text: `Tienes ${unreadMessages} mensaje(s) sin leer`,
      sub: 'Revisa la sección de Mensajes para responder.',
    });
  }
  if (activeProjects.length > 0) {
    notifications.push({
      text: `Tienes ${activeProjects.length} contrato(s) activo(s)`,
      sub: 'Revisa el progreso y la garantía en custodia (Escrow) más abajo.',
    });
  }
  if (!isStudent && awaitingDepositProjects.length > 0) {
    notifications.push({
      text: `${awaitingDepositProjects.length} contrato(s) esperando tu depósito en garantía`,
      sub: 'El estudiante no puede empezar hasta que se confirme el pago.',
    });
  }
  if (isStudent && pendingApplications.length > 0) {
    notifications.push({
      text: `${pendingApplications.length} postulación(es) pendiente(s) de respuesta`,
      sub: 'Te avisaremos aquí cuando un emprendedor te asigne el proyecto.',
    });
  }
  if (!isStudent && unreviewedCompleted.length > 0) {
    notifications.push({
      text: `${unreviewedCompleted.length} proyecto(s) completado(s) sin calificar`,
      sub: 'Deja una review al estudiante para ayudar a otros emprendedores.',
    });
  }

  return (
    <div className="min-h-screen bg-editorial-bg pb-24 md:pb-8">

      {/* Top Bar / Header */}
      <header className="flex flex-col md:flex-row justify-between items-start md:items-end mb-12 gap-4 pb-6 border-b border-editorial-border">
        <div>
          <button
            onClick={() => setView('landing')}
            className="mb-4 inline-flex items-center gap-1.5 text-xs font-bold uppercase tracking-wider text-editorial-muted hover:text-editorial-text transition-colors bg-white border border-editorial-border px-3 py-1.5 rounded-full cursor-pointer"
          >
            ← Volver a la Portada (Inicio)
          </button>
          <h2 className="text-3xl md:text-5xl font-serif font-black text-editorial-text tracking-tight">Hola, {firstName}</h2>
          <p className="text-sm text-editorial-muted mt-1">Aquí tienes un resumen de tu actividad en NYLA.</p>
        </div>

        <div className="flex items-center gap-4 self-end md:self-auto">
          {/* Notifications */}
          <div className="relative">
            <button
              onClick={() => {
                setShowNotifications(!showNotifications);
                setHasNewNotifications(false);
              }}
              className="p-2.5 bg-editorial-bg rounded-full border border-editorial-border hover:bg-editorial-light transition-all relative cursor-pointer"
            >
              <Bell className="w-5 h-5 text-editorial-text" />
              {hasNewNotifications && notifications.length > 0 && (
                <span className="absolute top-0 right-0 w-3 h-3 bg-red-600 rounded-full border-2 border-editorial-bg"></span>
              )}
            </button>

            <AnimatePresence>
              {showNotifications && (
                <motion.div
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: 10 }}
                  className="absolute right-0 mt-3 w-80 bg-editorial-bg border border-editorial-border rounded-[20px] shadow-md z-50 p-5"
                >
                  <h4 className="text-[11px] uppercase tracking-[0.2em] font-bold text-editorial-text/40 border-b border-editorial-border pb-2 mb-3">Notificaciones</h4>
                  <div className="space-y-3">
                    {notifications.length > 0 ? (
                      notifications.map((n, idx) => (
                        <div key={idx} className="flex gap-3 text-xs">
                          <span className="w-2 h-2 bg-editorial-text rounded-full shrink-0 mt-1.5"></span>
                          <div>
                            <p className="font-bold text-editorial-text">{n.text}</p>
                            <p className="text-editorial-muted mt-0.5">{n.sub}</p>
                          </div>
                        </div>
                      ))
                    ) : (
                      <p className="text-xs text-editorial-muted">Sin notificaciones nuevas por ahora.</p>
                    )}
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>

          {/* Profile Avatar */}
          <div
            onClick={() => setView('perfil')}
            className="w-11 h-11 rounded-full overflow-hidden border border-editorial-border cursor-pointer hover:border-editorial-text transition-all bg-white flex items-center justify-center"
          >
            {photoUrl ? (
              <img className="w-full h-full object-cover" referrerPolicy="no-referrer" src={photoUrl} alt={displayName || 'Perfil'} />
            ) : (
              <span className="text-sm font-bold text-editorial-text">{(displayName || '?').charAt(0).toUpperCase()}</span>
            )}
          </div>
        </div>
      </header>

      {/* Stats Grid */}
      <section className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-8 mb-12">
        {isStudent ? (
          <>
            <div className="bg-editorial-bg p-6 rounded-[24px] border border-editorial-border flex flex-col justify-between hover:bg-editorial-light/40 transition-colors">
              <div className="flex items-center justify-between mb-4">
                <span className="text-[10px] uppercase tracking-[0.15em] font-bold text-editorial-muted">Postulaciones</span>
                <div className="w-10 h-10 rounded-full bg-editorial-text/5 flex items-center justify-center text-editorial-text">
                  <Send className="w-4 h-4" />
                </div>
              </div>
              <div className="text-5xl font-serif font-black text-editorial-text">{stats.appliedCount ?? 0}</div>
            </div>
            <div className="bg-editorial-bg p-6 rounded-[24px] border border-editorial-border flex flex-col justify-between hover:bg-editorial-light/40 transition-colors">
              <div className="flex items-center justify-between mb-4">
                <span className="text-[10px] uppercase tracking-[0.15em] font-bold text-editorial-muted">Proyectos Activos</span>
                <div className="w-10 h-10 rounded-full bg-editorial-text/5 flex items-center justify-center text-editorial-text">
                  <Rocket className="w-4 h-4" />
                </div>
              </div>
              <div className="text-5xl font-serif font-black text-editorial-text">{String(stats.activeCount ?? 0).padStart(2, '0')}</div>
            </div>
            <div className="bg-editorial-bg p-6 rounded-[24px] border border-editorial-border flex flex-col justify-between hover:bg-editorial-light/40 transition-colors">
              <div className="flex items-center justify-between mb-4">
                <span className="text-[10px] uppercase tracking-[0.15em] font-bold text-editorial-muted">Proyectos Completados</span>
                <div className="w-10 h-10 rounded-full bg-editorial-text/5 flex items-center justify-center text-editorial-text">
                  <BadgeCheck className="w-4 h-4" />
                </div>
              </div>
              <div className="text-5xl font-serif font-black text-editorial-text">{String(stats.completedCount ?? 0).padStart(2, '0')}</div>
            </div>
            <div className="bg-editorial-bg p-6 rounded-[24px] border border-editorial-border flex flex-col justify-between hover:bg-editorial-light/40 transition-colors">
              <div className="flex items-center justify-between mb-4">
                <span className="text-[10px] uppercase tracking-[0.15em] font-bold text-editorial-muted">Ingresos Generados</span>
                <div className="w-10 h-10 rounded-full bg-editorial-text/5 flex items-center justify-center text-editorial-text">
                  <Landmark className="w-4 h-4" />
                </div>
              </div>
              <div className="text-4xl font-serif font-black text-editorial-text">${(stats.earningsCount ?? 0).toLocaleString('en-US', { minimumFractionDigits: 2 })}</div>
            </div>
          </>
        ) : (
          <>
            <div className="bg-editorial-bg p-6 rounded-[24px] border border-editorial-border flex flex-col justify-between hover:bg-editorial-light/40 transition-colors">
              <div className="flex items-center justify-between mb-4">
                <span className="text-[10px] uppercase tracking-[0.15em] font-bold text-editorial-muted">Proyectos Publicados</span>
                <div className="w-10 h-10 rounded-full bg-editorial-text/5 flex items-center justify-center text-editorial-text">
                  <Send className="w-4 h-4" />
                </div>
              </div>
              <div className="text-5xl font-serif font-black text-editorial-text">{stats.postedCount ?? 0}</div>
            </div>
            <div className="bg-editorial-bg p-6 rounded-[24px] border border-editorial-border flex flex-col justify-between hover:bg-editorial-light/40 transition-colors">
              <div className="flex items-center justify-between mb-4">
                <span className="text-[10px] uppercase tracking-[0.15em] font-bold text-editorial-muted">Proyectos Activos</span>
                <div className="w-10 h-10 rounded-full bg-editorial-text/5 flex items-center justify-center text-editorial-text">
                  <Rocket className="w-4 h-4" />
                </div>
              </div>
              <div className="text-5xl font-serif font-black text-editorial-text">{String(stats.activeCount ?? 0).padStart(2, '0')}</div>
            </div>
            <div className="bg-editorial-bg p-6 rounded-[24px] border border-editorial-border flex flex-col justify-between hover:bg-editorial-light/40 transition-colors">
              <div className="flex items-center justify-between mb-4">
                <span className="text-[10px] uppercase tracking-[0.15em] font-bold text-editorial-muted">Proyectos Completados</span>
                <div className="w-10 h-10 rounded-full bg-editorial-text/5 flex items-center justify-center text-editorial-text">
                  <BadgeCheck className="w-4 h-4" />
                </div>
              </div>
              <div className="text-5xl font-serif font-black text-editorial-text">{String(stats.completedCount ?? 0).padStart(2, '0')}</div>
            </div>
            <div className="bg-editorial-bg p-6 rounded-[24px] border border-editorial-border flex flex-col justify-between hover:bg-editorial-light/40 transition-colors">
              <div className="flex items-center justify-between mb-4">
                <span className="text-[10px] uppercase tracking-[0.15em] font-bold text-editorial-muted">Invertido en Talento</span>
                <div className="w-10 h-10 rounded-full bg-editorial-text/5 flex items-center justify-center text-editorial-text">
                  <Landmark className="w-4 h-4" />
                </div>
              </div>
              <div className="text-4xl font-serif font-black text-editorial-text">${(stats.spentCount ?? 0).toLocaleString('en-US', { minimumFractionDigits: 2 })}</div>
            </div>
          </>
        )}
      </section>

      {loading && (
        <div className="flex items-center justify-center py-12 text-editorial-muted text-xs gap-2">
          <Loader2 className="w-4 h-4 animate-spin" /> Cargando tu actividad...
        </div>
      )}

      {/* First-time entrepreneur onboarding: no projects published yet */}
      {!loading && !isStudent && projects.length === 0 && (
        <div className="mb-12 bg-editorial-text text-editorial-bg rounded-[32px] p-8 flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
          <div className="space-y-2 max-w-xl">
            <span className="text-[10px] uppercase tracking-[0.2em] font-bold text-editorial-bg/60">Primeros pasos</span>
            <h3 className="text-2xl font-serif font-black">Cuéntanos de qué va tu negocio</h3>
            <p className="text-xs text-editorial-bg/80 leading-relaxed">
              Dinos el nombre de tu emprendimiento, a qué se dedica y qué necesitas. Con eso, nuestro match inteligente analiza a los estudiantes registrados y te muestra al candidato más compatible con un porcentaje de coincidencia real.
            </p>
          </div>
          <button
            type="button"
            onClick={onOpenNewProject}
            className="shrink-0 bg-editorial-bg text-editorial-text px-6 py-3 rounded-full font-bold text-[11px] uppercase tracking-[0.15em] hover:opacity-90 transition-all cursor-pointer flex items-center gap-2"
          >
            <Rocket className="w-4 h-4" /> Describir mi negocio y ver mi match
          </button>
        </div>
      )}

      {actionError && (
        <p className="text-xs text-red-700 bg-red-50 border border-red-200 rounded-xl p-3 mb-8">{actionError}</p>
      )}

      {!loading && (
      <>
      {/* Awaiting escrow deposit */}
      {!isStudent && awaitingDepositProjects.length > 0 && (
        <section className="mb-12 space-y-4">
          <div className="flex gap-2 items-center pb-2.5 border-b border-editorial-border">
            <Wallet className="w-5 h-5 text-editorial-text" />
            <h3 className="text-2xl font-serif font-bold text-editorial-text">Esperando Depósito en Garantía</h3>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            {awaitingDepositProjects.map(project => (
              <div key={project.id} className="bg-white border border-editorial-border rounded-[24px] p-5 space-y-3">
                <h4 className="text-sm font-serif font-bold text-editorial-text">{project.title}</h4>
                <p className="text-[10px] text-editorial-muted">
                  {project.student?.studentProfile?.fullName ? `Asignado a ${project.student.studentProfile.fullName} • ` : ''}
                  Presupuesto: ${project.budget.toFixed(2)}
                </p>
                <button
                  type="button"
                  onClick={() => handleDeposit(project.id)}
                  disabled={depositingId === project.id}
                  className="w-full py-3 bg-editorial-text text-editorial-bg hover:opacity-90 transition-all font-bold text-[10px] uppercase tracking-[0.15em] rounded-full cursor-pointer border-none disabled:opacity-50"
                >
                  {depositingId === project.id ? 'Redirigiendo a Stripe...' : 'Depositar en Garantía'}
                </button>
              </div>
            ))}
          </div>
        </section>
      )}

      {isStudent && awaitingDepositProjects.length > 0 && (
        <section className="mb-12 space-y-4">
          <div className="flex gap-2 items-center pb-2.5 border-b border-editorial-border">
            <Wallet className="w-5 h-5 text-editorial-text" />
            <h3 className="text-2xl font-serif font-bold text-editorial-text">Esperando Depósito del Emprendedor</h3>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            {awaitingDepositProjects.map(project => (
              <div key={project.id} className="bg-white border border-editorial-border rounded-[24px] p-5 space-y-1">
                <h4 className="text-sm font-serif font-bold text-editorial-text">{project.title}</h4>
                <p className="text-[10px] text-editorial-muted">
                  El contrato fue firmado. Esperando que {project.entrepreneurName || 'el emprendedor'} deposite los fondos en garantía para comenzar.
                </p>
              </div>
            ))}
          </div>
        </section>
      )}

      {/* Active Projects & Payout Releases Panel */}
      {activeProjects.length > 0 && (
        <section className="mb-12 space-y-4">
          <div className="flex gap-2 items-center pb-2.5 border-b border-editorial-border">
            <ShieldCheck className="w-5 h-5 text-editorial-text" />
            <h3 className="text-2xl font-serif font-bold text-editorial-text">Contratos Activos y Garantía Escrow</h3>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            {activeProjects.map(project => (
              <div key={project.id} className="bg-white border border-editorial-border rounded-[32px] p-6 flex flex-col justify-between space-y-6">

                <div className="space-y-3.5">
                  <div className="flex justify-between items-start gap-4">
                    <div>
                      <span className="bg-green-50 text-green-800 border border-green-200 px-2.5 py-1 rounded text-[9px] font-bold uppercase tracking-wider">
                        FONDOS EN CUSTODIA (ESCROW)
                      </span>
                      <h4 className="text-lg font-serif font-bold text-editorial-text mt-2 leading-snug">{project.title}</h4>
                      {!isStudent && project.student?.studentProfile && (
                        <p className="text-[10px] text-editorial-muted mt-1 font-bold uppercase tracking-wider">
                          Estudiante: {project.student.studentProfile.fullName}
                        </p>
                      )}
                      {isStudent && project.entrepreneurName && (
                        <p className="text-[10px] text-editorial-muted mt-1 font-bold uppercase tracking-wider">
                          Emprendedor: {project.entrepreneurName}
                        </p>
                      )}
                    </div>
                    <div className="text-right">
                      <p className="text-[9px] text-editorial-muted font-bold uppercase tracking-wider">PRESUPUESTO</p>
                      <p className="text-xl font-serif font-bold text-editorial-text">${project.budget.toFixed(2)}</p>
                    </div>
                  </div>

                  <p className="text-xs text-editorial-muted leading-relaxed line-clamp-2">
                    {project.description}
                  </p>

                  <div className="bg-editorial-bg p-3.5 rounded-xl text-[11px] leading-relaxed text-editorial-text flex gap-2">
                    <CheckCircle2 className="w-4 h-4 text-editorial-accent shrink-0 mt-0.5" />
                    <div>
                      <strong>Garantía NYLA Activa:</strong> Los fondos se encuentran retenidos temporalmente de forma segura. Tras la aprobación, NYLA retiene su comisión fija de ${NYLA_FIXED_FEE.toFixed(2)}.
                    </div>
                  </div>

                  <div className="space-y-2 pt-2">
                    <div className="flex justify-between items-center text-[10px] font-bold text-editorial-muted uppercase tracking-wider">
                      <span>Progreso de Entregables</span>
                      <span>{project.progress}%</span>
                    </div>
                    <div className="w-full bg-editorial-light h-1.5 rounded-full overflow-hidden">
                      <div className="bg-editorial-text h-full transition-all duration-500" style={{ width: `${project.progress}%` }}></div>
                    </div>
                  </div>
                </div>

                {project.deliverables && project.deliverables.length > 0 && (
                  <div className="flex gap-2 flex-wrap pt-1">
                    {project.deliverables.map((img, idx) => (
                      <img key={idx} src={img} alt={`Entregable ${idx + 1}`} className="w-14 h-14 rounded-lg object-cover border border-editorial-border" />
                    ))}
                  </div>
                )}

                {isStudent && project.progress < 100 && (
                  <div className="space-y-2 pt-1">
                    <div className="flex gap-2 flex-wrap">
                      {(deliverImages[project.id] || []).map((img, idx) => (
                        <img key={idx} src={img} alt={`Adjunto ${idx + 1}`} className="w-12 h-12 rounded-lg object-cover border border-editorial-border" />
                      ))}
                      <label className="w-12 h-12 rounded-lg border border-dashed border-editorial-border flex items-center justify-center text-editorial-muted cursor-pointer hover:bg-editorial-light text-lg">
                        +
                        <input
                          type="file"
                          accept="image/*"
                          className="hidden"
                          onChange={(e) => {
                            const file = e.target.files?.[0];
                            e.target.value = '';
                            if (file) handleAddDeliverImage(project.id, file);
                          }}
                        />
                      </label>
                    </div>
                    <p className="text-[9px] text-editorial-muted">Adjunta capturas o fotos de lo que entregaste (opcional).</p>
                  </div>
                )}

                <div className="flex gap-2.5 pt-3 border-t border-editorial-border/40">
                  {isStudent ? (
                    project.progress < 100 ? (
                      <button
                        type="button"
                        onClick={() => handleDeliver(project.id)}
                        className="flex-1 py-3 bg-editorial-text text-editorial-bg hover:opacity-90 transition-all font-bold text-[10px] uppercase tracking-[0.15em] rounded-full cursor-pointer border-none"
                      >
                        Marcar como Entregado
                      </button>
                    ) : (
                      <div className="flex-1 py-3 text-center text-[10px] font-bold uppercase tracking-[0.15em] text-editorial-muted">
                        Esperando aprobación del emprendedor
                      </div>
                    )
                  ) : (
                    project.progress >= 100 ? (
                      <button
                        type="button"
                        onClick={() => handleInitiateRelease(project)}
                        className="flex-1 py-3 bg-green-700 text-white hover:bg-green-800 transition-all font-bold text-[10px] uppercase tracking-[0.15em] rounded-full cursor-pointer border-none flex items-center justify-center gap-1.5"
                      >
                        <BadgeCheck className="w-4 h-4" /> Autorizar & Liberar Fondos
                      </button>
                    ) : (
                      <div className="flex-1 py-3 text-center text-[10px] font-bold uppercase tracking-[0.15em] text-editorial-muted">
                        Esperando entrega del estudiante
                      </div>
                    )
                  )}
                </div>

              </div>
            ))}
          </div>
        </section>
      )}

      {/* Entrepreneur: completed projects — leave a review */}
      {!isStudent && completedProjects.length > 0 && (
        <section className="mb-12 space-y-4">
          <div className="flex gap-2 items-center pb-2.5 border-b border-editorial-border">
            <BadgeCheck className="w-5 h-5 text-editorial-text" />
            <h3 className="text-2xl font-serif font-bold text-editorial-text">Proyectos Completados</h3>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {completedProjects.map(project => (
              <div key={project.id} className="bg-editorial-bg rounded-[24px] border border-editorial-border p-5 space-y-3">
                <div className="flex justify-between items-start">
                  <div>
                    <h4 className="font-serif font-bold text-sm text-editorial-text">{project.title}</h4>
                    <p className="text-[10px] text-editorial-muted">
                      Estudiante: {project.student?.studentProfile?.fullName ?? 'N/D'}
                    </p>
                  </div>
                  <span className="text-xs font-serif font-bold text-editorial-text">${project.budget.toFixed(2)}</span>
                </div>
                {project.review ? (
                  <div className="bg-white p-3 rounded-xl border border-editorial-border text-xs space-y-1">
                    <div className="flex items-center gap-0.5 text-amber-500">
                      {Array.from({ length: 5 }).map((_, i) => (
                        <span key={i}>{i < project.review!.rating ? '★' : '☆'}</span>
                      ))}
                    </div>
                    {project.review.comment && <p className="text-editorial-muted italic">"{project.review.comment}"</p>}
                  </div>
                ) : (
                  <button
                    type="button"
                    onClick={() => handleOpenReview(project)}
                    className="w-full py-2.5 border border-editorial-border text-editorial-text font-bold rounded-full text-[10px] uppercase tracking-[0.15em] hover:bg-editorial-light transition-all cursor-pointer"
                  >
                    Dejar Review al Estudiante
                  </button>
                )}
              </div>
            ))}
          </div>
        </section>
      )}

      {/* Review Modal */}
      <AnimatePresence>
        {reviewingProject && (
          <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
            <motion.div
              initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
              onClick={() => setReviewingProject(null)}
              className="absolute inset-0 bg-editorial-text/40 backdrop-blur-sm"
            />
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 0.95 }}
              className="relative bg-white w-full max-w-md rounded-[28px] border border-editorial-border p-6 space-y-4 z-10"
            >
              <h4 className="font-serif font-black text-lg text-editorial-text">Calificar a {reviewingProject.student?.studentProfile?.fullName ?? 'estudiante'}</h4>
              <div className="flex gap-1.5 justify-center text-3xl text-amber-500">
                {Array.from({ length: 5 }).map((_, i) => (
                  <button key={i} type="button" onClick={() => setReviewRating(i + 1)} className="cursor-pointer bg-transparent border-none">
                    {i < reviewRating ? '★' : '☆'}
                  </button>
                ))}
              </div>
              <textarea
                value={reviewComment}
                onChange={(e) => setReviewComment(e.target.value)}
                rows={3}
                placeholder="Comentario (opcional)"
                className="w-full bg-editorial-bg border border-editorial-border rounded-xl p-3 text-xs focus:ring-1 focus:ring-editorial-text focus:outline-none text-editorial-text"
              />
              {reviewError && <p className="text-xs text-red-700 bg-red-50 border border-red-200 rounded-xl p-2.5">{reviewError}</p>}
              <div className="flex gap-3">
                <button type="button" onClick={() => setReviewingProject(null)} className="flex-1 py-2.5 border border-editorial-border text-editorial-text font-bold rounded-full text-[10px] uppercase tracking-[0.15em] cursor-pointer bg-transparent">Cancelar</button>
                <button type="button" onClick={handleSubmitReview} disabled={submittingReview} className="flex-1 py-2.5 bg-editorial-text text-editorial-bg font-bold rounded-full text-[10px] uppercase tracking-[0.15em] cursor-pointer disabled:opacity-50 border-none">
                  {submittingReview ? 'Enviando...' : 'Enviar Review'}
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* Entrepreneur: open projects + applicants */}
      {!isStudent && openProjects.length > 0 && (
        <section className="mb-12 space-y-4">
          <div className="flex gap-2 items-center pb-2.5 border-b border-editorial-border">
            <Users className="w-5 h-5 text-editorial-text" />
            <h3 className="text-2xl font-serif font-bold text-editorial-text">Proyectos Publicados y Postulantes</h3>
          </div>
          <div className="space-y-4">
            {openProjects.map(project => (
              <div key={project.id} className="bg-white border border-editorial-border rounded-[24px] p-5 space-y-3">
                <div className="flex justify-between items-start gap-4">
                  <div>
                    <h4 className="text-sm font-serif font-bold text-editorial-text">{project.title}</h4>
                    <p className="text-[10px] text-editorial-muted mt-0.5">Abierto • ${project.budget.toFixed(2)} presupuesto</p>
                  </div>
                </div>
                {(project.applications?.length ?? 0) === 0 ? (
                  <p className="text-xs text-editorial-muted">Aún no hay postulantes. También puedes ir a "Nuevo Proyecto" para revisar el match inteligente.</p>
                ) : (
                  <div className="space-y-2">
                    {project.applications!.filter(a => a.status === 'PENDING').map(app => (
                      <div key={app.id} className="flex items-center justify-between bg-editorial-bg p-3 rounded-xl">
                        <span className="text-xs font-bold text-editorial-text">{app.student?.studentProfile?.fullName || 'Estudiante'}</span>
                        <button
                          type="button"
                          onClick={() => handleAssign(project.id, app.studentId)}
                          disabled={assigningId === app.studentId}
                          className="text-[10px] uppercase tracking-wider font-bold bg-editorial-text text-editorial-bg px-3 py-1.5 rounded-full cursor-pointer border-none disabled:opacity-50"
                        >
                          {assigningId === app.studentId ? 'Asignando...' : 'Asignar'}
                        </button>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            ))}
          </div>
        </section>
      )}
      </>
      )}

      {/* Main Layout Split */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 items-start">

        <div className="lg:col-span-8 space-y-8">
          {isStudent ? (
            <div className="bg-editorial-text text-editorial-bg p-8 rounded-[40px] flex flex-col md:flex-row items-center gap-8 border border-editorial-border">
              <div className="flex-1 space-y-3">
                <h4 className="text-2xl font-serif font-bold text-editorial-bg">Explora nuevas oportunidades</h4>
                <p className="text-editorial-bg/80 text-sm max-w-md leading-relaxed">
                  Revisa los proyectos abiertos publicados por emprendedores y postúlate a los que se ajusten a tu perfil.
                </p>
                <button
                  onClick={() => setView('proyectos')}
                  className="bg-editorial-bg text-editorial-text px-6 py-3 rounded-full font-bold text-[11px] uppercase tracking-[0.2em] hover:bg-editorial-light transition-colors cursor-pointer border-none"
                >
                  Ver proyectos
                </button>
              </div>
            </div>
          ) : (
            <div className="bg-editorial-text text-editorial-bg p-8 rounded-[40px] flex flex-col md:flex-row items-center gap-8 border border-editorial-border">
              <div className="flex-1 space-y-3">
                <h4 className="text-2xl font-serif font-bold text-editorial-bg">¿Necesitas talento para un nuevo proyecto?</h4>
                <p className="text-editorial-bg/80 text-sm max-w-md leading-relaxed">
                  Publica los requisitos y nuestro match inteligente te mostrará los estudiantes más compatibles.
                </p>
                <button
                  onClick={onOpenNewProject}
                  className="bg-editorial-bg text-editorial-text px-6 py-3 rounded-full font-bold text-[11px] uppercase tracking-[0.2em] hover:bg-editorial-light transition-colors cursor-pointer border-none flex items-center gap-2"
                >
                  <Plus className="w-4 h-4" /> Nuevo Proyecto
                </button>
              </div>
            </div>
          )}
        </div>

        {/* Sidebar (col-span-4) */}
        <aside className="lg:col-span-4 space-y-8">

          {isStudent && pendingApplications.length > 0 && (
            <div className="bg-editorial-bg p-6 rounded-[32px] border border-editorial-border space-y-4">
              <h3 className="text-base font-serif font-bold text-editorial-text">Postulaciones Pendientes</h3>
              <div className="space-y-3">
                {pendingApplications.map(p => (
                  <div key={p.id} className="flex gap-3 items-start">
                    <div className="w-8 h-8 rounded-full bg-editorial-light text-editorial-muted flex items-center justify-center border border-editorial-border shrink-0">
                      <Hourglass className="w-3.5 h-3.5" />
                    </div>
                    <div>
                      <h5 className="text-xs font-bold text-editorial-text">{p.title}</h5>
                      <p className="text-[10px] font-bold text-editorial-muted mt-0.5">Esperando respuesta del emprendedor</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Helpful Tip Card */}
          <div className="bg-editorial-light p-6 rounded-[32px] border border-editorial-border space-y-3">
            <div className="text-editorial-text">
              <Lightbulb className="w-6 h-6" />
            </div>
            <h5 className="text-xs font-bold text-editorial-text uppercase tracking-wider">Consejo NYLA</h5>
            <p className="text-xs text-editorial-muted leading-relaxed">
              {isStudent
                ? 'Completar tu perfil con habilidades y disponibilidad reales aumenta tus posibilidades de coincidir con emprendedores.'
                : 'Mientras más detallada sea la descripción y las habilidades requeridas, mejor será el match inteligente de candidatos.'}
            </p>
            <button
              onClick={() => setView('perfil')}
              className="mt-2 inline-flex items-center gap-1 text-[11px] uppercase tracking-[0.15em] font-bold text-editorial-text hover:opacity-60 cursor-pointer border-none bg-transparent"
            >
              <span>Actualizar Perfil</span>
              <ChevronRight className="w-3.5 h-3.5" />
            </button>
          </div>
        </aside>

      </div>

      {/* Escrow Release & Celebration Payout Dialog Modal */}
      <AnimatePresence>
        {showCelebration && releasingProject && (
          <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
            <motion.div
              initial={{ opacity: 0, y: 30, scale: 0.95 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: 30, scale: 0.95 }}
              className="bg-white border border-editorial-border rounded-[40px] w-full max-w-lg overflow-hidden p-8 space-y-6"
            >
              <div className="text-center space-y-3">
                <div className="w-14 h-14 bg-green-100 text-green-800 rounded-full flex items-center justify-center mx-auto">
                  <ShieldCheck className="w-8 h-8" />
                </div>
                <h3 className="text-2xl font-serif font-black text-editorial-text leading-tight">Autorizar Liberación de Custodia</h3>
                <p className="text-xs text-editorial-muted max-w-sm mx-auto">
                  Por favor, confirma que los entregables han sido revisados y cumplen plenamente con tus requerimientos técnicos.
                </p>
              </div>

              <div className="border border-editorial-border rounded-2xl p-5 space-y-3.5 bg-editorial-bg/30">
                <span className="text-[10px] uppercase tracking-wider text-editorial-muted font-bold block">Liquidación Económica del Contrato</span>

                <div className="space-y-2 text-xs">
                  <div className="flex justify-between">
                    <span className="text-editorial-muted">Total Retenido en Garantía:</span>
                    <strong className="text-editorial-text">${releasingProject.budget.toFixed(2)} USD</strong>
                  </div>
                  <div className="flex justify-between border-b border-editorial-border/60 pb-2.5 mb-2">
                    <span className="text-editorial-muted">Comisión Fija de Servicio NYLA:</span>
                    <strong className="text-red-700">-${NYLA_FIXED_FEE.toFixed(2)} USD</strong>
                  </div>
                  <div className="flex justify-between font-serif font-black text-sm text-editorial-accent">
                    <span>Monto Neto Liberado al Estudiante:</span>
                    <span>${calculateStudentPayout(releasingProject.estimatedHours).toFixed(2)} USD</span>
                  </div>
                </div>
              </div>

              <div className="text-[11px] text-editorial-muted leading-relaxed text-center italic bg-editorial-bg/30 p-3.5 rounded-xl border border-editorial-border border-dashed">
                Al autorizar, el estado del contrato pasa a "Completado" y el estudiante queda notificado. La liberación real de fondos vía pasarela de pago llega en una fase posterior de la plataforma.
              </div>

              <div className="flex gap-4 pt-2">
                <button
                  type="button"
                  onClick={() => { setShowCelebration(false); setReleasingProject(null); }}
                  className="flex-1 py-3 border border-editorial-border text-editorial-text font-bold rounded-full text-[10px] uppercase tracking-[0.15em] hover:bg-editorial-light transition-all cursor-pointer bg-transparent"
                >
                  Cancelar
                </button>
                <button
                  type="button"
                  onClick={handleConfirmRelease}
                  className="flex-1 py-3 bg-green-700 text-white font-bold rounded-full text-[10px] uppercase tracking-[0.15em] hover:bg-green-800 transition-all cursor-pointer border-none"
                >
                  Aprobar & Confirmar
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

    </div>
  );
}
