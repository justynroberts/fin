/**
 * New Document Dialog - Choose document type
 */

import React, { useState, useEffect, useRef } from 'react';
import type { EditorMode } from '../types';
import './NewDocumentDialog.css';

interface NewDocumentDialogProps {
  isOpen: boolean;
  onClose: () => void;
  onCreate: (mode: EditorMode, name?: string, language?: string) => void;
}

const NewDocumentDialog: React.FC<NewDocumentDialogProps> = ({ isOpen, onClose, onCreate }) => {
  const [selectedMode, setSelectedMode] = useState<EditorMode>('markdown');
  const [documentName, setDocumentName] = useState('');
  const [language, setLanguage] = useState('javascript');
  const nameInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (isOpen) {
      // Focus name input when dialog opens
      setTimeout(() => nameInputRef.current?.focus(), 100);

      // Reset form
      setDocumentName('');
      setLanguage('javascript');
    }
  }, [isOpen]);

  useEffect(() => {
    if (!isOpen) return;

    const handleKeyDown = (e: KeyboardEvent) => {
      // Number keys 1, 2, 3 to select type
      if (e.key === '1') {
        setSelectedMode('notes');
        e.preventDefault();
      } else if (e.key === '2') {
        setSelectedMode('markdown');
        e.preventDefault();
      } else if (e.key === '3') {
        setSelectedMode('code');
        e.preventDefault();
      } else if (e.key === 'Enter' && !e.shiftKey) {
        handleCreate();
        e.preventDefault();
      } else if (e.key === 'Escape') {
        onClose();
        e.preventDefault();
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, selectedMode, documentName, language]);

  if (!isOpen) return null;

  const handleCreate = () => {
    const name = documentName.trim() || undefined;
    const lang = selectedMode === 'code' ? language : undefined;
    onCreate(selectedMode, name, lang);
    onClose();
  };

  const handleTypeClick = (mode: EditorMode) => {
    setSelectedMode(mode);
  };

  const handleTypeDoubleClick = (mode: EditorMode) => {
    setSelectedMode(mode);
    // Small delay to show selection before creating
    setTimeout(() => {
      const name = documentName.trim() || undefined;
      const lang = mode === 'code' ? language : undefined;
      onCreate(mode, name, lang);
      onClose();
    }, 100);
  };

  return (
    <div className="new-doc-overlay" onClick={onClose}>
      <div className="new-doc-content" onClick={(e) => e.stopPropagation()}>
        <div className="new-doc-header">
          <h2>New Document</h2>
          <button className="new-doc-close" onClick={onClose}>
            <span className="material-symbols-rounded">close</span>
          </button>
        </div>

        <div className="new-doc-body">
          <div className="form-group">
            <label htmlFor="doc-name">Document Name (optional)</label>
            <input
              ref={nameInputRef}
              id="doc-name"
              type="text"
              className="form-input"
              value={documentName}
              onChange={(e) => setDocumentName(e.target.value)}
              placeholder="untitled"
            />
          </div>

          <div className="form-group">
            <label>Document Type</label>
            <p className="new-doc-description">Choose type (Press 1, 2, or 3):</p>

            <div className="doc-type-options">
              <button
                className={`doc-type-option ${selectedMode === 'notes' ? 'selected' : ''}`}
                onClick={() => handleTypeClick('notes')}
                onDoubleClick={() => handleTypeDoubleClick('notes')}
              >
                <div className="doc-type-icon-wrapper">
                  <span className="material-symbols-rounded doc-type-icon">description</span>
                </div>
                <div className="doc-type-info">
                  <span className="doc-type-name">Notes</span>
                  <span className="doc-type-desc">Formatted notes with styling</span>
                  <span className="doc-type-shortcut">Press 1</span>
                </div>
                {selectedMode === 'notes' && (
                  <span className="material-symbols-rounded check">check_circle</span>
                )}
              </button>

              <button
                className={`doc-type-option ${selectedMode === 'markdown' ? 'selected' : ''}`}
                onClick={() => handleTypeClick('markdown')}
                onDoubleClick={() => handleTypeDoubleClick('markdown')}
              >
                <div className="doc-type-icon-wrapper">
                  <span className="material-symbols-rounded doc-type-icon">article</span>
                </div>
                <div className="doc-type-info">
                  <span className="doc-type-name">Markdown</span>
                  <span className="doc-type-desc">Plain text with live preview</span>
                  <span className="doc-type-shortcut">Press 2</span>
                </div>
                {selectedMode === 'markdown' && (
                  <span className="material-symbols-rounded check">check_circle</span>
                )}
              </button>

              <button
                className={`doc-type-option ${selectedMode === 'code' ? 'selected' : ''}`}
                onClick={() => handleTypeClick('code')}
                onDoubleClick={() => handleTypeDoubleClick('code')}
              >
                <div className="doc-type-icon-wrapper">
                  <span className="material-symbols-rounded doc-type-icon">code</span>
                </div>
                <div className="doc-type-info">
                  <span className="doc-type-name">Code</span>
                  <span className="doc-type-desc">Syntax highlighting & execution</span>
                  <span className="doc-type-shortcut">Press 3</span>
                </div>
                {selectedMode === 'code' && (
                  <span className="material-symbols-rounded check">check_circle</span>
                )}
              </button>
            </div>
          </div>

          {selectedMode === 'code' && (
            <div className="form-group">
              <label htmlFor="language">Programming Language</label>
              <select
                id="language"
                className="form-input"
                value={language}
                onChange={(e) => setLanguage(e.target.value)}
              >
                <option value="javascript">JavaScript</option>
                <option value="typescript">TypeScript</option>
                <option value="python">Python</option>
                <option value="java">Java</option>
                <option value="cpp">C++</option>
                <option value="csharp">C#</option>
                <option value="go">Go</option>
                <option value="rust">Rust</option>
                <option value="php">PHP</option>
                <option value="ruby">Ruby</option>
                <option value="swift">Swift</option>
                <option value="kotlin">Kotlin</option>
                <option value="html">HTML</option>
                <option value="css">CSS</option>
                <option value="json">JSON</option>
                <option value="yaml">YAML</option>
                <option value="xml">XML</option>
                <option value="sql">SQL</option>
                <option value="shell">Shell</option>
                <option value="markdown">Markdown</option>
                <option value="plaintext">Plain Text</option>
              </select>
            </div>
          )}
        </div>

        <div className="new-doc-footer">
          <button className="new-doc-btn secondary" onClick={onClose}>
            Cancel
          </button>
          <button className="new-doc-btn primary" onClick={handleCreate}>
            <span className="material-symbols-rounded">add</span>
            Create Document
          </button>
        </div>
      </div>
    </div>
  );
};

export default NewDocumentDialog;
