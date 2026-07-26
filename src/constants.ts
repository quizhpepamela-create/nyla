// NYLA earns a flat fee per project, not a percentage of the student's pay — see the
// official costing document (Proyecto Integrador: Costeo de la Plataforma Digital).
export const STUDENT_HOURLY_RATE = 5.0;
export const NYLA_FIXED_FEE = 10.57;

export const MIN_PROJECT_HOURS = 10;
export const MAX_PROJECT_HOURS = 30;

// NYLA sells 3 monthly management plans (not one-off small gigs) — each defines how many
// hours the student dedicates that month and what content is delivered. The commission is
// always the same flat $10.57; only the student's pay changes with the plan.
export interface ProjectPackage {
  id: 'basico' | 'intermedio' | 'avanzado';
  label: string;
  hours: number;
  includes: string[];
}

export const PROJECT_PACKAGES: ProjectPackage[] = [
  {
    id: 'basico',
    label: 'Básico',
    hours: 10,
    includes: ['2 videos', '2 publicaciones'],
  },
  {
    id: 'intermedio',
    label: 'Intermedio',
    hours: 20,
    includes: ['4 videos', '2 historias', '2 publicaciones'],
  },
  {
    id: 'avanzado',
    label: 'Avanzado',
    hours: 30,
    includes: ['6 videos', '2 historias', '4 publicaciones', 'Calendario de contenido del mes'],
  },
];

export function calculatePVP(hours: number): number {
  return Number((NYLA_FIXED_FEE + hours * STUDENT_HOURLY_RATE).toFixed(2));
}

export function calculateStudentPayout(hours: number): number {
  return Number((hours * STUDENT_HOURLY_RATE).toFixed(2));
}
