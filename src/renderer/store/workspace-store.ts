/**
 * Workspace store - manages workspace state and operations
 */

import { create } from 'zustand';
import { immer } from 'zustand/middleware/immer';

interface WorkspaceInfo {
  name: string;
  path: string;
  created: string;
  description?: string;
}

interface Document {
  id: string;
  path: string;
  title: string;
  mode: 'rich-text' | 'markdown' | 'code';
  tags: string[];
  created: string;
  modified: string;
  language?: string;
}

interface Tag {
  name: string;
  count: number;
}

interface GitStatus {
  branch: string;
  ahead: number;
  behind: number;
  modified: string[];
  staged: string[];
  untracked: string[];
  conflicts: string[];
  clean: boolean;
}

interface WorkspaceState {
  // Workspace
  isOpen: boolean;
  workspace: WorkspaceInfo | null;
  loading: boolean;
  error: string | null;

  // Documents
  documents: Document[];
  selectedDocument: Document | null;

  // Tags
  tags: Tag[];

  // Git
  gitStatus: GitStatus | null;
  syncing: boolean;

  // Search
  searchQuery: string;
  searchResults: Document[];

  // Actions
  openWorkspace: () => Promise<void>;
  createWorkspace: () => Promise<void>;
  closeWorkspace: () => Promise<void>;
  loadDocuments: () => Promise<void>;
  selectDocument: (document: Document | null) => void;
  loadTags: () => Promise<void>;
  loadGitStatus: () => Promise<void>;
  search: (query: string) => Promise<void>;
  searchByTag: (tag: string) => Promise<void>;
  commitChanges: (message: string) => Promise<void>;
  pushToRemote: (remote?: string, branch?: string) => Promise<void>;
  pullFromRemote: (remote?: string, branch?: string) => Promise<void>;
  setError: (error: string | null) => void;
}

export const useWorkspaceStore = create<WorkspaceState>()(
  immer((set, get) => ({
    // Initial state
    isOpen: false,
    workspace: null,
    loading: false,
    error: null,
    documents: [],
    selectedDocument: null,
    tags: [],
    gitStatus: null,
    syncing: false,
    searchQuery: '',
    searchResults: [],

    // Open existing workspace
    openWorkspace: async () => {
      set({ loading: true, error: null });

      try {
        const result = await window.electronAPI.workspace.open();

        if (result.success && result.path) {
          const info = await window.electronAPI.workspace.getInfo();
          set({
            isOpen: true,
            workspace: { ...info, path: result.path },
            loading: false,
          });

          // Load initial data
          await get().loadDocuments();
          await get().loadTags();
          await get().loadGitStatus();
        } else {
          set({ loading: false, error: result.error || 'Failed to open workspace' });
        }
      } catch (error) {
        set({ loading: false, error: (error as Error).message });
      }
    },

    // Create new workspace
    createWorkspace: async () => {
      console.log('[Workspace] Creating workspace...');
      set({ loading: true, error: null });

      try {
        const result = await window.electronAPI.workspace.create();
        console.log('[Workspace] Create result:', result);

        if (result.success && result.path) {
          console.log('[Workspace] Getting workspace info...');
          const info = await window.electronAPI.workspace.getInfo();
          console.log('[Workspace] Info:', info);

          set({
            isOpen: true,
            workspace: { ...info, path: result.path },
            loading: false,
          });

          console.log('[Workspace] Loading initial data...');
          // Load initial data
          await get().loadDocuments();
          await get().loadTags();
          await get().loadGitStatus();
          console.log('[Workspace] Workspace opened successfully!');
        } else {
          console.error('[Workspace] Failed to create:', result.error);
          set({ loading: false, error: result.error || 'Failed to create workspace' });
        }
      } catch (error) {
        console.error('[Workspace] Error:', error);
        set({ loading: false, error: (error as Error).message });
      }
    },

    // Close workspace
    closeWorkspace: async () => {
      try {
        await window.electronAPI.workspace.close();
        set({
          isOpen: false,
          workspace: null,
          documents: [],
          selectedDocument: null,
          tags: [],
          gitStatus: null,
          searchQuery: '',
          searchResults: [],
        });
      } catch (error) {
        set({ error: (error as Error).message });
      }
    },

    // Load documents
    loadDocuments: async () => {
      try {
        const docs = await window.electronAPI.document.list();
        set({ documents: docs });
      } catch (error) {
        console.error('[Workspace] Failed to load documents:', error);
        set({ error: (error as Error).message });
      }
    },

    // Select document
    selectDocument: (document) => {
      set({ selectedDocument: document });
    },

    // Load tags
    loadTags: async () => {
      try {
        const tags = await window.electronAPI.search.tags();
        set({ tags });
      } catch (error) {
        set({ error: (error as Error).message });
      }
    },

    // Load Git status
    loadGitStatus: async () => {
      try {
        const status = await window.electronAPI.git.status();
        set({ gitStatus: status });
      } catch (error) {
        set({ error: (error as Error).message });
      }
    },

    // Search documents
    search: async (query) => {
      set({ searchQuery: query });

      if (!query.trim()) {
        set({ searchResults: [] });
        return;
      }

      try {
        const results = await window.electronAPI.search.query(query);
        set({ searchResults: results });
      } catch (error) {
        set({ error: (error as Error).message });
      }
    },

    // Search by tag
    searchByTag: async (tag) => {
      try {
        const results = await window.electronAPI.search.byTag(tag);
        set({ searchResults: results, searchQuery: `tag:${tag}` });
      } catch (error) {
        set({ error: (error as Error).message });
      }
    },

    // Commit changes
    commitChanges: async (message) => {
      set({ syncing: true });

      try {
        await window.electronAPI.git.commit(message);
        await get().loadGitStatus();
        set({ syncing: false });
      } catch (error) {
        set({ syncing: false, error: (error as Error).message });
      }
    },

    // Push to remote
    pushToRemote: async (remote = 'origin', branch = 'main') => {
      set({ syncing: true });

      try {
        await window.electronAPI.git.push(remote, branch);
        await get().loadGitStatus();
        set({ syncing: false });
      } catch (error) {
        set({ syncing: false, error: (error as Error).message });
      }
    },

    // Pull from remote
    pullFromRemote: async (remote = 'origin', branch = 'main') => {
      set({ syncing: true });

      try {
        await window.electronAPI.git.pull(remote, branch);
        await get().loadDocuments();
        await get().loadTags();
        await get().loadGitStatus();
        set({ syncing: false });
      } catch (error) {
        set({ syncing: false, error: (error as Error).message });
      }
    },

    // Set error
    setError: (error) => {
      set({ error });
    },
  }))
);
