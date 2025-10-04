/**
 * AI Service - Handle API calls to AI providers with memory
 */

import { settingsService, AIConfig } from './settings-service';
import * as path from 'path';
import * as fs from 'fs/promises';
import { app } from 'electron';

interface Message {
  role: 'user' | 'assistant';
  content: string;
  timestamp: number;
}

interface ConversationMemory {
  documentPath: string;
  messages: Message[];
  lastUpdated: number;
}

class AIService {
  private memory: Map<string, ConversationMemory> = new Map();
  private memoryPath: string;

  constructor() {
    this.memoryPath = path.join(app.getPath('userData'), 'ai-memory.json');
  }

  async init(): Promise<void> {
    try {
      const data = await fs.readFile(this.memoryPath, 'utf8');
      const memories: ConversationMemory[] = JSON.parse(data);
      memories.forEach((mem) => {
        this.memory.set(mem.documentPath, mem);
      });
    } catch (error) {
      // Memory file doesn't exist yet
      this.memory = new Map();
    }
  }

  private async saveMemory(): Promise<void> {
    const memories = Array.from(this.memory.values());
    await fs.writeFile(this.memoryPath, JSON.stringify(memories, null, 2));
  }

  async sendPrompt(
    documentPath: string,
    documentContent: string,
    userPrompt: string,
    mode: string,
    language: string
  ): Promise<string> {
    const config = await settingsService.getAIConfig();

    // Build messages array
    const messages: Array<{ role: string; content: string }> = [];

    // Add memory if enabled
    if (config.enableMemory) {
      const memory = this.memory.get(documentPath);
      if (memory) {
        memory.messages.forEach((msg) => {
          messages.push({ role: msg.role, content: msg.content });
        });
      }
    }

    // Add system message for code mode to ensure proper output
    if (mode === 'code') {
      // Enhance the user prompt to emphasize code generation
      const enhancedPrompt = userPrompt.toLowerCase().includes('create') ||
                            userPrompt.toLowerCase().includes('write') ||
                            userPrompt.toLowerCase().includes('generate')
        ? userPrompt
        : `Create ${language} code to ${userPrompt}`;

      messages.push({
        role: 'user',
        content: `You are a code generation assistant. You MUST follow these rules:
1. Generate ONLY valid ${language} code - no explanations, no markdown, no comments unless asked
2. Do NOT wrap code in markdown code fences or backticks
3. Return raw, executable ${language} code that can be directly run or compiled
4. If you need to explain something, do it as code comments in ${language} syntax

Current ${language} code:
\`\`\`
${documentContent || '// Empty file'}
\`\`\`

Task: ${enhancedPrompt}

Remember: Return ONLY raw ${language} code, nothing else.`
      });
    } else if (mode === 'markdown') {
      messages.push({
        role: 'user',
        content: `You are working with a Markdown document.\n\nCurrent content:\n${documentContent}\n\nUser request: ${userPrompt}`
      });
    } else {
      messages.push({
        role: 'user',
        content: `You are working with a formatted notes document (rich text).\n\nCurrent content:\n${documentContent}\n\nUser request: ${userPrompt}`
      });
    }

    // Call the appropriate provider
    let response: string;
    switch (config.provider) {
      case 'anthropic':
        response = await this.callAnthropic(config, messages);
        break;
      case 'openai':
        response = await this.callOpenAI(config, messages);
        break;
      case 'openrouter':
        response = await this.callOpenRouter(config, messages);
        break;
      default:
        throw new Error(`Unknown provider: ${config.provider}`);
    }

    // Update memory
    if (config.enableMemory) {
      const memory = this.memory.get(documentPath) || {
        documentPath,
        messages: [],
        lastUpdated: Date.now(),
      };

      memory.messages.push({
        role: 'user',
        content: userPrompt,
        timestamp: Date.now(),
      });

      memory.messages.push({
        role: 'assistant',
        content: response,
        timestamp: Date.now(),
      });

      memory.lastUpdated = Date.now();
      this.memory.set(documentPath, memory);
      await this.saveMemory();
    }

    return response;
  }

  private async callAnthropic(
    config: AIConfig,
    messages: Array<{ role: string; content: string }>
  ): Promise<string> {
    if (!config.anthropicApiKey) {
      throw new Error('Anthropic API key not configured');
    }

    const response = await fetch('https://api.anthropic.com/v1/messages', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-api-key': config.anthropicApiKey,
        'anthropic-version': '2023-06-01',
      },
      body: JSON.stringify({
        model: config.model || 'claude-3-5-sonnet-20241022',
        max_tokens: 4096,
        messages: messages,
      }),
    });

    if (!response.ok) {
      const error = await response.text();
      throw new Error(`Anthropic API error: ${response.status} - ${error}`);
    }

    const data = await response.json() as any;
    return data.content[0].text;
  }

  private async callOpenAI(
    config: AIConfig,
    messages: Array<{ role: string; content: string }>
  ): Promise<string> {
    if (!config.openaiApiKey) {
      throw new Error('OpenAI API key not configured');
    }

    const response = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${config.openaiApiKey}`,
      },
      body: JSON.stringify({
        model: config.model || 'gpt-4-turbo-preview',
        messages: messages,
        max_tokens: 4096,
      }),
    });

    if (!response.ok) {
      const error = await response.text();
      throw new Error(`OpenAI API error: ${response.status} - ${error}`);
    }

    const data = await response.json() as any;
    return data.choices[0].message.content;
  }

  private async callOpenRouter(
    config: AIConfig,
    messages: Array<{ role: string; content: string }>
  ): Promise<string> {
    if (!config.openrouterApiKey) {
      throw new Error('OpenRouter API key not configured');
    }

    const response = await fetch('https://openrouter.ai/api/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${config.openrouterApiKey}`,
        'HTTP-Referer': 'https://github.com/fintontext/fintontext',
        'X-Title': 'FintonText',
      },
      body: JSON.stringify({
        model: config.model || 'anthropic/claude-3.5-sonnet',
        messages: messages,
      }),
    });

    if (!response.ok) {
      const error = await response.text();
      throw new Error(`OpenRouter API error: ${response.status} - ${error}`);
    }

    const data = await response.json() as any;
    return data.choices[0].message.content;
  }

  async clearMemory(documentPath?: string): Promise<void> {
    if (documentPath) {
      this.memory.delete(documentPath);
    } else {
      this.memory.clear();
    }
    await this.saveMemory();
  }

  async getMemory(documentPath: string): Promise<Message[] | null> {
    const memory = this.memory.get(documentPath);
    return memory ? memory.messages : null;
  }
}

export const aiService = new AIService();
