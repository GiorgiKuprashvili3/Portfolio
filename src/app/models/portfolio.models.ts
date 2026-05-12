export interface Project {
  id: number;
  type: 'fe' | 'da';
  title: string;
  description: string;
  tags: { label: string; variant: 'fe' | 'da' | 'green' }[];
  repoUrl: string;
  liveUrl?: string;
}

export interface SkillGroup {
  category: string;
  skills: string[];
}

export interface Experience {
  dateRange: string;
  role: string;
  company: string;
  bullets: string[];
}

export interface Stat {
  value: string;
  label: string;
}
