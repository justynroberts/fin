/**
 * Settings Dialog - Git configuration and preferences
 */

import React, { useState, useEffect } from 'react';
import './Settings.css';
import { useThemeStore, useWorkspaceStore } from '../store';

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
  provider: 'openai' | 'anthropic' | 'openrouter' | 'ollama';
  openaiApiKey: string;
  anthropicApiKey: string;
  openrouterApiKey: string;
  ollamaBaseUrl: string;
  model: string;
  enableMemory: boolean;
}

interface RSSFeed {
  id: string;
  name: string;
  url: string;
  enabled: boolean;
}

interface RSSConfig {
  feeds: RSSFeed[];
  refreshInterval: number;
}

interface EditorPreferences {
  theme: 'dark' | 'light' | 'auto';
  fontSize: number;
  fontFamily: string;
  lineHeight: number;
  autoSave: boolean;
  autoSaveInterval: number;
  autoOpenLastWorkspace: boolean;
  lastWorkspacePath: string | null;
}

const Settings: React.FC<SettingsProps> = ({ isOpen, onClose }) => {
  const { currentTheme, availableThemes, setTheme } = useThemeStore();

  const [gitConfig, setGitConfig] = useState<GitConfig>({
    remoteUrl: '',
    patToken: '',
    userName: 'Finton User',
    userEmail: 'finton@localhost',
    autoCommit: true,
    autoPush: false,
  });

  const [aiConfig, setAIConfig] = useState<AIConfig>({
    provider: 'anthropic',
    openaiApiKey: '',
    anthropicApiKey: '',
    openrouterApiKey: '',
    ollamaBaseUrl: 'http://127.0.0.1:11434',
    model: 'claude-3-5-sonnet-20241022',
    enableMemory: true,
  });

  const [rssConfig, setRSSConfig] = useState<RSSConfig>({
    feeds: [],
    refreshInterval: 30,
  });

  const [editorPreferences, setEditorPreferences] = useState<EditorPreferences>({
    theme: 'dark',
    fontSize: 14,
    fontFamily: 'Inter',
    lineHeight: 1.6,
    autoSave: true,
    autoSaveInterval: 30000,
    autoOpenLastWorkspace: false,
    lastWorkspacePath: null,
  });

  const [activeTab, setActiveTab] = useState<'git' | 'ai' | 'rss' | 'editor' | 'appearance' | 'logs'>('git');
  const [isSaving, setIsSaving] = useState(false);
  const [syncUrl, setSyncUrl] = useState('');
  const [isSyncing, setIsSyncing] = useState(false);
  const [syncMessage, setSyncMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);
  const panelRef = React.useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (isOpen) {
      loadSettings();
    }
  }, [isOpen]);

  // Scroll to top when switching tabs
  useEffect(() => {
    if (panelRef.current) {
      panelRef.current.scrollTop = 0;
    }
  }, [activeTab]);

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
      const rssCfg = await window.electronAPI.rss.getConfig();
      if (rssCfg) {
        setRSSConfig(rssCfg);
      }
      const editorPrefs = await window.electronAPI.settings.getEditorPreferences();
      if (editorPrefs) {
        setEditorPreferences(editorPrefs);
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
      await window.electronAPI.rss.setConfig(rssConfig);
      await window.electronAPI.settings.setEditorPreferences(editorPreferences);
      onClose();
    } catch (error) {
      console.error('[Settings] Failed to save:', error);
      alert('Failed to save settings: ' + (error as Error).message);
    } finally {
      setIsSaving(false);
    }
  };

  const handleSyncWithGitHub = async () => {
    if (!syncUrl.trim()) {
      setSyncMessage({ type: 'error', text: 'Please enter a GitHub repository URL' });
      return;
    }

    // Check if PAT token is configured
    if (!gitConfig.remoteUrl || !gitConfig.patToken) {
      setSyncMessage({ type: 'error', text: 'Please save your PAT token first before syncing' });
      return;
    }

    setIsSyncing(true);
    setSyncMessage({ type: 'success', text: 'Syncing with GitHub...' });

    try {
      console.log('[Settings] Starting GitHub sync...');
      console.log('[Settings] Remote URL:', syncUrl);
      console.log('[Settings] PAT token configured:', !!gitConfig.patToken);

      await window.electronAPI.git.syncWithRemote(syncUrl, gitConfig.patToken);
      console.log('[Settings] Sync completed successfully');

      setSyncMessage({ type: 'success', text: 'Successfully synced with GitHub! Reloading documents...' });
      setSyncUrl('');

      // Reload workspace data after sync (workspace was re-initialized in main process)
      setTimeout(async () => {
        try {
          console.log('[Settings] Reloading workspace data after sync...');

          // Get fresh workspace info and documents
          console.log('[Settings] Fetching workspace info...');
          const info = await window.electronAPI.workspace.getInfo();
          console.log('[Settings] Workspace info:', info);

          console.log('[Settings] Fetching documents...');
          const docs = await window.electronAPI.document.list();
          console.log('[Settings] Documents count:', docs.length);
          console.log('[Settings] Documents array:', docs);
          if (docs.length > 0) {
            console.table(docs.slice(0, 10)); // Show first 10 documents in table format
          } else {
            console.warn('[Settings] No documents returned from backend!');
            console.warn('[Settings] Check that ~/Documents/Finton/documents/ directory exists');
            console.warn('[Settings] Backend logs will show more details about what went wrong');
          }

          console.log('[Settings] Fetching tags...');
          const tags = await window.electronAPI.search.tags();
          console.log('[Settings] Tags count:', tags.length);
          console.log('[Settings] Tags array:', tags);

          // Update workspace store
          console.log('[Settings] Updating workspace store...');
          useWorkspaceStore.setState({
            workspace: info,
            documents: docs,
            tags: tags,
          });
          console.log('[Settings] Workspace store updated successfully');

          if (docs.length === 0) {
            setSyncMessage({ type: 'error', text: 'Sync completed but no documents were found. Check console for details.' });
          } else {
            setSyncMessage({ type: 'success', text: `Sync complete! Loaded ${docs.length} documents.` });
          }
        } catch (error) {
          console.error('[Settings] Failed to reload workspace data:', error);
          console.error('[Settings] Error details:', error instanceof Error ? error.message : String(error));
          setSyncMessage({ type: 'error', text: 'Synced but failed to reload documents. Try closing and reopening the workspace.' });
        }
      }, 500);
    } catch (error) {
      console.error('[Settings] Sync failed:', error);
      setSyncMessage({ type: 'error', text: 'Sync failed: ' + (error as Error).message });
    } finally {
      setIsSyncing(false);
    }
  };

  const addRSSFeed = () => {
    setRSSConfig({
      ...rssConfig,
      feeds: [
        ...rssConfig.feeds,
        {
          id: Date.now().toString(),
          name: 'New Feed',
          url: '',
          enabled: true,
        },
      ],
    });
  };

  const removeRSSFeed = (id: string) => {
    setRSSConfig({
      ...rssConfig,
      feeds: rssConfig.feeds.filter((feed) => feed.id !== id),
    });
  };

  const updateRSSFeed = (id: string, updates: Partial<RSSFeed>) => {
    setRSSConfig({
      ...rssConfig,
      feeds: rssConfig.feeds.map((feed) =>
        feed.id === id ? { ...feed, ...updates } : feed
      ),
    });
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
              className={`settings-tab ${activeTab === 'rss' ? 'active' : ''}`}
              onClick={() => setActiveTab('rss')}
            >
              <span className="material-symbols-rounded">rss_feed</span>
              RSS Feeds
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

          <div className="settings-panel" ref={panelRef}>
            {activeTab === 'git' && (
              <div className="settings-section">
                <h3>GitHub Sync</h3>
                <p className="section-desc">Connect your workspace to a GitHub repository for automatic sync across devices</p>

                <div className="form-group">
                  <label>GitHub Repository URL</label>
                  <div style={{ display: 'flex', gap: '8px' }}>
                    <input
                      type="text"
                      className="form-input"
                      value={syncUrl}
                      onChange={(e) => setSyncUrl(e.target.value)}
                      placeholder="https://github.com/username/repo"
                      style={{ flex: 1 }}
                    />
                    <button
                      className="settings-btn primary"
                      onClick={handleSyncWithGitHub}
                      disabled={isSyncing || !syncUrl.trim()}
                      style={{ minWidth: '120px' }}
                    >
                      {isSyncing ? 'Syncing...' : 'Sync Now'}
                    </button>
                  </div>
                  <span className="form-hint">
                    <span className="material-symbols-rounded">info</span>
                    Enter your GitHub repository URL and click "Sync Now" to connect this workspace
                  </span>
                  {syncMessage && (
                    <div
                      style={{
                        marginTop: '12px',
                        padding: '12px',
                        borderRadius: '6px',
                        backgroundColor: syncMessage.type === 'success' ? 'rgba(34, 197, 94, 0.1)' : 'rgba(239, 68, 68, 0.1)',
                        color: syncMessage.type === 'success' ? '#22c55e' : '#ef4444',
                        border: `1px solid ${syncMessage.type === 'success' ? 'rgba(34, 197, 94, 0.3)' : 'rgba(239, 68, 68, 0.3)'}`,
                        display: 'flex',
                        alignItems: 'center',
                        gap: '8px'
                      }}
                    >
                      <span className="material-symbols-rounded">
                        {syncMessage.type === 'success' ? 'check_circle' : 'error'}
                      </span>
                      {syncMessage.text}
                    </div>
                  )}
                </div>

                <div style={{ marginTop: '32px', paddingTop: '32px', borderTop: '1px solid var(--color-border)' }}>
                  <h3>Git Configuration</h3>
                  <p className="section-desc">Configure git identity and authentication</p>

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
                  <label>Personal Access Token (PAT)</label>
                  <input
                    type="password"
                    className="form-input"
                    value={gitConfig.patToken}
                    onChange={(e) => setGitConfig({ ...gitConfig, patToken: e.target.value })}
                    placeholder="ghp_xxxxxxxxxxxxxxxxxxxx"
                  />
                  <p style={{ fontSize: '12px', color: 'var(--color-text-secondary)', marginTop: '8px' }}>
                    Required for GitHub authentication. Get yours at{' '}
                    <a
                      href="#"
                      onClick={(e) => {
                        e.preventDefault();
                        window.electronAPI.rss.openLink('https://github.com/settings/tokens');
                      }}
                      style={{ color: 'var(--color-primary)', textDecoration: 'underline' }}
                    >
                      github.com/settings/tokens
                    </a>
                    {' '}(needs "repo" scope)
                  </p>
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
                      const newProvider = e.target.value as 'openai' | 'anthropic' | 'openrouter' | 'ollama';
                      const defaultModels = {
                        openai: 'gpt-4-turbo-preview',
                        anthropic: 'claude-3-5-sonnet-20241022',
                        openrouter: 'anthropic/claude-3.5-sonnet',
                        ollama: 'llama2'
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
                    <option value="ollama">Ollama (Local)</option>
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
                  <label>Ollama Base URL</label>
                  <input
                    type="text"
                    className="form-input"
                    value={aiConfig.ollamaBaseUrl}
                    onChange={(e) => setAIConfig({ ...aiConfig, ollamaBaseUrl: e.target.value })}
                    placeholder="http://127.0.0.1:11434"
                  />
                  <span className="form-hint">
                    <span className="material-symbols-rounded">info</span>
                    Local Ollama server URL (default: http://127.0.0.1:11434)
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
                      aiConfig.provider === 'ollama' ? 'llama2' :
                      'anthropic/claude-3.5-sonnet'
                    }
                  />
                  <span className="form-hint">
                    <span className="material-symbols-rounded">info</span>
                    {aiConfig.provider === 'openai' && 'e.g., gpt-4-turbo-preview, gpt-3.5-turbo'}
                    {aiConfig.provider === 'anthropic' && 'e.g., claude-3-5-sonnet-20241022, claude-3-opus-20240229'}
                    {aiConfig.provider === 'openrouter' && 'e.g., anthropic/claude-3.5-sonnet, openai/gpt-4'}
                    {aiConfig.provider === 'ollama' && 'e.g., llama2, mistral, codellama, llama3'}
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

            {activeTab === 'rss' && (
              <div className="settings-section">
                <h3>RSS Feeds</h3>
                <p className="section-desc">Configure RSS feeds to display on your dashboard</p>

                <div className="form-group">
                  <label>Refresh Interval (minutes)</label>
                  <input
                    type="number"
                    className="form-input"
                    min="5"
                    max="1440"
                    value={rssConfig.refreshInterval}
                    onChange={(e) => setRSSConfig({ ...rssConfig, refreshInterval: parseInt(e.target.value) || 30 })}
                  />
                  <span className="form-hint">
                    <span className="material-symbols-rounded">info</span>
                    How often to refresh feeds (5-1440 minutes)
                  </span>
                </div>

                <div className="form-group">
                  <div className="form-group-header">
                    <label>RSS Feeds</label>
                    <button className="add-feed-btn" onClick={addRSSFeed}>
                      <span className="material-symbols-rounded">add</span>
                      Add Feed
                    </button>
                  </div>

                  {rssConfig.feeds.length === 0 ? (
                    <div className="empty-feeds">
                      <span className="material-symbols-rounded">rss_feed</span>
                      <p>No RSS feeds configured</p>
                      <p className="empty-hint">Click "Add Feed" to get started</p>
                    </div>
                  ) : (
                    <div className="rss-feeds-list">
                      {rssConfig.feeds.map((feed) => (
                        <div key={feed.id} className="rss-feed-item">
                          <div className="feed-header">
                            <label className="checkbox-label">
                              <input
                                type="checkbox"
                                checked={feed.enabled}
                                onChange={(e) => updateRSSFeed(feed.id, { enabled: e.target.checked })}
                              />
                              <span>Enabled</span>
                            </label>
                            <button
                              className="remove-feed-btn"
                              onClick={() => removeRSSFeed(feed.id)}
                              title="Remove feed"
                            >
                              <span className="material-symbols-rounded">delete</span>
                            </button>
                          </div>
                          <div className="feed-inputs">
                            <input
                              type="text"
                              className="form-input"
                              placeholder="Feed Name"
                              value={feed.name}
                              onChange={(e) => updateRSSFeed(feed.id, { name: e.target.value })}
                            />
                            <input
                              type="url"
                              className="form-input"
                              placeholder="Feed URL (https://example.com/feed.xml)"
                              value={feed.url}
                              onChange={(e) => updateRSSFeed(feed.id, { url: e.target.value })}
                            />
                          </div>
                        </div>
                      ))}
                    </div>
                  )}

                  <span className="form-hint">
                    <span className="material-symbols-rounded">info</span>
                    Popular feeds: Hacker News (https://hnrss.org/frontpage), TechCrunch (https://techcrunch.com/feed/)
                  </span>
                </div>
              </div>
            )}

            {activeTab === 'editor' && (
              <div className="settings-section">
                <h3>Editor Settings</h3>
                <p className="section-desc">Configure editor behavior and preferences</p>

                <div className="form-group">
                  <label>
                    <div className="checkbox-label">
                      <input
                        type="checkbox"
                        checked={editorPreferences.autoSave}
                        onChange={(e) =>
                          setEditorPreferences({ ...editorPreferences, autoSave: e.target.checked })
                        }
                      />
                      <span>Enable auto-save</span>
                    </div>
                  </label>
                  <p className="field-desc">Automatically save documents while editing</p>
                </div>

                {editorPreferences.autoSave && (
                  <div className="form-group">
                    <label>Auto-save interval (seconds)</label>
                    <input
                      type="number"
                      min="5"
                      max="300"
                      value={editorPreferences.autoSaveInterval / 1000}
                      onChange={(e) =>
                        setEditorPreferences({
                          ...editorPreferences,
                          autoSaveInterval: Number(e.target.value) * 1000,
                        })
                      }
                    />
                  </div>
                )}

                <div className="form-group">
                  <label>
                    <div className="checkbox-label">
                      <input
                        type="checkbox"
                        checked={editorPreferences.autoOpenLastWorkspace}
                        onChange={(e) =>
                          setEditorPreferences({
                            ...editorPreferences,
                            autoOpenLastWorkspace: e.target.checked,
                          })
                        }
                      />
                      <span>Open last workspace on startup</span>
                    </div>
                  </label>
                  <p className="field-desc">Automatically open your most recent workspace when launching Finton</p>
                  {editorPreferences.lastWorkspacePath && (
                    <p className="field-desc" style={{ marginTop: '8px', fontStyle: 'italic' }}>
                      Last workspace: {editorPreferences.lastWorkspacePath}
                    </p>
                  )}
                </div>
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
