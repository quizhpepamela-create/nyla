// NYLA earns a flat fee per project, not a percentage of the student's pay — see the
// official costing document (Proyecto Integrador: Costeo de la Plataforma Digital).
export const STUDENT_HOURLY_RATE = 5.0;
export const NYLA_FIXED_FEE = 10.57;

export const MIN_PROJECT_HOURS = 1;
export const MAX_PROJECT_HOURS = 8;

// What a student can realistically deliver at each hour count, from 1 to the platform cap
// of 8h. Each package (Simple/Intermedio/Elaborado) is just a shortcut to one of these tiers
// — the table is also used to describe "Personalizado" hour-by-hour, with a hard limit so no
// one expects an unrealistic amount of work crammed into a single hour.
export const HOURLY_WORKLOAD: Record<number, string> = {
  1: '1 publicación simple para redes sociales (post o historia).',
  2: '1 publicación diseñada + recomendación breve de horario de publicación.',
  3: '2 publicaciones + redacción básica de texto publicitario (copy).',
  4: '2-3 publicaciones + mini calendario de contenido (1 semana) + hashtags recomendados.',
  5: '3-4 publicaciones + calendario de 1 semana + ajustes de identidad de marca (colores/tipografía).',
  6: '4-5 publicaciones + calendario de contenido completo (2 semanas) + configuración básica de una campaña de anuncios + reporte breve.',
  7: 'Todo lo del paquete Elaborado + 1 pieza de contenido adicional.',
  8: 'Todo lo del paquete Elaborado + calendario extendido (3 semanas) + reporte de resultados con recomendaciones.',
};

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

// Exact description of what a "Personalizado" quote includes at the chosen hour count.
// Hours are capped at MAX_PROJECT_HOURS so no one expects unrealistic work in too little time.
export function estimateCustomDeliverables(hours: number): string {
  const clamped = Math.min(MAX_PROJECT_HOURS, Math.max(MIN_PROJECT_HOURS, hours));
  return HOURLY_WORKLOAD[clamped] ?? HOURLY_WORKLOAD[MAX_PROJECT_HOURS];
}

export function calculatePVP(hours: number): number {
  return Number((NYLA_FIXED_FEE + hours * STUDENT_HOURLY_RATE).toFixed(2));
}

export function calculateStudentPayout(hours: number): number {
  return Number((hours * STUDENT_HOURLY_RATE).toFixed(2));
}
