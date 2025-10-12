/**
 * Settings Service - Manage application settings
 *
 * Settings are split into two locations:
 * 1. Workspace settings (.fintext-settings.json) - Committed to git, shared across machines
 * 2. Secure settings (localStorage in renderer) - API keys, tokens, kept local for security
 */

import * as fs from 'fs/promises';
import * as path from 'path';
import { app } from 'electron';

export interface GitConfig {
  remoteUrl: string;
  patToken: string; // This will move to localStorage for security
  userName: string;
  userEmail: string;
  autoCommit: boolean;
  autoPush: boolean;
}

export interface AIConfig {
  provider: 'openai' | 'anthropic' | 'openrouter' | 'ollama';
  openaiApiKey: string;
  anthropicApiKey: string;
  openrouterApiKey: string;
  ollamaBaseUrl: string;
  model: string;
  enableMemory: boolean;
}

export interface EditorPreferences {
  theme: 'dark' | 'light' | 'auto';
  fontSize: number;
  fontFamily: string;
  lineHeight: number;
  autoSave: boolean;
  autoSaveInterval: number;
}

export interface RSSFeed {
  id: string;
  name: string;
  url: string;
  enabled: boolean;
}

export interface RSSConfig {
  feeds: RSSFeed[];
  refreshInterval: number; // minutes
}

export interface WorkspaceSettings {
  gitConfig: Omit<GitConfig, 'patToken'>; // No token in file
  aiConfig: Omit<AIConfig, 'openaiApiKey' | 'anthropicApiKey' | 'openrouterApiKey' | 'ollamaBaseUrl'>; // No keys or URLs in file
  editorPreferences: EditorPreferences;
  rssConfig: RSSConfig;
  version: string;
}

class SettingsService {
  private appDataSettingsPath: string;
  private workspaceSettingsPath: string | null = null;
  private appDataSettings: {
    gitConfig?: GitConfig;
    aiConfig?: AIConfig;
  } = {};
  private workspaceSettings: WorkspaceSettings | null = null;

  constructor() {
    this.appDataSettingsPath = path.join(app.getPath('userData'), 'settings.json');
  }

  /**
   * Set workspace path and load workspace settings
   */
  async setWorkspacePath(workspacePath: string): Promise<void> {
    this.workspaceSettingsPath = path.join(workspacePath, '.fintext-settings.json');
    await this.loadWorkspaceSettings();
  }

  /**
   * Initialize app data settings (API keys, tokens)
   */
  async init(): Promise<void> {
    try {
      const data = await fs.readFile(this.appDataSettingsPath, 'utf8');
      this.appDataSettings = JSON.parse(data);
    } catch (error) {
      // Settings file doesn't exist yet, use defaults
      this.appDataSettings = {
        gitConfig: {
          remoteUrl: '',
          patToken: '',
          userName: 'FinText User',
          userEmail: 'fintext@localhost',
          autoCommit: true,
          autoPush: false,
        },
        aiConfig: {
          provider: 'anthropic',
          openaiApiKey: '',
          anthropicApiKey: '',
          openrouterApiKey: '',
          ollamaBaseUrl: 'http://127.0.0.1:11434',
          model: 'claude-3-5-sonnet-20241022',
          enableMemory: true,
        },
      };
      await this.saveAppDataSettings();
    }
  }

  /**
   * Load workspace settings from .fintext-settings.json
   */
  private async loadWorkspaceSettings(): Promise<void> {
    if (!this.workspaceSettingsPath) return;

    try {
      const data = await fs.readFile(this.workspaceSettingsPath, 'utf8');
      this.workspaceSettings = JSON.parse(data);
    } catch (error) {
      // Create default workspace settings
      this.workspaceSettings = {
        gitConfig: {
          remoteUrl: '',
          userName: 'FinText User',
          userEmail: 'fintext@localhost',
          autoCommit: true,
          autoPush: false,
        },
        aiConfig: {
          provider: 'anthropic',
          model: 'claude-3-5-sonnet-20241022',
          enableMemory: true,
        },
        editorPreferences: {
          theme: 'dark',
          fontSize: 14,
          fontFamily: 'Inter',
          lineHeight: 1.6,
          autoSave: true,
          autoSaveInterval: 30000,
        },
        rssConfig: {
          feeds: [
            {
              id: '1',
              name: 'Hacker News',
              url: 'https://hnrss.org/frontpage',
              enabled: true,
            },
            {
              id: '2',
              name: 'TechCrunch',
              url: 'https://techcrunch.com/feed/',
              enabled: true,
            },
            {
              id: '3',
              name: 'The Verge',
              url: 'https://www.theverge.com/rss/index.xml',
              enabled: true,
            },
            {
              id: '4',
              name: 'Ars Technica',
              url: 'https://feeds.arstechnica.com/arstechnica/index',
              enabled: true,
            },
            {
              id: '5',
              name: 'Wired',
              url: 'https://www.wired.com/feed/rss',
              enabled: true,
            },
            {
              id: '6',
              name: 'MIT Technology Review',
              url: 'https://www.technologyreview.com/feed/',
              enabled: true,
            },
          ],
          refreshInterval: 1,
        },
        version: '1.0.0',
      };
      await this.saveWorkspaceSettings();
    }
  }

  /**
   * Save app data settings (sensitive data)
   */
  private async saveAppDataSettings(): Promise<void> {
    await fs.writeFile(this.appDataSettingsPath, JSON.stringify(this.appDataSettings, null, 2));
  }

  /**
   * Save workspace settings (shareable data)
   */
  private async saveWorkspaceSettings(): Promise<void> {
    if (!this.workspaceSettingsPath || !this.workspaceSettings) return;
    await fs.writeFile(this.workspaceSettingsPath, JSON.stringify(this.workspaceSettings, null, 2));
  }

  /**
   * Get git config (merged from workspace and app data)
   */
  async getGitConfig(): Promise<GitConfig> {
    const workspaceGit = this.workspaceSettings?.gitConfig || {
      remoteUrl: '',
      userName: 'FinText User',
      userEmail: 'fintext@localhost',
      autoCommit: true,
      autoPush: false,
    };

    const appDataGit = this.appDataSettings.gitConfig || {
      remoteUrl: '',
      patToken: '',
      userName: 'FinText User',
      userEmail: 'fintext@localhost',
      autoCommit: true,
      autoPush: false,
    };

    // Merge workspace settings with token from app data
    return {
      ...workspaceGit,
      patToken: appDataGit.patToken,
    };
  }

  /**
   * Set git config (splits between workspace and app data)
   */
  async setGitConfig(config: GitConfig): Promise<void> {
    // Save token to app data
    if (!this.appDataSettings.gitConfig) {
      this.appDataSettings.gitConfig = config;
    } else {
      this.appDataSettings.gitConfig.patToken = config.patToken;
    }
    await this.saveAppDataSettings();

    // Save non-sensitive data to workspace
    if (this.workspaceSettings) {
      this.workspaceSettings.gitConfig = {
        remoteUrl: config.remoteUrl,
        userName: config.userName,
        userEmail: config.userEmail,
        autoCommit: config.autoCommit,
        autoPush: config.autoPush,
      };
      await this.saveWorkspaceSettings();
    }
  }

  /**
   * Get AI config (merged from workspace and app data)
   */
  async getAIConfig(): Promise<AIConfig> {
    const workspaceAI = this.workspaceSettings?.aiConfig || {
      provider: 'anthropic' as const,
      model: 'claude-3-5-sonnet-20241022',
      enableMemory: true,
    };

    const appDataAI = this.appDataSettings.aiConfig || {
      provider: 'anthropic' as const,
      openaiApiKey: '',
      anthropicApiKey: '',
      openrouterApiKey: '',
      ollamaBaseUrl: 'http://127.0.0.1:11434',
      model: 'claude-3-5-sonnet-20241022',
      enableMemory: true,
    };

    // Merge workspace settings with API keys and base URLs from app data
    return {
      provider: workspaceAI.provider,
      openaiApiKey: appDataAI.openaiApiKey || '',
      anthropicApiKey: appDataAI.anthropicApiKey || '',
      openrouterApiKey: appDataAI.openrouterApiKey || '',
      ollamaBaseUrl: appDataAI.ollamaBaseUrl || 'http://127.0.0.1:11434',
      model: workspaceAI.model,
      enableMemory: workspaceAI.enableMemory,
    };
  }

  /**
   * Set AI config (splits between workspace and app data)
   */
  async setAIConfig(config: AIConfig): Promise<void> {
    // Save API keys and base URLs to app data (only sensitive data, not provider/model/enableMemory)
    if (!this.appDataSettings.aiConfig) {
      this.appDataSettings.aiConfig = {
        provider: 'anthropic',
        openaiApiKey: config.openaiApiKey,
        anthropicApiKey: config.anthropicApiKey,
        openrouterApiKey: config.openrouterApiKey,
        ollamaBaseUrl: config.ollamaBaseUrl,
        model: '',
        enableMemory: false,
      };
    } else {
      this.appDataSettings.aiConfig.openaiApiKey = config.openaiApiKey;
      this.appDataSettings.aiConfig.anthropicApiKey = config.anthropicApiKey;
      this.appDataSettings.aiConfig.openrouterApiKey = config.openrouterApiKey;
      this.appDataSettings.aiConfig.ollamaBaseUrl = config.ollamaBaseUrl;
    }
    await this.saveAppDataSettings();

    // Save non-sensitive data to workspace
    if (this.workspaceSettings) {
      this.workspaceSettings.aiConfig = {
        provider: config.provider,
        model: config.model,
        enableMemory: config.enableMemory,
      };
      await this.saveWorkspaceSettings();
    }
  }

  /**
   * Get editor preferences from workspace settings
   */
  async getEditorPreferences(): Promise<EditorPreferences> {
    return this.workspaceSettings?.editorPreferences || {
      theme: 'dark',
      fontSize: 14,
      fontFamily: 'Inter',
      lineHeight: 1.6,
      autoSave: true,
      autoSaveInterval: 30000,
    };
  }

  /**
   * Set editor preferences in workspace settings
   */
  async setEditorPreferences(preferences: EditorPreferences): Promise<void> {
    if (this.workspaceSettings) {
      this.workspaceSettings.editorPreferences = preferences;
      await this.saveWorkspaceSettings();
    }
  }

  /**
   * Get complete workspace settings
   */
  async getWorkspaceSettings(): Promise<WorkspaceSettings | null> {
    return this.workspaceSettings;
  }

  /**
   * Get RSS config from workspace settings
   */
  async getRSSConfig(): Promise<RSSConfig> {
    return this.workspaceSettings?.rssConfig || {
      feeds: [],
      refreshInterval: 30,
    };
  }

  /**
   * Set RSS config in workspace settings
   */
  async setRSSConfig(config: RSSConfig): Promise<void> {
    if (this.workspaceSettings) {
      this.workspaceSettings.rssConfig = config;
      await this.saveWorkspaceSettings();
    }
  }
}

export const settingsService = new SettingsService();
