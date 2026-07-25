// NYLA earns a flat fee per project, not a percentage of the student's pay — see the
// official costing document (Proyecto Integrador: Costeo de la Plataforma Digital).
export const STUDENT_HOURLY_RATE = 5.0;
export const NYLA_FIXED_FEE = 10.57;

export interface ProjectPackage {
  id: 'simple' | 'intermedio' | 'elaborado';
  label: string;
  hours: number;
}

export const PROJECT_PACKAGES: ProjectPackage[] = [
  { id: 'simple', label: 'Simple', hours: 2 },
  { id: 'intermedio', label: 'Intermedio', hours: 4 },
  { id: 'elaborado', label: 'Elaborado', hours: 6 },
];

export function calculatePVP(hours: number): number {
  return Number((NYLA_FIXED_FEE + hours * STUDENT_HOURLY_RATE).toFixed(2));
}

export function calculateStudentPayout(hours: number): number {
  return Number((hours * STUDENT_HOURLY_RATE).toFixed(2));
}
