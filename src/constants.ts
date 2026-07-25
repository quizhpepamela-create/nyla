// NYLA earns a flat fee per project, not a percentage of the student's pay — see the
// official costing document (Proyecto Integrador: Costeo de la Plataforma Digital).
export const STUDENT_HOURLY_RATE = 5.0;
export const NYLA_FIXED_FEE = 10.57;

export interface ProjectPackage {
  id: 'simple' | 'intermedio' | 'elaborado';
  label: string;
  hours: number;
  includes: string[];
}

export const PROJECT_PACKAGES: ProjectPackage[] = [
  {
    id: 'simple',
    label: 'Simple',
    hours: 2,
    includes: [
      '1 pieza de contenido para redes sociales (post o historia)',
      'Recomendación breve de horario de publicación',
    ],
  },
  {
    id: 'intermedio',
    label: 'Intermedio',
    hours: 4,
    includes: [
      '2-3 piezas de contenido para redes sociales',
      'Mini calendario de publicaciones (1 semana)',
      'Recomendaciones de hashtags y horarios',
    ],
  },
  {
    id: 'elaborado',
    label: 'Elaborado',
    hours: 6,
    includes: [
      '4-5 piezas de contenido para redes sociales',
      'Calendario de contenido completo (2 semanas)',
      'Configuración básica de una campaña de anuncios',
      'Reporte breve de resultados y próximos pasos',
    ],
  },
];

// Rough guide for a custom/personalized quote: about one unit of deliverable work per hour.
export function estimateCustomDeliverables(hours: number): string {
  return `≈ ${hours} ${hours === 1 ? 'unidad de trabajo' : 'unidades de trabajo'} (posts, diseños, asesorías o ajustes de campaña) — el alcance exacto se define con el estudiante según tu proyecto.`;
}

export function calculatePVP(hours: number): number {
  return Number((NYLA_FIXED_FEE + hours * STUDENT_HOURLY_RATE).toFixed(2));
}

export function calculateStudentPayout(hours: number): number {
  return Number((hours * STUDENT_HOURLY_RATE).toFixed(2));
}
