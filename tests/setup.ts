import '@testing-library/jest-dom';
import { vi } from 'vitest';

// Mock electron API for tests
global.window = global.window || {};
(global.window as any).electronAPI = {
  ping: vi.fn().mockResolvedValue('pong'),

  workspace: {
    open: vi.fn().mockResolvedValue({ success: true, path: '/test/workspace' }),
    create: vi.fn().mockResolvedValue({ success: true, path: '/test/workspace' }),
    close: vi.fn().mockResolvedValue(undefined),
    getInfo: vi.fn().mockResolvedValue({ name: 'Test Workspace' }),
  },

  document: {
    list: vi.fn().mockResolvedValue([]),
    read: vi.fn().mockResolvedValue(''),
    write: vi.fn().mockResolvedValue(undefined),
    delete: vi.fn().mockResolvedValue(undefined),
    addTags: vi.fn().mockResolvedValue(undefined),
  },

  search: {
    query: vi.fn().mockResolvedValue([]),
    tags: vi.fn().mockResolvedValue([]),
    byTag: vi.fn().mockResolvedValue([]),
  },

  git: {
    status: vi.fn().mockResolvedValue({ clean: true }),
    commit: vi.fn().mockResolvedValue(undefined),
    push: vi.fn().mockResolvedValue(undefined),
    pull: vi.fn().mockResolvedValue(undefined),
    addRemote: vi.fn().mockResolvedValue(undefined),
    getRemotes: vi.fn().mockResolvedValue([]),
    log: vi.fn().mockResolvedValue([]),
  },
};
