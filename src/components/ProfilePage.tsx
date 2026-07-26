import React, { useEffect, useState } from 'react';
import { CheckCircle2, Save, Loader2, Wallet, ExternalLink, Upload } from 'lucide-react';
import { ViewState, StudentProfileData, EntrepreneurProfileData } from '../types';
import { useAuth } from '../context/AuthContext';

const MAX_IMAGE_BYTES = 2 * 1024 * 1024; // 2MB

function fileToDataUrl(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(reader.result as string);
    reader.onerror = reject;
    reader.readAsDataURL(file);
  });
}

interface ProfilePageProps {
  setView: (view: ViewState) => void;
}

export default function ProfilePage({ setView }: ProfilePageProps) {
  const { user, profile, updateProfile } = useAuth();
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [imageError, setImageError] = useState<string | null>(null);

  const isStudent = user?.role === 'STUDENT';
  const studentProfile = isStudent ? (profile as StudentProfileData | null) : null;
  const entrepreneurProfile = !isStudent ? (profile as EntrepreneurProfileData | null) : null;

  const [connectStatus, setConnectStatus] = useState<{ connected: boolean; onboardingComplete: boolean } | null>(null);
  const [connectLoading, setConnectLoading] = useState(false);
  const [connectError, setConnectError] = useState<string | null>(null);

  useEffect(() => {
    if (!isStudent) return;
    fetch('/api/payments/connect/status', { credentials: 'include' })
      .then(r => r.ok ? r.json() : null)
      .then(data => data && setConnectStatus(data))
      .catch(() => {});
  }, [isStudent]);

  const handleConnectStripe = async () => {
    setConnectLoading(true);
    setConnectError(null);
    try {
      const res = await fetch('/api/payments/connect/onboard', { method: 'POST', credentials: 'include' });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'No se pudo iniciar la conexión con Stripe.');
      window.location.href = data.url;
    } catch (err: any) {
      setConnectError(err.message);
      setConnectLoading(false);
    }
  };

  const [studentForm, setStudentForm] = useState({
    fullName: '', university: '', career: '', semester: '', skills: '', experience: '',
    portfolioUrl: '', cvUrl: '', availability: '', photoUrl: '',
  });

  const [entrepreneurForm, setEntrepreneurForm] = useState({
    businessName: '', category: '', description: '', objectives: '', projectNeeds: '',
    studentProfileSought: '', requiredSkills: '', estimatedDuration: '', budgetOrHours: '', logoUrl: '',
  });

  useEffect(() => {
    if (studentProfile) {
      setStudentForm({
        fullName: studentProfile.fullName || '',
        university: studentProfile.university || '',
        career: studentProfile.career || '',
        semester: studentProfile.semester || '',
        skills: (studentProfile.skills || []).join(', '),
        experience: studentProfile.experience || '',
        portfolioUrl: studentProfile.portfolioUrl || '',
        cvUrl: studentProfile.cvUrl || '',
        availability: studentProfile.availability || '',
        photoUrl: studentProfile.photoUrl || '',
      });
    }
  }, [studentProfile]);

  useEffect(() => {
    if (entrepreneurProfile) {
      setEntrepreneurForm({
        businessName: entrepreneurProfile.businessName || '',
        category: entrepreneurProfile.category || '',
        description: entrepreneurProfile.description || '',
        objectives: entrepreneurProfile.objectives || '',
        projectNeeds: entrepreneurProfile.projectNeeds || '',
        studentProfileSought: entrepreneurProfile.studentProfileSought || '',
        requiredSkills: (entrepreneurProfile.requiredSkills || []).join(', '),
        estimatedDuration: entrepreneurProfile.estimatedDuration || '',
        budgetOrHours: entrepreneurProfile.budgetOrHours || '',
        logoUrl: entrepreneurProfile.logoUrl || '',
      });
    }
  }, [entrepreneurProfile]);

  const handleStudentPhotoUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    e.target.value = '';
    if (!file) return;
    setImageError(null);
    if (file.size > MAX_IMAGE_BYTES) {
      setImageError('La imagen es muy pesada (máximo 2MB).');
      return;
    }
    const dataUrl = await fileToDataUrl(file);
    setStudentForm(f => ({ ...f, photoUrl: dataUrl }));
  };

  const handleLogoUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    e.target.value = '';
    if (!file) return;
    setImageError(null);
    if (file.size > MAX_IMAGE_BYTES) {
      setImageError('La imagen es muy pesada (máximo 2MB).');
      return;
    }
    const dataUrl = await fileToDataUrl(file);
    setEntrepreneurForm(f => ({ ...f, logoUrl: dataUrl }));
  };

  const handleSaveStudent = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setSaving(true);
    try {
      await updateProfile({
        ...studentForm,
        skills: studentForm.skills.split(',').map(s => s.trim()).filter(Boolean),
      });
      setSaved(true);
      setTimeout(() => setSaved(false), 2000);
    } catch (err: any) {
      setError(err.message || 'No se pudo guardar el perfil.');
    } finally {
      setSaving(false);
    }
  };

  const handleSaveEntrepreneur = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setSaving(true);
    try {
      await updateProfile({
        ...entrepreneurForm,
        requiredSkills: entrepreneurForm.requiredSkills.split(',').map(s => s.trim()).filter(Boolean),
      });
      setSaved(true);
      setTimeout(() => setSaved(false), 2000);
    } catch (err: any) {
      setError(err.message || 'No se pudo guardar el perfil.');
    } finally {
      setSaving(false);
    }
  };

  const inputClass =
    'w-full bg-white border border-editorial-border rounded-xl p-3 text-sm focus:ring-1 focus:ring-editorial-text focus:outline-none';
  const labelClass = 'text-[10px] font-bold text-editorial-muted uppercase tracking-wider block mb-1.5';

  return (
    <div className="min-h-screen bg-editorial-bg pb-24 md:pb-8">
      <div className="mb-8 pb-6 border-b border-editorial-border">
        <h2 className="text-3xl md:text-5xl font-serif font-black text-editorial-text tracking-tight">Mi Perfil</h2>
        <p className="text-sm text-editorial-muted mt-1">
          {isStudent
            ? 'Administra tu información académica y profesional visible para los emprendedores.'
            : 'Administra la información de tu emprendimiento visible para los estudiantes.'}
        </p>
      </div>

      {isStudent ? (
        <form onSubmit={handleSaveStudent} className="max-w-3xl bg-white p-8 rounded-[32px] border border-editorial-border space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
            <div>
              <label className={labelClass}>Nombre completo</label>
              <input className={inputClass} value={studentForm.fullName} onChange={e => setStudentForm(f => ({ ...f, fullName: e.target.value }))} required />
            </div>
            <div>
              <label className={labelClass}>Foto de perfil</label>
              <div className="flex items-center gap-3">
                {studentForm.photoUrl && (
                  <img src={studentForm.photoUrl} alt="Foto" className="w-11 h-11 rounded-full object-cover border border-editorial-border shrink-0" />
                )}
                <label className="flex-1 inline-flex items-center justify-center gap-2 bg-editorial-bg border border-editorial-border rounded-xl p-3 text-xs font-bold text-editorial-text cursor-pointer hover:bg-editorial-light transition-all">
                  <Upload className="w-3.5 h-3.5" /> {studentForm.photoUrl ? 'Cambiar foto' : 'Subir foto'}
                  <input type="file" accept="image/*" className="hidden" onChange={handleStudentPhotoUpload} />
                </label>
              </div>
            </div>
            <div>
              <label className={labelClass}>Universidad</label>
              <input className={inputClass} value={studentForm.university} onChange={e => setStudentForm(f => ({ ...f, university: e.target.value }))} />
            </div>
            <div>
              <label className={labelClass}>Carrera</label>
              <input className={inputClass} value={studentForm.career} onChange={e => setStudentForm(f => ({ ...f, career: e.target.value }))} />
            </div>
            <div>
              <label className={labelClass}>Semestre</label>
              <input className={inputClass} value={studentForm.semester} onChange={e => setStudentForm(f => ({ ...f, semester: e.target.value }))} />
            </div>
            <div>
              <label className={labelClass}>Disponibilidad</label>
              <input className={inputClass} value={studentForm.availability} onChange={e => setStudentForm(f => ({ ...f, availability: e.target.value }))} placeholder="Ej. 10-15h/semana" />
            </div>
          </div>

          <div>
            <label className={labelClass}>Habilidades (separadas por coma)</label>
            <input className={inputClass} value={studentForm.skills} onChange={e => setStudentForm(f => ({ ...f, skills: e.target.value }))} placeholder="React, Figma, Python..." />
          </div>

          <div>
            <label className={labelClass}>Experiencia</label>
            <textarea className={inputClass} rows={4} value={studentForm.experience} onChange={e => setStudentForm(f => ({ ...f, experience: e.target.value }))} />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
            <div>
              <label className={labelClass}>Portafolio (URL)</label>
              <input className={inputClass} value={studentForm.portfolioUrl} onChange={e => setStudentForm(f => ({ ...f, portfolioUrl: e.target.value }))} placeholder="https://..." />
            </div>
            <div>
              <label className={labelClass}>CV (URL)</label>
              <input className={inputClass} value={studentForm.cvUrl} onChange={e => setStudentForm(f => ({ ...f, cvUrl: e.target.value }))} placeholder="https://..." />
            </div>
          </div>

          {imageError && <p className="text-xs text-red-700 bg-red-50 border border-red-200 rounded-xl p-3">{imageError}</p>}
          {error && <p className="text-xs text-red-700 bg-red-50 border border-red-200 rounded-xl p-3">{error}</p>}

          <button
            type="submit"
            disabled={saving}
            className="inline-flex items-center gap-2 bg-editorial-text text-editorial-bg font-bold px-6 py-3 rounded-full text-[11px] uppercase tracking-[0.15em] hover:opacity-90 transition-all disabled:opacity-50 cursor-pointer border-none"
          >
            {saving ? <Loader2 className="w-4 h-4 animate-spin" /> : saved ? <CheckCircle2 className="w-4 h-4" /> : <Save className="w-4 h-4" />}
            {saving ? 'Guardando...' : saved ? 'Guardado' : 'Guardar cambios'}
          </button>
        </form>
      ) : (
        <form onSubmit={handleSaveEntrepreneur} className="max-w-3xl bg-white p-8 rounded-[32px] border border-editorial-border space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
            <div>
              <label className={labelClass}>Nombre del emprendimiento</label>
              <input className={inputClass} value={entrepreneurForm.businessName} onChange={e => setEntrepreneurForm(f => ({ ...f, businessName: e.target.value }))} required />
            </div>
            <div>
              <label className={labelClass}>Logo del emprendimiento</label>
              <div className="flex items-center gap-3">
                {entrepreneurForm.logoUrl && (
                  <img src={entrepreneurForm.logoUrl} alt="Logo" className="w-11 h-11 rounded-full object-cover border border-editorial-border shrink-0" />
                )}
                <label className="flex-1 inline-flex items-center justify-center gap-2 bg-editorial-bg border border-editorial-border rounded-xl p-3 text-xs font-bold text-editorial-text cursor-pointer hover:bg-editorial-light transition-all">
                  <Upload className="w-3.5 h-3.5" /> {entrepreneurForm.logoUrl ? 'Cambiar logo' : 'Subir logo'}
                  <input type="file" accept="image/*" className="hidden" onChange={handleLogoUpload} />
                </label>
              </div>
            </div>
            <div>
              <label className={labelClass}>Categoría</label>
              <input className={inputClass} value={entrepreneurForm.category} onChange={e => setEntrepreneurForm(f => ({ ...f, category: e.target.value }))} />
            </div>
            <div>
              <label className={labelClass}>Duración estimada del proyecto</label>
              <input className={inputClass} value={entrepreneurForm.estimatedDuration} onChange={e => setEntrepreneurForm(f => ({ ...f, estimatedDuration: e.target.value }))} placeholder="Ej. 2 semanas" />
            </div>
          </div>

          <div>
            <label className={labelClass}>Descripción del negocio</label>
            <textarea className={inputClass} rows={3} value={entrepreneurForm.description} onChange={e => setEntrepreneurForm(f => ({ ...f, description: e.target.value }))} />
          </div>

          <div>
            <label className={labelClass}>Objetivos</label>
            <textarea className={inputClass} rows={3} value={entrepreneurForm.objectives} onChange={e => setEntrepreneurForm(f => ({ ...f, objectives: e.target.value }))} />
          </div>

          <div>
            <label className={labelClass}>Necesidades del proyecto</label>
            <textarea className={inputClass} rows={3} value={entrepreneurForm.projectNeeds} onChange={e => setEntrepreneurForm(f => ({ ...f, projectNeeds: e.target.value }))} />
          </div>

          <div>
            <label className={labelClass}>Perfil de estudiante que busca</label>
            <input className={inputClass} value={entrepreneurForm.studentProfileSought} onChange={e => setEntrepreneurForm(f => ({ ...f, studentProfileSought: e.target.value }))} />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
            <div>
              <label className={labelClass}>Habilidades requeridas (separadas por coma)</label>
              <input className={inputClass} value={entrepreneurForm.requiredSkills} onChange={e => setEntrepreneurForm(f => ({ ...f, requiredSkills: e.target.value }))} placeholder="Figma, Marketing, SEO..." />
            </div>
            <div>
              <label className={labelClass}>Presupuesto / horas requeridas</label>
              <input className={inputClass} value={entrepreneurForm.budgetOrHours} onChange={e => setEntrepreneurForm(f => ({ ...f, budgetOrHours: e.target.value }))} placeholder="Ej. $60 / 8h" />
            </div>
          </div>

          {imageError && <p className="text-xs text-red-700 bg-red-50 border border-red-200 rounded-xl p-3">{imageError}</p>}
          {error && <p className="text-xs text-red-700 bg-red-50 border border-red-200 rounded-xl p-3">{error}</p>}

          <button
            type="submit"
            disabled={saving}
            className="inline-flex items-center gap-2 bg-editorial-text text-editorial-bg font-bold px-6 py-3 rounded-full text-[11px] uppercase tracking-[0.15em] hover:opacity-90 transition-all disabled:opacity-50 cursor-pointer border-none"
          >
            {saving ? <Loader2 className="w-4 h-4 animate-spin" /> : saved ? <CheckCircle2 className="w-4 h-4" /> : <Save className="w-4 h-4" />}
            {saving ? 'Guardando...' : saved ? 'Guardado' : 'Guardar cambios'}
          </button>
        </form>
      )}

      {isStudent && (
        <div className="max-w-3xl bg-white p-8 rounded-[32px] border border-editorial-border space-y-4 mt-8">
          <div className="flex items-center gap-2">
            <Wallet className="w-5 h-5 text-editorial-text" />
            <h3 className="text-lg font-serif font-bold text-editorial-text">Cuenta de Pagos</h3>
          </div>
          <p className="text-xs text-editorial-muted leading-relaxed">
            Conecta tu cuenta de Stripe para poder recibir los pagos liberados de tus proyectos (custodia Escrow) directamente.
          </p>

          {connectStatus?.onboardingComplete ? (
            <span className="inline-flex items-center gap-1.5 bg-green-50 text-green-800 border border-green-200 px-3 py-1.5 rounded-full text-[10px] font-bold uppercase tracking-wider">
              <CheckCircle2 className="w-3.5 h-3.5" /> Lista para recibir pagos
            </span>
          ) : connectStatus?.connected ? (
            <span className="inline-flex items-center gap-1.5 bg-amber-50 text-amber-800 border border-amber-200 px-3 py-1.5 rounded-full text-[10px] font-bold uppercase tracking-wider">
              Configuración pendiente en Stripe
            </span>
          ) : (
            <span className="inline-flex items-center gap-1.5 bg-editorial-light text-editorial-muted border border-editorial-border px-3 py-1.5 rounded-full text-[10px] font-bold uppercase tracking-wider">
              No conectada
            </span>
          )}

          {connectError && <p className="text-xs text-red-700 bg-red-50 border border-red-200 rounded-xl p-3">{connectError}</p>}

          <div>
            <button
              type="button"
              onClick={handleConnectStripe}
              disabled={connectLoading}
              className="inline-flex items-center gap-2 bg-editorial-text text-editorial-bg font-bold px-6 py-3 rounded-full text-[11px] uppercase tracking-[0.15em] hover:opacity-90 transition-all disabled:opacity-50 cursor-pointer border-none"
            >
              {connectLoading ? <Loader2 className="w-4 h-4 animate-spin" /> : <ExternalLink className="w-4 h-4" />}
              {connectStatus?.onboardingComplete ? 'Actualizar cuenta de Stripe' : 'Conectar con Stripe'}
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
