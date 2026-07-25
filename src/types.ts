export type ViewState = 'landing' | 'dashboard' | 'proyectos' | 'mensajes' | 'perfil' | 'configuracion' | 'contratacion' | 'login' | 'register' | 'forgot-password' | 'reset-password';

export type UserRole = 'STUDENT' | 'ENTREPRENEUR' | 'ADMIN';

export interface AuthUser {
  id: string;
  email: string;
  role: UserRole;
}

export interface StudentProfileData {
  id: string;
  userId: string;
  fullName: string;
  photoUrl: string | null;
  university: string | null;
  career: string | null;
  semester: string | null;
  skills: string[];
  experience: string | null;
  portfolioUrl: string | null;
  cvUrl: string | null;
  availability: string | null;
  rating: number | null;
}

export interface EntrepreneurProfileData {
  id: string;
  userId: string;
  businessName: string;
  logoUrl: string | null;
  category: string | null;
  description: string | null;
  objectives: string | null;
  projectNeeds: string | null;
  studentProfileSought: string | null;
  requiredSkills: string[];
  estimatedDuration: string | null;
  budgetOrHours: string | null;
}

export interface Message {
  id: string;
  role: 'user' | 'model' | 'assistant';
  content: string;
  timestamp: string;
  isContract?: boolean;
  contractData?: {
    id: string;
    parties: string;
    service: string;
    amount: string;
    duration: string;
    status: 'pending' | 'accepted' | 'modified';
  };
}

export interface ChatThread {
  id: string;
  name: string;
  avatar: string;
  isAI: boolean;
  online: boolean;
  lastMessage: string;
  time: string;
  messages: Message[];
}

export type ProjectStatus = 'OPEN' | 'IN_PROGRESS' | 'COMPLETED' | 'CANCELLED';
export type EscrowStatus = 'NONE' | 'HELD' | 'RELEASED';
export type ApplicationStatus = 'PENDING' | 'ACCEPTED' | 'REJECTED';

export interface Project {
  id: string;
  entrepreneurId: string;
  studentId: string | null;
  title: string;
  description: string;
  requiredCareer: string | null;
  requiredSkills: string[];
  estimatedHours: number;
  hourlyRate: number;
  budget: number;
  status: ProjectStatus;
  escrowStatus: EscrowStatus;
  progress: number;
  deliverables: string[];
  startDate: string | null;
  endDate: string | null;
  createdAt: string;
  updatedAt: string;
  // Joined convenience fields, present depending on which endpoint returned this project.
  entrepreneurName?: string | null;
  student?: { id: string; studentProfile: StudentProfileData | null } | null;
  applications?: ApplicationData[];
  myApplicationStatus?: ApplicationStatus | null;
}

export interface ApplicationData {
  id: string;
  projectId: string;
  studentId: string;
  proposedHours: number | null;
  status: ApplicationStatus;
  createdAt: string;
  student?: { id: string; studentProfile: StudentProfileData | null };
}

export interface MatchBreakdown {
  career: number;
  skills: number;
  availability: number;
  rating: number;
  experience: number;
}

export interface MatchCandidate {
  studentId: string;
  score: number;
  breakdown: MatchBreakdown;
  profile: StudentProfileData;
}

export interface Review {
  id: string;
  author: string;
  role: string;
  avatar: string;
  stars: number;
  text: string;
}

export interface Certification {
  name: string;
  issuer: string;
  year: number;
}
