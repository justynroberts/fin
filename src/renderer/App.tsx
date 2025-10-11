// FORCE RELOAD v3 - Template content fix
import React, { useEffect } from 'react';
import { useWorkspaceStore, useDocumentStore, useThemeStore } from './store';
import WorkspaceSidebar from './components/WorkspaceSidebar';
import EditorContainer from './components/EditorContainer';
import Dashboard from './components/Dashboard';
import Settings from './components/Settings';
import NewDocumentDialog from './components/NewDocumentDialog';
import TemplateManager from './components/TemplateManager';
import './styles/App.css';

// Template fix: NewDocumentDialog calls store directly to avoid React stale closure

const App: React.FC = () => {
  const { isOpen, openWorkspace, createWorkspace, closeWorkspace } = useWorkspaceStore();
  const { path: documentPath, title, isDirty, cursorPosition, newDocument, saveDocument, undo, redo, canUndo, canRedo, isActive } = useDocumentStore();
  const { applyTheme } = useThemeStore();
  const [showSettings, setShowSettings] = React.useState(false);
  const [showNewDocDialog, setShowNewDocDialog] = React.useState(false);
  const [showTemplateManager, setShowTemplateManager] = React.useState(false);
  const [zenMode, setZenMode] = React.useState(false);

  // Keyboard shortcuts
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      // ESC to exit zen mode
      if (e.key === 'Escape' && zenMode) {
        e.preventDefault();
        setZenMode(false);
      }
      // Zen mode (Cmd/Ctrl + \)
      if ((e.metaKey || e.ctrlKey) && e.key === '\\') {
        e.preventDefault();
        setZenMode(prev => !prev);
      }
      // New document dialog (Cmd/Ctrl + Shift + N)
      if ((e.metaKey || e.ctrlKey) && e.shiftKey && e.key === 'N') {
        e.preventDefault();
        setShowNewDocDialog(true);
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [zenMode]);

  // Apply theme on mount
  useEffect(() => {
    applyTheme();
  }, [applyTheme]);

  if (!isOpen) {
    return (
      <div className="app">
        <div className="titlebar">
          <div className="titlebar-title">Finton</div>
        </div>

        <div className="main-content">
          <div className="welcome-screen">
            <div className="welcome-hero">
              <div className="welcome-icon-container">
                <span className="material-symbols-rounded welcome-icon">pets</span>
                <div className="icon-glow"></div>
              </div>
              <h1 className="welcome-title">Finton</h1>
              <p className="welcome-subtitle">
                A powerful text editor with AI assistance, seamless mode switching, and intelligent organization
              </p>
            </div>

            <div className="welcome-actions">
              <button className="action-button-large primary" onClick={createWorkspace}>
                <span className="material-symbols-rounded">add_circle</span>
                <div className="button-content">
                  <div className="button-title">Create Workspace</div>
                  <div className="button-subtitle">Start fresh with Git version control</div>
                </div>
              </button>
              <button className="action-button-large secondary" onClick={openWorkspace}>
                <span className="material-symbols-rounded">folder_open</span>
                <div className="button-content">
                  <div className="button-title">Open Workspace</div>
                  <div className="button-subtitle">Continue with existing workspace</div>
                </div>
              </button>
            </div>

            <div className="features-grid">
              <div className="feature-card">
                <div className="feature-icon-wrapper">
                  <span className="material-symbols-rounded">psychology</span>
                </div>
                <div className="feature-content">
                  <div className="feature-title">AI Assistant</div>
                  <div className="feature-desc">Generate and modify content with AI</div>
                </div>
              </div>
              <div className="feature-card">
                <div className="feature-icon-wrapper">
                  <span className="material-symbols-rounded">swap_horiz</span>
                </div>
                <div className="feature-content">
                  <div className="feature-title">Mode Switching</div>
                  <div className="feature-desc">Notes, Markdown, and Code</div>
                </div>
              </div>
              <div className="feature-card">
                <div className="feature-icon-wrapper">
                  <span className="material-symbols-rounded">search</span>
                </div>
                <div className="feature-content">
                  <div className="feature-title">Smart Search</div>
                  <div className="feature-desc">Find anything instantly</div>
                </div>
              </div>
              <div className="feature-card">
                <div className="feature-icon-wrapper">
                  <span className="material-symbols-rounded">local_offer</span>
                </div>
                <div className="feature-content">
                  <div className="feature-title">Organization</div>
                  <div className="feature-desc">Tags and metadata</div>
                </div>
              </div>
            </div>
          </div>
        </div>

        <div className="statusbar">
          <span className="statusbar-item">Ready to start</span>
        </div>
      </div>
    );
  }

  return (
    <div className={`app ${zenMode ? 'zen-mode' : ''}`}>
      {!zenMode && (
        <div className="titlebar">
          <div className="titlebar-title">
            <span className="material-symbols-rounded" style={{ fontSize: '20px', marginRight: '8px', verticalAlign: 'middle' }}>pets</span>
            Finton {title && `- ${title}`}
            {isDirty && ' •'}
          </div>
        </div>
      )}

      {!zenMode && (
        <div className="toolbar">
          <div className="toolbar-left">
            <button className="toolbar-button" onClick={() => setShowNewDocDialog(true)} title="Create new document (Cmd/Ctrl+Shift+N)">
              <span className="material-symbols-rounded">add</span>
            </button>
            <button className="toolbar-button" onClick={async () => {
              await saveDocument();
              await useWorkspaceStore.getState().loadDocuments();
              await useWorkspaceStore.getState().loadTags();
            }} disabled={!isDirty}>
              <span className="material-symbols-rounded">save</span>
              Save
            </button>
            <div className="toolbar-divider"></div>
            <button
              className="toolbar-button"
              onClick={undo}
              disabled={!canUndo}
              title="Undo (Cmd/Ctrl+Z)"
            >
              <span className="material-symbols-rounded">undo</span>
            </button>
            <button
              className="toolbar-button"
              onClick={redo}
              disabled={!canRedo}
              title="Redo (Cmd/Ctrl+Shift+Z)"
            >
              <span className="material-symbols-rounded">redo</span>
            </button>
            <div className="toolbar-divider"></div>
            <button className="toolbar-button" onClick={() => closeWorkspace()}>
              <span className="material-symbols-rounded">close</span>
              Close Workspace
            </button>
          </div>
          <div className="toolbar-right">
            <button
              className="toolbar-button"
              onClick={() => setShowTemplateManager(true)}
              title="Manage Templates"
            >
              <span className="material-symbols-rounded">bookmark</span>
              Templates
            </button>
            <button
              className="toolbar-button"
              onClick={() => setZenMode(true)}
              title="Zen Mode (Cmd/Ctrl+\)"
            >
              <span className="material-symbols-rounded">fullscreen</span>
              Zen
            </button>
            <button
              className="toolbar-button"
              onClick={() => setShowSettings(true)}
            >
              <span className="material-symbols-rounded">settings</span>
              Settings
            </button>
          </div>
        </div>
      )}

      <div className="main-content">
        {!zenMode && <WorkspaceSidebar />}
        {isActive ? <EditorContainer zenMode={zenMode} onExitZen={() => setZenMode(false)} /> : <Dashboard />}
      </div>

      <Settings
        isOpen={showSettings}
        onClose={() => setShowSettings(false)}
      />

      <NewDocumentDialog
        isOpen={showNewDocDialog}
        onClose={() => setShowNewDocDialog(false)}
      />

      <TemplateManager
        isOpen={showTemplateManager}
        onClose={() => setShowTemplateManager(false)}
      />

      {!zenMode && (
        <div className="statusbar">
          {documentPath ? (
            <>
              <span className="statusbar-item">{documentPath}</span>
              {cursorPosition && (
                <span className="statusbar-item">
                  Ln {cursorPosition.line}, Col {cursorPosition.column}
                </span>
              )}
            </>
          ) : (
            <span className="statusbar-item">No document open</span>
          )}
          <span className="statusbar-item">UTF-8</span>
        </div>
      )}
    </div>
  );
};

export default App;
