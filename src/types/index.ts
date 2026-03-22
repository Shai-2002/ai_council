export type RoleSlug = 'ceo' | 'coo' | 'cfo' | 'product' | 'marketing';

export interface Role {
  slug: RoleSlug;
  name: string;
  title: string;
  description: string;
  icon: string;
  color: string;
  bgLight: string;
  bgDark: string;
  text: string;
  border: string;
  artifactType: string;
}

export interface Message {
  id: string;
  role: 'user' | 'assistant';
  content: string;
}

export interface Artifact {
  id: string;
  roleSlug: RoleSlug;
  artifactType: string;
  title: string;
  status: 'draft' | 'final';
  createdAt: string;
  structuredData?: Record<string, unknown>;
}
