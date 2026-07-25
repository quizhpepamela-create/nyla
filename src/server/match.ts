import { StudentProfile } from "@prisma/client";

export interface MatchBreakdown {
  career: number;
  skills: number;
  availability: number;
  rating: number;
  experience: number;
}

export interface MatchResult {
  score: number;
  breakdown: MatchBreakdown;
}

interface ProjectRequirements {
  requiredCareer?: string | null;
  requiredSkills: string[];
}

function normalize(value: string): string {
  return value.trim().toLowerCase();
}

export function scoreStudent(project: ProjectRequirements, profile: StudentProfile): MatchResult {
  // Career: partial, case-insensitive match in either direction.
  let career = 0;
  if (project.requiredCareer && profile.career) {
    const a = normalize(project.requiredCareer);
    const b = normalize(profile.career);
    if (a === b || a.includes(b) || b.includes(a)) {
      career = 30;
    }
  }

  // Skills: overlap ratio against the required skill list.
  let skills = 0;
  if (project.requiredSkills.length > 0) {
    const required = new Set(project.requiredSkills.map(normalize));
    const have = new Set(profile.skills.map(normalize));
    const overlap = [...required].filter((s) => have.has(s)).length;
    skills = Math.round((overlap / required.size) * 40);
  }

  const availability = profile.availability && profile.availability.trim() ? 10 : 0;
  const rating = Math.round(((profile.rating ?? 3.5) / 5) * 15);
  const experience = profile.experience && profile.experience.trim() ? 5 : 0;

  const score = Math.min(100, career + skills + availability + rating + experience);

  return {
    score,
    breakdown: { career, skills, availability, rating, experience },
  };
}
