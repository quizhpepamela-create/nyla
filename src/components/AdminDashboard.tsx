import React, { useEffect, useState } from 'react';
import { ShieldCheck, Users, Briefcase, DollarSign, Star, Loader2, LogOut, Ban, CheckCircle2 } from 'lucide-react';
import { ViewState } from '../types';
import { useAuth } from '../context/AuthContext';

interface AdminDashboardProps {
  setView: (view: ViewState) => void;
}

interface AdminUser {
  id: string;
  email: string;
  role: 'STUDENT' | 'ENTREPRENEUR' | 'ADMIN';
  isActive: boolean;
  createdAt: string;
  lastLoginAt: string | null;
  displayName: string | null;
}

interface AdminProject {
  id: string;
  title: string;
  status: string;
  escrowStatus: string;
  budget: number;
  estimatedHours: number;
  createdAt: string;
  entrepreneurName: string;
  studentName: string | null;
}

interface AdminStats {
  userCount: number;
  studentCount: number;
  entrepreneurCount: number;
  activeUserCount: number;
  projectCount: number;
  openCount: number;
  inProgressCount: number;
  completedCount: number;
  releasedCount: number;
  heldCount: number;
  totalCommission: number;
  totalPaidToStudents: number;
  totalEscrowHeld: number;
  reviewCount: number;
  platformReviewAverage: number | null;
}

interface AdminReview {
  id: string;
  rating: number;
  comment: string | null;
  createdAt: string;
  studentName: string;
  businessName: string;
}

type Tab = 'resumen' | 'usuarios' | 'proyectos' | 'reviews';

export default function AdminDashboard({ setView }: AdminDashboardProps) {
  const { logout } = useAuth();
  const [tab, setTab] = useState<Tab>('resumen');
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState<AdminStats | null>(null);
  const [users, setUsers] = useState<AdminUser[]>([]);
  const [projects, setProjects] = useState<AdminProject[]>([]);
  const [reviews, setReviews] = useState<AdminReview[]>([]);
  const [busyUserId, setBusyUserId] = useState<string | null>(null);

  const loadAll = async () => {
    setLoading(true);
    try {
      const [statsRes, usersRes, projectsRes, reviewsRes] = await Promise.all([
        fetch('/api/admin/stats', { credentials: 'include' }),
        fetch('/api/admin/users', { credentials: 'include' }),
        fetch('/api/admin/projects', { credentials: 'include' }),
        fetch('/api/admin/reviews', { credentials: 'include' }),
      ]);
      if (statsRes.ok) setStats(await statsRes.json());
      if (usersRes.ok) setUsers((await usersRes.json()).users);
      if (projectsRes.ok) setProjects((await projectsRes.json()).projects);
      if (reviewsRes.ok) setReviews((await reviewsRes.json()).reviews);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadAll();
  }, []);

  const handleToggleActive = async (user: AdminUser) => {
    setBusyUserId(user.id);
    try {
      const res = await fetch(`/api/admin/users/${user.id}/toggle-active`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({ isActive: !user.isActive }),
      });
      if (res.ok) {
        setUsers(prev => prev.map(u => u.id === user.id ? { ...u, isActive: !u.isActive } : u));
      }
    } finally {
      setBusyUserId(null);
    }
  };

  const handleDeleteReview = async (id: string) => {
    await fetch(`/api/admin/reviews/${id}`, { method: 'DELETE', credentials: 'include' });
    setReviews(prev => prev.filter(r => r.id !== id));
  };

  const handleLogout = async () => {
    await logout();
    setView('landing');
  };

  const tabs: { id: Tab; label: string }[] = [
    { id: 'resumen', label: 'Resumen' },
    { id: 'usuarios', label: 'Usuarios' },
    { id: 'proyectos', label: 'Proyectos' },
    { id: 'reviews', label: 'Reviews' },
  ];

  return (
    <div className="min-h-screen bg-editorial-bg p-6 md:p-10">
      <header className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-10 pb-6 border-b border-editorial-border">
        <div className="flex items-center gap-3">
          <div className="w-11 h-11 rounded-full bg-editorial-text text-editorial-bg flex items-center justify-center">
            <ShieldCheck className="w-5 h-5" />
          </div>
          <div>
            <h1 className="text-2xl font-serif font-black text-editorial-text">Panel de Administrador</h1>
            <p className="text-xs text-editorial-muted">Vista general de la plataforma NYLA</p>
          </div>
        </div>
        <button
          onClick={handleLogout}
          className="flex items-center gap-2 px-5 py-2.5 border border-editorial-border rounded-full text-[11px] font-bold uppercase tracking-wider text-editorial-text hover:bg-editorial-light transition-all cursor-pointer bg-white"
        >
          <LogOut className="w-3.5 h-3.5" /> Cerrar sesión
        </button>
      </header>

      <div className="flex gap-2 mb-8 bg-white border border-editorial-border rounded-full p-1.5 w-fit">
        {tabs.map(t => (
          <button
            key={t.id}
            onClick={() => setTab(t.id)}
            className={`px-5 py-2 rounded-full text-[11px] font-bold uppercase tracking-wider cursor-pointer transition-all ${
              tab === t.id ? 'bg-editorial-text text-editorial-bg' : 'text-editorial-muted hover:bg-editorial-light'
            }`}
          >
            {t.label}
          </button>
        ))}
      </div>

      {loading && (
        <div className="flex items-center justify-center py-16 text-editorial-muted text-xs gap-2">
          <Loader2 className="w-4 h-4 animate-spin" /> Cargando datos...
        </div>
      )}

      {!loading && tab === 'resumen' && stats && (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          <div className="bg-white p-6 rounded-[24px] border border-editorial-border space-y-2">
            <Users className="w-5 h-5 text-editorial-text" />
            <p className="text-3xl font-serif font-black text-editorial-text">{stats.userCount}</p>
            <p className="text-[10px] uppercase tracking-wider text-editorial-muted font-bold">Usuarios ({stats.studentCount} estudiantes, {stats.entrepreneurCount} emprendedores)</p>
          </div>
          <div className="bg-white p-6 rounded-[24px] border border-editorial-border space-y-2">
            <CheckCircle2 className="w-5 h-5 text-editorial-text" />
            <p className="text-3xl font-serif font-black text-editorial-text">{stats.activeUserCount}</p>
            <p className="text-[10px] uppercase tracking-wider text-editorial-muted font-bold">Cuentas activas (no bloqueadas)</p>
          </div>
          <div className="bg-white p-6 rounded-[24px] border border-editorial-border space-y-2">
            <Briefcase className="w-5 h-5 text-editorial-text" />
            <p className="text-3xl font-serif font-black text-editorial-text">{stats.projectCount}</p>
            <p className="text-[10px] uppercase tracking-wider text-editorial-muted font-bold">
              Proyectos ({stats.openCount} abiertos, {stats.inProgressCount} en progreso, {stats.completedCount} completados)
            </p>
          </div>
          <div className="bg-white p-6 rounded-[24px] border border-editorial-border space-y-2">
            <Star className="w-5 h-5 text-amber-500" />
            <p className="text-3xl font-serif font-black text-editorial-text">{stats.platformReviewAverage ?? '—'}</p>
            <p className="text-[10px] uppercase tracking-wider text-editorial-muted font-bold">Calificación promedio ({stats.reviewCount} reviews)</p>
          </div>
          <div className="bg-white p-6 rounded-[24px] border border-editorial-border space-y-2">
            <DollarSign className="w-5 h-5 text-editorial-text" />
            <p className="text-3xl font-serif font-black text-editorial-text">${stats.totalCommission.toFixed(2)}</p>
            <p className="text-[10px] uppercase tracking-wider text-editorial-muted font-bold">Comisión total de NYLA ({stats.releasedCount} pagados)</p>
          </div>
          <div className="bg-white p-6 rounded-[24px] border border-editorial-border space-y-2">
            <DollarSign className="w-5 h-5 text-editorial-accent" />
            <p className="text-3xl font-serif font-black text-editorial-text">${stats.totalPaidToStudents.toFixed(2)}</p>
            <p className="text-[10px] uppercase tracking-wider text-editorial-muted font-bold">Pagado a estudiantes</p>
          </div>
          <div className="bg-white p-6 rounded-[24px] border border-editorial-border space-y-2">
            <DollarSign className="w-5 h-5 text-blue-600" />
            <p className="text-3xl font-serif font-black text-editorial-text">${stats.totalEscrowHeld.toFixed(2)}</p>
            <p className="text-[10px] uppercase tracking-wider text-editorial-muted font-bold">En garantía ahora ({stats.heldCount} contratos)</p>
          </div>
        </div>
      )}

      {!loading && tab === 'usuarios' && (
        <div className="bg-white border border-editorial-border rounded-[24px] overflow-hidden">
          <table className="w-full text-xs">
            <thead>
              <tr className="bg-editorial-bg text-[10px] uppercase tracking-wider text-editorial-muted font-bold">
                <th className="text-left p-4">Nombre</th>
                <th className="text-left p-4">Correo</th>
                <th className="text-left p-4">Rol</th>
                <th className="text-left p-4">Estado</th>
                <th className="text-right p-4">Acción</th>
              </tr>
            </thead>
            <tbody>
              {users.map(u => (
                <tr key={u.id} className="border-t border-editorial-border">
                  <td className="p-4 font-bold text-editorial-text">{u.displayName || '—'}</td>
                  <td className="p-4 text-editorial-muted">{u.email}</td>
                  <td className="p-4">{u.role}</td>
                  <td className="p-4">
                    <span className={`px-2.5 py-1 rounded-full text-[9px] font-bold uppercase ${u.isActive ? 'bg-green-50 text-green-700 border border-green-200' : 'bg-red-50 text-red-700 border border-red-200'}`}>
                      {u.isActive ? 'Activo' : 'Bloqueado'}
                    </span>
                  </td>
                  <td className="p-4 text-right">
                    {u.role !== 'ADMIN' && (
                      <button
                        onClick={() => handleToggleActive(u)}
                        disabled={busyUserId === u.id}
                        className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-[9px] font-bold uppercase cursor-pointer border disabled:opacity-50 ${
                          u.isActive ? 'border-red-200 text-red-700 hover:bg-red-50' : 'border-green-200 text-green-700 hover:bg-green-50'
                        }`}
                      >
                        {u.isActive ? <><Ban className="w-3 h-3" /> Bloquear</> : <><CheckCircle2 className="w-3 h-3" /> Activar</>}
                      </button>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {!loading && tab === 'proyectos' && (
        <div className="bg-white border border-editorial-border rounded-[24px] overflow-hidden overflow-x-auto">
          <table className="w-full text-xs">
            <thead>
              <tr className="bg-editorial-bg text-[10px] uppercase tracking-wider text-editorial-muted font-bold">
                <th className="text-left p-4">Proyecto</th>
                <th className="text-left p-4">Emprendedor</th>
                <th className="text-left p-4">Estudiante</th>
                <th className="text-left p-4">Estado</th>
                <th className="text-left p-4">Escrow</th>
                <th className="text-right p-4">Presupuesto</th>
              </tr>
            </thead>
            <tbody>
              {projects.map(p => (
                <tr key={p.id} className="border-t border-editorial-border">
                  <td className="p-4 font-bold text-editorial-text">{p.title}</td>
                  <td className="p-4 text-editorial-muted">{p.entrepreneurName}</td>
                  <td className="p-4 text-editorial-muted">{p.studentName || '—'}</td>
                  <td className="p-4">{p.status}</td>
                  <td className="p-4">{p.escrowStatus}</td>
                  <td className="p-4 text-right font-bold">${p.budget.toFixed(2)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {!loading && tab === 'reviews' && (
        <div className="space-y-3">
          {reviews.length === 0 && <p className="text-xs text-editorial-muted">No hay reviews todavía.</p>}
          {reviews.map(r => (
            <div key={r.id} className="bg-white border border-editorial-border rounded-2xl p-4 flex justify-between items-start gap-4">
              <div className="space-y-1">
                <div className="flex items-center gap-2">
                  <span className="font-bold text-xs text-editorial-text">{r.studentName}</span>
                  <span className="text-[10px] text-editorial-muted">calificado por {r.businessName}</span>
                </div>
                <div className="flex text-amber-500 text-xs">
                  {Array.from({ length: 5 }).map((_, i) => <Star key={i} className={`w-3.5 h-3.5 ${i < r.rating ? 'fill-amber-500' : ''}`} />)}
                </div>
                {r.comment && <p className="text-xs text-editorial-muted italic">"{r.comment}"</p>}
              </div>
              <button
                onClick={() => handleDeleteReview(r.id)}
                className="text-[9px] font-bold uppercase text-red-700 border border-red-200 px-3 py-1.5 rounded-full hover:bg-red-50 cursor-pointer shrink-0"
              >
                Eliminar
              </button>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
