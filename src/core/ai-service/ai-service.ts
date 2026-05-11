/**
 * AI Service for LAD 2
 * Provides AI-powered features with cloud and local fallback support
 */

import { eventBus, Events } from '../event-bus/event-bus';

export interface AIAction {
  id: string;
  name: string;
  description: string;
  inputSchema: Record<string, any>;
  outputSchema: Record<string, any>;
  promptTemplate: string;
}

export interface AIResult {
  success: boolean;
  output?: any;
  error?: string;
  processingTime: number;
  modelUsed: string;
}

export class AIService {
  private static instance: AIService;
  private actions: Map<string, AIAction> = new Map();
  private provider: 'openai' | 'anthropic' | 'webllm' = 'openai';
  private apiKey: string | null = null;

  private constructor() {}

  static getInstance(): AIService {
    if (!AIService.instance) {
      AIService.instance = new AIService();
    }
    return AIService.instance;
  }

  /**
   * Register an AI action
   */
  registerAction(action: AIAction): void {
    this.actions.set(action.id, action);
  }

  /**
   * Get registered action
   */
  getAction(actionId: string): AIAction | undefined {
    return this.actions.get(actionId);
  }

  /**
   * Get all registered actions
   */
  getAllActions(): AIAction[] {
    return Array.from(this.actions.values());
  }

  /**
   * Set API key for cloud AI providers
   */
  setApiKey(key: string): void {
    this.apiKey = key;
  }

  /**
   * Execute an AI action
   */
  async executeAction(
    actionId: string,
    input: Record<string, any>
  ): Promise<AIResult> {
    const action = this.actions.get(actionId);
    if (!action) {
      return {
        success: false,
        error: `Action "${actionId}" not found`,
        processingTime: 0,
        modelUsed: this.provider,
      };
    }

    const startTime = Date.now();
    
    eventBus.emit(Events.AI_ACTION_STARTED, { actionId, input });

    try {
      // Build prompt from template
      const prompt = this.buildPrompt(action.promptTemplate, input);
      
      // Execute based on provider
      const output = await this.executePrompt(prompt);
      
      const processingTime = Date.now() - startTime;

      eventBus.emit(Events.AI_ACTION_COMPLETED, { 
        actionId, 
        output, 
        processingTime 
      });

      return {
        success: true,
        output,
        processingTime,
        modelUsed: this.provider,
      };
    } catch (error) {
      const processingTime = Date.now() - startTime;
      const errorMessage = error instanceof Error ? error.message : 'Unknown error';

      eventBus.emit(Events.AI_ACTION_ERROR, { 
        actionId, 
        error: errorMessage,
        input 
      });

      return {
        success: false,
        error: errorMessage,
        processingTime,
        modelUsed: this.provider,
      };
    }
  }

  /**
   * Build prompt from template with variables
   */
  private buildPrompt(template: string, variables: Record<string, any>): string {
    let prompt = template;
    
    for (const [key, value] of Object.entries(variables)) {
      const placeholder = `{${key}}`;
      prompt = prompt.replace(
        new RegExp(placeholder, 'g'), 
        String(value)
      );
    }
    
    return prompt;
  }

  /**
   * Execute prompt with current provider
   */
  private async executePrompt(prompt: string): Promise<any> {
    // Implementation depends on provider
    // This is a placeholder - actual implementation would call the AI API
    switch (this.provider) {
      case 'openai':
        return this.executeWithOpenAI(prompt);
      case 'anthropic':
        return this.executeWithAnthropic(prompt);
      case 'webllm':
        return this.executeWithWebLLM(prompt);
      default:
        throw new Error(`Unknown AI provider: ${this.provider}`);
    }
  }

  /**
   * Execute with OpenAI
   */
  private async executeWithOpenAI(prompt: string): Promise<any> {
    if (!this.apiKey) {
      throw new Error('OpenAI API key not configured');
    }
    
    // Placeholder for actual OpenAI API call
    console.log('Executing with OpenAI:', prompt);
    return { result: 'OpenAI response' };
  }

  /**
   * Execute with Anthropic
   */
  private async executeWithAnthropic(prompt: string): Promise<any> {
    if (!this.apiKey) {
      throw new Error('Anthropic API key not configured');
    }
    
    // Placeholder for actual Anthropic API call
    console.log('Executing with Anthropic:', prompt);
    return { result: 'Anthropic response' };
  }

  /**
   * Execute with local WebLLM
   */
  private async executeWithWebLLM(prompt: string): Promise<any> {
    // Placeholder for local LLM execution
    console.log('Executing with WebLLM:', prompt);
    return { result: 'Local LLM response' };
  }

  /**
   * Parse text to task (convenience method)
   */
  async parseTextToTask(text: string, context?: string): Promise<any> {
    return this.executeAction('parse_text_to_task', { text, context });
  }

  /**
   * Categorize transaction
   */
  async categorizeTransaction(merchant: string, amount: number, description?: string): Promise<any> {
    return this.executeAction('categorize_transaction', { merchant, amount, description });
  }

  /**
   * Summarize notes
   */
  async summarizeNotes(content: string, maxLength?: number): Promise<any> {
    return this.executeAction('summarize_notes', { content, maxLength: maxLength ?? 100 });
  }
}

// Export singleton instance
export const aiService = AIService.getInstance();
