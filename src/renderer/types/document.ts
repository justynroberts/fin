/**
 * Document and file operation types
 */

import { EditorMode, CodeLanguage } from './editor';

export interface Document {
  id: string;
  content: string;
  mode: EditorMode;
  language?: CodeLanguage;
  filePath?: string;
  fileName: string;
  isDirty: boolean;
  created: Date;
  modified: Date;
  saved?: Date;
}

export interface FileInfo {
  path: string;
  name: string;
  extension: string;
  size: number;
  lastModified: Date;
}

export interface SaveOptions {
  filePath?: string;
  createBackup?: boolean;
  encoding?: BufferEncoding;
}

export interface OpenOptions {
  encoding?: BufferEncoding;
  mode?: EditorMode;
  language?: CodeLanguage;
}

export interface RecentFile {
  path: string;
  name: string;
  lastOpened: Date;
  mode: EditorMode;
}

export interface AutoSaveState {
  enabled: boolean;
  interval: number;
  lastAutoSave?: Date;
  pendingChanges: boolean;
}
