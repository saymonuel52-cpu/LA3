/**
 * Dexie.js database setup for LAD 2
 * Local-first IndexedDB with CRDT sync support
 */

import Dexie, { type Table } from 'dexie';
import type {
  User,
  Settings,
  ModuleConfig,
  ActivityLog,
  Workspace,
  Task,
  CalendarEvent,
  Transaction,
  Note,
  Contact,
  Procedure,
  Appointment,
  Client,
  AIActionLog,
  AIPromptTemplate,
  SyncMetadata,
  TimelineEntity,
} from './schema';

export class LADDatabase extends Dexie {
  // Core tables
  users!: Table<User, string>;
  settings!: Table<Settings, string>;
  moduleConfigs!: Table<ModuleConfig, string>;
  activityLogs!: Table<ActivityLog, string>;
  workspaces!: Table<Workspace, string>;
  
  // Module tables
  tasks!: Table<Task, string>;
  calendarEvents!: Table<CalendarEvent, string>;
  transactions!: Table<Transaction, string>;
  notes!: Table<Note, string>;
  contacts!: Table<Contact, string>;
  
  // Appointments module
  procedures!: Table<Procedure, string>;
  appointments!: Table<Appointment, string>;
  clients!: Table<Client, string>;
  
  // AI tables
  aiActionLogs!: Table<AIActionLog, string>;
  aiPromptTemplates!: Table<AIPromptTemplate, string>;
  
  // Sync tables
  syncMetadata!: Table<SyncMetadata, string>;

  // Timeline Engine — Time-Centric Core
  timelineEntities!: Table<TimelineEntity, string>;

  constructor() {
    super('LAD2Database');
    
    this.version(1).stores({
      // Core tables
      users: 'id, email',
      settings: 'id, user_id, key, context',
      moduleConfigs: 'id, user_id, module_id, enabled',
      activityLogs: 'id, user_id, timestamp, sync_status',
      workspaces: 'id, user_id, context, is_default',
      
      // Module tables
      tasks: 'id, user_id, workspace_id, status, due_date, [user_id+workspace_id]',
      calendarEvents: 'id, user_id, workspace_id, start_time, [user_id+workspace_id]',
      transactions: 'id, user_id, workspace_id, date, category, [user_id+workspace_id]',
      notes: 'id, user_id, workspace_id, is_pinned, last_edited, [user_id+workspace_id]',
      contacts: 'id, user_id, workspace_id, name, tags, [user_id+workspace_id]',
      
      // Appointments module
      procedures: 'id, user_id, workspace_id, category, [user_id+workspace_id]',
      appointments: 'id, user_id, workspace_id, date, time, status, client_id, [user_id+workspace_id]',
      clients: 'id, user_id, workspace_id, name, phone, [user_id+workspace_id]',
      
      // AI tables
      aiActionLogs: 'id, user_id, timestamp, action_id',
      aiPromptTemplates: 'id, name, module_id',
      
      // Sync tables
      syncMetadata: 'id, user_id, entity_type, entity_id, sync_status',
    });
    
    // Add indexes for better query performance
    this.version(2).stores({
      tasks: 'id, user_id, workspace_id, status, due_date, priority, [user_id+status], [user_id+workspace_id+status]',
      calendarEvents: 'id, user_id, workspace_id, start_time, end_time, [user_id+start_time], [user_id+workspace_id]',
    }).upgrade((tx) => {
      // Migration logic if needed
    });
    
    // Timeline Engine — Time-Centric Core
    this.version(3).stores({
      timelineEntities: 'id, startTime, endTime, [startTime+endTime], type, status, isDeleted',
    }).upgrade((tx) => {
      // Migration: можно перенести данные из calendar_events и tasks в timeline_entities
      // Для MVP пока оставляем пустым
    });
  }
  
  // Helper methods for common operations
  
  async getUserSettings(userId: string, context?: string): Promise<Settings[]> {
    if (context) {
      return this.settings.where({ user_id: userId, context }).toArray();
    }
    return this.settings.where({ user_id: userId }).toArray();
  }
  
  async getEnabledModules(userId: string): Promise<ModuleConfig[]> {
    return this.moduleConfigs
      .where({ user_id: userId, enabled: true })
      .toArray();
  }
  
  async getTasksByWorkspace(userId: string, workspaceId: string): Promise<Task[]> {
    return this.tasks
      .where({ user_id: userId, workspace_id: workspaceId })
      .sortBy('due_date');
  }
  
  async logActivity(
    userId: string,
    moduleId: string,
    action: string,
    entityType: string,
    entityId: string,
    changes?: Record<string, any>
  ): Promise<string> {
    const id = crypto.randomUUID();
    const log: ActivityLog = {
      id,
      user_id: userId,
      module_id: moduleId,
      action,
      entity_type: entityType,
      entity_id: entityId,
      changes: changes || {},
      timestamp: new Date().toISOString(),
      sync_status: 'local',
    };
    
    await this.activityLogs.add(log);
    return id;
  }
  
  // CRDT sync helpers
  async getPendingSyncs(userId: string): Promise<SyncMetadata[]> {
    return this.syncMetadata
      .where({ user_id: userId, sync_status: 'pending' })
      .toArray();
  }
  
  async markSynced(entityType: string, entityId: string, userId: string): Promise<void> {
    await this.syncMetadata
      .where({ user_id: userId, entity_type: entityType, entity_id: entityId })
      .modify({ sync_status: 'synced', last_synced: new Date().toISOString() });
  }
  
  // Context-aware queries
  async getWorkspaceByContext(userId: string, context: string): Promise<Workspace | undefined> {
    return this.workspaces
      .where({ user_id: userId, context })
      .first();
  }
  
  async getDefaultWorkspace(userId: string): Promise<Workspace | undefined> {
    return this.workspaces
      .where({ user_id: userId, is_default: true })
      .first();
  }
}

// Singleton instance
export const db = new LADDatabase();

// Initialize default data
export async function initializeDatabase(userId: string): Promise<void> {
  // Create default workspaces if they don't exist
  const contexts = ['home', 'work', 'study'] as const;
  
  for (const context of contexts) {
    const existing = await db.workspaces
      .where({ user_id: userId, context })
      .first();
    
    if (!existing) {
      await db.workspaces.add({
        id: crypto.randomUUID(),
        user_id: userId,
        name: context === 'home' ? 'Дом' : context === 'work' ? 'Работа' : 'Учеба',
        context,
        icon: context === 'home' ? 'home' : context === 'work' ? 'briefcase' : 'book',
        color: context === 'home' ? '#3b82f6' : context === 'work' ? '#10b981' : '#8b5cf6',
        is_default: context === 'home',
        created_at: new Date().toISOString(),
      });
    }
  }
  
  // Create default settings
  const defaultSettings = [
    { key: 'theme', value: 'system', context: 'home' },
    { key: 'language', value: 'ru', context: 'home' },
    { key: 'notifications', value: true, context: 'home' },
    { key: 'ai_enabled', value: true, context: 'home' },
  ];
  
  for (const setting of defaultSettings) {
    const existing = await db.settings
      .where({ user_id: userId, key: setting.key, context: setting.context })
      .first();
    
    if (!existing) {
      await db.settings.add({
        id: crypto.randomUUID(),
        user_id: userId,
        key: setting.key,
        value: setting.value,
        context: setting.context as any,
        created_at: new Date().toISOString(),
      });
    }
  }
}

// Export types for convenience
export type { 
  User, Settings, ModuleConfig, ActivityLog, Workspace,
  Task, CalendarEvent, Transaction, Note, Contact,
  AIActionLog, AIPromptTemplate, SyncMetadata 
};