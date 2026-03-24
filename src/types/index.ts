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
  modelUsed?: string;
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

export interface Project {
  id: string;
  workspace_id: string;
  name: string;
  description: string;
  created_at: string;
  updated_at: string;
  file_count?: number;
  chat_count?: number;
}

export interface Chat {
  id: string;
  workspace_id: string;
  project_id: string | null;
  title: string;
  chat_type: 'single' | 'meeting_room';
  role_slug: string | null;
  is_archived: boolean;
  created_at: string;
  updated_at: string;
  last_message?: {
    content: string;
    sender: string;
    created_at: string;
  } | null;
}

export interface FileRecord {
  id: string;
  workspace_id: string;
  project_id: string | null;
  chat_id: string | null;
  role_slug: string | null;
  name: string;
  file_type: string;
  size_bytes: number;
  storage_path: string;
  extracted_text: string | null;
  extraction_status: 'pending' | 'processing' | 'done' | 'failed';
  source: 'upload' | 'generated';
  created_at: string;
  download_url?: string;
}
