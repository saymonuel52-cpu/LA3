/**
 * Database schema for LAD 2 Personal OS
 * Compatible with Dexie.js (IndexedDB) and Supabase (PostgreSQL)
 */

// Core tables that exist in both local and cloud databases
export interface User {
  id: string;
  email?: string;
  name?: string;
  avatar_url?: string;
  settings: Record<string, any>;
  created_at: string;
  updated_at: string;
}

export interface Settings {
  id: string;
  user_id: string;
  key: string;
  value: any;
  context: 'home' | 'work' | 'study';
  module_id?: string;
  created_at: string;
}

export interface ModuleConfig {
  id: string;
  module_id: string;
  user_id: string;
  enabled: boolean;
  position: number;
  context_visibility: {
    home: boolean;
    work: boolean;
    study: boolean;
  };
  config: Record<string, any>;
  last_used?: string;
}

export interface ActivityLog {
  id: string;
  user_id: string;
  module_id: string;
  action: string;
  entity_type: string;
  entity_id: string;
  changes: Record<string, any>;
  timestamp: string;
  sync_status: 'local' | 'synced' | 'conflict';
}

// Workspace and context management
export interface Workspace {
  id: string;
  user_id: string;
  name: string;
  context: 'home' | 'work' | 'study';
  icon?: string;
  color?: string;
  is_default: boolean;
  created_at: string;
}

// Module-specific tables (examples)
export interface Task {
  id: string;
  user_id: string;
  workspace_id: string;
  title: string;
  description?: string;
  status: 'todo' | 'in_progress' | 'done' | 'archived';
  priority: 'low' | 'medium' | 'high' | 'urgent';
  due_date?: string;
  completed_at?: string;
  tags: string[];
  assigned_to?: string; // user_id for collaboration
  created_at: string;
  updated_at: string;
  sync_version: number; // For CRDT conflict resolution
  isDemo: boolean; // Маркер демо-данных
}

export interface CalendarEvent {
  id: string;
  user_id: string;
  workspace_id: string;
  title: string;
  description?: string;
  start_time: string;
  end_time: string;
  location?: string;
  participants?: string[]; // user_ids or emails
  recurrence_rule?: string; // RRULE format
  reminders: {
    type: 'notification' | 'email';
    minutes_before: number;
  }[];
  created_at: string;
  updated_at: string;
  sync_version: number;
  isDemo: boolean; // Маркер демо-данных
}

export interface Transaction {
  id: string;
  user_id: string;
  workspace_id: string;
  account_id: string;
  amount: number;
  currency: string;
  merchant: string;
  description?: string;
  category: string;
  subcategory?: string;
  date: string;
  is_income: boolean;
  tags: string[];
  receipt_url?: string;
  ai_categorized: boolean;
  created_at: string;
  updated_at: string;
  sync_version: number;
  isDemo: boolean; // Маркер демо-данных
}

export interface Note {
  id: string;
  user_id: string;
  workspace_id: string;
  title: string;
  content: string; // Markdown
  tags: string[];
  is_pinned: boolean;
  is_archived: boolean;
  last_edited: string;
  ai_summary?: string;
  created_at: string;
  updated_at: string;
  sync_version: number;
  isDemo?: boolean; // Маркер демо-данных
}

export interface Contact {
  id: string;
  user_id: string;
  workspace_id: string;
  name: string;
  email?: string;
  phone?: string;
  company?: string;
  position?: string;
  tags: string[];
  notes?: string;
  last_contacted?: string;
  next_follow_up?: string;
  created_at: string;
  updated_at: string;
  sync_version: number;
  isDemo?: boolean; // Маркер демо-данных
}

// Appointments module
export interface Procedure {
  id: string;
  user_id: string;
  workspace_id: string;
  name: string;
  description?: string;
  duration_minutes: number;
  price: number;
  category: string;
  color: string;
  created_at: string;
  updated_at: string;
  sync_version: number;
  isDemo?: boolean; // Маркер демо-данных
}

export interface Appointment {
  id: string;
  user_id: string;
  workspace_id: string;
  client_id: string;
  procedure_id: string;
  date: string;
  time: string;
  duration_minutes: number;
  price: number;
  status: 'pending' | 'confirmed' | 'completed' | 'cancelled';
  notes?: string;
  reminder_sent: boolean;
  created_at: string;
  updated_at: string;
  sync_version: number;
  isDemo?: boolean; // Маркер демо-данных
}

export interface Client {
  id: string;
  user_id: string;
  workspace_id: string;
  name: string;
  phone: string;
  email?: string;
  notes?: string;
  total_visits: number;
  total_spent: number;
  last_visit?: string;
  next_appointment?: string;
  tags: string[];
  created_at: string;
  updated_at: string;
  sync_version: number;
  isDemo?: boolean; // Маркер демо-данных
}

// AI-specific tables
export interface AIActionLog {
  id: string;
  user_id: string;
  action_id: string;
  input: Record<string, any>;
  output: Record<string, any>;
  success: boolean;
  error?: string;
  processing_time: number;
  model_used: string;
  timestamp: string;
}

export interface AIPromptTemplate {
  id: string;
  name: string;
  description: string;
  template: string;
  variables: string[];
  module_id?: string;
  context: string[];
  is_system: boolean;
}

// Sync metadata
export interface SyncMetadata {
  id: string;
  user_id: string;
  entity_type: string;
  entity_id: string;
  local_version: number;
  cloud_version?: number;
  last_synced?: string;
  conflict_data?: Record<string, any>;
  sync_status: 'pending' | 'synced' | 'conflict' | 'error';
}

// Dexie.js schema definition
export const dexieSchema = {
  // Core tables
  users: 'id, email',
  settings: 'id, user_id, key, context',
  module_configs: 'id, user_id, module_id, enabled',
  activity_logs: 'id, user_id, timestamp, sync_status',
  workspaces: 'id, user_id, context, is_default',
  
  // Module tables
  tasks: 'id, user_id, workspace_id, status, due_date, [user_id+workspace_id]',
  calendar_events: 'id, user_id, workspace_id, start_time, [user_id+workspace_id]',
  transactions: 'id, user_id, workspace_id, date, category, [user_id+workspace_id]',
  notes: 'id, user_id, workspace_id, is_pinned, last_edited, [user_id+workspace_id]',
  contacts: 'id, user_id, workspace_id, name, tags, [user_id+workspace_id]',
  
  // Appointments module
  procedures: 'id, user_id, workspace_id, category, [user_id+workspace_id]',
  appointments: 'id, user_id, workspace_id, date, time, status, client_id, [user_id+workspace_id]',
  clients: 'id, user_id, workspace_id, name, phone, [user_id+workspace_id]',
  
  // AI tables
  ai_action_logs: 'id, user_id, timestamp, action_id',
  ai_prompt_templates: 'id, name, module_id',
  
  // Sync tables
  sync_metadata: 'id, user_id, entity_type, entity_id, sync_status',
};

// Supabase SQL schema (for reference)
export const supabaseSchema = `
-- Core tables
CREATE TABLE users (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  email TEXT UNIQUE,
  name TEXT,
  avatar_url TEXT,
  settings JSONB DEFAULT '{}',
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE settings (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES users(id) ON DELETE CASCADE,
  key TEXT NOT NULL,
  value JSONB,
  context TEXT CHECK (context IN ('home', 'work', 'study')),
  module_id TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(user_id, key, context, module_id)
);

CREATE TABLE module_configs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES users(id) ON DELETE CASCADE,
  module_id TEXT NOT NULL,
  enabled BOOLEAN DEFAULT true,
  position INTEGER DEFAULT 0,
  context_visibility JSONB DEFAULT '{"home": true, "work": true, "study": true}',
  config JSONB DEFAULT '{}',
  last_used TIMESTAMPTZ,
  UNIQUE(user_id, module_id)
);

-- Enable Row Level Security (RLS) for multi-tenancy
ALTER TABLE users ENABLE ROW LEVEL SECURITY;
ALTER TABLE settings ENABLE ROW LEVEL SECURITY;
ALTER TABLE module_configs ENABLE ROW LEVEL SECURITY;

-- Create policies for data isolation
CREATE POLICY "Users can only access their own data" ON users
  FOR ALL USING (auth.uid() = id);

CREATE POLICY "Settings are user-specific" ON settings
  FOR ALL USING (auth.uid() = user_id);
`;