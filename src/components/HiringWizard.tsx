import React, { useState, useEffect } from 'react';
import { Check, ChevronRight, Sparkles, Shield, ArrowLeft, CheckCircle2, PenTool, Loader2 } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { Project, ViewState, MatchCandidate, EntrepreneurProfileData } from '../types';
import { STUDENT_HOURLY_RATE, NYLA_FIXED_FEE, PROJECT_PACKAGES, calculatePVP, calculateStudentPayout } from '../constants';
import { useAuth } from '../context/AuthContext';

interface HiringWizardProps {
  setView: (view: ViewState) => void;
  onContractCreated: (newProject: Project) => void;
  preselectedStudentId?: string;
}

interface StudentTalent {
  id: string;
  name: string;
  avatar: string;
  career: string;
  specialty: string;
  skills: string[];
  experienceYears: number;
  expectedRate: number;
  availabilityHours: number;
  rating: number;
  university: string;
  email: string;
  description: string;
  cycle?: string;
  experienceSummary?: string;
  projects?: Array<{
    title: string;
    description: string;
    budget: number;
    hours: number;
    tech: string[];
    deliverableType: 'interface' | 'chart' | 'marketing';
    visualTitle: string;
    visualSubtitle: string;
    visualElements: string[];
  }>;
}

function talentFromMatch(candidate: MatchCandidate): StudentTalent {
  const p = candidate.profile;
  return {
    id: candidate.studentId,
    name: p.fullName,
    avatar: p.photoUrl || '',
    career: p.career || 'No especificada',
    specialty: p.career || 'Talento NYLA',
    skills: p.skills,
    experienceYears: 0,
    expectedRate: STUDENT_HOURLY_RATE,
    availabilityHours: 0,
    rating: p.rating ?? 0,
    university: p.university || 'No especificada',
    email: '',
    description: p.experience || 'Aún no ha completado su carta de presentación.',
    cycle: p.semester || undefined,
    experienceSummary: p.experience || undefined,
    projects: [],
  };
}

export default function HiringWizard({ setView, onContractCreated, preselectedStudentId }: HiringWizardProps) {
  const { profile } = useAuth();
  const businessName = (profile as EntrepreneurProfileData | null)?.businessName || '';

  // Step 1: Matching and Details, Step 2: Rate & Business Model, Step 3: Digital Contract, Step 4: Payments
  const [step, setStep] = useState(1);

  // Project Details
  const [projectTitle, setProjectTitle] = useState('');
  const [projectDesc, setProjectDesc] = useState('');
  const [requiredCareer, setRequiredCareer] = useState('Diseño Gráfico y Publicidad');
  const [requiredSkills, setRequiredSkills] = useState<string[]>([]);
  const [selectedPackageId, setSelectedPackageId] = useState<'basico' | 'intermedio' | 'avanzado'>('intermedio');
  const selectedPackage = PROJECT_PACKAGES.find(p => p.id === selectedPackageId)!;
  const estimatedHours = selectedPackage.hours;
  const hourlyRate = STUDENT_HOURLY_RATE;
  const [entrepreneurName, setEntrepreneurName] = useState(businessName);
  const [signatureText, setSignatureText] = useState('');
  const [isSigned, setIsSigned] = useState(false);

  useEffect(() => {
    if (businessName) setEntrepreneurName(businessName);
  }, [businessName]);

  const [isProcessingPayment, setIsProcessingPayment] = useState(false);

  // Dynamic Matching & Showcase States
  const [isScanning, setIsScanning] = useState(false);
  const [activeStudentTab, setActiveStudentTab] = useState<'info' | 'projects'>('info');
  const [selectedWorkIndex, setSelectedWorkIndex] = useState<number>(0);

  // Real match state — populated from the server (src/server/match.ts) against real StudentProfile rows.
  const [projectId, setProjectId] = useState<string | null>(null);
  const [matches, setMatches] = useState<MatchCandidate[]>([]);
  const [loadingMatches, setLoadingMatches] = useState(false);
  const [hasSearched, setHasSearched] = useState(false);
  const [searchError, setSearchError] = useState<string | null>(null);

  const talents: StudentTalent[] = matches.map(talentFromMatch);

  // Selected Student
  const [selectedStudentId, setSelectedStudentId] = useState<string | undefined>(preselectedStudentId);
  const selectedStudent = talents.find(t => t.id === selectedStudentId) || talents[0];
  const selectedMatch = matches.find(m => m.studentId === selectedStudentId) || matches[0];

  const handleSelectStudent = (id: string) => {
    setIsScanning(true);
    setSelectedStudentId(id);
    setActiveStudentTab('info');
    setSelectedWorkIndex(0);
    setTimeout(() => {
      setIsScanning(false);
    }, 700);
  };

  // Publishes the project (once) and fetches real, ranked matches from the server.
  const handleSearchMatches = async () => {
    setLoadingMatches(true);
    setSearchError(null);
    setIsScanning(true);
    try {
      let currentProjectId = projectId;
      if (!currentProjectId) {
        const createRes = await fetch(`/api/projects`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          credentials: "include",
          body: JSON.stringify({ title: projectTitle, description: projectDesc, requiredCareer, requiredSkills, estimatedHours }),
        });
        const createData = await createRes.json();
        if (!createRes.ok) throw new Error(createData.error || "No se pudo publicar el proyecto.");
        currentProjectId = createData.project.id;
        setProjectId(currentProjectId);
      }

      const matchRes = await fetch(`/api/projects/${currentProjectId}/matches`, { credentials: "include" });
      const matchData = await matchRes.json();
      if (!matchRes.ok) throw new Error(matchData.error || "No se pudieron cargar los estudiantes compatibles.");

      setMatches(matchData.matches);
      if (matchData.matches.length > 0) {
        setSelectedStudentId(matchData.matches[0].studentId);
      }
    } catch (err: any) {
      setSearchError(err.message || "Ocurrió un error al buscar coincidencias.");
    } finally {
      setLoadingMatches(false);
      setIsScanning(false);
      setHasSearched(true);
    }
  };

  const handleToggleSkillFilter = (skill: string) => {
    if (requiredSkills.includes(skill)) {
      setRequiredSkills(prev => prev.filter(s => s !== skill));
    } else {
      setRequiredSkills(prev => [...prev, skill]);
    }
  };

  // Business Model calculations: NYLA earns a flat $10.57 fee per project, the student
  // earns hours x $5.00/hour. PVP = NYLA_FIXED_FEE + hours x rate.
  const calculateBusinessModel = (hours: number) => {
    const rawTotal = calculatePVP(hours);
    const studentNetEarnings = calculateStudentPayout(hours);
    const commissionAmount = NYLA_FIXED_FEE;

    return {
      rawTotal,
      commissionAmount,
      studentNetEarnings,
    };
  };

  const modelMath = calculateBusinessModel(estimatedHours);

  const handleNextStep = () => {
    if (step < 4) {
      setStep(prev => prev + 1);
    } else {
      handleCompleteHiring();
    }
  };

  const handlePrevStep = () => {
    if (step > 1) {
      setStep(prev => prev - 1);
    }
  };

  const handleCompleteHiring = async () => {
    if (!projectId || !selectedStudent) return;
    setIsProcessingPayment(true);
    setSearchError(null);
    try {
      const res = await fetch(`/api/projects/${projectId}/assign`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({ studentId: selectedStudent.id }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'No se pudo completar la contratación.');
      onContractCreated(data.project);
    } catch (err: any) {
      setSearchError(err.message || 'No se pudo completar la contratación.');
    } finally {
      setIsProcessingPayment(false);
    }
  };

  // Helper arrays for filters
  const filterCareers = ['Diseño Gráfico y Publicidad', 'Marketing y Comunicación Digital', 'Modelos de Negocios y Finanzas', 'Diseño de Modas', 'Ingeniería en Sistemas'];
  const filterSkills = ['Figma', 'Canva', 'Instagram', 'Branding', 'TikTok', 'Copywriting', 'Modelos de Negocio', 'SEO', 'Meta Ads', 'WhatsApp Marketing', 'React.js', 'Tailwind CSS'];

  return (
    <div className="min-h-screen bg-editorial-bg pb-24 md:pb-8">
      
      {/* Upper header */}
      <div className="mb-8 pb-6 border-b border-editorial-border flex flex-col md:flex-row justify-between items-start md:items-end gap-4">
        <div>
          <button 
            onClick={() => setView('landing')}
            className="mb-4 inline-flex items-center gap-1.5 text-xs font-bold uppercase tracking-wider text-editorial-muted hover:text-editorial-text transition-colors bg-white border border-editorial-border px-3 py-1.5 rounded-full cursor-pointer"
          >
            ← Volver a la Portada (Inicio)
          </button>
          <h2 className="text-3xl md:text-5xl font-serif font-black text-editorial-text tracking-tight">Centro de Contratación & Firma</h2>
          <p className="text-sm text-editorial-muted mt-1">
            Genera contratos digitales, gestiona el match inteligente de talento y realiza pagos retenidos en garantía (Escrow).
          </p>
        </div>
        
        {/* Step Progress Indicators */}
        <div className="flex gap-2 bg-editorial-light/50 p-2 rounded-full border border-editorial-border text-xs font-bold font-sans self-stretch md:self-auto justify-around">
          <div className={`px-3 py-1 rounded-full ${step >= 1 ? 'bg-editorial-text text-editorial-bg' : 'text-editorial-muted'}`}>1. Match</div>
          <div className={`px-3 py-1 rounded-full ${step >= 2 ? 'bg-editorial-text text-editorial-bg' : 'text-editorial-muted'}`}>2. Tarifas</div>
          <div className={`px-3 py-1 rounded-full ${step >= 3 ? 'bg-editorial-text text-editorial-bg' : 'text-editorial-muted'}`}>3. Contrato</div>
          <div className={`px-3 py-1 rounded-full ${step >= 4 ? 'bg-editorial-text text-editorial-bg' : 'text-editorial-muted'}`}>4. Pago</div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        
        {/* Main interactive form card (col-span-8) */}
        <div className="lg:col-span-8 bg-white border border-editorial-border rounded-[32px] p-6 md:p-8 space-y-8">
          
          {step === 1 && (
            <div className="space-y-6">
              <div className="border-b border-editorial-border pb-4">
                <span className="text-[10px] uppercase tracking-[0.2em] font-bold text-editorial-accent">Paso 1 de 4</span>
                <h3 className="text-2xl font-serif font-black text-editorial-text mt-1">Match Inteligente de Talento</h3>
                <p className="text-xs text-editorial-muted mt-1">Configura las necesidades del proyecto para filtrar e identificar el candidato universitario ideal.</p>
              </div>

              {/* Project Title and details */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <label className="text-[10px] font-bold text-editorial-muted uppercase tracking-wider block">Título del Proyecto</label>
                  <input
                    type="text"
                    value={projectTitle}
                    onChange={(e) => setProjectTitle(e.target.value)}
                    disabled={!!projectId}
                    className="w-full bg-editorial-bg border border-editorial-border rounded-xl p-3 text-xs focus:ring-1 focus:ring-editorial-text focus:outline-none focus:bg-white text-editorial-text font-semibold disabled:opacity-60"
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-[10px] font-bold text-editorial-muted uppercase tracking-wider block">Carrera Requerida</label>
                  <select
                    value={requiredCareer}
                    onChange={(e) => setRequiredCareer(e.target.value)}
                    disabled={!!projectId}
                    className="w-full bg-editorial-bg border border-editorial-border rounded-xl p-3 text-xs focus:ring-1 focus:ring-editorial-text focus:outline-none focus:bg-white text-editorial-text font-semibold disabled:opacity-60"
                  >
                    {filterCareers.map(c => <option key={c} value={c}>{c}</option>)}
                  </select>
                </div>
              </div>

              <div className="space-y-2">
                <label className="text-[10px] font-bold text-editorial-muted uppercase tracking-wider block">Descripción del Proyecto</label>
                <textarea
                  value={projectDesc}
                  onChange={(e) => setProjectDesc(e.target.value)}
                  rows={2}
                  disabled={!!projectId}
                  className="w-full bg-editorial-bg border border-editorial-border rounded-xl p-3 text-xs focus:ring-1 focus:ring-editorial-text focus:outline-none focus:bg-white text-editorial-text font-semibold disabled:opacity-60"
                />
              </div>

              {/* Skills checklist */}
              <div className="space-y-2">
                <label className="text-[10px] font-bold text-editorial-muted uppercase tracking-wider block">Habilidades requeridas ({requiredSkills.length})</label>
                <div className="flex flex-wrap gap-2">
                  {filterSkills.map(skill => {
                    const isSelected = requiredSkills.includes(skill);
                    return (
                      <button
                        key={skill}
                        type="button"
                        onClick={() => handleToggleSkillFilter(skill)}
                        disabled={!!projectId}
                        className={`px-3 py-1.5 rounded-full text-[10px] font-bold uppercase tracking-wider border transition-all cursor-pointer disabled:opacity-60 disabled:cursor-not-allowed ${
                          isSelected
                            ? 'bg-editorial-text text-editorial-bg border-editorial-text'
                            : 'bg-editorial-bg text-editorial-muted border-editorial-border hover:bg-editorial-light'
                        }`}
                      >
                        {skill}
                      </button>
                    );
                  })}
                </div>
              </div>

              {!projectId && (
                <button
                  type="button"
                  onClick={handleSearchMatches}
                  disabled={loadingMatches || !projectTitle.trim() || !projectDesc.trim()}
                  className="w-full py-3.5 bg-editorial-text text-editorial-bg font-bold rounded-full text-[11px] uppercase tracking-[0.15em] hover:opacity-90 transition-all disabled:opacity-50 cursor-pointer border-none flex items-center justify-center gap-2"
                >
                  {loadingMatches ? (
                    <span className="flex items-center gap-2"><Loader2 className="w-4 h-4 animate-spin" /> Publicando y buscando coincidencias...</span>
                  ) : (
                    <span className="flex items-center gap-2"><Sparkles className="w-4 h-4" /> Publicar y buscar estudiantes compatibles</span>
                  )}
                </button>
              )}

              {searchError && (
                <p className="text-xs text-red-700 bg-red-50 border border-red-200 rounded-xl p-3">{searchError}</p>
              )}

              {/* Talents match results list */}
              {hasSearched && talents.length === 0 && !loadingMatches && (
                <div className="text-center py-8 text-editorial-muted text-xs bg-editorial-bg/40 rounded-xl border border-editorial-border">
                  Todavía no hay estudiantes con perfil completo registrados en NYLA. Vuelve a intentarlo cuando haya más talento disponible.
                </div>
              )}

              {hasSearched && talents.length > 0 && selectedStudent && (
              <>
              <div className="space-y-3 pt-4 border-t border-editorial-border">
                <h4 className="text-xs font-serif font-bold text-editorial-text flex items-center justify-between">
                  <span className="flex items-center gap-1.5"><Sparkles className="w-4 h-4 text-editorial-text animate-pulse" /> Resultados del Algoritmo de Match Inteligente</span>
                  {isScanning && <span className="text-[9px] font-mono font-bold text-editorial-accent animate-pulse">Escaneando base de datos...</span>}
                </h4>

                <div className="grid grid-cols-1 gap-3">
                  {talents.map(student => {
                    const score = matches.find(m => m.studentId === student.id)?.score ?? 0;
                    const isSelected = selectedStudentId === student.id;
                    return (
                      <div 
                        key={student.id}
                        onClick={() => handleSelectStudent(student.id)}
                        className={`p-4 rounded-2xl border transition-all cursor-pointer flex flex-col md:flex-row justify-between items-start md:items-center gap-4 ${
                          isSelected 
                            ? 'bg-white border-editorial-text ring-1 ring-editorial-text shadow-sm' 
                            : 'bg-editorial-bg/30 border-editorial-border hover:bg-editorial-bg/60'
                        }`}
                      >
                        <div className="flex items-center gap-3">
                          <div className="relative">
                            {student.avatar.startsWith('http') ? (
                              <div className="w-12 h-12 rounded-full overflow-hidden border border-editorial-border bg-white shrink-0">
                                <img className="w-full h-full object-cover" referrerPolicy="no-referrer" src={student.avatar} alt={student.name} />
                              </div>
                            ) : (
                              <div className="w-12 h-12 rounded-full bg-editorial-text text-editorial-bg flex items-center justify-center text-lg shrink-0">
                                {student.name.charAt(0).toUpperCase()}
                              </div>
                            )}
                            <div className="absolute -bottom-1 -right-1 bg-green-500 w-3.5 h-3.5 rounded-full border-2 border-white"></div>
                          </div>
                          
                          <div className="space-y-0.5 text-left">
                            <div className="flex items-center gap-1.5 flex-wrap">
                              <h5 className="text-xs font-bold text-editorial-text">{student.name}</h5>
                              <span className="text-[9px] font-bold text-editorial-muted bg-white border border-editorial-border px-1.5 py-0.5 rounded">
                                {student.career}
                              </span>
                              {student.cycle && (
                                <span className="text-[9px] font-bold text-editorial-text bg-editorial-light px-1.5 py-0.5 rounded">
                                  {student.cycle}
                                </span>
                              )}
                            </div>
                            <p className="text-[10px] text-editorial-muted truncate max-w-[280px]">{student.specialty} • {student.university}</p>
                            
                            {/* Skills overlaps */}
                            <div className="flex flex-wrap gap-1 mt-1">
                              {student.skills.slice(0, 3).map(sk => {
                                const isReq = requiredSkills.includes(sk);
                                return (
                                  <span key={sk} className={`text-[8px] px-1.5 py-0.5 rounded-full font-bold uppercase ${isReq ? 'bg-editorial-accent/20 text-editorial-accent border border-editorial-accent/30' : 'bg-editorial-light text-editorial-muted'}`}>
                                    {sk}
                                  </span>
                                );
                              })}
                              {student.skills.length > 3 && <span className="text-[8px] text-editorial-muted">+{student.skills.length - 3}</span>}
                            </div>
                          </div>
                        </div>

                        {/* Match score bar and actions */}
                        <div className="flex items-center gap-4 w-full md:w-auto justify-between md:justify-end border-t md:border-none pt-2.5 md:pt-0 mt-2 md:mt-0">
                          <div className="space-y-1 text-right">
                            <p className="text-[9px] text-editorial-muted font-bold uppercase tracking-wider">COINCIDENCIA</p>
                            <div className="flex items-center gap-2">
                              <div className="w-20 bg-editorial-light h-1.5 rounded-full overflow-hidden">
                                <div 
                                  className="bg-editorial-text h-full rounded-full" 
                                  style={{ width: `${score}%` }}
                                ></div>
                              </div>
                              <span className="text-xs font-serif font-black text-editorial-text">{score}%</span>
                            </div>
                          </div>

                          <div className="flex items-center">
                            <div className={`w-5 h-5 rounded-full border flex items-center justify-center shrink-0 ${
                              isSelected ? 'bg-editorial-text text-editorial-bg border-editorial-text' : 'border-editorial-border'
                            }`}>
                              {isSelected && <Check className="w-3 h-3" />}
                            </div>
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>

              {/* Selected Candidate Detailed Insights (Dynamic match details and portfolios) */}
              <div className="bg-editorial-light/40 border border-editorial-border rounded-2xl p-5 space-y-5 text-left relative overflow-hidden">
                
                {/* Simulated Laser Radar scanning background line */}
                {isScanning && (
                  <div className="absolute top-0 left-0 right-0 h-0.5 bg-editorial-accent opacity-60 animate-[bounce_1.5s_infinite] shadow-[0_0_8px_rgba(217,119,6,0.8)]"></div>
                )}

                {/* Tabs Header */}
                <div className="flex justify-between items-center border-b border-editorial-border pb-3 flex-wrap gap-2">
                  <div className="flex gap-4">
                    <button
                      type="button"
                      onClick={() => setActiveStudentTab('info')}
                      className={`text-xs uppercase tracking-wider font-bold pb-2 border-b-2 transition-all cursor-pointer ${
                        activeStudentTab === 'info'
                          ? 'border-editorial-text text-editorial-text'
                          : 'border-transparent text-editorial-muted hover:text-editorial-text'
                      }`}
                    >
                      Diagnóstico de Match Inteligente
                    </button>
                    <button
                      type="button"
                      onClick={() => setActiveStudentTab('projects')}
                      className={`text-xs uppercase tracking-wider font-bold pb-2 border-b-2 transition-all cursor-pointer flex items-center gap-1.5 ${
                        activeStudentTab === 'projects'
                          ? 'border-editorial-text text-editorial-text'
                          : 'border-transparent text-editorial-muted hover:text-editorial-text'
                      }`}
                    >
                      Proyectos Completados ({selectedStudent.projects?.length || 0})
                    </button>
                  </div>
                  
                  <span className="text-[10px] uppercase font-bold text-green-700 bg-green-50 border border-green-100 px-2 py-1 rounded">
                    Disponible de inmediato
                  </span>
                </div>

                {/* Tab content with AnimatePresence */}
                <div className="relative min-h-[200px]">
                  {isScanning && (
                    <div className="absolute inset-0 flex flex-col items-center justify-center bg-white/80 backdrop-blur-[1px] rounded-xl z-10 space-y-3">
                      <div className="relative w-12 h-12">
                        {/* Radar Scan pulse */}
                        <div className="absolute inset-0 rounded-full border-2 border-editorial-accent/30 animate-ping"></div>
                        <div className="absolute inset-2 rounded-full border-2 border-editorial-text/20 animate-pulse"></div>
                        <div className="absolute inset-0 rounded-full border-t-2 border-editorial-text animate-spin"></div>
                      </div>
                      <div className="text-center">
                        <p className="text-[10px] font-bold text-editorial-text uppercase tracking-widest animate-pulse">Analizando Coincidencia...</p>
                        <p className="text-[8px] text-editorial-muted mt-0.5 font-mono">Verificando {selectedStudent.skills.length} habilidades y tasa de éxito</p>
                      </div>
                    </div>
                  )}

                  {activeStudentTab === 'info' ? (
                    <div className="space-y-4">
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        
                        {/* Radar-like metric breakdown */}
                        <div className="bg-white p-4 rounded-xl border border-editorial-border space-y-3">
                          <h5 className="text-[10px] font-bold text-editorial-muted uppercase tracking-wider">Desglose de Coincidencia (Match %):</h5>
                          
                          <div className="space-y-2">
                            <div>
                              <div className="flex justify-between text-[10px] mb-1 font-bold">
                                <span className="text-editorial-muted">Habilidades Técnicas:</span>
                                <span className="text-editorial-text">
                                  {Math.round(((selectedMatch?.breakdown.skills ?? 0) / 40) * 100)}%
                                </span>
                              </div>
                              <div className="w-full bg-editorial-bg h-1 rounded-full overflow-hidden">
                                <div
                                  className="bg-green-600 h-full rounded-full"
                                  style={{ width: `${Math.round(((selectedMatch?.breakdown.skills ?? 0) / 40) * 100)}%` }}
                                ></div>
                              </div>
                            </div>

                            <div>
                              <div className="flex justify-between text-[10px] mb-1 font-bold">
                                <span className="text-editorial-muted">Alineación de Carrera:</span>
                                <span className="text-editorial-text">
                                  {Math.round(((selectedMatch?.breakdown.career ?? 0) / 30) * 100)}%
                                </span>
                              </div>
                              <div className="w-full bg-editorial-bg h-1 rounded-full overflow-hidden">
                                <div
                                  className="bg-editorial-text h-full rounded-full"
                                  style={{ width: `${Math.round(((selectedMatch?.breakdown.career ?? 0) / 30) * 100)}%` }}
                                ></div>
                              </div>
                            </div>

                            <div>
                              <div className="flex justify-between text-[10px] mb-1 font-bold">
                                <span className="text-editorial-muted">Disponibilidad y Experiencia:</span>
                                <span className="text-editorial-text">{Math.round((((selectedMatch?.breakdown.availability ?? 0) + (selectedMatch?.breakdown.experience ?? 0)) / 15) * 100)}%</span>
                              </div>
                              <div className="w-full bg-editorial-bg h-1 rounded-full overflow-hidden">
                                <div
                                  className="bg-editorial-text h-full rounded-full"
                                  style={{ width: `${Math.round((((selectedMatch?.breakdown.availability ?? 0) + (selectedMatch?.breakdown.experience ?? 0)) / 15) * 100)}%` }}
                                ></div>
                              </div>
                            </div>

                            <div>
                              <div className="flex justify-between text-[10px] mb-1 font-bold">
                                <span className="text-editorial-muted">Historial de Calidad (Reviews):</span>
                                <span className="text-editorial-text">{Math.round(((selectedMatch?.breakdown.rating ?? 0) / 15) * 100)}%</span>
                              </div>
                              <div className="w-full bg-editorial-bg h-1 rounded-full overflow-hidden">
                                <div
                                  className="bg-yellow-500 h-full rounded-full"
                                  style={{ width: `${Math.round(((selectedMatch?.breakdown.rating ?? 0) / 15) * 100)}%` }}
                                ></div>
                              </div>
                            </div>
                          </div>
                        </div>

                        {/* Student Bio and details */}
                        <div className="space-y-3 text-left">
                          <h5 className="text-[10px] font-bold text-editorial-muted uppercase tracking-wider">Carta de Presentación Académica:</h5>
                          <p className="text-xs text-editorial-text leading-relaxed font-serif italic bg-white p-3.5 rounded-xl border border-editorial-border">
                            "{selectedStudent.description}"
                          </p>
                           <div className="grid grid-cols-2 gap-x-4 gap-y-2 text-[10px] text-editorial-muted font-bold pt-2.5 border-t border-editorial-border/60">
                            <div>
                              Tarifa: <span className="text-editorial-text">${selectedStudent.expectedRate.toFixed(2)}/h</span>
                            </div>
                            <div>
                              Disponibilidad: <span className="text-editorial-text">{selectedMatch?.profile.availability || 'No especificada'}</span>
                            </div>
                            {selectedStudent.cycle && (
                              <div>
                                Ciclo: <span className="text-editorial-text">{selectedStudent.cycle}</span>
                              </div>
                            )}
                            <div className="col-span-2">
                              Carrera: <span className="text-editorial-text">{selectedStudent.career}</span>
                            </div>
                          </div>
                          {selectedStudent.experienceSummary && (
                            <div className="text-[10px] text-editorial-muted font-bold pt-2 border-t border-editorial-border/60">
                              Experiencia Destacada: <p className="text-editorial-text font-normal mt-0.5 leading-relaxed">{selectedStudent.experienceSummary}</p>
                            </div>
                          )}
                        </div>

                      </div>
                    </div>
                  ) : (
                    <div className="space-y-4 text-left">
                      {selectedStudent.projects && selectedStudent.projects.length > 0 ? (
                        <div className="grid grid-cols-1 md:grid-cols-12 gap-4">
                          
                          {/* Project list selection */}
                          <div className="md:col-span-4 space-y-2">
                            {selectedStudent.projects.map((proj, idx) => (
                              <button
                                key={proj.title}
                                type="button"
                                onClick={() => setSelectedWorkIndex(idx)}
                                className={`w-full text-left p-2.5 rounded-xl border text-xs transition-all cursor-pointer block ${
                                  selectedWorkIndex === idx
                                    ? 'bg-white border-editorial-text shadow-sm'
                                    : 'bg-transparent border-editorial-border/60 hover:bg-white/40'
                                }`}
                              >
                                <span className="font-bold text-editorial-text block truncate">{proj.title}</span>
                                <span className="text-[9px] text-editorial-muted font-mono">${proj.budget} USD • {proj.hours}h</span>
                              </button>
                            ))}
                          </div>

                          {/* Selected Project Details and Interactive Deliverable Card */}
                          <div className="md:col-span-8 bg-white p-4 rounded-xl border border-editorial-border space-y-3">
                            <div className="flex justify-between items-baseline border-b border-editorial-border/60 pb-2 flex-wrap gap-2">
                              <h6 className="text-xs font-serif font-black text-editorial-text">
                                {selectedStudent.projects[selectedWorkIndex]?.title}
                              </h6>
                              <span className="text-[8px] bg-green-50 border border-green-100 text-green-700 px-1.5 py-0.5 rounded font-bold uppercase shrink-0">
                                Entregado Escrow Seguro
                              </span>
                            </div>

                            <p className="text-[11px] text-editorial-muted leading-relaxed">
                              {selectedStudent.projects[selectedWorkIndex]?.description}
                            </p>

                            {/* Simulated Interactive Mockup / Deliverable Box */}
                            <div className="bg-editorial-bg p-3 rounded-lg border border-editorial-border space-y-2">
                              <div className="flex justify-between items-center text-[9px] text-editorial-muted font-bold font-mono">
                                <span>📦 ENTREGABLE DIGITAL VERIFICADO</span>
                                <span className="text-editorial-accent">ESTADO: COMPILADO</span>
                              </div>
                              
                              <div className="bg-white p-3 rounded border border-editorial-border/80 text-left">
                                <p className="text-[10px] font-bold text-editorial-text">{selectedStudent.projects[selectedWorkIndex]?.visualTitle}</p>
                                <p className="text-[8px] text-editorial-muted -mt-0.5">{selectedStudent.projects[selectedWorkIndex]?.visualSubtitle}</p>
                                
                                <ul className="space-y-1 mt-2 text-[8px] text-editorial-text">
                                  {selectedStudent.projects[selectedWorkIndex]?.visualElements.map((el, i) => (
                                    <li key={i} className="flex items-center gap-1 font-semibold">
                                      <span className="text-green-600">✓</span> {el}
                                    </li>
                                  ))}
                                </ul>
                              </div>
                            </div>

                            {/* Technologies applied */}
                            <div className="flex flex-wrap gap-1.5 pt-1">
                              {selectedStudent.projects[selectedWorkIndex]?.tech.map(t => (
                                <span key={t} className="text-[8px] font-bold uppercase tracking-wide bg-editorial-light border border-editorial-border px-2 py-0.5 rounded text-editorial-muted">
                                  {t}
                                </span>
                              ))}
                            </div>

                          </div>

                        </div>
                      ) : (
                        <div className="text-center py-8 text-editorial-muted text-xs bg-white rounded-xl border border-editorial-border">
                          Este estudiante no registra portafolios previos en la plataforma.
                        </div>
                      )}
                    </div>
                  )}
                </div>

              </div>
              </>
              )}
            </div>
          )}

          {step === 2 && (
            <div className="space-y-6">
              <div className="border-b border-editorial-border pb-4">
                <span className="text-[10px] uppercase tracking-[0.2em] font-bold text-editorial-accent">Paso 2 de 4</span>
                <h3 className="text-2xl font-serif font-black text-editorial-text mt-1">Elige un Plan Mensual</h3>
                <p className="text-xs text-editorial-muted mt-1">NYLA cobra una comisión fija de ${NYLA_FIXED_FEE.toFixed(2)} USD por plan; el estudiante cobra ${hourlyRate.toFixed(2)} USD por hora de gestión mensual.</p>
              </div>

              {/* Plan selector */}
              <div className="space-y-4">
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                  {PROJECT_PACKAGES.map(pkg => {
                    const isSelected = selectedPackageId === pkg.id;
                    return (
                      <button
                        key={pkg.id}
                        type="button"
                        onClick={() => setSelectedPackageId(pkg.id)}
                        className={`text-left p-4 rounded-2xl border transition-all cursor-pointer space-y-1.5 ${
                          isSelected
                            ? 'bg-editorial-text text-editorial-bg border-editorial-text shadow-sm'
                            : 'bg-editorial-bg/30 border-editorial-border hover:bg-editorial-bg/60'
                        }`}
                      >
                        <p className={`text-[10px] font-bold uppercase tracking-wider ${isSelected ? 'text-editorial-bg/70' : 'text-editorial-muted'}`}>{pkg.hours} horas / mes</p>
                        <p className="font-serif font-black text-base">{pkg.label}</p>
                        <p className={`text-lg font-serif font-black ${isSelected ? 'text-editorial-bg' : 'text-editorial-text'}`}>${calculatePVP(pkg.hours).toFixed(2)} <span className="text-[10px] font-sans font-normal">/ mes</span></p>
                        <p className={`text-[10px] ${isSelected ? 'text-editorial-bg/70' : 'text-editorial-muted'}`}>Estudiante recibe ${calculateStudentPayout(pkg.hours).toFixed(2)}/mes</p>
                        <ul className={`text-[9px] leading-relaxed pt-1.5 mt-1.5 border-t space-y-0.5 ${isSelected ? 'border-editorial-bg/20 text-editorial-bg/85' : 'border-editorial-border text-editorial-muted'}`}>
                          {pkg.includes.map((item, idx) => (
                            <li key={idx}>• {item}</li>
                          ))}
                        </ul>
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Business Model breakdown */}
              <div className="space-y-3 pt-4">
                <h4 className="text-xs font-bold text-editorial-text uppercase tracking-wider">Desglose de Pago</h4>

                <div className="border border-editorial-border rounded-2xl p-5 space-y-2.5 bg-white text-xs">
                  <div className="flex justify-between items-center">
                    <span className="text-editorial-muted">Horas de gestión al mes:</span>
                    <span className="font-semibold">{estimatedHours}h × ${hourlyRate.toFixed(2)}/h</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-editorial-muted">Pago al estudiante (mensual):</span>
                    <span className="font-semibold text-editorial-accent">${modelMath.studentNetEarnings.toFixed(2)} USD</span>
                  </div>
                  <div className="flex justify-between items-center border-b border-editorial-border pb-2.5">
                    <span className="text-editorial-muted">Comisión fija NYLA:</span>
                    <span className="font-semibold">${modelMath.commissionAmount.toFixed(2)} USD</span>
                  </div>
                  <div className="flex justify-between items-center text-sm font-serif font-black pt-1 text-editorial-text">
                    <span>Total a pagar (Emprendedor, mensual):</span>
                    <span>${modelMath.rawTotal.toFixed(2)} USD</span>
                  </div>
                </div>
                <p className="text-[9px] text-editorial-muted leading-relaxed italic">
                  *La comisión de NYLA es siempre ${NYLA_FIXED_FEE.toFixed(2)} USD, sin importar el plan elegido. Los fondos permanecen en garantía segura (Escrow) hasta la entrega aprobada del mes.
                </p>
              </div>
            </div>
          )}

          {step === 3 && (
            <div className="space-y-6">
              <div className="border-b border-editorial-border pb-4">
                <span className="text-[10px] uppercase tracking-[0.2em] font-bold text-editorial-accent">Paso 3 de 4</span>
                <h3 className="text-2xl font-serif font-black text-editorial-text mt-1">Contrato de Colaboración Digital</h3>
                <p className="text-xs text-editorial-muted mt-1">Revisa los términos legales auto-generados y realiza la firma electrónica obligatoria.</p>
              </div>

              {/* Contract template content */}
              <div className="bg-editorial-bg border border-editorial-border rounded-2xl p-6 font-serif text-[11px] leading-relaxed max-h-80 overflow-y-auto space-y-4 text-editorial-text select-none shadow-inner">
                <div className="text-center font-bold uppercase tracking-wider border-b border-editorial-border pb-3 mb-4 font-serif">
                  CONTRATO DE COLABORACIÓN DIGITAL DE TALENTO ACADÉMICO
                </div>

                <p>
                  Conste por el presente documento el <strong>Contrato de Colaboración Digital</strong> (en adelante, el "Acuerdo") celebrado por una parte por el Emprendedor Patrocinador <strong>{entrepreneurName}</strong> (en adelante, el "Emprendedor"), y por la otra parte la estudiante universitaria certificada de {selectedStudent.university}, <strong>{selectedStudent.name}</strong> (en adelante, la "Estudiante"), bajo los siguientes términos y cláusulas:
                </p>

                <div className="space-y-2">
                  <p className="font-bold">CLÁUSULA PRIMERA: DATOS DE LAS PARTES</p>
                  <ul className="list-disc pl-5 space-y-1">
                    <li><strong>Estudiante:</strong> {selectedStudent.name} ({selectedStudent.career})</li>
                    <li><strong>Emprendedor:</strong> {entrepreneurName} (Socio Colaborador del Portal Universitario NYLA)</li>
                    <li><strong>Plataforma Intermediaria:</strong> NYLA Corp (Navega las metas de tu vida)</li>
                  </ul>
                </div>

                <div className="space-y-2">
                  <p className="font-bold">CLÁUSULA SEGUNDA: DESCRIPCIÓN DEL PROYECTO & ENTREGABLES</p>
                  <p>La Estudiante se compromete a realizar la prestación del servicio técnico denominado: <strong>"{projectTitle}"</strong>. Los entregables comprenden de manera imperativa:</p>
                  <ul className="list-decimal pl-5 space-y-1">
                    <li>Entregable 1: Diseño UI/UX inicial y flujos interactivos de prueba.</li>
                    <li>Entregable 2: Componentes React funcionales con código estructurado.</li>
                    <li>Entregable 3: Pruebas del módulo y subida de documentación en repositorio Git.</li>
                  </ul>
                </div>

                <div className="space-y-2">
                  <p className="font-bold">CLÁUSULA TERCERA: CONDICIONES ECONÓMICAS & COMISIONES</p>
                  <p>
                    Las partes acuerdan un volumen de <strong>{estimatedHours} horas estimadas</strong> de desarrollo técnico a una tarifa por hora de <strong>${hourlyRate.toFixed(2)} USD</strong>, más la comisión fija de intermediación de NYLA de <strong>${NYLA_FIXED_FEE.toFixed(2)} USD</strong>, consolidando un presupuesto total de contrato de <strong>${modelMath.rawTotal.toFixed(2)} USD</strong>. El Emprendedor declara que este monto será depositado en la pasarela segura de NYLA, quedando retenido en garantía (Escrow) hasta la entrega formal.
                  </p>
                  <p>
                    NYLA Corp retendrá su comisión fija de <strong>${modelMath.commissionAmount.toFixed(2)} USD</strong> del presupuesto una vez se aprueben los entregables. La Estudiante recibirá de forma neta la suma de <strong>${modelMath.studentNetEarnings.toFixed(2)} USD</strong>, correspondiente a las horas pactadas.
                  </p>
                </div>

                <div className="space-y-2">
                  <p className="font-bold">CLÁUSULA CUARTA: PLAZO DE ENTREGA</p>
                  <p>
                    El plan contratado tiene una duración de <strong>1 mes calendario</strong> de gestión ({estimatedHours} horas totales), iniciando de forma inmediata a la acreditación del depósito en garantía.
                  </p>
                </div>

                <div className="space-y-2">
                  <p className="font-bold">CLÁUSULA QUINTA: DERECHOS DE PROPIEDAD INTELECTUAL</p>
                  <p>
                    Todos los derechos patrimoniales de propiedad intelectual del software, código de origen, wireframes e ilustraciones generados en este proyecto serán transferidos de forma exclusiva al Emprendedor una vez liberado el pago completo en garantía. La Estudiante conservará el derecho moral de crédito y de exponer el trabajo en su portafolio profesional de NYLA para efectos académicos y demostrativos.
                  </p>
                </div>

                <div className="space-y-2">
                  <p className="font-bold">CLÁUSULA SEXTA: POLÍTICA DE CANCELACIÓN</p>
                  <p>
                    Cualquiera de las partes podrá solicitar la resolución del contrato notificando con 48 horas de anticipación. En caso de cancelación unilateral, las horas debidamente documentadas y validadas por el comité técnico de NYLA serán prorrateadas y pagadas del fondo de garantía, liberándose el saldo restante de vuelta al Emprendedor.
                  </p>
                </div>
              </div>

              {/* Digital Signature Panel */}
              <div className="p-5 border border-editorial-border rounded-2xl bg-editorial-bg/25 space-y-4">
                <div className="flex items-center gap-2">
                  <PenTool className="w-4 h-4 text-editorial-text" />
                  <span className="font-bold text-xs uppercase tracking-wider text-editorial-text">Aceptación Mediante Firma Digital</span>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 items-end">
                  <div className="space-y-1.5">
                    <label className="text-[10px] font-bold text-editorial-muted uppercase tracking-wider">Nombre del Emprendedor</label>
                    <input 
                      type="text"
                      value={entrepreneurName}
                      onChange={(e) => setEntrepreneurName(e.target.value)}
                      placeholder="Escribe tu nombre completo para firmar"
                      className="w-full bg-white border border-editorial-border rounded-xl p-3 text-xs focus:ring-1 focus:ring-editorial-text focus:outline-none text-editorial-text"
                    />
                  </div>
                  
                  <div className="space-y-1.5">
                    <label className="text-[10px] font-bold text-editorial-muted uppercase tracking-wider">Firma Electrónica Requerida</label>
                    <input 
                      type="text"
                      value={signatureText}
                      onChange={(e) => {
                        setSignatureText(e.target.value);
                        setIsSigned(e.target.value.trim().length > 3);
                      }}
                      placeholder="Escribe exactamente tu nombre para aceptar"
                      className="w-full bg-white border border-editorial-border rounded-xl p-3 text-xs focus:ring-1 focus:ring-editorial-text focus:outline-none text-editorial-text font-serif italic text-lg tracking-wide border-dashed"
                    />
                  </div>
                </div>

                <div className="flex gap-2.5 items-start mt-2">
                  <input 
                    type="checkbox"
                    id="chk-terms"
                    checked={isSigned}
                    onChange={(e) => setIsSigned(e.target.checked && signatureText.trim().length > 2)}
                    className="mt-1 w-4 h-4 border-editorial-border text-editorial-text focus:ring-editorial-text"
                  />
                  <label htmlFor="chk-terms" className="text-[10px] text-editorial-muted leading-normal">
                    Confirmo que he leído y acepto todas las cláusulas, la comisión fija de NYLA (${NYLA_FIXED_FEE.toFixed(2)} USD) y políticas de entrega estipuladas en esta propuesta de colaboración digital.
                  </label>
                </div>
              </div>
            </div>
          )}

          {step === 4 && (
            <div className="space-y-6">
              <div className="border-b border-editorial-border pb-4">
                <span className="text-[10px] uppercase tracking-[0.2em] font-bold text-editorial-accent">Paso 4 de 4</span>
                <h3 className="text-2xl font-serif font-black text-editorial-text mt-1">Confirmación del Contrato</h3>
                <p className="text-xs text-editorial-muted mt-1">Revisa el resumen antes de confirmar. El depósito en garantía (Escrow) se realiza con Stripe desde tu Dashboard en el siguiente paso.</p>
              </div>

              <div className="flex gap-3 bg-green-50 border border-green-200 rounded-2xl p-4 text-xs text-green-900 items-start">
                <Shield className="w-5 h-5 text-green-700 shrink-0 mt-0.5" />
                <div>
                  <p className="font-bold">Depósito Protegido por Escrow NYLA</p>
                  <p className="text-green-800 leading-relaxed mt-0.5">
                    Al confirmar, el contrato queda registrado y asignado a {selectedStudent?.name}. Desde tu Dashboard podrás depositar <strong>${modelMath.rawTotal.toFixed(2)} USD</strong> en garantía con Stripe; el estudiante recibe <strong>${modelMath.studentNetEarnings.toFixed(2)} USD</strong> y NYLA retiene su comisión fija de <strong>${NYLA_FIXED_FEE.toFixed(2)} USD</strong> solo cuando apruebes la entrega.
                  </p>
                </div>
              </div>

              {searchError && (
                <p className="text-xs text-red-700 bg-red-50 border border-red-200 rounded-xl p-3">{searchError}</p>
              )}
            </div>
          )}

          {/* Wizard Action buttons footer */}
          <div className="pt-6 border-t border-editorial-border flex justify-between gap-4">
            <button
              type="button"
              onClick={step === 1 ? () => setView('dashboard') : handlePrevStep}
              className="px-5 py-3 border border-editorial-border text-editorial-text font-bold rounded-full text-[10px] uppercase tracking-[0.15em] hover:bg-editorial-light transition-all cursor-pointer flex items-center gap-1.5"
            >
              <ArrowLeft className="w-3.5 h-3.5" /> {step === 1 ? 'Cancelar' : 'Atrás'}
            </button>

            <button
              type="button"
              onClick={handleNextStep}
              disabled={(step === 1 && !selectedStudent) || (step === 3 && !isSigned) || isProcessingPayment}
              className="px-8 py-3 bg-editorial-text text-editorial-bg font-bold rounded-full text-[10px] uppercase tracking-[0.15em] hover:opacity-90 transition-all disabled:opacity-40 cursor-pointer flex items-center gap-1.5 shadow-none"
            >
              {isProcessingPayment ? (
                <span>Confirmando contrato...</span>
              ) : step === 4 ? (
                <span className="flex items-center gap-1.5"><CheckCircle2 className="w-3.5 h-3.5" /> Confirmar Contrato</span>
              ) : (
                <span className="flex items-center gap-1.5">Continuar <ChevronRight className="w-3.5 h-3.5" /></span>
              )}
            </button>
          </div>

        </div>

        {/* Right contextual panel (col-span-4) */}
        <aside className="lg:col-span-4 space-y-6">
          
          {/* Summary Card */}
          <div className="bg-editorial-bg p-6 rounded-[32px] border border-editorial-border space-y-5">
            <h4 className="font-serif font-black text-sm text-editorial-text border-b border-editorial-border pb-3">Resumen de Contratación</h4>
            
            {selectedStudent ? (
            <div className="space-y-4">

              {/* Selected Student profile snap */}
              <div className="flex gap-3 items-center">
                {selectedStudent.avatar.startsWith('http') ? (
                  <div className="w-10 h-10 rounded-full overflow-hidden border border-editorial-border shrink-0 bg-white">
                    <img className="w-full h-full object-cover" referrerPolicy="no-referrer" src={selectedStudent.avatar} alt={selectedStudent.name} />
                  </div>
                ) : (
                  <div className="w-10 h-10 rounded-full bg-editorial-text text-editorial-bg flex items-center justify-center text-base shrink-0">
                    {selectedStudent.avatar || selectedStudent.name.charAt(0)}
                  </div>
                )}
                <div>
                  <h5 className="text-[11px] font-bold text-editorial-text">{selectedStudent.name}</h5>
                  <p className="text-[9px] text-editorial-muted font-bold">{selectedStudent.career} • {selectedStudent.specialty}</p>
                </div>
              </div>

              {/* Dynamic stats breakdown based on current configurations */}
              <div className="space-y-2 border-t border-b border-editorial-border py-4 text-xs">
                <div className="flex justify-between">
                  <span className="text-editorial-muted">Servicio:</span>
                  <span className="font-bold text-editorial-text truncate max-w-[150px]" title={projectTitle}>{projectTitle}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-editorial-muted">Duración del Plan:</span>
                  <span className="font-bold text-editorial-text">1 mes ({estimatedHours}h)</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-editorial-muted">Tarifa por hora:</span>
                  <span className="font-bold text-editorial-text">${hourlyRate.toFixed(2)} USD</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-editorial-muted">Comisión fija NYLA:</span>
                  <span className="font-bold text-editorial-text">${NYLA_FIXED_FEE.toFixed(2)} USD</span>
                </div>
              </div>

              {/* Final Totals display */}
              <div className="space-y-1.5 text-right">
                <p className="text-[8px] text-editorial-muted font-bold uppercase tracking-widest">PRESUpuesto total retenido</p>
                <p className="text-3xl font-serif font-black text-editorial-text">${modelMath.rawTotal.toLocaleString('en-US', { minimumFractionDigits: 2 })}</p>
                <p className="text-[9px] text-editorial-accent font-bold">
                  Estudiante recibe neto: ${modelMath.studentNetEarnings.toLocaleString('en-US', { minimumFractionDigits: 2 })}
                </p>
              </div>

            </div>
            ) : (
              <p className="text-xs text-editorial-muted">Busca y selecciona un estudiante compatible en el Paso 1 para ver el resumen del contrato.</p>
            )}
          </div>

          {/* Secure Trust badge */}
          <div className="bg-white p-5 border border-editorial-border rounded-[24px] space-y-3">
            <div className="w-8 h-8 rounded-full bg-editorial-text/5 text-editorial-text flex items-center justify-center">
              <Shield className="w-4 h-4" />
            </div>
            <h5 className="text-xs font-bold text-editorial-text uppercase tracking-wider">Políticas de NYLA Trust</h5>
            <p className="text-[11px] text-editorial-muted leading-relaxed">
              La plataforma garantiza la mediación e intermediación neutral de disputas. El estudiante cuenta con el respaldo de su universidad de origen y NYLA retendrá el pago hasta la validación mutua del código.
            </p>
          </div>

        </aside>

      </div>

    </div>
  );
}
