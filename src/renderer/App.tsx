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
  const { isOpen, openWorkspace, openWorkspacePath, createWorkspace, closeWorkspace, pullFromRemote, loadGitStatus } = useWorkspaceStore();
  const { path: documentPath, title, isDirty, cursorPosition, newDocument, saveDocument, undo, redo, canUndo, canRedo, isActive } = useDocumentStore();
  const { applyTheme } = useThemeStore();
  const [showSettings, setShowSettings] = React.useState(false);
  const [showNewDocDialog, setShowNewDocDialog] = React.useState(false);
  const [showTemplateManager, setShowTemplateManager] = React.useState(false);
  const [zenMode, setZenMode] = React.useState(false);
  const zenModeRef = React.useRef(zenMode);
  const [hasCheckedAutoOpen, setHasCheckedAutoOpen] = React.useState(false);

  // Keep ref in sync
  useEffect(() => {
    zenModeRef.current = zenMode;
  }, [zenMode]);

  // Keyboard shortcuts
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      // ESC to exit zen mode
      if (e.key === 'Escape' && zenModeRef.current) {
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
  }, []); // Empty deps - event listener won't be recreated

  // Apply theme on mount
  useEffect(() => {
    applyTheme();
  }, [applyTheme]);

  // Auto-open fixed workspace on mount
  useEffect(() => {
    const autoOpenWorkspace = async () => {
      // Only check once, and only if workspace isn't already open
      if (hasCheckedAutoOpen || isOpen) {
        return;
      }

      setHasCheckedAutoOpen(true);

      try {
        // Check if electronAPI is available
        if (!window.electronAPI?.workspace?.openFixedWorkspace) {
          console.warn('[App] electronAPI not available yet');
          return;
        }

        console.log('[App] Auto-opening fixed workspace');
        await openWorkspacePath('fixed'); // Special marker for fixed workspace
      } catch (error) {
        console.error('[App] Failed to auto-open workspace:', error);
        // This is a critical error since we always need the fixed workspace
      }
    };

    // Use a small delay to ensure electronAPI is ready
    const timer = setTimeout(autoOpenWorkspace, 100);
    return () => clearTimeout(timer);
  }, [hasCheckedAutoOpen, isOpen, openWorkspacePath]);

  // Periodic background sync (every 5 minutes)
  useEffect(() => {
    if (!isOpen) return;

    const syncInterval = setInterval(async () => {
      try {
        console.log('[App] Running periodic sync...');
        await pullFromRemote();
        await loadGitStatus();
      } catch (error) {
        console.warn('[App] Periodic sync failed:', error);
      }
    }, 5 * 60 * 1000); // 5 minutes

    return () => clearInterval(syncInterval);
  }, [isOpen, pullFromRemote, loadGitStatus]);

  if (!isOpen) {
    return (
      <div className="app">
        <div className="titlebar">
          <div className="titlebar-title">Finton</div>
        </div>

        <div className="main-content" style={{ display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
          <div style={{ textAlign: 'center' }}>
            <div className="welcome-icon-container">
              <span className="material-symbols-rounded welcome-icon">pets</span>
              <div className="icon-glow"></div>
            </div>
            <p style={{ marginTop: '2rem', color: 'var(--color-text-secondary)' }}>
              Opening workspace...
            </p>
          </div>
        </div>

        <div className="statusbar">
          <span className="statusbar-item">Loading</span>
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
            <button className="toolbar-button" onClick={async () => {
              if (isDirty) {
                await saveDocument();
              }
              useDocumentStore.setState({ isActive: false });
            }} title="Return to dashboard">
              <span className="material-symbols-rounded">home</span>
            </button>
            <div className="toolbar-divider"></div>
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
