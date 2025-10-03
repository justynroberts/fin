/**
 * Settings Dialog - Git configuration and preferences
 */

import React, { useState, useEffect } from 'react';
import './Settings.css';
import { useThemeStore } from '../store';

interface SettingsProps {
  isOpen: boolean;
  onClose: () => void;
}

interface GitConfig {
  remoteUrl: string;
  patToken: string;
  userName: string;
  userEmail: string;
  autoCommit: boolean;
  autoPush: boolean;
}

interface AIConfig {
  provider: 'openai' | 'anthropic' | 'openrouter';
  openaiApiKey: string;
  anthropicApiKey: string;
  openrouterApiKey: string;
  model: string;
  enableMemory: boolean;
}

const Settings: React.FC<SettingsProps> = ({ isOpen, onClose }) => {
  const { currentTheme, availableThemes, setTheme } = useThemeStore();

  const [gitConfig, setGitConfig] = useState<GitConfig>({
    remoteUrl: '',
    patToken: '',
    userName: 'FintonText User',
    userEmail: 'fintontext@localhost',
    autoCommit: true,
    autoPush: false,
  });

  const [aiConfig, setAIConfig] = useState<AIConfig>({
    provider: 'anthropic',
    openaiApiKey: '',
    anthropicApiKey: '',
    openrouterApiKey: '',
    model: 'claude-3-5-sonnet-20241022',
    enableMemory: true,
  });

  const [activeTab, setActiveTab] = useState<'git' | 'ai' | 'editor' | 'appearance'>('git');
  const [isSaving, setIsSaving] = useState(false);

  useEffect(() => {
    if (isOpen) {
      loadSettings();
    }
  }, [isOpen]);

  const loadSettings = async () => {
    try {
      const config = await window.electronAPI.settings.getGitConfig();
      if (config) {
        setGitConfig(config);
      }
      const aiCfg = await window.electronAPI.settings.getAIConfig();
      if (aiCfg) {
        setAIConfig(aiCfg);
      }
    } catch (error) {
      console.error('[Settings] Failed to load:', error);
    }
  };

  const handleSave = async () => {
    setIsSaving(true);
    try {
      await window.electronAPI.settings.setGitConfig(gitConfig);
      await window.electronAPI.settings.setAIConfig(aiConfig);
      onClose();
    } catch (error) {
      console.error('[Settings] Failed to save:', error);
      alert('Failed to save settings: ' + (error as Error).message);
    } finally {
      setIsSaving(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="settings-overlay" onClick={onClose}>
      <div className="settings-content" onClick={(e) => e.stopPropagation()}>
        <div className="settings-header">
          <h2>Settings</h2>
          <button className="settings-close" onClick={onClose}>
            <span className="material-symbols-rounded">close</span>
          </button>
        </div>

        <div className="settings-body">
          <div className="settings-sidebar">
            <button
              className={`settings-tab ${activeTab === 'git' ? 'active' : ''}`}
              onClick={() => setActiveTab('git')}
            >
              <span className="material-symbols-rounded">source</span>
              Git Configuration
            </button>
            <button
              className={`settings-tab ${activeTab === 'ai' ? 'active' : ''}`}
              onClick={() => setActiveTab('ai')}
            >
              <span className="material-symbols-rounded">psychology</span>
              AI Assistant
            </button>
            <button
              className={`settings-tab ${activeTab === 'editor' ? 'active' : ''}`}
              onClick={() => setActiveTab('editor')}
            >
              <span className="material-symbols-rounded">edit</span>
              Editor
            </button>
            <button
              className={`settings-tab ${activeTab === 'appearance' ? 'active' : ''}`}
              onClick={() => setActiveTab('appearance')}
            >
              <span className="material-symbols-rounded">palette</span>
              Appearance
            </button>
          </div>

          <div className="settings-panel">
            {activeTab === 'git' && (
              <div className="settings-section">
                <h3>Git Configuration</h3>
                <p className="section-desc">Configure git repository and authentication for syncing</p>

                <div className="form-group">
                  <label>User Name</label>
                  <input
                    type="text"
                    className="form-input"
                    value={gitConfig.userName}
                    onChange={(e) => setGitConfig({ ...gitConfig, userName: e.target.value })}
                    placeholder="Your name"
                  />
                </div>

                <div className="form-group">
                  <label>User Email</label>
                  <input
                    type="email"
                    className="form-input"
                    value={gitConfig.userEmail}
                    onChange={(e) => setGitConfig({ ...gitConfig, userEmail: e.target.value })}
                    placeholder="your.email@example.com"
                  />
                </div>

                <div className="form-group">
                  <label>Remote Repository URL</label>
                  <input
                    type="text"
                    className="form-input"
                    value={gitConfig.remoteUrl}
                    onChange={(e) => setGitConfig({ ...gitConfig, remoteUrl: e.target.value })}
                    placeholder="https://github.com/username/repo.git"
                  />
                  <span className="form-hint">
                    <span className="material-symbols-rounded">info</span>
                    Optional: Set a remote repository for syncing your workspace
                  </span>
                </div>

                <div className="form-group">
                  <label>Personal Access Token (PAT)</label>
                  <input
                    type="password"
                    className="form-input"
                    value={gitConfig.patToken}
                    onChange={(e) => setGitConfig({ ...gitConfig, patToken: e.target.value })}
                    placeholder="ghp_xxxxxxxxxxxx"
                  />
                  <span className="form-hint">
                    <span className="material-symbols-rounded">info</span>
                    Required for pushing to private repositories. Generate at github.com/settings/tokens
                  </span>
                </div>

                <div className="form-group">
                  <label className="checkbox-label">
                    <input
                      type="checkbox"
                      checked={gitConfig.autoCommit}
                      onChange={(e) => setGitConfig({ ...gitConfig, autoCommit: e.target.checked })}
                    />
                    <span>Auto-commit on save</span>
                  </label>
                  <span className="form-hint">
                    Automatically create a git commit when saving documents
                  </span>
                </div>

                <div className="form-group">
                  <label className="checkbox-label">
                    <input
                      type="checkbox"
                      checked={gitConfig.autoPush}
                      onChange={(e) => setGitConfig({ ...gitConfig, autoPush: e.target.checked })}
                    />
                    <span>Auto-push to remote</span>
                  </label>
                  <span className="form-hint">
                    Automatically push commits to remote repository (requires remote URL and PAT)
                  </span>
                </div>
              </div>
            )}

            {activeTab === 'ai' && (
              <div className="settings-section">
                <h3>AI Assistant</h3>
                <p className="section-desc">Configure AI providers for document assistance with memory</p>

                <div className="form-group">
                  <label>Provider</label>
                  <select
                    className="form-input"
                    value={aiConfig.provider}
                    onChange={(e) => {
                      const newProvider = e.target.value as 'openai' | 'anthropic' | 'openrouter';
                      const defaultModels = {
                        openai: 'gpt-4-turbo-preview',
                        anthropic: 'claude-3-5-sonnet-20241022',
                        openrouter: 'anthropic/claude-3.5-sonnet'
                      };
                      setAIConfig({
                        ...aiConfig,
                        provider: newProvider,
                        model: defaultModels[newProvider]
                      });
                    }}
                  >
                    <option value="anthropic">Anthropic (Claude)</option>
                    <option value="openai">OpenAI (GPT)</option>
                    <option value="openrouter">OpenRouter</option>
                  </select>
                </div>

                <div className="form-group">
                  <label>Anthropic API Key</label>
                  <input
                    type="password"
                    className="form-input"
                    value={aiConfig.anthropicApiKey}
                    onChange={(e) => setAIConfig({ ...aiConfig, anthropicApiKey: e.target.value })}
                    placeholder="sk-ant-..."
                  />
                  <span className="form-hint">
                    <span className="material-symbols-rounded">info</span>
                    Get your API key from console.anthropic.com
                  </span>
                </div>

                <div className="form-group">
                  <label>OpenAI API Key</label>
                  <input
                    type="password"
                    className="form-input"
                    value={aiConfig.openaiApiKey}
                    onChange={(e) => setAIConfig({ ...aiConfig, openaiApiKey: e.target.value })}
                    placeholder="sk-..."
                  />
                  <span className="form-hint">
                    <span className="material-symbols-rounded">info</span>
                    Get your API key from platform.openai.com
                  </span>
                </div>

                <div className="form-group">
                  <label>OpenRouter API Key</label>
                  <input
                    type="password"
                    className="form-input"
                    value={aiConfig.openrouterApiKey}
                    onChange={(e) => setAIConfig({ ...aiConfig, openrouterApiKey: e.target.value })}
                    placeholder="sk-or-..."
                  />
                  <span className="form-hint">
                    <span className="material-symbols-rounded">info</span>
                    Get your API key from openrouter.ai
                  </span>
                </div>

                <div className="form-group">
                  <label>Model</label>
                  <input
                    type="text"
                    className="form-input"
                    value={aiConfig.model}
                    onChange={(e) => setAIConfig({ ...aiConfig, model: e.target.value })}
                    placeholder={
                      aiConfig.provider === 'openai' ? 'gpt-4-turbo-preview' :
                      aiConfig.provider === 'anthropic' ? 'claude-3-5-sonnet-20241022' :
                      'anthropic/claude-3.5-sonnet'
                    }
                  />
                  <span className="form-hint">
                    <span className="material-symbols-rounded">info</span>
                    {aiConfig.provider === 'openai' && 'e.g., gpt-4-turbo-preview, gpt-3.5-turbo'}
                    {aiConfig.provider === 'anthropic' && 'e.g., claude-3-5-sonnet-20241022, claude-3-opus-20240229'}
                    {aiConfig.provider === 'openrouter' && 'e.g., anthropic/claude-3.5-sonnet, openai/gpt-4'}
                  </span>
                </div>

                <div className="form-group">
                  <label className="checkbox-label">
                    <input
                      type="checkbox"
                      checked={aiConfig.enableMemory}
                      onChange={(e) => setAIConfig({ ...aiConfig, enableMemory: e.target.checked })}
                    />
                    <span>Enable conversation memory</span>
                  </label>
                  <span className="form-hint">
                    Maintain conversation context across multiple AI prompts
                  </span>
                </div>
              </div>
            )}

            {activeTab === 'editor' && (
              <div className="settings-section">
                <h3>Editor Settings</h3>
                <p className="section-desc">Configure editor behavior and preferences</p>
                <p className="coming-soon">Coming soon...</p>
              </div>
            )}

            {activeTab === 'appearance' && (
              <div className="settings-section">
                <h3>Appearance</h3>
                <p className="section-desc">Customize the look and feel of the application</p>

                <div className="form-group">
                  <label>Theme</label>
                  <div className="theme-grid">
                    {availableThemes.map((theme) => (
                      <button
                        key={theme.id}
                        className={`theme-card ${currentTheme.id === theme.id ? 'active' : ''}`}
                        onClick={() => setTheme(theme.id)}
                      >
                        <div className="theme-preview">
                          <div className={`theme-preview-colors ${theme.id}`}>
                            <div className="preview-color bg"></div>
                            <div className="preview-color primary"></div>
                            <div className="preview-color accent"></div>
                          </div>
                        </div>
                        <div className="theme-name">
                          {theme.name}
                        </div>
                        {currentTheme.id === theme.id && (
                          <span className="material-symbols-rounded theme-check">check_circle</span>
                        )}
                      </button>
                    ))}
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>

        <div className="settings-footer">
          <button className="settings-btn secondary" onClick={onClose}>
            Cancel
          </button>
          <button className="settings-btn primary" onClick={handleSave} disabled={isSaving}>
            <span className="material-symbols-rounded">save</span>
            {isSaving ? 'Saving...' : 'Save Settings'}
          </button>
        </div>
      </div>
    </div>
  );
};

export default Settings;
