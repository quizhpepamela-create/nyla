import React, { useEffect, useState } from 'react';
import { Star, Briefcase, Loader2, ArrowLeft, GraduationCap } from 'lucide-react';
import { ViewState, StudentDirectoryEntry, StudentDetail } from '../types';

interface StudentsPageProps {
  setView: (view: ViewState) => void;
}

export default function StudentsPage({ setView }: StudentsPageProps) {
  const [students, setStudents] = useState<StudentDirectoryEntry[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const [activeStudentId, setActiveStudentId] = useState<string | null>(null);
  const [detail, setDetail] = useState<StudentDetail | null>(null);
  const [loadingDetail, setLoadingDetail] = useState(false);

  useEffect(() => {
    const load = async () => {
      setLoading(true);
      setError(null);
      try {
        const res = await fetch('/api/students', { credentials: 'include' });
        const data = await res.json();
        if (!res.ok) throw new Error(data.error || 'No se pudo cargar el directorio de talento.');
        setStudents(data.students);
      } catch (err: any) {
        setError(err.message || 'No se pudo cargar el directorio de talento.');
      } finally {
        setLoading(false);
      }
    };
    load();
  }, []);

  const openStudent = async (id: string) => {
    setActiveStudentId(id);
    setLoadingDetail(true);
    setDetail(null);
    try {
      const res = await fetch(`/api/students/${id}`, { credentials: 'include' });
      const data = await res.json();
      if (res.ok) setDetail(data);
    } finally {
      setLoadingDetail(false);
    }
  };

  if (activeStudentId) {
    return (
      <div className="min-h-screen bg-editorial-bg pb-24 md:pb-8">
        <button
          onClick={() => setActiveStudentId(null)}
          className="mb-6 inline-flex items-center gap-1.5 text-xs font-bold uppercase tracking-wider text-editorial-muted hover:text-editorial-text transition-colors bg-white border border-editorial-border px-3 py-1.5 rounded-full cursor-pointer"
        >
          <ArrowLeft className="w-3.5 h-3.5" /> Volver al Directorio
        </button>

        {loadingDetail && (
          <div className="flex items-center justify-center py-16 text-editorial-muted text-xs gap-2">
            <Loader2 className="w-4 h-4 animate-spin" /> Cargando perfil...
          </div>
        )}

        {!loadingDetail && detail && (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            <div className="lg:col-span-1 space-y-4">
              <div className="bg-white border border-editorial-border rounded-[28px] p-6 text-center space-y-3">
                {detail.student.photoUrl ? (
                  <img src={detail.student.photoUrl} referrerPolicy="no-referrer" className="w-20 h-20 rounded-full object-cover mx-auto border border-editorial-border" alt={detail.student.fullName} />
                ) : (
                  <div className="w-20 h-20 rounded-full bg-editorial-text text-editorial-bg flex items-center justify-center text-2xl mx-auto">
                    {detail.student.fullName.charAt(0).toUpperCase()}
                  </div>
                )}
                <h3 className="font-serif font-black text-lg text-editorial-text">{detail.student.fullName}</h3>
                <p className="text-xs text-editorial-muted">{detail.student.career || 'Carrera no especificada'} • {detail.student.university || 'Universidad no especificada'}</p>
                <div className="flex items-center justify-center gap-1 text-amber-500 text-sm">
                  {detail.reviewAverage ? (
                    <>
                      <Star className="w-4 h-4 fill-amber-500" />
                      <span className="font-bold text-editorial-text">{detail.reviewAverage.toFixed(1)}</span>
                      <span className="text-editorial-muted text-[11px]">({detail.reviewCount} reviews)</span>
                    </>
                  ) : (
                    <span className="text-editorial-muted text-[11px]">Sin reviews todavía</span>
                  )}
                </div>
                {detail.student.experience && (
                  <p className="text-xs text-editorial-text font-serif italic bg-editorial-bg p-3 rounded-xl border border-editorial-border">"{detail.student.experience}"</p>
                )}
                <div className="flex flex-wrap gap-1.5 justify-center pt-1">
                  {detail.student.skills.map(s => (
                    <span key={s} className="text-[9px] font-bold uppercase tracking-wider bg-editorial-light text-editorial-text px-2 py-1 rounded-full">{s}</span>
                  ))}
                </div>
              </div>
            </div>

            <div className="lg:col-span-2 space-y-8">
              <div>
                <h4 className="text-sm font-bold text-editorial-text uppercase tracking-wider mb-3 flex items-center gap-2">
                  <Briefcase className="w-4 h-4" /> Proyectos Completados ({detail.completedProjects.length})
                </h4>
                {detail.completedProjects.length === 0 ? (
                  <p className="text-xs text-editorial-muted bg-white border border-editorial-border rounded-2xl p-6 text-center">Aún no ha completado proyectos en NYLA.</p>
                ) : (
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    {detail.completedProjects.map(p => (
                      <div key={p.id} className="bg-white border border-editorial-border rounded-2xl p-4 space-y-1.5">
                        <p className="font-serif font-bold text-sm text-editorial-text">{p.title}</p>
                        <p className="text-[11px] text-editorial-muted line-clamp-2">{p.description}</p>
                        <p className="text-[10px] font-bold text-editorial-text">${p.budget.toFixed(2)} · {p.estimatedHours}h</p>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              <div>
                <h4 className="text-sm font-bold text-editorial-text uppercase tracking-wider mb-3">Reviews de Emprendedores</h4>
                {detail.reviews.length === 0 ? (
                  <p className="text-xs text-editorial-muted bg-white border border-editorial-border rounded-2xl p-6 text-center">Aún no tiene reviews.</p>
                ) : (
                  <div className="space-y-3">
                    {detail.reviews.map(r => (
                      <div key={r.id} className="bg-white border border-editorial-border rounded-2xl p-4 space-y-1">
                        <div className="flex justify-between items-center">
                          <span className="text-[11px] font-bold text-editorial-text">{r.businessName}</span>
                          <div className="flex text-amber-500 text-xs">
                            {Array.from({ length: 5 }).map((_, i) => <span key={i}>{i < r.rating ? '★' : '☆'}</span>)}
                          </div>
                        </div>
                        {r.comment && <p className="text-xs text-editorial-muted italic">"{r.comment}"</p>}
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          </div>
        )}
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-editorial-bg pb-24 md:pb-8">
      <div className="mb-10 pb-6 border-b border-editorial-border">
        <button
          onClick={() => setView('landing')}
          className="mb-4 inline-flex items-center gap-1.5 text-xs font-bold uppercase tracking-wider text-editorial-muted hover:text-editorial-text transition-colors bg-white border border-editorial-border px-3 py-1.5 rounded-full cursor-pointer"
        >
          ← Volver a la Portada (Inicio)
        </button>
        <h2 className="text-3xl md:text-5xl font-serif font-black text-editorial-text tracking-tight">Talento NYLA</h2>
        <p className="text-sm text-editorial-muted mt-1">Explora los perfiles reales de los estudiantes registrados en la plataforma.</p>
      </div>

      {loading && (
        <div className="flex items-center justify-center py-16 text-editorial-muted text-xs gap-2">
          <Loader2 className="w-4 h-4 animate-spin" /> Cargando estudiantes...
        </div>
      )}
      {error && <p className="text-xs text-red-700 bg-red-50 border border-red-200 rounded-xl p-3">{error}</p>}

      {!loading && students.length === 0 && (
        <div className="text-center py-16 bg-white border border-editorial-border rounded-[32px]">
          <GraduationCap className="w-8 h-8 text-editorial-muted mx-auto mb-2" />
          <p className="text-editorial-text font-serif italic">Todavía no hay estudiantes registrados.</p>
        </div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {students.map(s => (
          <button
            key={s.id}
            onClick={() => openStudent(s.id)}
            className="text-left bg-white border border-editorial-border rounded-[28px] p-5 space-y-3 hover:border-editorial-text transition-all cursor-pointer"
          >
            <div className="flex items-center gap-3">
              {s.photoUrl ? (
                <img src={s.photoUrl} referrerPolicy="no-referrer" className="w-12 h-12 rounded-full object-cover border border-editorial-border" alt={s.fullName} />
              ) : (
                <div className="w-12 h-12 rounded-full bg-editorial-text text-editorial-bg flex items-center justify-center text-lg shrink-0">
                  {s.fullName.charAt(0).toUpperCase()}
                </div>
              )}
              <div className="min-w-0">
                <p className="font-serif font-bold text-sm text-editorial-text truncate">{s.fullName}</p>
                <p className="text-[10px] text-editorial-muted truncate">{s.career || 'Carrera no especificada'}</p>
              </div>
            </div>

            <div className="flex items-center gap-1 text-amber-500 text-xs">
              {s.reviewAverage ? (
                <>
                  <Star className="w-3.5 h-3.5 fill-amber-500" />
                  <span className="font-bold text-editorial-text">{s.reviewAverage.toFixed(1)}</span>
                  <span className="text-editorial-muted">({s.reviewCount})</span>
                </>
              ) : (
                <span className="text-editorial-muted">Sin reviews todavía</span>
              )}
              <span className="text-editorial-muted ml-auto">{s.completedProjectsCount} proyecto(s)</span>
            </div>

            <div className="flex flex-wrap gap-1.5">
              {s.skills.slice(0, 4).map(skill => (
                <span key={skill} className="text-[9px] font-bold uppercase tracking-wider bg-editorial-light text-editorial-text px-2 py-1 rounded-full">{skill}</span>
              ))}
            </div>
          </button>
        ))}
      </div>
    </div>
  );
}
