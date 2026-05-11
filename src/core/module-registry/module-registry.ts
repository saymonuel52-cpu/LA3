/**
 * Module Registry for LAD 2
 * Manages dynamic module loading, registration, and lifecycle
 */

import { eventBus, Events } from '../event-bus/event-bus';

export interface ModuleMetadata {
  id: string;
  name: string;
  version: string;
  description: string;
  icon: string;
  route: string;
  contexts: string[];
  enabled: boolean;
  component?: React.ComponentType;
}

export class ModuleRegistry {
  private static instance: ModuleRegistry;
  private modules: Map<string, ModuleMetadata> = new Map();
  private enabledModules: Set<string> = new Set();

  private constructor() {}

  static getInstance(): ModuleRegistry {
    if (!ModuleRegistry.instance) {
      ModuleRegistry.instance = new ModuleRegistry();
    }
    return ModuleRegistry.instance;
  }

  /**
   * Register a new module
   */
  register(module: ModuleMetadata): void {
    this.modules.set(module.id, module);
    
    if (module.enabled) {
      this.enabledModules.add(module.id);
    }
  }

  /**
   * Get a module by ID
   */
  getModule(moduleId: string): ModuleMetadata | undefined {
    return this.modules.get(moduleId);
  }

  /**
   * Get all registered modules
   */
  getAllModules(): ModuleMetadata[] {
    return Array.from(this.modules.values());
  }

  /**
   * Get enabled modules
   */
  getEnabledModules(): ModuleMetadata[] {
    return Array.from(this.modules.values()).filter(m => this.enabledModules.has(m.id));
  }

  /**
   * Enable a module
   */
  enableModule(moduleId: string): void {
    const module = this.modules.get(moduleId);
    if (module) {
      this.enabledModules.add(moduleId);
      module.enabled = true;
      eventBus.emit(Events.MODULE_ENABLED, { moduleId });
    }
  }

  /**
   * Disable a module
   */
  disableModule(moduleId: string): void {
    const module = this.modules.get(moduleId);
    if (module) {
      this.enabledModules.delete(moduleId);
      module.enabled = false;
      eventBus.emit(Events.MODULE_DISABLED, { moduleId });
    }
  }

  /**
   * Check if a module is enabled
   */
  isModuleEnabled(moduleId: string): boolean {
    return this.enabledModules.has(moduleId);
  }

  /**
   * Update module component
   */
  updateComponent(moduleId: string, component: React.ComponentType): void {
    const module = this.modules.get(moduleId);
    if (module) {
      module.component = component;
    }
  }

  /**
   * Get module component
   */
  getModuleComponent(moduleId: string): React.ComponentType | undefined {
    return this.modules.get(moduleId)?.component;
  }

  /**
   * Load modules from configuration
   */
  async loadFromConfig(config: ModuleMetadata[]): Promise<void> {
    for (const module of config) {
      this.register(module);
    }
    
    // Persist enabled state
    this.persistEnabledModules();
  }

  /**
   * Persist enabled modules to localStorage
   */
  private persistEnabledModules(): void {
    const enabled = Array.from(this.enabledModules);
    localStorage.setItem('lad2_enabled_modules', JSON.stringify(enabled));
  }

  /**
   * Restore enabled modules from localStorage
   */
  restoreEnabledModules(): void {
    const stored = localStorage.getItem('lad2_enabled_modules');
    if (stored) {
      try {
        const enabled = JSON.parse(stored) as string[];
        this.enabledModules = new Set(enabled);
        
        // Update module enabled state
        for (const moduleId of enabled) {
          const module = this.modules.get(moduleId);
          if (module) {
            module.enabled = true;
          }
        }
      } catch (error) {
        console.error('Failed to restore enabled modules:', error);
      }
    }
  }
}

// Export singleton instance
export const moduleRegistry = ModuleRegistry.getInstance();
